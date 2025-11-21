
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useCars } from '../../hooks/useCars';
import { PencilIcon, TrashIcon, PlusCircleIcon, EyeIcon, LockClosedIcon, LockOpenIcon, SearchIcon } from '../../components/IconComponents';
import type { User } from '../../types';
import KYCViewerModal from '../../components/KYCViewerModal';
import Swal from 'sweetalert2';

const ManageUsers: React.FC = () => {
  const { users, deleteUser, updateUser } = useUserManagement();
  const { deleteCarsByDealer } = useCars();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [kycViewerState, setKycViewerState] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });

  const filteredUsers = useMemo(() => 
    users.filter(user => 
      `${user.fname} ${user.lname} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);

  const handleAction = (user: User, action: 'approve' | 'reject' | 'delete' | 'block' | 'unblock') => {
    const actionConfig: Record<string, { title: string; text: string; confirmColor: string }> = {
        approve: { title: 'Approve Verification?', text: `Grant full access to ${user.fname} ${user.lname}?`, confirmColor: '#2563EB' },
        reject: { title: 'Reject Verification?', text: `Reject verification for ${user.fname} ${user.lname}?`, confirmColor: '#DC2626' },
        delete: { title: 'Delete User?', text: `Permanently delete ${user.fname} ${user.lname}? This cannot be undone.`, confirmColor: '#DC2626' },
        block: { title: 'Block User?', text: `Block access for ${user.fname} ${user.lname}?`, confirmColor: '#DC2626' },
        unblock: { title: 'Unblock User?', text: `Restore access for ${user.fname} ${user.lname}?`, confirmColor: '#2563EB' },
    };

    const config = actionConfig[action];

    Swal.fire({
        title: config.title,
        text: config.text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: config.confirmColor,
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, confirm'
    }).then((result) => {
        if (result.isConfirmed) {
            switch (action) {
                case 'approve':
                    updateUser(user.uid, { verificationStatus: 'Verified' });
                    break;
                case 'reject':
                    updateUser(user.uid, { verificationStatus: 'Rejected' });
                    break;
                case 'delete':
                    if (user.role === 'dealer') {
                        deleteCarsByDealer(user.uid);
                    }
                    deleteUser(user.uid);
                    break;
                case 'block':
                    updateUser(user.uid, { status: 'Blocked' });
                    break;
                case 'unblock':
                    updateUser(user.uid, { status: 'Active' });
                    break;
            }
            Swal.fire('Success!', 'Action completed successfully.', 'success');
        }
    });
  };
  
  const VerificationStatusBadge: React.FC<{status: User['verificationStatus']}> = ({ status }) => {
    const statusStyles = {
        Verified: { text: 'text-green-500', bg: 'bg-green-500/10' },
        Pending: { text: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        Unverified: { text: 'text-gray-500', bg: 'bg-gray-500/10' },
        Rejected: { text: 'text-red-500', bg: 'bg-red-500/10' },
    };
    const style = statusStyles[status];
    return <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${style.bg} ${style.text}`}>{status}</span>
  };

  const AccountStatusBadge: React.FC<{status: User['status']}> = ({ status }) => {
    const statusStyles = {
        Active: { text: 'text-green-500', bg: 'bg-green-500/10' },
        Blocked: { text: 'text-red-500', bg: 'bg-red-500/10' },
    };
    const style = statusStyles[status];
    return <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${style.bg} ${style.text}`}>{status}</span>
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
        <div className="flex items-center gap-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 bg-background border border-input rounded-md pl-10 pr-4 py-2 focus:ring-ring focus:border-ring text-foreground"
                />
            </div>
            <Link to="/superadmin/users/add" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">
                <PlusCircleIcon className="w-5 h-5"/>
                <span className="hidden sm:inline">Add User</span>
            </Link>
        </div>
      </div>

      <div className="bg-secondary rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background">
              <tr>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Verification</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.uid} className="border-t border-border">
                    <td className="p-4 font-bold text-foreground">{user.fname} {user.lname}</td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <span className="capitalize px-2 py-1 text-xs rounded-full bg-accent/20 text-accent-foreground font-semibold">{user.role}</span>
                    </td>
                    <td className="p-4">
                       <AccountStatusBadge status={user.status} />
                    </td>
                    <td className="p-4">
                      <VerificationStatusBadge status={user.verificationStatus} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {user.verificationStatus === 'Pending' && (
                          <>
                            <button onClick={() => handleAction(user, 'approve')} className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500 hover:bg-green-500/30">Approve</button>
                            <button onClick={() => handleAction(user, 'reject')} className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500 hover:bg-red-500/30">Reject</button>
                          </>
                        )}
                        {user.kycDocument && (
                           <button onClick={() => setKycViewerState({isOpen: true, user})} className="p-2 text-muted-foreground hover:text-accent" title="View KYC Documents">
                               <EyeIcon className="w-4 h-4" />
                           </button>
                        )}
                        <button onClick={() => navigate(`/superadmin/users/edit/${encodeURIComponent(user.email)}`)} className="p-2 text-muted-foreground hover:text-accent" title="Edit User">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {user.status === 'Active' ? (
                             <button onClick={() => handleAction(user, 'block')} className="p-2 text-muted-foreground hover:text-red-500" title="Block User">
                                <LockClosedIcon className="w-4 h-4" />
                             </button>
                          ) : (
                             <button onClick={() => handleAction(user, 'unblock')} className="p-2 text-muted-foreground hover:text-green-500" title="Unblock User">
                                <LockOpenIcon className="w-4 h-4" />
                             </button>
                          )}
                        <button onClick={() => handleAction(user, 'delete')} className="p-2 text-muted-foreground hover:text-red-500" title="Delete User">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground">
                    {searchTerm ? `No users found for "${searchTerm}".` : "There are no registered users on the platform."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
       {kycViewerState.isOpen && kycViewerState.user && (
          <KYCViewerModal 
            user={kycViewerState.user}
            onClose={() => setKycViewerState({ isOpen: false, user: null })}
          />
      )}
    </div>
  );
};

export default ManageUsers;
