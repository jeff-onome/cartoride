import React from 'react';
import { Link } from 'react-router-dom';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useCars } from '../../hooks/useCars';
import { CarIcon, ListingIcon, UsersIcon, PlusCircleIcon } from '../../components/IconComponents';

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
  const { users } = useUserManagement();
  const { cars } = useCars();
  
  const totalUsers = users.length;
  const totalDealers = users.filter(u => u.role === 'dealer').length;
  const totalListings = cars.length;
  const totalInventoryValue = cars.reduce((sum, car) => sum + car.price, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Super Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">Platform-wide overview and statistics.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard 
            title="Total Users" 
            value={totalUsers} 
            icon={<UsersIcon className="w-6 h-6" />}
        />
        <StatCard 
            title="Registered Dealers" 
            value={totalDealers} 
            icon={<UsersIcon className="w-6 h-6" />}
        />
        <StatCard 
            title="Total Vehicle Listings" 
            value={totalListings} 
            icon={<CarIcon className="w-6 h-6" />}
        />
        <StatCard 
            title="Total Inventory Value" 
            value={`₦${(totalInventoryValue / 1_000_000_000).toFixed(2)}B`} 
            icon={<ListingIcon className="w-6 h-6" />}
        />
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
            <Link to="/superadmin/users/add" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-3 px-5 rounded-lg hover:bg-primary/90 transition-colors">
                <PlusCircleIcon className="w-5 h-5"/>
                Create New User
            </Link>
            <Link to="/superadmin/users" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-semibold py-3 px-5 rounded-lg border border-border hover:bg-border transition-colors">
                <UsersIcon className="w-5 h-5"/>
                Manage All Users
            </Link>
             <Link to="/superadmin/listings" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-semibold py-3 px-5 rounded-lg border border-border hover:bg-border transition-colors">
                <ListingIcon className="w-5 h-5"/>
                Manage All Listings
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;