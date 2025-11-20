import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserForm, { UserFormData } from './UserForm';
import { useUserManagement } from '../../hooks/useUserManagement';

const EditUser: React.FC = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const { users, updateUser } = useUserManagement();
  
  const decodedEmail = email ? decodeURIComponent(email) : '';
  const userToEdit = users.find(u => u.email === decodedEmail);

  const handleUpdateUser = (formData: UserFormData) => {
    if (!userToEdit) return;
    
    // The form doesn't handle password changes, so we only pass non-password data.
    const { password, ...updateData } = formData;
    
    updateUser(userToEdit.uid, updateData);
    navigate('/superadmin/users');
  };
  
  if (!userToEdit) {
      return (
          <div className="text-center py-10">
              <h2 className="text-2xl font-bold">User not found</h2>
              <p className="text-muted-foreground">The user you're trying to edit does not exist.</p>
              <Link to="/superadmin/users" className="text-accent mt-4 inline-block">Back to User Management</Link>
          </div>
      )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Edit User</h1>
      <UserForm onSubmit={handleUpdateUser} initialData={userToEdit} isEdit={true} />
    </div>
  );
};

export default EditUser;