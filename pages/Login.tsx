
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeftIcon, InformationCircleIcon } from '../components/IconComponents';
import { db } from '../firebase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Reactively handle redirection once the user object is fully loaded by AuthContext
  useEffect(() => {
    // Redirect if user is authenticated and profile is loaded
    if (user && !authLoading) {
        if (user.status === 'Blocked') {
            setError('Your account has been blocked. Please contact support.');
            setIsLoggingIn(false);
            return;
        }

        // Determine redirect path based on role
        switch (user.role) {
            case 'superadmin':
                navigate('/superadmin/dashboard');
                break;
            case 'dealer':
                navigate('/dealer/dashboard');
                break;
            default:
                // If there was a specific destination (like checking out a car), go there
                if (from && from !== '/') {
                    navigate(from);
                } else {
                    navigate('/profile');
                }
        }
    }
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      await login(email, password);
      // We wait for the useEffect above to detect the 'user' change from AuthContext.
      // Do not manually navigate here as we need the user role from context.
    } catch (err: any) {
        setIsLoggingIn(false); // Only stop loading on error. On success, keep loading until redirect.
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                setError('Invalid email or password.');
                break;
            case 'auth/too-many-requests':
                 setError('Too many failed login attempts. Please try again later.');
                 break;
            default:
                setError('An error occurred during login. Please try again.');
                console.error("Login error:", err);
                break;
        }
    }
  };

  return (
    <div className="relative flex flex-grow items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0 opacity-20"
        style={{backgroundImage: "url('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1740&auto=format&fit=crop')"}}
      />
      <div className="absolute inset-0 w-full h-full bg-background/80 backdrop-blur-sm z-0"/>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute -top-4 -left-4 sm:-left-12 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link to="/register" className="font-medium text-accent hover:text-accent/90">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-secondary/80 p-8 rounded-lg border border-border" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-foreground mb-1">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground bg-background rounded-md focus:outline-none focus:ring-ring focus:border-ring sm:text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-login" className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                id="password-login"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground bg-background rounded-md focus:outline-none focus:ring-ring focus:border-ring sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:bg-muted disabled:cursor-not-allowed"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
