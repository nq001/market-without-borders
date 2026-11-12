import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Layers,
  Store as StoreIcon,
  Plus,
  Eye,
  LogIn,
  AlertOctagon,
  Trash2,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/currency';

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'ACTIVE' | 'SUSPENDED';
  owner_name: string;
  owner_email: string;
  owner_id: string;
  category_id: string;
  category_name: string;
  productCount: number;
  grossSales: number;
  created_at: string;
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  stores: StoreData[];
}

interface AdminCategoriesScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onEnterStoreImpersonation?: (storeId: string) => void;
}

export const AdminCategoriesScreen: React.FC<AdminCategoriesScreenProps> = ({
  onNavigate,
  onLogout,
  onEnterStoreImpersonation,
}) => {
  const { showToast } = useToast();

  // Stores and Categories state
  const [categories, setCategories] = useState<CategoryData[]>([
    {
      id: 'cat-1',
      name: 'Handcrafted Decor & Ceramics',
      slug: 'decor-ceramics',
      stores: [
        {
          id: 'store-1',
          name: 'Artisan Handcrafts',
          slug: 'artisan-handcrafts',
          description: 'Specialist studio crafting terracotta vases and oak tableware.',
          status: 'ACTIVE',
          owner_name: 'Fulfillment Staff',
          owner_email: 'staff@mwb.com',
          owner_id: 'usr-1',
          category_id: 'cat-1',
          category_name: 'Handcrafted Decor & Ceramics',
          productCount: 28,
          grossSales: 639000,
          created_at: '2026-11-10',
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'Organic Textiles & Apparel',
      slug: 'textiles-apparel',
      stores: [
        {
          id: 'store-2',
          name: 'Heritage Textiles',
          slug: 'heritage-textiles',
          description: 'Organic hand-spun indigo blankets, linens, and natural shawls.',
          status: 'ACTIVE',
          owner_name: 'David Kim',
          owner_email: 'david.kim@textiles.com',
          owner_id: 'usr-david',
          category_id: 'cat-2',
          category_name: 'Organic Textiles & Apparel',
          productCount: 16,
          grossSales: 412000,
          created_at: '2026-11-11',
        },
      ],
    },
    {
      id: 'cat-3',
      name: 'Artisanal Pantry & Spices',
      slug: 'pantry-spices',
      stores: [],
    },
  ]);

  // Store Drawer state (Section 2.3)
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);

  // Add Store modal state (Section 2.3)
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreSlug, setNewStoreSlug] = useState('');
  const [newStoreDesc, setNewStoreDesc] = useState('');
  const [newStoreCategoryId, setNewStoreCategoryId] = useState(categories[0].id);
  const [newStoreOwnerEmail, setNewStoreOwnerEmail] = useState('');

  // Handle Add Store (Dynamically elevates user role to OWNER)
  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName || !newStoreSlug || !newStoreOwnerEmail) return;

    const targetCategory = categories.find((c) => c.id === newStoreCategoryId);
    if (!targetCategory) return;

    const newStore: StoreData = {
      id: `store-${Date.now()}`,
      name: newStoreName,
      slug: newStoreSlug,
      description: newStoreDesc,
      status: 'ACTIVE',
      owner_name: newStoreOwnerEmail.split('@')[0],
      owner_email: newStoreOwnerEmail,
      owner_id: `usr-${Date.now()}`,
      category_id: targetCategory.id,
      category_name: targetCategory.name,
      productCount: 0,
      grossSales: 0,
      created_at: new Date().toISOString().split('T')[0],
    };

    setCategories((prev) =>
      prev.map((c) =>
        c.id === targetCategory.id
          ? { ...c, stores: [...c.stores, newStore] }
          : c,
      ),
    );

    showToast({
      type: 'success',
      title: 'Store Added & Role Elevated',
      description: `Store "${newStoreName}" linked to ${newStoreOwnerEmail}. User role dynamically elevated to Owner.`,
    });

    setIsAddStoreOpen(false);
    setNewStoreName('');
    setNewStoreSlug('');
    setNewStoreDesc('');
    setNewStoreOwnerEmail('');
  };

  // Suspend Store
  const handleToggleSuspendStore = (storeId: string) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        stores: cat.stores.map((s) => {
          if (s.id === storeId) {
            const nextStatus = s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
            return { ...s, status: nextStatus };
          }
          return s;
        }),
      })),
    );

    if (selectedStore && selectedStore.id === storeId) {
      setSelectedStore((prev) =>
        prev ? { ...prev, status: prev.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : null,
      );
    }

    showToast({
      type: 'info',
      title: 'Store Status Updated',
      description: 'Store operational status has been updated across the marketplace.',
    });
  };

  // Delete Store
  const handleDeleteStore = (storeId: string) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        stores: cat.stores.filter((s) => s.id !== storeId),
      })),
    );

    if (selectedStore && selectedStore.id === storeId) {
      setSelectedStore(null);
    }

    showToast({
      type: 'success',
      title: 'Store Removed',
      description: 'Store has been deleted from this category.',
    });
  };

  return (
    <AdminLayout currentPath="/admin/categories" onNavigate={onNavigate} onLogout={onLogout}>
      {/* Header & Add Store Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Categories & Linked Stores</h1>
          <p className="text-xs text-muted">View categories, associate stores, inspect store details, and invoke full admin control.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddStoreOpen(true)}
          className="rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold text-xs px-5 py-2.5 flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Store</span>
        </button>
      </div>

      {/* Category Tree Listing (Section 2.3) */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-paper border border-sand rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-sand">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-forest" />
                <h2 className="font-heading text-base font-bold text-ink">{cat.name}</h2>
                <span className="text-xs text-muted">({cat.stores.length} stores linked)</span>
              </div>
            </div>

            {/* Stores List for this Category */}
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.stores.length === 0 ? (
                <div className="col-span-full py-4 text-center text-xs text-muted italic">
                  No stores linked to this category yet. Click "Add New Store" to link one.
                </div>
              ) : (
                cat.stores.map((store) => (
                  <div
                    key={store.id}
                    className="p-4 rounded-xl border border-sand hover:border-forest/50 bg-sand/20 hover:bg-sand/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading text-sm font-bold text-ink">{store.name}</h3>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            store.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {store.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1.5 line-clamp-2">{store.description}</p>
                      <div className="mt-3 text-[11px] text-muted space-y-0.5">
                        <div>Owner: <strong className="text-ink">{store.owner_name}</strong></div>
                        <div>Products: <strong className="text-ink">{store.productCount}</strong></div>
                      </div>
                    </div>

                    {/* Quick Store Actions */}
                    <div className="mt-4 pt-3 border-t border-sand flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStore(store)}
                        className="text-xs font-semibold text-forest hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Drawer</span>
                      </button>

                      {/* Section 2.3: Full Admin Control (Enter Store) */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onEnterStoreImpersonation) {
                            onEnterStoreImpersonation(store.id);
                          } else {
                            showToast({
                              type: 'info',
                              title: 'Full Admin Control Invoked',
                              description: `Switching workspace context to "${store.name}". You now have full owner authority.`,
                            });
                            onNavigate('/owner');
                          }
                        }}
                        className="px-2.5 py-1 rounded-[999px] bg-forest text-paper hover:bg-forest-light text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                        title="Enter store with full owner control"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>Enter Store</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Store Drawer (Section 2.3) */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-paper h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-sand">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-sand">
                <div className="flex items-center gap-2">
                  <StoreIcon className="w-5 h-5 text-forest" />
                  <h2 className="font-heading text-lg font-bold text-ink">Store Telemetry Drawer</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStore(null)}
                  className="p-1 rounded-lg hover:bg-sand text-muted hover:text-ink cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Store Details */}
              <div className="py-5 space-y-4 text-xs">
                <div>
                  <label className="text-muted block text-[11px] uppercase tracking-wider font-semibold">Store Name</label>
                  <div className="font-heading text-lg font-bold text-ink mt-0.5">{selectedStore.name}</div>
                  <div className="text-muted font-mono text-[11px]">slug: {selectedStore.slug}</div>
                </div>

                <div>
                  <label className="text-muted block text-[11px] uppercase tracking-wider font-semibold">Category Association</label>
                  <div className="font-medium text-forest text-sm mt-0.5">{selectedStore.category_name}</div>
                </div>

                <div>
                  <label className="text-muted block text-[11px] uppercase tracking-wider font-semibold">Owner Information</label>
                  <div className="font-medium text-ink mt-0.5">{selectedStore.owner_name} ({selectedStore.owner_email})</div>
                </div>

                <div>
                  <label className="text-muted block text-[11px] uppercase tracking-wider font-semibold">Description</label>
                  <p className="text-muted leading-relaxed mt-0.5">{selectedStore.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-sand/30 border border-sand">
                    <span className="text-muted text-[10px] uppercase">Active Catalog</span>
                    <div className="font-bold text-base text-ink mt-0.5">{selectedStore.productCount} Items</div>
                  </div>
                  <div className="p-3 rounded-xl bg-sand/30 border border-sand">
                    <span className="text-muted text-[10px] uppercase">Gross Revenue</span>
                    <div className="font-bold text-base text-ink mt-0.5">{formatCurrency(selectedStore.grossSales)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="pt-4 border-t border-sand space-y-3">
              {/* Full Admin Control Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedStore(null);
                  if (onEnterStoreImpersonation) {
                    onEnterStoreImpersonation(selectedStore.id);
                  } else {
                    showToast({
                      type: 'info',
                      title: 'Entering Store',
                      description: `Logged in as Owner for "${selectedStore.name}".`,
                    });
                    onNavigate('/owner');
                  }
                }}
                className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3 text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Enter Store (Full Admin Control)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleSuspendStore(selectedStore.id)}
                  className={`flex-1 rounded-[999px] py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    selectedStore.status === 'ACTIVE'
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {selectedStore.status === 'ACTIVE' ? 'Suspend Store' : 'Reinstate Store'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteStore(selectedStore.id)}
                  className="px-4 py-2 rounded-[999px] bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Store Modal (Section 2.3) */}
      {isAddStoreOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper border border-sand rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sand">
              <h3 className="font-heading text-lg font-bold text-ink">Add Store & Assign Owner</h3>
              <button
                type="button"
                onClick={() => setIsAddStoreOpen(false)}
                className="p-1 rounded-lg hover:bg-sand text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => {
                    setNewStoreName(e.target.value);
                    setNewStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="e.g. Damascus Silks"
                  className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Store URL Slug *</label>
                <input
                  type="text"
                  required
                  value={newStoreSlug}
                  onChange={(e) => setNewStoreSlug(e.target.value)}
                  placeholder="damascus-silks"
                  className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Primary Category *</label>
                <select
                  value={newStoreCategoryId}
                  onChange={(e) => setNewStoreCategoryId(e.target.value)}
                  className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Owner User Email *</label>
                <input
                  type="email"
                  required
                  value={newStoreOwnerEmail}
                  onChange={(e) => setNewStoreOwnerEmail(e.target.value)}
                  placeholder="owner@artisan.com"
                  className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
                />
                <span className="text-[11px] text-muted mt-1 block">
                  If this user is currently a Customer, saving this will dynamically elevate their role to <strong>Owner</strong>.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newStoreDesc}
                  onChange={(e) => setNewStoreDesc(e.target.value)}
                  placeholder="Brief description of store products and philosophy..."
                  className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2 text-xs text-ink outline-none focus:ring-1 focus:ring-forest resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand">
                <button
                  type="button"
                  onClick={() => setIsAddStoreOpen(false)}
                  className="px-4 py-2 rounded-[999px] bg-sand hover:bg-sand-hover text-ink text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[999px] bg-forest hover:bg-forest-light text-paper text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  Create & Link Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
