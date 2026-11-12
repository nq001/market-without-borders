import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Store as StoreIcon,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  LogIn,
  AlertOctagon,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/currency';

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  owner_name: string;
  owner_email: string;
  owner_id: string;
  category_name: string;
  productCount: number;
  grossSales: number;
  created_at: string;
}

interface AdminStoresScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onEnterStoreImpersonation?: (storeId: string) => void;
}

export const AdminStoresScreen: React.FC<AdminStoresScreenProps> = ({
  onNavigate,
  onLogout,
  onEnterStoreImpersonation,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED'>('ALL');
  const [selectedDrawerStore, setSelectedDrawerStore] = useState<StoreItem | null>(null);

  const [stores, setStores] = useState<StoreItem[]>([
    {
      id: 'store-1',
      name: 'Artisan Handcrafts',
      slug: 'artisan-handcrafts',
      description: 'Handmade pottery, woven ceramics, and fine woodcraft items.',
      status: 'ACTIVE',
      owner_name: 'Elena Rostova',
      owner_email: 'staff@mwb.com',
      owner_id: 'usr-1',
      category_name: 'Ceramics & Home Decor',
      productCount: 28,
      grossSales: 840000,
      created_at: '2026-09-12',
    },
    {
      id: 'store-2',
      name: 'Heritage Textiles',
      slug: 'heritage-textiles',
      description: 'Traditional loomed rugs, raw cotton scarves, and linen fabrics.',
      status: 'ACTIVE',
      owner_name: 'Marcus Vance',
      owner_email: 'marcus@heritage.com',
      owner_id: 'usr-2',
      category_name: 'Apparel & Textiles',
      productCount: 20,
      grossSales: 408000,
      created_at: '2026-10-01',
    },
    {
      id: 'store-3',
      name: 'Nomad Leatherworks',
      slug: 'nomad-leather',
      description: 'Full-grain vegetable-tanned leather goods and bespoke luggage.',
      status: 'PENDING',
      owner_name: 'Tariq Al-Mansoor',
      owner_email: 'tariq@nomad.com',
      owner_id: 'usr-3',
      category_name: 'Accessories',
      productCount: 6,
      grossSales: 0,
      created_at: '2026-11-10',
    },
  ]);

  const handleToggleStoreStatus = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          const nextStatus = s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          showToast({
            type: nextStatus === 'ACTIVE' ? 'success' : 'info',
            title: `Store ${nextStatus === 'ACTIVE' ? 'Reactivated' : 'Suspended'}`,
            description: `Store ${s.name} is now ${nextStatus.toLowerCase()}.`,
          });
          return { ...s, status: nextStatus };
        }
        return s;
      }),
    );
  };

  const handleApproveStore = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          showToast({
            type: 'success',
            title: 'Store Approved',
            description: `${s.name} has been approved and is now active.`,
          });
          return { ...s, status: 'ACTIVE' };
        }
        return s;
      }),
    );
  };

  const filteredStores = stores.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout currentPath="/admin/stores" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-ink">Stores Management</h1>
            <p className="text-sm text-muted mt-1">
              Approve, suspend, inspect, or impersonate marketplace independent artisan stores.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-[999px] bg-sand font-semibold text-ink">
              Total: {stores.length}
            </span>
            <span className="text-xs px-3 py-1 rounded-[999px] bg-amber/20 text-ink font-semibold">
              Pending: {stores.filter((s) => s.status === 'PENDING').length}
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-paper p-4 rounded-2xl border border-sand shadow-xs flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by store name, owner, or category..."
              className="w-full bg-sand/60 rounded-[999px] pl-10 pr-4 py-2.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
            />
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-sand/60 rounded-xl px-3 py-2 text-xs font-semibold text-ink outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending Approval</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Stores Grid / Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className={`bg-paper rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
                store.status === 'SUSPENDED'
                  ? 'border-red-200 bg-red-50/20'
                  : store.status === 'PENDING'
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-sand hover:border-forest/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <StoreIcon className="w-5 h-5 text-forest" />
                    <h3 className="font-heading font-bold text-base text-ink truncate">{store.name}</h3>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[999px] ${
                      store.status === 'ACTIVE'
                        ? 'bg-forest/10 text-forest'
                        : store.status === 'PENDING'
                        ? 'bg-amber text-ink'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {store.status}
                  </span>
                </div>

                <p className="text-xs text-muted line-clamp-2 mb-4">{store.description}</p>

                <div className="bg-sand/40 rounded-xl p-3 space-y-1.5 text-xs text-ink mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted">Owner:</span>
                    <span className="font-semibold">{store.owner_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Category:</span>
                    <span>{store.category_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Products:</span>
                    <span>{store.productCount} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Gross Sales:</span>
                    <span className="font-semibold">{formatCurrency(store.grossSales)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-sand">
                <button
                  type="button"
                  onClick={() => setSelectedDrawerStore(store)}
                  className="flex items-center gap-1 text-xs text-ink hover:text-forest font-semibold cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Drawer</span>
                </button>

                <div className="flex items-center gap-2">
                  {store.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleApproveStore(store.id)}
                      className="px-2.5 py-1 rounded-[999px] bg-forest text-paper text-xs font-semibold hover:bg-forest/90 cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                  {store.status !== 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleToggleStoreStatus(store.id)}
                      className={`px-2.5 py-1 rounded-[999px] text-xs font-semibold cursor-pointer ${
                        store.status === 'ACTIVE'
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-forest/10 text-forest hover:bg-forest/20'
                      }`}
                    >
                      {store.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Store Summary Drawer (Section 2.6) */}
        {selectedDrawerStore && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
            <div className="w-full max-w-md bg-paper h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between border-b border-sand pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <StoreIcon className="w-5 h-5 text-forest" />
                    <h2 className="font-heading font-bold text-lg text-ink">Store Profile Drawer</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDrawerStore(null)}
                    className="p-1 rounded-full hover:bg-sand text-muted hover:text-ink cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5 text-sm">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-ink">{selectedDrawerStore.name}</h3>
                    <p className="text-xs text-muted mt-1">{selectedDrawerStore.description}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-sand/40 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Status:</span>
                      <span className="font-bold text-forest">{selectedDrawerStore.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Owner Account:</span>
                      <span className="font-semibold">{selectedDrawerStore.owner_name} ({selectedDrawerStore.owner_email})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Category:</span>
                      <span>{selectedDrawerStore.category_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Total Products:</span>
                      <span>{selectedDrawerStore.productCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Gross Sales:</span>
                      <span className="font-bold">{formatCurrency(selectedDrawerStore.grossSales)}</span>
                    </div>
                  </div>

                  {/* Section 2.6: Full Admin Control Impersonation Mode */}
                  <div className="p-4 rounded-xl border border-forest/20 bg-forest/5 space-y-2">
                    <div className="flex items-center gap-2 text-forest font-bold text-xs uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Full Admin Control</span>
                    </div>
                    <p className="text-xs text-ink/80 leading-relaxed">
                      Enter this store workspace directly to inspect or edit products, orders, and configurations as the owner. Actions are recorded in the Activity Log.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = selectedDrawerStore.id;
                        setSelectedDrawerStore(null);
                        if (onEnterStoreImpersonation) {
                          onEnterStoreImpersonation(targetId);
                        } else {
                          onNavigate(`/owner?storeId=${targetId}`);
                        }
                      }}
                      className="w-full mt-2 py-2.5 px-4 rounded-xl bg-forest text-paper font-semibold text-xs flex items-center justify-center gap-2 hover:bg-forest/90 cursor-pointer shadow-xs"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Enter Store Workspace</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-sand">
                <button
                  type="button"
                  onClick={() => setSelectedDrawerStore(null)}
                  className="w-full py-2.5 rounded-xl bg-sand text-ink text-xs font-semibold hover:bg-sand-hover cursor-pointer"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

