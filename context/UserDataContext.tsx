
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../firebase';
import type { TestDrive, Purchase } from '../types';
import { useAuth } from '../hooks/useAuth';

interface UserDataContextType {
  testDrives: TestDrive[];
  purchases: Purchase[];
  loading: boolean;
  addRecentlyViewed: (carId: string) => Promise<void>;
  clearCompare: () => Promise<void>;
  cancelTestDrive: (testDriveId: string) => Promise<void>;
  scheduleTestDrive: (driveData: Omit<TestDrive, 'id' | 'userId'>) => Promise<void>;
  rescheduleTestDrive: (testDriveId: string, newBookingDate: string) => Promise<void>;
  addPurchase: (purchaseData: Omit<Purchase, 'id' | 'userId'>) => Promise<void>;
}

export const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    
    const transformSnapshotToArray = (snapshot: any) => {
        const items: any[] = [];
        const val = snapshot.val();
        if (val) {
            for (const key in val) {
                items.push({ id: key, ...val[key] });
            }
        }
        return items;
    }
    
    useEffect(() => {
       if (!user) {
           setTestDrives([]);
           setPurchases([]);
           setLoading(false);
           return;
       }
       setLoading(true);
       
       const drivesQuery = db.ref('testDrives').orderByChild('userId').equalTo(user.uid);
       const purchasesQuery = db.ref('purchases').orderByChild('userId').equalTo(user.uid);

       const drivesUnsubscribe = drivesQuery.on('value', 
            (snapshot) => {
                setTestDrives(transformSnapshotToArray(snapshot));
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching test drives:", error);
                setLoading(false);
            }
       );

       const purchasesUnsubscribe = purchasesQuery.on('value', 
            (snapshot) => {
                setPurchases(transformSnapshotToArray(snapshot));
            },
            (error) => {
                console.error("Error fetching purchases:", error);
            }
       );
       
       // Generate referral code if missing
       if (!user.referralCode) {
           const code = (user.fname.substring(0, 3) + Math.floor(Math.random() * 10000)).toUpperCase();
           db.ref('users/' + user.uid).update({ 
               referralCode: code,
               loyaltyPoints: user.loyaltyPoints || 0,
               tier: user.tier || 'Bronze',
               referrals: user.referrals || 0
           });
       }
       
       return () => {
           drivesQuery.off('value', drivesUnsubscribe);
           purchasesQuery.off('value', purchasesUnsubscribe);
       }
    }, [user]);

    const addRecentlyViewed = async (carId: string) => {
        if (!user) return;
        const recent = user.recentlyViewed || [];
        const newHistory = [carId, ...recent.filter(id => id !== carId)].slice(0, 5);
        await db.ref('users/' + user.uid).update({ recentlyViewed: newHistory });
    };

    const clearCompare = async () => {
        if (!user) return;
        await db.ref('users/' + user.uid).update({ compareItems: [] });
    };

    const scheduleTestDrive = async (driveData: Omit<TestDrive, 'id' | 'userId'>) => {
        if (!user) return;
        const newDriveRef = db.ref('testDrives').push();
        await newDriveRef.set({ ...driveData, userId: user.uid });
    };
    
    const cancelTestDrive = async (testDriveId: string) => {
        const driveRef = db.ref('testDrives/' + testDriveId);
        await driveRef.update({ status: 'Cancelled' });
    };

    const rescheduleTestDrive = async (testDriveId: string, newBookingDate: string) => {
        const driveRef = db.ref('testDrives/' + testDriveId);
        await driveRef.update({ bookingDate: newBookingDate, status: 'Approved' });
    };

    const addPurchase = async (purchaseData: Omit<Purchase, 'id' | 'userId'>) => {
        if (!user) return;
        const newPurchaseRef = db.ref('purchases').push();
        await newPurchaseRef.set({ ...purchaseData, userId: user.uid });
        
        // Calculate Loyalty Points
        // Logic: 10 points for every 100,000 currency units spent
        const pointsEarned = Math.floor(purchaseData.pricePaid / 100000) * 10;
        const currentPoints = user.loyaltyPoints || 0;
        const newTotalPoints = currentPoints + pointsEarned;
        
        // Determine Tier
        let newTier = user.tier || 'Bronze';
        if (newTotalPoints >= 3000) newTier = 'Platinum';
        else if (newTotalPoints >= 1500) newTier = 'Gold';
        else if (newTotalPoints >= 500) newTier = 'Silver';

        await db.ref('users/' + user.uid).update({
            loyaltyPoints: newTotalPoints,
            tier: newTier
        });
    };

    const value = {
        testDrives,
        purchases,
        loading,
        addRecentlyViewed,
        clearCompare,
        cancelTestDrive,
        scheduleTestDrive,
        rescheduleTestDrive,
        addPurchase,
    };

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    );
};