import React, { useState } from 'react';
import { Search, Eye, Filter } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Drawer } from '../../components/common/Drawer';
import { OrderStatusBadge, OrderStatusType } from '../../components/common/OrderStatusBadge';
import { formatPrice } from '../../utils/currency';

interface AdminOrderRow {
  id: string;
  customer_email: string;
  customer_name: string;
  created_at: string;
  total_amount: number;
  status: OrderStatusType;
  items: Array<{ name: string; sku: string; price: number; quantity: number }>;
  address: { full_name: string; street: string; city: string; postal_code: string; country: string };
}

interface AdminOrdersScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onDispatchShipment?: (orderId: string) => void;
}

export const AdminOrdersScreen: React.FC<AdminOrdersScreenProps> = ({
  onNavigate,
  onLogout,
  onDispatchShipment,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatusType>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null);

  const [orders] = useState<AdminOrderRow[]>([
    {
      id: 'ord-94821',
      customer_email: 'jane@example.com',
      customer_name: 'Jane Doe',
      created_at: 'Nov 10, 2026, 10:14 AM',
      total_amount: 150000,
      status: 'PAID',
      items: [{ name: 'Pro Laptop 15"', sku: 'LAP-123', price: 150000, quantity: 1 }],
      address: { full_name: 'Jane Doe', street: '100 Market St', city: 'San Francisco', postal_code: '94105', country: 'United States' },
    },
    {
      id: 'ord-94820',
      customer_email: 'mike@example.com',
      customer_name: 'Michael Vance',
      created_at: 'Nov 10, 2026, 09:30 AM',
      total_amount: 36000,
      status: 'SHIPPED',
      items: [{ name: 'USB-C Docking Station', sku: 'ACC-402', price: 18000, quantity: 2 }],
      address: { full_name: 'Michael Vance', street: '220 Pine St', city: 'Seattle', postal_code: '98101', country: 'United States' },
    },
    {
      id: 'ord-94819',
      customer_email: 'elena@example.com',
      customer_name: 'Elena Rostova',
      created_at: 'Nov 10, 2026, 08:15 AM',
      total_amount: 18500,
      status: 'DELIVERED',
      items: [{ name: 'Mechanical Wireless Keyboard', sku: 'KEY-801', price: 18500, quantity: 1 }],
      address: { full_name: 'Elena Rostova', street: '500 Howard St', city: 'Austin', postal_code: '73301', country: 'United States' },
    },
  ]);

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (search) {
      const matchId = o.id.toLowerCase().includes(search.toLowerCase());
      const matchEmail = o.customer_email.toLowerCase().includes(search.toLowerCase());
      if (!matchId && !matchEmail) return false;
    }
    return true;
  });

  return (
    <AdminLayout
      currentPath="/admin/orders"
      breadcrumbs={['Fulfillment', 'Orders']}
      title="Order Fulfillment & Processing Hub"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="bg-paper border border-sand rounded-[28px] p-6 space-y-6 shadow-xs">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID or customer email..."
              className="w-full bg-sand/60 rounded-[999px] py-2 pl-9 pr-4 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
            />
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-sand/60 rounded-[999px] px-3.5 py-1.5 text-xs text-ink font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="PAID">Paid (Ready for Shipment)</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sand text-muted uppercase tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-sand/20 transition-colors">
                  <td className="py-4 font-mono font-semibold text-ink">{ord.id}</td>
                  <td className="py-4">
                    <span className="font-semibold block text-ink">{ord.customer_name}</span>
                    <span className="text-muted">{ord.customer_email}</span>
                  </td>
                  <td className="py-4 text-muted">{ord.created_at}</td>
                  <td className="py-4 font-heading font-semibold text-sm text-ink">
                    {formatPrice(ord.total_amount)}
                  </td>
                  <td className="py-4">
                    <OrderStatusBadge status={ord.status} />
                  </td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(ord)}
                      className="p-1.5 text-muted hover:text-forest transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspector Drawer */}
      <Drawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details: ${selectedOrder?.id}`}
        footer={
          selectedOrder?.status === 'PAID' && onDispatchShipment ? (
            <button
              type="button"
              onClick={() => {
                onDispatchShipment(selectedOrder.id);
                setSelectedOrder(null);
              }}
              className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3 text-sm transition-all shadow-md cursor-pointer"
            >
              Fulfill & Dispatch Shipment
            </button>
          ) : undefined
        }
      >
        {selectedOrder && (
          <div className="space-y-6 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-sand">
              <span className="text-xs text-muted">Lifecycle Status</span>
              <OrderStatusBadge status={selectedOrder.status} />
            </div>

            {/* Address Snapshot */}
            <div className="bg-sand/40 rounded-2xl p-4 space-y-1 text-xs">
              <strong className="block text-ink font-semibold mb-1">Delivery Address Snapshot</strong>
              <div className="text-muted">{selectedOrder.address.full_name}</div>
              <div className="text-muted">{selectedOrder.address.street}</div>
              <div className="text-muted">{selectedOrder.address.city}, {selectedOrder.address.postal_code}</div>
              <div className="text-muted">{selectedOrder.address.country}</div>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              <strong className="block text-ink font-semibold text-xs uppercase tracking-wider text-muted">
                Purchased Line Items
              </strong>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-3 bg-sand/30 rounded-xl">
                  <div>
                    <div className="font-semibold text-ink">{item.name}</div>
                    <div className="text-muted font-mono">{item.sku} × {item.quantity}</div>
                  </div>
                  <div className="font-mono font-bold">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-sand flex justify-between items-center">
              <span className="font-semibold text-ink">Total Order Amount</span>
              <span className="font-heading font-bold text-xl text-ink">
                {formatPrice(selectedOrder.total_amount)}
              </span>
            </div>
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
};

