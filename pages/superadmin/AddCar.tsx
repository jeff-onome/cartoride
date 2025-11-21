
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CarForm from '../../components/CarForm';
import { useCars } from '../../hooks/useCars';
import { useUserManagement } from '../../hooks/useUserManagement';
import type { Car } from '../../types';
import Swal from 'sweetalert2';

const SuperAdminAddCar: React.FC = () => {
  const navigate = useNavigate();
  const { addCar } = useCars();
  const { users } = useUserManagement();

  const dealers = useMemo(() => users.filter(u => u.role === 'dealer'), [users]);
  const [selectedDealerId, setSelectedDealerId] = useState<string>(dealers[0]?.uid || '');

  const handleAddCar = async (carData: Omit<Car, 'id' | 'dealerId' | 'verificationStatus'>) => {
    if (!selectedDealerId) {
        Swal.fire({
            title: 'Selection Required',
            text: "Please select a dealer to assign this vehicle to.",
            icon: 'warning',
            confirmButtonColor: '#2563EB'
        });
        return;
    }
    try {
        await addCar({ 
            ...carData, 
            dealerId: selectedDealerId,
            verificationStatus: 'Verified' // Cars added by admin are pre-verified
        });
        Swal.fire({
            title: 'Success!',
            text: "Vehicle added successfully!",
            icon: 'success',
            confirmButtonColor: '#2563EB'
        }).then(() => {
             navigate('/superadmin/listings');
        });
    } catch(e) {
        console.error("Failed to add car:", e);
        Swal.fire({
            title: 'Error',
            text: "An error occurred while adding the vehicle.",
            icon: 'error',
            confirmButtonColor: '#2563EB'
        });
    }
  };

  const inputClass = "w-full bg-background border border-input rounded-md p-2 focus:ring-ring focus:border-ring text-foreground";

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Add New Vehicle (Admin)</h1>
      <CarForm onSubmit={handleAddCar}>
         <div>
            <label className="block text-sm font-medium mb-1">Assign to Dealer</label>
            <select 
                value={selectedDealerId}
                onChange={(e) => setSelectedDealerId(e.target.value)}
                className={inputClass}
                required
            >
                {dealers.length === 0 ? (
                    <option disabled>No dealers found</option>
                ) : (
                    dealers.map(dealer => (
                        <option key={dealer.uid} value={dealer.uid}>
                            {dealer.fname} {dealer.lname} ({dealer.email})
                        </option>
                    ))
                )}
            </select>
        </div>
      </CarForm>
    </div>
  );
};

export default SuperAdminAddCar;
