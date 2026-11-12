import React, { useState } from 'react';
import { Package, ArrowRight, Eye, RotateCcw } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { OrderStatusBadge, OrderStatusType } from '../components/common/OrderStatusBadge';
import { formatPrice } from '../utils/currency';

export interface OrderSummary {
  id: string;
  created_at: string;
  total_amount: number;
  status: OrderStatusType;
  items_count: number;
  items_preview: string;
}

interface OrderHistoryScreenProps {
  onSelectOrder: (orderId: string) => void;
  onContinueShopping: () => void;
  onRequestReturn?: (orderId: string) => void;
}

export const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({
  onSelectOrder,
  onContinueShopping,
  onRequestReturn,
}) => {
  const [filter, setFilter] = useState<'ALL' | OrderStatusType>('ALL');

  const [orders] = useState<OrderSummary[]>([
    {
      id: 'ord-94821',
      created_at: 'November 10, 2026',
      total_amount: 150000,
      status: 'DELIVERED',
      items_count: 1,
      items_preview: 'Pro Laptop 15" (1x)',
    },
    {
      id: 'ord-81042',
      created_at: 'November 8, 2026',
      total_amount: 45000,
      status: 'SHIPPED',
      items_count: 2,
      items_preview: 'Mechanical Keyboard, Wireless Mouse',
    },
    {
      id: 'ord-73918',
      created_at: 'November 2, 2026',
      total_amount: 12000,
      status: 'PAID',
      items_count: 1,
      items_preview: 'USB-C Multiport Adapter',
    },
  ]);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-muted">Customer Account</span>
            <h1 className="text-3xl sm:text-4xl font-heading text-ink mt-1">My Orders</h1>
          </div>

          <button
            type="button"
            onClick={onContinueShopping}
            className="rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-6 py-2.5 text-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            Continue Shopping
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`rounded-[999px] px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                filter === st ? 'bg-forest text-paper shadow-xs' : 'bg-sand/60 text-muted hover:text-ink hover:bg-sand'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Order Cards List */}
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center bg-sand/20 rounded-[28px] p-8 space-y-3">
            <Package className="w-12 h-12 text-muted mx-auto" />
            <h4 className="font-heading text-xl text-ink">No orders found in this view</h4>
            <p className="text-sm text-muted">There are no orders matching the selected status filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-sand/40 hover:bg-sand/70 rounded-[24px] p-6 transition-all border border-sand flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Meta */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-sm text-ink">{order.id}</span>
                    <OrderStatusBadge status={order.status} />
                    <span className="text-xs text-muted">• {order.created_at}</span>
                  </div>
                  <h4 className="font-medium text-sm text-ink">{order.items_preview}</h4>
                  <span className="text-xs text-muted block">
                    {order.items_count} item(s) • Total:{' '}
                    <strong className="text-ink font-heading text-sm">{formatPrice(order.total_amount)}</strong>
                  </span>
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {order.status === 'DELIVERED' && onRequestReturn && (
                    <button
                      type="button"
                      onClick={() => onRequestReturn(order.id)}
                      className="rounded-[999px] bg-sand hover:bg-sand-hover text-ink text-xs font-semibold px-4 py-2 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-muted" />
                      <span>Return item</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectOrder(order.id)}
                    className="rounded-[999px] bg-forest hover:bg-forest-light text-paper text-xs font-semibold px-5 py-2.5 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Tracking & Receipt</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

