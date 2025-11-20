
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { DashboardIcon, ListingIcon, PlusCircleIcon, LogOutIcon, ArrowLeftIcon, MenuIcon, ReceiptIcon } from '../../components/IconComponents';

const DealerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
      isActive
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`;

  const sidebarContent = (onLinkClick?: () => void) => (
      <>
        <div className="px-4 py-3 mb-2 border-b border-border">
            <p className="font-semibold text-foreground truncate">{user?.fname} {user?.lname}</p>
            <p className="text-xs text-muted-foreground">Dealer Account</p>
        </div>
        <NavLink to="/dealer/dashboard" className={navLinkClasses} end onClick={onLinkClick}>
            <DashboardIcon className="h-5 w-5" />
            <span>Dashboard</span>
        </NavLink>
        <NavLink to="/dealer/listings" className={navLinkClasses} end onClick={onLinkClick}>
            <ListingIcon className="h-5 w-5" />
            <span>My Listings</span>
        </NavLink>
        <NavLink to="/dealer/sales" className={navLinkClasses} end onClick={onLinkClick}>
            <ReceiptIcon className="h-5 w-5" />
            <span>Sales History</span>
        </NavLink>
        <NavLink to="/dealer/listings/add" className={navLinkClasses} onClick={onLinkClick}>
            <PlusCircleIcon className="h-5 w-5" />
            <span>Add Vehicle</span>
        </NavLink>
        <div className="pt-2 border-t border-border !mt-4">
            <NavLink to="/" className={navLinkClasses({ isActive: false })} onClick={onLinkClick}>
                <ArrowLeftIcon className="h-5 w-5"/>
                <span>Back to Site</span>
            </NavLink>
            <button onClick={() => { handleLogout(); if (onLinkClick) onLinkClick(); }} className={`w-full ${navLinkClasses({ isActive: false })}`}>
                <LogOutIcon className="h-5 w-5"/>
                <span>Logout</span>
            </button>
        </div>
      </>
  );

  return (
    <div className="bg-background min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Mobile Header and Drawer */}
        <div className="md:hidden">
            <div className="flex justify-between items-center mb-6">
                <p className="font-semibold text-foreground truncate">{user?.fname} {user?.lname}</p>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2" aria-label="Open menu">
                    <MenuIcon className="h-6 w-6 text-muted-foreground"/>
                </button>
            </div>
            
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/60 z-30 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Panel */}
            <div className={`fixed top-0 left-0 h-full w-72 bg-secondary z-40 transform transition-transform shadow-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <div className="p-3 space-y-2">
                    {sidebarContent(() => setIsSidebarOpen(false))}
                 </div>
            </div>
        </div>

        {/* Desktop Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="hidden md:block md:col-span-1">
             <div className="bg-secondary p-3 rounded-lg border border-border space-y-2">
                {sidebarContent()}
             </div>
          </aside>
          
          <main className="md:col-span-3">
              <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DealerLayout;
