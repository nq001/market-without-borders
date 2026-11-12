import React, { useState } from 'react';
import { Search, Plus, Edit2, Ban, CheckCircle2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Drawer } from '../../components/common/Drawer';
import { StockBadge } from '../../components/common/StockBadge';
import { formatPrice } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

interface AdminProductsScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

interface AdminProductRow {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  is_active: boolean;
}

export const AdminProductsScreen: React.FC<AdminProductsScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductRow | null>(null);

  const [products, setProducts] = useState<AdminProductRow[]>([
    {
      id: 'prod-1',
      name: 'Pro Laptop 15"',
      sku: 'LAP-123',
      category: 'Laptops',
      price: 150000,
      stock: 50,
      is_active: true,
    },
    {
      id: 'prod-2',
      name: 'USB-C Docking Station',
      sku: 'ACC-402',
      category: 'Accessories',
      price: 18000,
      stock: 35,
      is_active: true,
    },
    {
      id: 'prod-3',
      name: 'Mechanical Wireless Keyboard',
      sku: 'KEY-801',
      category: 'Workspace & Audio',
      price: 18500,
      stock: 4,
      is_active: true,
    },
    {
      id: 'prod-4',
      name: 'Ergonomic Vertical Mouse',
      sku: 'MOU-551',
      category: 'Workspace & Audio',
      price: 8900,
      stock: 0,
      is_active: false,
    },
  ]);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('Laptops');
  const [formPriceMinor, setFormPriceMinor] = useState('150000');
  const [formInitialStock, setFormInitialStock] = useState('50');

  const openCreateDrawer = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`SKU-${Date.now().toString().slice(-4)}`);
    setFormCategory('Laptops');
    setFormPriceMinor('10000');
    setFormInitialStock('25');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (prod: AdminProductRow) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormSku(prod.sku);
    setFormCategory(prod.category);
    setFormPriceMinor(prod.price.toString());
    setFormInitialStock(prod.stock.toString());
    setIsDrawerOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formName,
                sku: formSku,
                category: formCategory,
                price: Number(formPriceMinor),
              }
            : p,
        ),
      );
      showToast({ type: 'success', title: 'Product Updated', description: `${formName} metadata saved.` });
    } else {
      const newProd: AdminProductRow = {
        id: `prod-${Date.now()}`,
        name: formName,
        sku: formSku,
        category: formCategory,
        price: Number(formPriceMinor),
        stock: Number(formInitialStock),
        is_active: true,
      };
      setProducts((prev) => [newProd, ...prev]);
      showToast({ type: 'success', title: 'Product Created', description: `${formName} added with ${formInitialStock} stock.` });
    }

    setIsDrawerOpen(false);
  };

  const toggleProductActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.is_active;
          showToast({
            type: nextState ? 'success' : 'warning',
            title: nextState ? 'Product Activated' : 'Product Deactivated',
            description: `${p.name} is now ${nextState ? 'visible in storefront' : 'hidden from catalog'}.`,
          });
          return { ...p, is_active: nextState };
        }
        return p;
      }),
    );
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout
      currentPath="/admin/products"
      breadcrumbs={['Catalog', 'Products']}
      title="Product Catalog & Inventory Matrix"
      actionButton={{ label: 'New Product', onClick: openCreateDrawer }}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="bg-paper border border-sand rounded-[28px] p-6 space-y-6 shadow-xs">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product title or SKU..."
              className="w-full bg-sand/60 rounded-[999px] py-2 pl-9 pr-4 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
            />
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <span className="text-xs text-muted font-medium">
            Showing {filtered.length} of {products.length} catalog items
          </span>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sand text-muted uppercase tracking-wider">
                <th className="pb-3">Product Name</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Inventory</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-sand/20 transition-colors">
                  <td className="py-4 font-semibold text-sm text-ink">{prod.name}</td>
                  <td className="py-4 font-mono text-muted">{prod.sku}</td>
                  <td className="py-4 font-medium text-ink">{prod.category}</td>
                  <td className="py-4 font-heading font-semibold text-sm text-ink">
                    {formatPrice(prod.price)}
                  </td>
                  <td className="py-4">
                    <StockBadge quantity={prod.stock} />
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-[999px] ${
                        prod.is_active ? 'bg-forest/10 text-forest' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {prod.is_active ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditDrawer(prod)}
                      className="p-1 text-muted hover:text-forest transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleProductActive(prod.id)}
                      className={`p-1 transition-colors cursor-pointer ${
                        prod.is_active ? 'text-muted hover:text-red-700' : 'text-forest hover:text-forest-light'
                      }`}
                      title={prod.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {prod.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer for Create & Edit */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingProduct ? 'Edit Product Details' : 'Create New Product'}
        footer={
          <button
            type="submit"
            form="product-form"
            className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3 text-sm transition-all shadow-md cursor-pointer"
          >
            {editingProduct ? 'Save Modifications' : 'Create Product & Allocate Stock'}
          </button>
        }
      >
        <form id="product-form" onSubmit={handleSaveProduct} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">Product Title</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Ultra Ergonomic Monitor Arm"
              className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">SKU</label>
              <input
                type="text"
                required
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink font-mono outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink outline-none focus:ring-1 focus:ring-forest cursor-pointer"
              >
                <option value="Laptops">Laptops</option>
                <option value="Accessories">Accessories</option>
                <option value="Workspace & Audio">Workspace & Audio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">
              Price (in minor units cents: e.g. 150000 = 1,500.00)
            </label>
            <input
              type="number"
              required
              min="100"
              value={formPriceMinor}
              onChange={(e) => setFormPriceMinor(e.target.value)}
              className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink font-mono outline-none focus:ring-1 focus:ring-forest"
            />
            <span className="text-xs text-muted block mt-1">
              Display Price: <strong className="text-ink">{formatPrice(Number(formPriceMinor) || 0)}</strong>
            </span>
          </div>

          {!editingProduct && (
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Initial Stock Allocation
              </label>
              <input
                type="number"
                required
                min="0"
                value={formInitialStock}
                onChange={(e) => setFormInitialStock(e.target.value)}
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink font-mono outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          )}
        </form>
      </Drawer>
    </AdminLayout>
  );
};

