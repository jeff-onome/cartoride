
import React from 'react';
import { Link } from 'react-router-dom';
import type { Car } from '../types';
import { FuelIcon, GaugeIcon, TransmissionIcon, HeartIcon, CompareIcon } from './IconComponents';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import Swal from 'sweetalert2';

interface CarCardProps {
  car: Car;
}

const tagColors = {
  'Best Deal': 'bg-green-500',
  'New Arrival': 'bg-blue-500',
  'Trending': 'bg-purple-500',
};

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const { user } = useAuth();
  
  const isFavorite = user?.favorites?.includes(car.id) ?? false;
  const isCompared = user?.compareItems?.includes(car.id) ?? false;

  const handleToggle = async (e: React.MouseEvent, field: 'favorites' | 'compareItems', currentStatus: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
        Swal.fire({
            title: 'Login Required',
            text: "Please log in to use this feature.",
            icon: 'info',
            confirmButtonColor: '#2563EB'
        });
        return;
    }

    const userFieldRef = db.ref(`users/${user.uid}/${field}`);
    
    await userFieldRef.transaction((currentData: string[] | null) => {
        const currentList = Array.isArray(currentData) ? currentData : [];

        if (field === 'compareItems' && !currentStatus && currentList.length >= 4) {
             // We can't easily show alert from inside transaction callback, but we can abort
            return; // Return undefined to abort transaction
        }

        if (currentStatus) {
            return currentList.filter(id => id !== car.id);
        } else {
            if (!currentList.includes(car.id)) {
                return [...currentList, car.id];
            }
            return currentList;
        }
    });
    
    // Check limit after transaction for UI feedback if needed
    if (field === 'compareItems' && !currentStatus && user.compareItems && user.compareItems.length >= 4) {
         Swal.fire({
            title: 'Limit Reached',
            text: "You can only compare up to 4 cars at a time.",
            icon: 'warning',
            confirmButtonColor: '#2563EB'
        });
    }
  };

  const isRent = car.listingType === 'Rent';

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 hover:shadow-primary/20 transition-all duration-300 flex flex-col group">
      <div className="relative overflow-hidden">
        <Link to={`/car/${car.id}`}>
            <img 
              src={car.images?.[0] || 'https://placehold.co/600x400?text=No+Image'} 
              alt={`${car.make} ${car.model}`} 
              className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
        </Link>
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
             <div className="bg-secondary text-foreground text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                {car.condition}
            </div>
            <div className={`${isRent ? 'bg-orange-500' : 'bg-primary'} text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm`}>
                {isRent ? 'For Rent' : 'For Sale'}
            </div>
        </div>
        
         {car.tag && (
          <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-full ${tagColors[car.tag]}`}>
            {car.tag}
          </div>
        )}
        {user && (
           <div className="absolute bottom-2 right-2 flex space-x-2">
            <button
              onClick={(e) => handleToggle(e, 'compareItems', isCompared)}
              title={isCompared ? "Remove from Compare" : "Add to Compare"}
              className={`p-2 rounded-full transition-colors duration-200 ${isCompared ? 'bg-accent text-accent-foreground' : 'bg-black/50 text-white hover:bg-accent'}`}
              aria-pressed={isCompared}
            >
              <CompareIcon className="h-5 w-5" />
            </button>
             <button
              onClick={(e) => handleToggle(e, 'favorites', isFavorite)}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              className={`p-2 rounded-full transition-colors duration-200 ${isFavorite ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-red-500'}`}
              aria-pressed={isFavorite}
            >
              <HeartIcon className={`h-5 w-5 ${isFavorite ? 'fill-current' : 'fill-none'}`} />
            </button>
           </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-card-foreground">{car.make} {car.model}</h3>
        <p className="text-sm text-muted-foreground mb-4">{car.year}</p>
        <p className="text-2xl font-bold text-accent mb-4">
            ₦{car.price.toLocaleString()}
            {isRent && <span className="text-sm font-normal text-muted-foreground ml-1">/ {car.pricePeriod || 'Day'}</span>}
        </p>
        
        <div className="grid grid-cols-3 gap-4 text-center my-4 border-t border-b border-border py-4">
          <div className="flex flex-col items-center">
            <FuelIcon className="h-6 w-6 text-muted-foreground mb-1" />
            <span className="text-sm text-foreground">{car.fuelType}</span>
          </div>
          <div className="flex flex-col items-center">
            <GaugeIcon className="h-6 w-6 text-muted-foreground mb-1" />
            <span className="text-sm text-foreground">{car.mileage.toLocaleString()} mi</span>
          </div>
          <div className="flex flex-col items-center">
            <TransmissionIcon className="h-6 w-6 text-muted-foreground mb-1" />
            <span className="text-sm text-foreground">{car.transmission}</span>
          </div>
        </div>

        <div className="mt-auto">
          <Link to={`/car/${car.id}`} className="block w-full text-center bg-accent text-accent-foreground font-bold py-3 px-4 rounded-lg hover:bg-accent/90 transition-colors duration-300">
            {isRent ? 'Check Availability' : 'View Details'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
