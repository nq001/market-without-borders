import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Shield, UserPlus, Trash2, CheckCircle2, Lock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SUPPORT_MODERATOR' | 'FINANCE_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  created_at: string;
}

export const AdminTeamScreen: React.FC<{ onNavigate: (path: string) => void; onLogout: () => void }> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [members, setMembers] = useState<AdminMember[]>([
    {
      id: 'adm-1',
      name: 'Platform Administrator',
      email: 'admin@mwb.example',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      created_at: '2026-08-01',
    },
    {
      id: 'adm-2',
      name: 'Nora Support Specialist',
      email: 'support@mwb.example',
      role: 'SUPPORT_MODERATOR',
      status: 'ACTIVE',
      created_at: '2026-10-15',
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'SUPER_ADMIN' | 'SUPPORT_MODERATOR' | 'FINANCE_ADMIN'>('SUPPORT_MODERATOR');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    const newMember: AdminMember = {
      id: `adm-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'ACTIVE',
      created_at: new Date().toISOString().split('T')[0],
    };

    setMembers([...members, newMember]);
    setInviteEmail('');
    setInviteName('');
    showToast({
      type: 'success',
      title: 'Admin Invitation Dispatched',
      description: `${inviteName} has been assigned the ${inviteRole} permission set.`,
    });
  };

  const handleRemove = (id: string) => {
    if (members.length <= 1) {
      showToast({ type: 'error', title: 'Cannot Delete', description: 'At least one Super Admin must remain.' });
      return;
    }
    setMembers(members.filter((m) => m.id !== id));
    showToast({ type: 'info', title: 'Admin Member Removed', description: 'Access credentials revoked.' });
  };

  return (
    <AdminLayout currentPath="/admin/admin-team" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-ink">Admin Team & RBAC</h1>
          <p className="text-sm text-muted mt-1">
            Delegate operational control across support moderators, financial auditors, and platform owners.
          </p>
        </div>

        {/* Invite Form */}
        <div className="bg-paper rounded-2xl border border-sand p-6 shadow-xs">
          <h3 className="font-heading font-bold text-base text-ink mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-forest" />
            <span>Provision New Admin Account</span>
          </h3>
          <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Full Name..."
              className="bg-sand/60 rounded-xl px-4 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
              required
            />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address..."
              className="bg-sand/60 rounded-xl px-4 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
              required
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="bg-sand/60 rounded-xl px-4 py-2.5 text-xs font-semibold text-ink outline-none cursor-pointer"
            >
              <option value="SUPPORT_MODERATOR">Support Moderator (Complaints & Reviews)</option>
              <option value="FINANCE_ADMIN">Finance Admin (Payouts & Fees)</option>
              <option value="SUPER_ADMIN">Super Admin (Unrestricted)</option>
            </select>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-forest text-paper text-xs font-semibold hover:bg-forest/90 cursor-pointer shadow-xs whitespace-nowrap"
            >
              Send Invitation
            </button>
          </form>
        </div>

        {/* Members Table */}
        <div className="bg-paper rounded-2xl border border-sand overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand/40 border-b border-sand text-muted font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Name & Email</th>
                <th className="p-4">Permission Level</th>
                <th className="p-4">Status</th>
                <th className="p-4">Provisioned Date</th>
                <th className="p-4 text-right">Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-sand/20 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-ink block">{m.name}</span>
                    <span className="text-muted">{m.email}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-[999px] text-[10px] font-bold ${
                        m.role === 'SUPER_ADMIN'
                          ? 'bg-forest text-paper'
                          : m.role === 'FINANCE_ADMIN'
                          ? 'bg-amber text-ink'
                          : 'bg-sand font-semibold text-ink'
                      }`}
                    >
                      {m.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-forest font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  </td>
                  <td className="p-4 text-muted">{m.created_at}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(m.id)}
                      className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                      title="Revoke access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

