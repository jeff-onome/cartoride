import React from 'react';
import { useNavigate } from 'react-router-dom';
import CarForm from '../../components/CarForm';
import { useCars } from '../../hooks/useCars';
import { useAuth } from '../../hooks/useAuth';
import type { Car } from '../../types';

const AddCar: React.FC = () => {
  const navigate = useNavigate();
  const { addCar } = useCars();
  const { user } = useAuth();

  const handleAddCar = async (carData: Omit<Car, 'id' | 'dealerId' | 'verificationStatus'>) => {
    if (!user) {
        alert("You must be logged in to add a car.");
        return;
    }
    try {
        await addCar({ 
            ...carData, 
            dealerId: user.uid,
            verificationStatus: 'Unverified' // Default status for new cars
        });
        navigate('/dealer/listings');
    } catch (error) {
        console.error("Failed to add car:", error);
        alert("An error occurred while adding the vehicle. Please try again.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Add New Vehicle</h1>
      <CarForm onSubmit={handleAddCar} />
    </div>
  );
};

export default AddCar;