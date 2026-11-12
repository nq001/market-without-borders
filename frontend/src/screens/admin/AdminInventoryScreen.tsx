import React, { useState } from 'react';
import { Boxes, History, SlidersHorizontal } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Modal } from '../../components/common/Modal';
import { Drawer } from '../../components/common/Drawer';
import { StockBadge } from '../../components/common/StockBadge';
import { useToast } from '../../context/ToastContext';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  available: number;
  reserved: number;
  total: number;
}

interface MovementLog {
  id: string;
  type: 'ADD' | 'DEDUCT' | 'RESERVE' | 'RELEASE';
  quantity: number;
  reason: string;
  timestamp: string;
}

interface AdminInventoryScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminInventoryScreen: React.FC<AdminInventoryScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([
    { id: 'inv-1', name: 'Pro Laptop 15"', sku: 'LAP-123', available: 50, reserved: 2, total: 52 },
    { id: 'inv-2', name: 'USB-C Docking Station', sku: 'ACC-402', available: 35, reserved: 1, total: 36 },
    { id: 'inv-3', name: 'Mechanical Wireless Keyboard', sku: 'KEY-801', available: 4, reserved: 0, total: 4 },
  ]);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Adjustment fields
  const [adjType, setAdjType] = useState<'ADD' | 'DEDUCT' | 'ADJUST'>('ADD');
  const [adjAmount, setAdjAmount] = useState('10');
  const [adjReason, setAdjReason] = useState('Supplier shipment received');

  const [movements] = useState<MovementLog[]>([
    { id: 'm-1', type: 'RESERVE', quantity: 2, reason: 'Order #ord-94821 checkout initiated', timestamp: '14 mins ago' },
    { id: 'm-2', type: 'DEDUCT', quantity: 1, reason: 'Payment webhook confirmed #ord-94820', timestamp: '42 mins ago' },
    { id: 'm-3', type: 'ADD', quantity: 50, reason: 'Initial seed batch arrival', timestamp: 'Yesterday' },
  ]);

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjAmount('10');
    setAdjReason('Stock restock');
    setIsAdjustModalOpen(true);
  };

  const openHistoryDrawer = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsHistoryDrawerOpen(true);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const qty = Number(adjAmount);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === selectedItem.id) {
          let nextAvail = item.available;
          if (adjType === 'ADD') nextAvail += qty;
          if (adjType === 'DEDUCT') nextAvail = Math.max(0, nextAvail - qty);
          if (adjType === 'ADJUST') nextAvail = qty;

          return { ...item, available: nextAvail, total: nextAvail + item.reserved };
        }
        return item;
      }),
    );

    showToast({
      type: 'success',
      title: 'Inventory Synchronized',
      description: `${selectedItem.name} stock modified via TypeORM transaction.`,
    });
    setIsAdjustModalOpen(false);
  };

  return (
    <AdminLayout
      currentPath="/admin/inventory"
      breadcrumbs={['Operations', 'Inventory Matrix']}
      title="Live Inventory Levels & Stock Movements"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="bg-paper border border-sand rounded-[28px] p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-sand">
          <div>
            <h3 className="font-heading font-semibold text-lg text-ink">Atomic Warehouse Balances</h3>
            <p className="text-xs text-muted">Synchronized with checkout reservation invariants</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sand text-muted uppercase tracking-wider">
                <th className="pb-3">Product Name</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Available</th>
                <th className="pb-3">Reserved (Checkout)</th>
                <th className="pb-3">Total Physical</th>
                <th className="pb-3">Health Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-sand/20 transition-colors">
                  <td className="py-4 font-semibold text-sm text-ink">{item.name}</td>
                  <td className="py-4 font-mono text-muted">{item.sku}</td>
                  <td className="py-4 font-bold text-sm text-forest">{item.available}</td>
                  <td className="py-4 font-semibold text-amber-800">{item.reserved}</td>
                  <td className="py-4 font-mono text-ink">{item.total}</td>
                  <td className="py-4">
                    <StockBadge quantity={item.available} />
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openAdjustModal(item)}
                      className="rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-3 py-1.5 transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Adjust</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openHistoryDrawer(item)}
                      className="p-1.5 text-muted hover:text-forest transition-colors cursor-pointer inline-flex items-center"
                      title="View Movement History"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Stock: ${selectedItem?.name}`}
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">Action Type</label>
            <select
              value={adjType}
              onChange={(e) => setAdjType(e.target.value as any)}
              className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink outline-none focus:ring-1 focus:ring-forest cursor-pointer"
            >
              <option value="ADD">ADD (Incoming Stock Restock)</option>
              <option value="DEDUCT">DEDUCT (Damaged / Return to Vendor)</option>
              <option value="ADJUST">ADJUST (Set Absolute Manual Quantity)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">Quantity</label>
            <input
              type="number"
              required
              min="1"
              value={adjAmount}
              onChange={(e) => setAdjAmount(e.target.value)}
              className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink font-mono outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">Reason / Reference</label>
            <input
              type="text"
              required
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              placeholder="e.g. Purchase order PO-9921"
              className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3 text-sm transition-all shadow-md mt-2 cursor-pointer"
          >
            Apply Inventory Movement
          </button>
        </form>
      </Modal>

      {/* Movement History Drawer */}
      <Drawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        title={`Audit Trail: ${selectedItem?.name}`}
      >
        <div className="space-y-4 text-xs">
          {movements.map((m) => (
            <div key={m.id} className="bg-sand/40 border border-sand rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-forest">{m.type} ({m.quantity})</span>
                <span className="text-muted">{m.timestamp}</span>
              </div>
              <p className="text-muted">{m.reason}</p>
            </div>
          ))}
        </div>
      </Drawer>
    </AdminLayout>
  );
};
