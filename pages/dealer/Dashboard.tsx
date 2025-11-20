import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCars } from '../../hooks/useCars';
import { CarIcon, ListingIcon, PlusCircleIcon } from '../../components/IconComponents';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-secondary p-6 rounded-lg border border-border flex items-center gap-4">
    <div className="bg-accent/10 p-3 rounded-full text-accent">
        {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { cars } = useCars();
  
  const dealerCars = cars.filter(car => car.dealerId === user?.uid);
  const totalListings = dealerCars.length;
  const totalInventoryValue = dealerCars.reduce((sum, car) => sum + car.price, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Dealer Dashboard</h1>
      <p className="text-muted-foreground mb-6">Here's an overview of your inventory.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
            title="Active Listings" 
            value={totalListings} 
            icon={<CarIcon className="w-6 h-6" />}
        />
        <StatCard 
            title="Total Inventory Value" 
            value={`₦${(totalInventoryValue / 1_000_000).toFixed(2)}M`} 
            icon={<ListingIcon className="w-6 h-6" />}
        />
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
            <Link to="/dealer/listings/add" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-3 px-5 rounded-lg hover:bg-primary/90 transition-colors">
                <PlusCircleIcon className="w-5 h-5"/>
                Add New Vehicle
            </Link>
            <Link to="/dealer/listings" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-semibold py-3 px-5 rounded-lg border border-border hover:bg-border transition-colors">
                <ListingIcon className="w-5 h-5"/>
                Manage Listings
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;