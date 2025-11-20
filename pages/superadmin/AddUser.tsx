import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm, { UserFormData } from './UserForm';
import { useUserManagement } from '../../hooks/useUserManagement';
import { User } from '../../types';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const { addUser, users } = useUserManagement();

  const handleAddUser = async (userData: UserFormData) => {
     if (users.some(u => u.email === userData.email)) {
        alert("A user with this email already exists.");
        return;
    }
    const { password, ...restOfUserData } = userData;
    const userToCreate: Omit<User, 'uid'> = {
        ...restOfUserData,
        address: null,
        verificationStatus: 'Unverified',
        kycDocument: null,
        favorites: [],
        recentlyViewed: [],
        compareItems: [],
    };

    try {
      await addUser(userToCreate, password || '');
      navigate('/superadmin/users');
    } catch(error) {
       console.error("Failed to add user:", error);
       alert("An error occurred. Check if the user already exists in Firebase Auth.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Create New User</h1>
      <UserForm onSubmit={handleAddUser} />
    </div>
  );
};

export default AddUser;