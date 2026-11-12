import React, { useState } from 'react';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { ShoppingCart, CheckCircle, Truck, Package, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

interface StoreOrder {
  id: string;
  customerName: string;
  itemsSummary: string;
  total: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
}

interface OwnerOrdersScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  storeName?: string;
}

export const OwnerOrdersScreen: React.FC<OwnerOrdersScreenProps> = ({
  onNavigate,
  onLogout,
  storeName = 'Artisan Handcrafts',
}) => {
  const { showToast } = useToast();

  // Section 3.5: End-to-end order tracking, including whether each order has been delivered
  const [orders, setOrders] = useState<StoreOrder[]>([
    {
      id: 'ORD-8821',
      customerName: 'Jane Customer',
      itemsSummary: 'Terracotta Handcrafted Vase x 2',
      total: 9000,
      status: 'PENDING',
      createdAt: '2026-11-12 14:10',
    },
    {
      id: 'ORD-8819',
      customerName: 'Sarah Miller',
      itemsSummary: 'Raw Oak Serving Platter x 1, Ceramic Pour-Over x 1',
      total: 6700,
      status: 'SHIPPED',
      createdAt: '2026-11-11 09:30',
    },
    {
      id: 'ORD-8812',
      customerName: 'Alex Chen',
      itemsSummary: 'Carved Walnut Spoon Set x 2',
      total: 5000,
      status: 'DELIVERED',
      createdAt: '2026-11-09 16:45',
    },
  ]);

  const handleUpdateStatus = (orderId: string, nextStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
    );
    showToast({
      type: 'success',
      title: 'Order Status Updated',
      description: `Order ${orderId} marked as ${nextStatus}.`,
    });
  };

  return (
    <OwnerLayout currentPath="/owner/orders" storeName={storeName} onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Store Orders & Delivery Fulfillment</h1>
        <p className="text-xs text-muted">Track buyer orders, update fulfillment milestones, and confirm deliveries for your store items.</p>
      </div>

      {/* Orders Table (Section 3.5) */}
      <div className="bg-paper border border-sand rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sand/40 border-b border-sand text-muted font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Buyer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Subtotal</th>
                <th className="py-3.5 px-4">Delivery Status</th>
                <th className="py-3.5 px-4 text-right">Update Milestone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-sand/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-ink">{ord.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-ink">{ord.customerName}</div>
                    <div className="text-[11px] text-muted">{ord.createdAt}</div>
                  </td>
                  <td className="py-3.5 px-4 text-ink">{ord.itemsSummary}</td>
                  <td className="py-3.5 px-4 font-bold text-ink">{formatCurrency(ord.total)}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        ord.status === 'PENDING'
                          ? 'bg-amber text-ink'
                          : ord.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ord.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {ord.status === 'SHIPPED' && <Truck className="w-3 h-3" />}
                      {ord.status === 'DELIVERED' && <CheckCircle className="w-3 h-3" />}
                      <span>{ord.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {ord.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, 'SHIPPED')}
                        className="px-3 py-1 rounded-[999px] bg-forest text-paper font-semibold hover:bg-forest-light cursor-pointer shadow-xs text-[11px]"
                      >
                        Dispatch Shipment
                      </button>
                    )}
                    {ord.status === 'SHIPPED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                        className="px-3 py-1 rounded-[999px] bg-emerald-700 text-paper font-semibold hover:bg-emerald-800 cursor-pointer shadow-xs text-[11px]"
                      >
                        Confirm Delivered
                      </button>
                    )}
                    {ord.status === 'DELIVERED' && (
                      <span className="text-muted text-[11px] italic">Completed</span>
                    )}
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

