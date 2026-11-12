import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Users as UsersIcon,
  CheckCircle2,
  XCircle,
  Shield,
  Trash2,
  AlertTriangle,
  ArrowRightLeft,
  Search,
  Filter,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { MOCK_USERS } from '../../data/mockDatabase';

interface UserRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OWNER' | 'CUSTOMER';
  approval_status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  store_name?: string;
  store_id?: string;
  created_at: string;
}

interface AdminUsersScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Deletion modal state
  const [deleteModalUser, setDeleteModalUser] = useState<UserRecord | null>(null);
  const [deleteStoreCheckbox, setDeleteStoreCheckbox] = useState(false);

  // Mock initial seed + fetch state
  const [users, setUsers] = useState<UserRecord[]>(
    MOCK_USERS.map((u) => ({
      id: u.id,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      approval_status: u.approval_status === 'PENDING' ? 'PENDING_APPROVAL' : u.approval_status,
      store_name: u.store_name,
      store_id: u.store_id,
      created_at: u.created_at,
    }))
  );

  // Section 2.2: Accept or Reject Pending Users
  const handleApprovalAction = (userId: string, action: 'accept' | 'reject') => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            approval_status: action === 'accept' ? 'ACTIVE' : 'SUSPENDED',
          };
        }
        return u;
      }),
    );

    showToast({
      type: action === 'accept' ? 'success' : 'info',
      title: action === 'accept' ? 'User Approved' : 'User Rejected',
      description: `Account has been ${action === 'accept' ? 'activated' : 'rejected'}.`,
    });
  };

  // Section 2.2: Change User Role (Owner <-> Customer)
  const handleToggleRole = (userId: string, currentRole: UserRecord['role']) => {
    if (currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN') {
      showToast({ type: 'warning', title: 'Action Denied', description: 'Admin roles are protected.' });
      return;
    }

    const newRole = currentRole === 'OWNER' ? 'CUSTOMER' : 'OWNER';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );

    showToast({
      type: 'success',
      title: 'Role Updated',
      description: `User role successfully changed to ${newRole}.`,
    });
  };

  // Section 2.2: Suspend / Unsuspend User
  const handleToggleSuspend = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, approval_status: newStatus as any } : u)),
    );

    showToast({
      type: 'info',
      title: newStatus === 'SUSPENDED' ? 'User Suspended' : 'User Reinstated',
      description: `User access has been ${newStatus.toLowerCase()}.`,
    });
  };

  // Section 2.2: Delete User with Store Confirmation Prompt
  const confirmDeleteUser = () => {
    if (!deleteModalUser) return;

    setUsers((prev) => prev.filter((u) => u.id !== deleteModalUser.id));

    showToast({
      type: 'success',
      title: 'User Deleted',
      description: deleteStoreCheckbox && deleteModalUser.store_name
        ? `User and store "${deleteModalUser.store_name}" were both removed.`
        : 'User account removed. Linked store preserved.',
    });

    setDeleteModalUser(null);
    setDeleteStoreCheckbox(false);
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === 'pending' && u.approval_status !== 'PENDING_APPROVAL') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        (u.store_name && u.store_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingCount = users.filter((u) => u.approval_status === 'PENDING_APPROVAL').length;

  return (
    <AdminLayout currentPath="/admin/users" onNavigate={onNavigate} onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Manage Users & Approvals</h1>
          <p className="text-xs text-muted">Review onboarding applications, manage marketplace roles, and moderate accounts.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-sand/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-paper text-ink shadow-xs' : 'text-muted hover:text-ink'
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pending' ? 'bg-paper text-ink shadow-xs' : 'text-muted hover:text-ink'
            }`}
          >
            <span>Pending Approvals</span>
            {pendingCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber text-ink font-bold text-[10px] flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name, email, or store..."
          className="w-full bg-paper border border-sand rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink placeholder-muted outline-none focus:ring-1 focus:ring-forest"
        />
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Users Table */}
      <div className="bg-paper rounded-2xl border border-sand overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sand/40 border-b border-sand text-muted font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Approval Status</th>
                <th className="py-3.5 px-4">Linked Store</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-sand/20 transition-colors">
                    {/* User Identity */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-ink text-sm">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-muted">{user.email}</div>
                    </td>

                    {/* Role & Toggle */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-[999px] font-semibold text-[10px] ${
                            user.role === 'OWNER'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-sand text-ink'
                          }`}
                        >
                          {user.role}
                        </span>
                        {user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && (
                          <button
                            type="button"
                            onClick={() => handleToggleRole(user.id, user.role)}
                            className="p-1 hover:bg-sand rounded text-muted hover:text-forest transition-colors cursor-pointer"
                            title="Switch Role (Owner <-> Customer)"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          user.approval_status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : user.approval_status === 'PENDING_APPROVAL'
                            ? 'bg-amber text-ink'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.approval_status === 'PENDING_APPROVAL' ? 'Pending Approval' : user.approval_status}
                      </span>
                    </td>

                    {/* Linked Store */}
                    <td className="py-3.5 px-4">
                      {user.store_name ? (
                        <span className="font-medium text-forest">{user.store_name}</span>
                      ) : (
                        <span className="text-muted italic">No store</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {user.approval_status === 'PENDING_APPROVAL' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprovalAction(user.id, 'accept')}
                            className="px-3 py-1.5 rounded-[999px] bg-forest text-paper font-semibold hover:bg-forest-light transition-all cursor-pointer shadow-xs"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprovalAction(user.id, 'reject')}
                            className="px-3 py-1.5 rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleSuspend(user.id, user.approval_status)}
                            className={`px-3 py-1 rounded-[999px] font-medium transition-colors cursor-pointer ${
                              user.approval_status === 'SUSPENDED'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-sand hover:bg-amber-100 text-amber-900'
                            }`}
                          >
                            {user.approval_status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteModalUser(user)}
                            className="p-1.5 text-muted hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Safe User & Store Deletion (Section 2.2) */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper border border-sand rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-heading text-lg font-bold text-ink">Delete User Account</h3>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              You are about to delete user <strong>{deleteModalUser.email}</strong>. This removes their authentication credentials and account profile.
            </p>

            {deleteModalUser.store_name && (
              <div className="p-3.5 rounded-xl bg-amber/10 border border-amber/20 space-y-2">
                <div className="text-xs font-semibold text-ink">Associated Store Detected</div>
                <p className="text-[11px] text-muted">
                  This user owns <strong>{deleteModalUser.store_name}</strong>. By default, the store is preserved as an active entity.
                </p>
                <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={deleteStoreCheckbox}
                    onChange={(e) => setDeleteStoreCheckbox(e.target.checked)}
                    className="rounded text-forest focus:ring-forest cursor-pointer"
                  />
                  <span>Also permanently delete <strong>{deleteModalUser.store_name}</strong></span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalUser(null);
                  setDeleteStoreCheckbox(false);
                }}
                className="px-4 py-2 rounded-[999px] bg-sand hover:bg-sand-hover text-ink text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-4 py-2 rounded-[999px] bg-red-700 hover:bg-red-800 text-paper text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
