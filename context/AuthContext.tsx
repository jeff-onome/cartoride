
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { auth, db } from '../firebase';
import type { User } from '../types';

type FirebaseUser = firebase.User;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, pass: string) => Promise<FirebaseUser>;
  register: (userData: Omit<User, 'uid'>, pass: string) => Promise<FirebaseUser>;
  updateUserContext: (updatedData: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userRef: firebase.database.Reference | null = null;
    let onValueChange: ((a: firebase.database.DataSnapshot) => any) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      // Cleanup previous listener if exists to prevent permission errors on logout
      if (userRef && onValueChange) {
        userRef.off('value', onValueChange);
        userRef = null;
        onValueChange = null;
      }

      if (firebaseUser) {
        setLoading(true);
        
        userRef = db.ref('users/' + firebaseUser.uid);
        
        onValueChange = (snapshot) => {
            if (snapshot.exists()) {
              setUser({ uid: firebaseUser.uid, ...snapshot.val() } as User);
            } else {
              // User exists in Auth but not in DB (rare, but possible)
              setUser(null);
            }
            setLoading(false);
        };

        const onError = (error: any) => {
            // Ignore permission denied errors that can happen during race conditions at logout
            if (error.code !== 'PERMISSION_DENIED') {
                console.error("Error fetching user profile:", error);
            }
            setLoading(false);
        };

        userRef.on('value', onValueChange, onError);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      if (userRef && onValueChange) {
        userRef.off('value', onValueChange);
      }
      unsubscribeAuth();
    };
  }, []);
  
  const login = async (email: string, pass: string): Promise<FirebaseUser> => {
      const userCredential = await auth.signInWithEmailAndPassword(email, pass);
      return userCredential.user!;
  };

  const logout = async (): Promise<void> => {
    await auth.signOut();
  };
  
  const register = async (userData: Omit<User, 'uid'>, pass: string): Promise<FirebaseUser> => {
    const userCredential = await auth.createUserWithEmailAndPassword(userData.email, pass);
    const { uid } = userCredential.user!;
    
    const userRef = db.ref('users/' + uid);
    await userRef.set(userData);
    
    // The listener will pick up the change, but we can set it briefly to avoid flash
    // setUser({ uid, ...userData } as User);

    return userCredential.user!;
  };
  
  const updateUserContext = async (updatedData: Partial<User>): Promise<void> => {
    if (user) {
        const userRef = db.ref('users/' + user.uid);
        await userRef.update(updatedData);
    }
  };

  const value = { user, loading, login, logout, register, updateUserContext };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
