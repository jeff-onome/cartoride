import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/IconComponents';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    // Mock API call
    console.log('Changing password...');
    setTimeout(() => {
        setSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => navigate('/profile'), 2000);
    }, 1000);
  };

  const inputClasses = "appearance-none block w-full px-3 py-2 border border-input placeholder-muted-foreground bg-white text-black rounded-md focus:outline-none focus:ring-ring focus:border-ring sm:text-sm";

  return (
    <div className="relative flex flex-grow items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0 opacity-20"
        style={{backgroundImage: "url('https://images.unsplash.com/photo-1592853625601-bb9d23da12fc?q=80&w=1740&auto=format&fit=crop')"}}
      />
      <div className="absolute inset-0 w-full h-full bg-background/80 backdrop-blur-sm z-0"/>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <button 
          onClick={() => navigate('/profile')} 
          className="absolute -top-4 -left-4 sm:-left-12 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Go back to profile"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Change Password
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Choose a strong password and don't reuse it for other accounts.
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-secondary/80 p-8 rounded-lg border border-border" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-foreground mb-1">Current Password</label>
              <input
                id="current-password"
                name="current-password"
                type="password"
                autoComplete="current-password"
                required
                className={inputClasses}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-1">New Password</label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                required
                className={inputClasses}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
             <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className={inputClasses}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;