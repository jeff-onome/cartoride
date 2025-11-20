import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { COUNTRIES_WITH_STATES } from '../../data/locationData';

export type UserFormData = Omit<User, 'uid' | 'address' | 'verificationStatus' | 'kycDocument'> & { uid?: string, password?: string };

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: UserFormData) => void;
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSubmit, isEdit = false }) => {
  const [formData, setFormData] = useState<UserFormData>(initialData || {
    fname: '',
    lname: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    role: 'customer',
    status: 'Active',
    password: '',
  });
  
  const [statesForCountry, setStatesForCountry] = useState<string[]>([]);
  const countries = Object.keys(COUNTRIES_WITH_STATES).sort();
  
  useEffect(() => {
    if (initialData?.country) {
        setStatesForCountry(COUNTRIES_WITH_STATES[initialData.country] || []);
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.country) {
      setStatesForCountry(COUNTRIES_WITH_STATES[formData.country] || []);
      if (formData.country !== initialData?.country) {
          setFormData(prev => ({...prev, state: ''}));
      }
    } else {
      setStatesForCountry([]);
    }
  }, [formData.country, initialData?.country]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!isEdit && (!formData.password || formData.password.length < 6)){
        alert("Password must be at least 6 characters long.");
        return;
    }
    onSubmit(formData);
  };

  const inputClass = "w-full bg-background border border-input rounded-md p-2 focus:ring-ring focus:border-ring text-foreground";
  
  return (
    <form onSubmit={handleSubmit} className="bg-secondary p-8 rounded-lg border border-border space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className="block text-sm font-medium mb-1">First Name</label><input type="text" name="fname" value={formData.fname} onChange={handleChange} className={inputClass} required /></div>
        <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" name="lname" value={formData.lname} onChange={handleChange} className={inputClass} required /></div>
        <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required disabled={isEdit} /></div>
        <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} required /></div>
        <div><label className="block text-sm font-medium mb-1">Country</label>
            <select name="country" value={formData.country} onChange={handleChange} className={inputClass} required>
                <option value="" disabled>Select Country</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
        <div><label className="block text-sm font-medium mb-1">State/Province</label>
            <select name="state" value={formData.state} onChange={handleChange} className={inputClass} required disabled={!formData.country}>
                <option value="" disabled>Select State/Province</option>
                {statesForCountry.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
        <div><label className="block text-sm font-medium mb-1">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className={inputClass} required>
                <option value="customer">Customer</option>
                <option value="dealer">Dealer</option>
                <option value="superadmin">Super Admin</option>
            </select>
        </div>
        {!isEdit && (
             <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} required placeholder="Min. 6 characters" /></div>
        )}
      </div>

      <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors">
        {isEdit ? 'Save Changes' : 'Create User'}
      </button>
    </form>
  );
};

export default UserForm;