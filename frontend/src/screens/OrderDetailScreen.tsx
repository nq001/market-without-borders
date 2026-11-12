import React, { useState } from 'react';
import { ArrowLeft, Truck, Printer, Ban, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { OrderStatusBadge, OrderStatusType } from '../components/common/OrderStatusBadge';
import { formatPrice } from '../utils/currency';
import { useToast } from '../context/ToastContext';

interface OrderDetailScreenProps {
  orderId: string;
  onBack: () => void;
  onPrintInvoice: (orderId: string) => void;
}

export const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({
  orderId,
  onBack,
  onPrintInvoice,
}) => {
  const { showToast } = useToast();
  const [status, setStatus] = useState<OrderStatusType>('SHIPPED');

  const milestones = [
    { label: 'Order Placed & Stock Reserved', date: 'Nov 10, 10:14 AM', done: true },
    { label: 'Payment Confirmed', date: 'Nov 10, 10:15 AM', done: true },
    { label: 'Dispatched via Express Courier', date: 'Nov 10, 02:40 PM', done: true },
    { label: 'Delivered to Address', date: 'Estimated Nov 12', done: status === 'DELIVERED' },
  ];

  const handleCancelOrder = () => {
    setStatus('CANCELLED');
    showToast({
      type: 'info',
      title: 'Order Cancelled',
      description: 'Your order was cancelled and reserved inventory has been released.',
    });
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-forest hover:text-amber transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onPrintInvoice(orderId)}
              className="rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-4 py-2 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            {status === 'PENDING_PAYMENT' && (
              <button
                type="button"
                onClick={handleCancelOrder}
                className="rounded-[999px] bg-red-50 hover:bg-red-100 text-red-800 font-semibold px-4 py-2 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel Order</span>
              </button>
            )}
          </div>
        </div>

        {/* Header Summary */}
        <div className="bg-sand/40 rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-sand">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-muted">Order #{orderId}</span>
              <OrderStatusBadge status={status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading text-ink mt-2">
              Pro Laptop 15" Package
            </h1>
            <p className="text-xs text-muted mt-1">Placed on November 10, 2026 at 10:14 AM</p>
          </div>

          <div className="md:text-right">
            <span className="text-xs text-muted block">Total Paid</span>
            <span className="font-heading text-3xl font-bold text-ink">{formatPrice(150000)}</span>
          </div>
        </div>

        {/* Milestone Sentence Timeline */}
        <div className="bg-sand/30 rounded-[28px] p-6 sm:p-8 space-y-6 border border-sand">
          <div className="flex items-center gap-2 text-forest font-heading font-semibold text-lg pb-3 border-b border-sand">
            <Truck className="w-5 h-5 text-forest" />
            <span>Fulfillment Timeline</span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-sand-hover">
            {milestones.map((ms, idx) => (
              <div key={idx} className="relative flex items-start gap-4">
                <span
                  className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
                    ms.done ? 'bg-forest text-paper ring-4 ring-paper' : 'bg-sand text-muted ring-4 ring-paper'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <div className="flex-1">
                  <h4 className={`text-sm font-semibold ${ms.done ? 'text-ink' : 'text-muted'}`}>
                    {ms.label}
                  </h4>
                  <span className="text-xs text-muted block mt-0.5">{ms.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tracking Link */}
          <div className="pt-4 border-t border-sand flex items-center justify-between text-xs">
            <span className="text-muted">Courier Tracking Number: <strong className="font-mono text-ink">EXP-99281944</strong></span>
            <span className="text-forest font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Verified Transit
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

