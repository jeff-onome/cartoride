
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import type { User } from '../types';
import { useAuth } from '../hooks/useAuth';

interface UserManagementContextType {
  users: User[];
  loading: boolean;
  updateUser: (uid: string, updatedData: Partial<User>) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  addUser: (userData: Omit<User, 'uid'>, password: string) => Promise<void>;
}

export const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);


export const UserManagementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If no user or not superadmin, don't fetch or clear sensitive data
        if (!user || user.role !== 'superadmin') {
            setUsers([]);
            setLoading(false);
            return;
        }

        const usersRef = db.ref('users');
        setLoading(true);
        
        const handleSnapshot = (snapshot: firebase.database.DataSnapshot) => {
            const usersData = snapshot.val();
            const usersList = usersData ? Object.keys(usersData).map(key => ({
                uid: key,
                ...usersData[key]
            } as User)) : [];
            setUsers(usersList);
            setLoading(false);
        };

        const handleError = (error: Error) => {
            console.error("Error fetching users (UserManagementContext):", error);
            // Do not keep loading state true if error occurs
            setLoading(false);
        };

        usersRef.on('value', handleSnapshot, handleError);
        
        return () => {
            usersRef.off('value', handleSnapshot);
        };
    }, [user]);

    const addUser = async (userData: Omit<User, 'uid'>, password: string) => {
        // Use a secondary app to create the user without logging out the current superadmin
        // Use a unique name to prevent conflicts
        const appName = `SecondaryApp-${Date.now()}`;
        const secondaryApp = firebase.initializeApp(firebase.app().options, appName);
        try {
            const userCredential = await secondaryApp.auth().createUserWithEmailAndPassword(userData.email, password);
            const uid = userCredential.user!.uid;
            
            // We don't need to store extra data using the secondary app's auth context,
            // we use the main app's db connection (which is authenticated as superadmin)
            await db.ref('users/' + uid).set(userData);
            
            await secondaryApp.auth().signOut();
        } catch (error) {
            console.error("Error adding user:", error);
            throw error;
        } finally {
            await secondaryApp.delete();
        }
    };

    const updateUser = async (uid: string, updatedData: Partial<User>) => {
        await db.ref('users/' + uid).update(updatedData);
    };

    const deleteUser = async (uid: string) => {
        // Note: This only deletes the database record. Deleting from Firebase Auth
        // requires admin privileges and is typically done from a backend server.
        await db.ref('users/' + uid).remove();
    };

    return (
        <UserManagementContext.Provider value={{ users, loading, updateUser, deleteUser, addUser }}>
            {children}
        </UserManagementContext.Provider>
    );
};
