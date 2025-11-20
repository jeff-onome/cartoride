import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { db } from '../firebase';
import type { Car } from '../types';

interface CarContextType {
  cars: Car[];
  loading: boolean;
  addCar: (car: Omit<Car, 'id'>) => Promise<void>;
  updateCar: (carId: string, updatedCar: Partial<Car>) => Promise<void>;
  deleteCar: (carId: string) => Promise<void>;
  deleteCarsByDealer: (dealerId: string) => Promise<void>;
  verifyCar: (carId: string) => Promise<void>;
}

export const CarContext = createContext<CarContextType | undefined>(undefined);

export const CarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const carsRef = db.ref('cars');
        const unsubscribe = carsRef.on('value', (snapshot) => {
            const carsData = snapshot.val();
            const carsList = carsData ? Object.keys(carsData).map(key => ({
                id: key,
                ...carsData[key]
            } as Car)) : [];
            setCars(carsList);
            setLoading(false);
        });
        return () => carsRef.off('value', unsubscribe);
    }, []);

    const addCar = async (carData: Omit<Car, 'id'>) => {
        const newCarRef = db.ref('cars').push();
        await newCarRef.set(carData);
    };

    const updateCar = async (carId: string, updatedCar: Partial<Car>) => {
        const carRef = db.ref('cars/' + carId);
        await carRef.update(updatedCar);
    };

    const deleteCar = async (carId: string) => {
        const carRef = db.ref('cars/' + carId);
        await carRef.remove();
    };
    
    const deleteCarsByDealer = async (dealerId: string) => {
        const carsQuery = db.ref('cars').orderByChild('dealerId').equalTo(dealerId);
        const snapshot = await carsQuery.get();
        if (snapshot.exists()) {
            const updates: { [key: string]: null } = {};
            snapshot.forEach((childSnapshot) => {
                updates[`/cars/${childSnapshot.key}`] = null;
            });
            await db.ref().update(updates);
        }
    };

    const verifyCar = async (carId: string) => {
        const carRef = db.ref('cars/' + carId);
        await carRef.update({ verificationStatus: 'Verified' });
    };

    return (
        <CarContext.Provider value={{ cars, loading, addCar, updateCar, deleteCar, deleteCarsByDealer, verifyCar }}>
            {children}
        </CarContext.Provider>
    );
};