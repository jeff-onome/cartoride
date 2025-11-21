
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CarForm from '../../components/CarForm';
import { useCars } from '../../hooks/useCars';
import { useAuth } from '../../hooks/useAuth';
import type { Car } from '../../types';
import Swal from 'sweetalert2';

const AddCar: React.FC = () => {
  const navigate = useNavigate();
  const { addCar } = useCars();
  const { user } = useAuth();

  const handleAddCar = async (carData: Omit<Car, 'id' | 'dealerId' | 'verificationStatus'>) => {
    if (!user) {
        Swal.fire({
            title: 'Login Required',
            text: "You must be logged in to add a car.",
            icon: 'warning',
            confirmButtonColor: '#2563EB'
        });
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
        Swal.fire({
            title: 'Error',
            text: "An error occurred while adding the vehicle. Please try again.",
            icon: 'error',
            confirmButtonColor: '#2563EB'
        });
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
