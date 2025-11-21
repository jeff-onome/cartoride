
import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm, { UserFormData } from './UserForm';
import { useUserManagement } from '../../hooks/useUserManagement';
import { User } from '../../types';
import Swal from 'sweetalert2';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const { addUser, users } = useUserManagement();

  const handleAddUser = async (userData: UserFormData) => {
     if (users.some(u => u.email === userData.email)) {
        Swal.fire({
            title: 'User Exists',
            text: "A user with this email already exists.",
            icon: 'warning',
            confirmButtonColor: '#2563EB'
        });
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
      Swal.fire({
          title: 'Success!',
          text: 'User created successfully.',
          icon: 'success',
          confirmButtonColor: '#2563EB',
          timer: 2000,
          showConfirmButton: false
      }).then(() => {
          navigate('/superadmin/users');
      });
    } catch(error) {
       console.error("Failed to add user:", error);
       Swal.fire({
            title: 'Error',
            text: "An error occurred. Check if the user already exists in Firebase Auth.",
            icon: 'error',
            confirmButtonColor: '#2563EB'
        });
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
