
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCars } from '../../hooks/useCars';
import { PencilIcon, TrashIcon, PlusCircleIcon, SearchIcon } from '../../components/IconComponents';
import Swal from 'sweetalert2';

const ManageListings: React.FC = () => {
  const { user } = useAuth();
  const { cars, deleteCar } = useCars();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const dealerCars = useMemo(() => cars.filter(car => car.dealerId === user?.uid), [cars, user]);

  const filteredCars = useMemo(() => 
    dealerCars.filter(car => 
      `${car.make} ${car.model} ${car.year}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [dealerCars, searchTerm]);

  const handleDelete = (carId: string, carName: string) => {
    Swal.fire({
        title: 'Are you sure?',
        text: `Are you sure you want to delete the listing for ${carName}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteCar(carId);
            Swal.fire(
                'Deleted!',
                'The listing has been deleted.',
                'success'
            );
        }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
        <div className="flex items-center gap-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 bg-background border border-input rounded-md pl-10 pr-4 py-2 focus:ring-ring focus:border-ring text-foreground"
                />
            </div>
            <Link to="/dealer/listings/add" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">
                <PlusCircleIcon className="w-5 h-5"/>
                <span className="hidden sm:inline">Add Vehicle</span>
            </Link>
        </div>
      </div>

      <div className="bg-secondary rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background">
              <tr>
                <th className="p-4 font-semibold">Vehicle</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Condition</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.length > 0 ? (
                filteredCars.map(car => (
                  <tr key={car.id} className="border-t border-border">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <img src={car.images[0]} alt={car.make} className="w-20 h-14 object-cover rounded-md" />
                        <div>
                          <p className="font-bold text-foreground">{car.make} {car.model}</p>
                          <p className="text-xs text-muted-foreground">{car.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                         <span className={`px-2 py-1 text-xs rounded-full ${car.listingType === 'Rent' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {car.listingType || 'Sale'}
                        </span>
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                        ₦{car.price.toLocaleString()}
                        {car.listingType === 'Rent' && <span className="text-xs font-normal text-muted-foreground">/{car.pricePeriod || 'Day'}</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${car.condition === 'New' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                        {car.condition}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/dealer/listings/edit/${car.id}`)} className="p-2 text-muted-foreground hover:text-accent" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(car.id, `${car.make} ${car.model}`)} className="p-2 text-muted-foreground hover:text-red-500" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground">
                    {searchTerm ? `No listings found for "${searchTerm}".` : "You haven't listed any vehicles yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageListings;
