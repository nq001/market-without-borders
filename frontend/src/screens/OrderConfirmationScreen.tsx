import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, Package } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { OrderStatusBadge, OrderStatusType } from '../components/common/OrderStatusBadge';
import { formatPrice } from '../utils/currency';

interface OrderConfirmationScreenProps {
  orderId: string;
  orderTotal: number;
  initialStatus?: OrderStatusType;
  onViewOrderDetails: (id: string) => void;
  onRetryPayment: (id: string, total: number) => void;
  onContinueShopping: () => void;
}

export const OrderConfirmationScreen: React.FC<OrderConfirmationScreenProps> = ({
  orderId,
  orderTotal,
  initialStatus = 'PAID',
  onViewOrderDetails,
  onRetryPayment,
  onContinueShopping,
}) => {
  const [status, setStatus] = useState<OrderStatusType>(initialStatus);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    // If order is still pending, poll status
    if (status === 'PENDING_PAYMENT') {
      setIsPolling(true);
      const timer = setTimeout(() => {
        setStatus('PAID');
        setIsPolling(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const isSuccess = status === 'PAID' || status === 'SHIPPED' || status === 'DELIVERED';

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-xl mx-auto px-4 py-16 w-full text-center space-y-8">
        {/* Status Icon */}
        <div className="flex justify-center">
          {isSuccess ? (
            <div className="w-20 h-20 rounded-full bg-forest/10 flex items-center justify-center text-forest">
              <CheckCircle2 className="w-12 h-12 text-forest" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          )}
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <OrderStatusBadge status={status} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading text-ink">
            {isSuccess ? 'Thank you for your order!' : 'Payment was not completed'}
          </h1>

          <p className="text-sm text-muted max-w-md mx-auto">
            {isSuccess
              ? `We have confirmed your payment and reserved your inventory. A confirmation receipt has been dispatched to your email.`
              : `Your bank declined the transaction. Your items are held in reservation so you can retry payment without losing your cart.`}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-sand/60 rounded-[28px] p-6 space-y-4 text-left border border-sand">
          <div className="flex justify-between items-center pb-3 border-b border-sand/80 text-sm">
            <span className="text-muted">Order Number</span>
            <span className="font-mono font-bold text-ink">{orderId}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-sand/80 text-sm">
            <span className="text-muted">Total Paid</span>
            <span className="font-heading font-bold text-lg text-ink">{formatPrice(orderTotal)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted">Estimated Delivery</span>
            <span className="font-medium text-forest">2-4 Business Days</span>
          </div>
        </div>

        {/* Polling Indicator */}
        {isPolling && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-forest" />
            <span>Confirming payment webhook with PostgreSQL...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {isSuccess ? (
            <>
              <button
                type="button"
                onClick={() => onViewOrderDetails(orderId)}
                className="w-full sm:w-auto rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold px-7 py-3.5 text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>View Order Details</span>
              </button>
              <button
                type="button"
                onClick={onContinueShopping}
                className="w-full sm:w-auto rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-7 py-3.5 text-sm transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onRetryPayment(orderId, orderTotal)}
                className="w-full sm:w-auto rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold px-8 py-3.5 text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Retry Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onContinueShopping}
                className="w-full sm:w-auto rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-7 py-3.5 text-sm transition-colors cursor-pointer"
              >
                Back to Store
              </button>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

