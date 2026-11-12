import React, { useState } from 'react';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { Users, UserPlus, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface StoreStaffMember {
  id: string;
  name: string;
  email: string;
  permission: 'ORDERS_ONLY' | 'PRODUCTS_ONLY' | 'FULL_STORE_ACCESS';
  status: 'ACTIVE' | 'SUSPENDED';
  joined_date: string;
}

export const OwnerStaffScreen: React.FC<{ onNavigate: (path: string) => void; onLogout: () => void }> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [staff, setStaff] = useState<StoreStaffMember[]>([
    {
      id: 'st-1',
      name: 'Amira Hassan',
      email: 'amira@artisan.example',
      permission: 'ORDERS_ONLY',
      status: 'ACTIVE',
      joined_date: '2026-10-01',
    },
    {
      id: 'st-2',
      name: 'Lucas Dupont',
      email: 'lucas@artisan.example',
      permission: 'PRODUCTS_ONLY',
      status: 'ACTIVE',
      joined_date: '2026-10-18',
    },
  ]);

  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [permissionInput, setPermissionInput] = useState<'ORDERS_ONLY' | 'PRODUCTS_ONLY' | 'FULL_STORE_ACCESS'>('ORDERS_ONLY');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim()) return;

    const newStaff: StoreStaffMember = {
      id: `st-${Date.now()}`,
      name: nameInput,
      email: emailInput,
      permission: permissionInput,
      status: 'ACTIVE',
      joined_date: new Date().toISOString().split('T')[0],
    };

    setStaff([...staff, newStaff]);
    setNameInput('');
    setEmailInput('');
    showToast({
      type: 'success',
      title: 'Store Staff Member Added',
      description: `${newStaff.name} has been provisioned with ${newStaff.permission.replace(/_/g, ' ')}.`,
    });
  };

  const handleToggleStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const next = s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          showToast({
            type: next === 'ACTIVE' ? 'success' : 'info',
            title: `Staff ${next === 'ACTIVE' ? 'Reactivated' : 'Suspended'}`,
            description: `${s.name} access is now ${next.toLowerCase()}.`,
          });
          return { ...s, status: next };
        }
        return s;
      }),
    );
  };

  const handleRemove = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
    showToast({ type: 'info', title: 'Staff Removed', description: 'Store member revoked.' });
  };

  return (
    <OwnerLayout currentPath="/owner/staff" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-ink">Store Staff & Team</h1>
          <p className="text-sm text-muted mt-1">
            Delegate day-to-day fulfillment and catalog duties while keeping financial and settings controls reserved for the store owner.
          </p>
        </div>

        {/* Add Staff Form */}
        <div className="bg-paper rounded-2xl border border-sand p-6 shadow-xs">
          <h3 className="font-heading font-bold text-base text-ink mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-forest" />
            <span>Invite Staff Member</span>
          </h3>
          <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Staff Member Name..."
              className="bg-sand/60 rounded-xl px-4 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
              required
            />
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Staff Email..."
              className="bg-sand/60 rounded-xl px-4 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
              required
            />
            <select
              value={permissionInput}
              onChange={(e) => setPermissionInput(e.target.value as any)}
              className="bg-sand/60 rounded-xl px-4 py-2.5 text-xs font-semibold text-ink outline-none cursor-pointer"
            >
              <option value="ORDERS_ONLY">Orders Only (Fulfillment & Tracking)</option>
              <option value="PRODUCTS_ONLY">Products Only (Catalog & Inventory)</option>
              <option value="FULL_STORE_ACCESS">Full Operations (Excluding Earnings)</option>
            </select>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-forest text-paper text-xs font-semibold hover:bg-forest/90 cursor-pointer shadow-xs whitespace-nowrap"
            >
              Add Staff
            </button>
          </form>
        </div>

        {/* Staff Table */}
        <div className="bg-paper rounded-2xl border border-sand overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand/40 border-b border-sand text-muted font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-sand/20 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-ink block">{s.name}</span>
                    <span className="text-muted">{s.email}</span>
                  </td>
                  <td className="p-4 font-semibold text-forest">
                    {s.permission.replace(/_/g, ' ')}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-[999px] text-[10px] font-bold ${
                        s.status === 'ACTIVE' ? 'bg-forest/10 text-forest' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted">{s.joined_date}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(s.id)}
                      className="px-2.5 py-1 rounded-lg bg-sand text-ink hover:bg-sand-hover text-xs font-semibold cursor-pointer"
                    >
                      {s.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(s.id)}
                      className="p-1 text-red-600 hover:text-red-800 cursor-pointer inline-block align-middle"
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
    </OwnerLayout>
  );
};

