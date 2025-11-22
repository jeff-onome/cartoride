
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
  addPurchase: (purchaseData: Omit<Purchase, 'id' | 'userId'>, referralCode?: string) => Promise<void>;
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
    
    const calculateTier = (points: number) => {
        if (points >= 3000) return 'Platinum';
        if (points >= 1500) return 'Gold';
        if (points >= 500) return 'Silver';
        return 'Bronze';
    };

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
       
       // Generate unique referral code if missing
       if (!user.referralCode) {
           // Logic: First 3 chars of Name + Random 4 digits + Last 3 chars of UID for uniqueness
           const fname = user.fname || 'USR';
           const cleanName = fname.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
           const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit number
           const uidSuffix = user.uid.slice(-3).toUpperCase();
           const code = `${cleanName || 'USR'}${randomNum}${uidSuffix}`;

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

    const addPurchase = async (purchaseData: Omit<Purchase, 'id' | 'userId'>, referralCode?: string) => {
        if (!user) return;
        const newPurchaseRef = db.ref('purchases').push();
        await newPurchaseRef.set({ ...purchaseData, userId: user.uid });
        
        // Calculate Loyalty Points for Buyer
        // Logic: 10 points for every 100,000 currency units spent
        const pointsEarned = Math.floor(purchaseData.pricePaid / 100000) * 10;
        const currentPoints = user.loyaltyPoints || 0;
        const newTotalPoints = currentPoints + pointsEarned;
        
        // Determine Tier for Buyer
        const newTier = calculateTier(newTotalPoints);

        await db.ref('users/' + user.uid).update({
            loyaltyPoints: newTotalPoints,
            tier: newTier
        });

        // Handle Referral Logic
        if (referralCode) {
            try {
                const usersRef = db.ref('users');
                const snapshot = await usersRef.orderByChild('referralCode').equalTo(referralCode).once('value');
                
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const referrerId = childSnapshot.key;
                        
                        // Prevent self-referral
                        if (referrerId && referrerId !== user.uid) {
                            const referrerData = childSnapshot.val();
                            const referrerCurrentPoints = referrerData.loyaltyPoints || 0;
                            const referrerCurrentReferrals = referrerData.referrals || 0;
                            
                            // Award 500 points to the referrer
                            const newReferrerPoints = referrerCurrentPoints + 500;
                            const newReferrerTier = calculateTier(newReferrerPoints);
                            const newReferrerCount = referrerCurrentReferrals + 1;

                            db.ref('users/' + referrerId).update({
                                loyaltyPoints: newReferrerPoints,
                                referrals: newReferrerCount,
                                tier: newReferrerTier
                            });
                        }
                    });
                }
            } catch (error) {
                console.error("Error processing referral reward:", error);
            }
        }
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
