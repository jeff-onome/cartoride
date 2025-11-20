import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { CarIcon, MenuIcon, XIcon, UserIcon } from './IconComponents';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import { useSiteContent } from '../hooks/useSiteContent';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { siteContent } = useSiteContent();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
      isActive
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
    }`;

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive 
      ? 'bg-accent text-accent-foreground' 
      : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
    }`;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const closeUserMenu = () => setIsUserMenuOpen(false);


  const navLinks = (
    <>
      <NavLink to="/" className={navLinkClasses} end>Home</NavLink>
      <NavLink to="/inventory" className={navLinkClasses}>Inventory</NavLink>
      <NavLink to="/about" className={navLinkClasses}>About</NavLink>
      <NavLink to="/faq" className={navLinkClasses}>FAQ</NavLink>
      <NavLink to="/contact" className={navLinkClasses}>Contact</NavLink>
      {user?.role === 'dealer' && (
          <NavLink to="/dealer/dashboard" className={navLinkClasses}>Dealer Portal</NavLink>
      )}
      {user?.role === 'superadmin' && (
          <NavLink to="/superadmin/dashboard" className={navLinkClasses}>Super Admin</NavLink>
      )}
    </>
  );

  const handleLogout = () => {
    logout();
    closeUserMenu();
  }

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 text-foreground text-2xl font-bold">
              <CarIcon className="h-8 w-8 text-accent" />
              <span>{siteContent?.siteName}</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center">
            <nav className="ml-10 flex items-baseline space-x-4">
              {navLinks}
            </nav>
            <div className="ml-6 flex items-center space-x-4">
              <ThemeToggle />
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-secondary-foreground">
                    <UserIcon className="h-6 w-6" />
                  </button>
                ) : (
                  <Link to="/login" className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-secondary-foreground">
                    <UserIcon className="h-6 w-6" />
                  </Link>
                )}
                {isUserMenuOpen && user && (
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-md shadow-lg ring-1 ring-border">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate" title={`${user.fname} ${user.lname}`}>{user.fname} {user.lname}</p>
                      <p className="text-sm text-muted-foreground truncate" title={user.email}>{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" onClick={closeUserMenu} className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary">
                        My Profile
                      </Link>
                      {user.role === 'dealer' && (
                        <Link to="/dealer/dashboard" onClick={closeUserMenu} className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary">
                          Dealer Portal
                        </Link>
                      )}
                       {user.role === 'superadmin' && (
                        <Link to="/superadmin/dashboard" onClick={closeUserMenu} className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary">
                          Super Admin
                        </Link>
                      )}
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary">
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden items-center">
             <ThemeToggle />
             <div className="relative ml-2">
                {user ? (
                   <Link to="/profile" onClick={closeMobileMenu} className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-secondary-foreground">
                    <UserIcon className="h-6 w-6" />
                  </Link>
                ) : (
                  <Link to="/login" onClick={closeMobileMenu} className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-secondary-foreground">
                    <UserIcon className="h-6 w-6" />
                  </Link>
                )}
              </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="bg-secondary inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring ml-2"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <NavLink to="/" className={mobileNavLinkClasses} onClick={closeMobileMenu} end>Home</NavLink>
             <NavLink to="/inventory" className={mobileNavLinkClasses} onClick={closeMobileMenu}>Inventory</NavLink>
             <NavLink to="/about" className={mobileNavLinkClasses} onClick={closeMobileMenu}>About</NavLink>
             <NavLink to="/faq" className={mobileNavLinkClasses} onClick={closeMobileMenu}>FAQ</NavLink>
             <NavLink to="/contact" className={mobileNavLinkClasses} onClick={closeMobileMenu}>Contact</NavLink>
             {user?.role === 'dealer' && (
                <NavLink to="/dealer/dashboard" className={mobileNavLinkClasses} onClick={closeMobileMenu}>Dealer Portal</NavLink>
             )}
             {user?.role === 'superadmin' && (
                <NavLink to="/superadmin/dashboard" className={mobileNavLinkClasses} onClick={closeMobileMenu}>Super Admin</NavLink>
             )}
             {user && (
                <div className="border-t border-border pt-4 mt-4">
                     <p className="px-3 py-2 text-sm font-semibold text-foreground">{user.fname} {user.lname}</p>
                     <button onClick={() => { logout(); closeMobileMenu(); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground">
                        Logout
                      </button>
                </div>
             )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;