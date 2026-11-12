import React, { useState } from 'react';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  stock: number;
}

interface OwnerProductsScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  storeName?: string;
}

export const OwnerProductsScreen: React.FC<OwnerProductsScreenProps> = ({
  onNavigate,
  onLogout,
  storeName = 'Artisan Handcrafts',
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<ProductItem[]>([
    { id: 'p1', name: 'Terracotta Handcrafted Vase', sku: 'THV-001', price: 4500, category: 'Handcrafted Decor', stock: 18 },
    { id: 'p2', name: 'Raw Oak Serving Platter', sku: 'OSP-002', price: 3800, category: 'Handcrafted Decor', stock: 9 },
    { id: 'p3', name: 'Ceramic Pour-Over Dripper', sku: 'CPD-003', price: 2900, category: 'Handcrafted Decor', stock: 24 },
    { id: 'p4', name: 'Carved Walnut Spoon Set', sku: 'WSS-004', price: 2500, category: 'Handcrafted Decor', stock: 14 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newPrice, setNewPrice] = useState(35);
  const [newCategory, setNewCategory] = useState('Handcrafted Decor');
  const [newStock, setNewStock] = useState(15);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ProductItem = {
      id: `prod-${Date.now()}`,
      name: newName,
      sku: newSku,
      price: Math.round(newPrice * 100),
      category: newCategory,
      stock: newStock,
    };
    setProducts((prev) => [item, ...prev]);
    showToast({ type: 'success', title: 'Product Added', description: `"${newName}" added to your store.` });
    setIsModalOpen(false);
    setNewName('');
    setNewSku('');
  };

  const handleDelete = (id: string, name: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast({ type: 'info', title: 'Product Removed', description: `"${name}" removed from store.` });
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <OwnerLayout currentPath="/owner/products" storeName={storeName} onNavigate={onNavigate} onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">My Store Products</h1>
          <p className="text-xs text-muted">Create, edit, and manage items sold exclusively through your storefront.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold text-xs px-5 py-2.5 flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name or SKU..."
          className="w-full bg-paper border border-sand rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
        />
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Products Table (Section 3.2) */}
      <div className="bg-paper border border-sand rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sand/40 border-b border-sand text-muted font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Inventory</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-sand/20 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-ink">{p.name}</td>
                  <td className="py-3.5 px-4 font-mono text-muted">{p.sku}</td>
                  <td className="py-3.5 px-4 font-bold text-ink">{formatCurrency(p.price)}</td>
                  <td className="py-3.5 px-4 text-muted">{p.category}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-forest">{p.stock} units</span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 text-muted hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Product"
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

      {/* Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper border border-sand rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sand">
              <h3 className="font-heading text-lg font-bold text-ink">Add Product to Store</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-sand text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setNewSku(e.target.value.substring(0, 3).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100));
                  }}
                  placeholder="e.g. Stoneware Espresso Cup"
                  className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink font-mono outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Price ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Initial Stock Units *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-[999px] bg-sand hover:bg-sand-hover text-ink text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[999px] bg-forest hover:bg-forest-light text-paper text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
};

