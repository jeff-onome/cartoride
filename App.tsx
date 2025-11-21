
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Faq from './pages/Faq';
import Contact from './pages/Contact';
import Inventory from './pages/Inventory';
import CarDetail from './pages/CarDetail';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import UserProfile from './pages/UserProfile';
import { UserDataProvider } from './context/UserDataContext';
import { CarProvider } from './context/CarContext';
import ChangePassword from './pages/ChangePassword';
import DealerProtectedRoute from './components/DealerProtectedRoute';
import DealerLayout from './pages/dealer/DealerLayout';
import Dashboard from './pages/dealer/Dashboard';
import ManageListings from './pages/dealer/ManageListings';
import AddCar from './pages/dealer/AddCar';
import EditCar from './pages/dealer/EditCar';
import { UserManagementProvider } from './context/UserManagementContext';
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute';
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import ManageUsers from './pages/superadmin/ManageUsers';
import AddUser from './pages/superadmin/AddUser';
import EditUser from './pages/superadmin/EditUser';
import ManageAllListings from './pages/superadmin/ManageAllListings';
import { SiteContentProvider } from './context/SiteContentContext';
import SiteContent from './pages/superadmin/SiteContent';
import SuperAdminAddCar from './pages/superadmin/AddCar';
import { useAuth } from './hooks/useAuth';
import SalesHistory from './pages/dealer/SalesHistory';
import SalesAnalytics from './pages/superadmin/SalesAnalytics';
import { useSiteContent } from './hooks/useSiteContent';
import { hexToHSL, getContrastColorHSL } from './utils/colorUtils';

const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const { siteContent } = useSiteContent();

  // Apply dynamic theme colors
  useEffect(() => {
    if (siteContent?.themeSettings) {
        const root = document.documentElement;
        const { primaryColor, secondaryColor, accentColor, backgroundColor } = siteContent.themeSettings;

        // Primary
        root.style.setProperty('--primary', hexToHSL(primaryColor));
        root.style.setProperty('--primary-foreground', getContrastColorHSL(primaryColor));
        
        // Ring (matches primary usually)
        root.style.setProperty('--ring', hexToHSL(primaryColor));

        // Accent
        root.style.setProperty('--accent', hexToHSL(accentColor));
        root.style.setProperty('--accent-foreground', getContrastColorHSL(accentColor));

        // Secondary (Used for backgrounds in some cards/headers)
        // Note: We only update the HSL value, the tailwind class handles opacity if needed.
        // We might want to be careful overriding this if it breaks dark mode, 
        // but forcing a brand color here is usually desired for "Secondary".
        // If secondaryColor is meant to be the muted background, we update --secondary.
        if (secondaryColor) {
             root.style.setProperty('--secondary', hexToHSL(secondaryColor));
             root.style.setProperty('--secondary-foreground', getContrastColorHSL(secondaryColor));
        }

        // Background
        if (backgroundColor) {
             root.style.setProperty('--background', hexToHSL(backgroundColor));
             root.style.setProperty('--foreground', getContrastColorHSL(backgroundColor));
        } else {
             root.style.removeProperty('--background');
             root.style.removeProperty('--foreground');
        }
    }
  }, [siteContent]);
  
  return (
    <HashRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* User Routes */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />

            {/* Dealer Routes */}
            <Route path="/dealer" element={<DealerProtectedRoute><DealerLayout /></DealerProtectedRoute>}>
              <Route index path="dashboard" element={<Dashboard />} />
              <Route path="listings" element={<ManageListings />} />
              <Route path="listings/add" element={<AddCar />} />
              <Route path="listings/edit/:id" element={<EditCar />} />
              <Route path="sales" element={<SalesHistory />} />
            </Route>

            {/* Super Admin Routes */}
            <Route path="/superadmin" element={<SuperAdminProtectedRoute><SuperAdminLayout /></SuperAdminProtectedRoute>}>
              <Route index path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="users/add" element={<AddUser />} />
              <Route path="users/edit/:email" element={<EditUser />} />
              <Route path="listings" element={<ManageAllListings />} />
              <Route path="listings/add" element={<SuperAdminAddCar />} />
              <Route path="content" element={<SiteContent />} />
              <Route path="analytics" element={<SalesAnalytics />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!user && <Footer />}
      </div>
    </HashRouter>
  );
};


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CarProvider>
          <UserManagementProvider>
            <UserDataProvider>
              <SiteContentProvider>
                <AppLayout />
              </SiteContentProvider>
            </UserDataProvider>
          </UserManagementProvider>
        </CarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
