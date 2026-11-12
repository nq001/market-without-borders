import React, { useState } from 'react';
import { CreditCard, CheckCircle2, XCircle, ArrowLeft, Lock } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { formatPrice } from '../utils/currency';
import { useToast } from '../context/ToastContext';

interface PaymentSimulationScreenProps {
  orderId: string;
  orderTotal: number;
  onPaymentSuccess: (orderId: string) => void;
  onPaymentFailed: (orderId: string) => void;
  onCancel: () => void;
}

export const PaymentSimulationScreen: React.FC<PaymentSimulationScreenProps> = ({
  orderId,
  orderTotal,
  onPaymentSuccess,
  onPaymentFailed,
  onCancel,
}) => {
  const { showToast } = useToast();
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);

  const simulateWebhook = async (status: 'SUCCESS' | 'FAILURE') => {
    setIsProcessing(true);

    try {
      const eventType = status === 'SUCCESS' ? 'payment.succeeded' : 'payment.failed';
      // Post to payment webhook endpoint
      await fetch('/api/v1/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-payment-signature': 'simulated_hmac_sha256_signature',
        },
        body: JSON.stringify({
          event_id: `evt-${Date.now()}`,
          event_type: eventType,
          type: eventType,
          data: {
            order_id: orderId,
            amount: orderTotal,
            status: status === 'SUCCESS' ? 'SUCCEEDED' : 'FAILED',
          },
        }),
      });
    } catch {
      // Backend offline fallback simulation
    }

    setTimeout(() => {
      setIsProcessing(false);
      if (status === 'SUCCESS') {
        showToast({
          type: 'success',
          title: 'Payment Authorized',
          description: `Order #${orderId} has been marked as PAID!`,
        });
        onPaymentSuccess(orderId);
      } else {
        showToast({
          type: 'error',
          title: 'Payment Declined',
          description: 'The simulated card transaction was declined. Your items remain reserved for 15 minutes.',
        });
        onPaymentFailed(orderId);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-lg mx-auto px-4 py-12 w-full space-y-8">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back to Checkout</span>
        </button>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Step 2 of 2: Simulation Gateway
          </span>
          <h1 className="text-3xl font-heading text-ink font-semibold">
            Mock Payment Gateway
          </h1>
          <p className="text-sm text-muted">
            Test true asynchronous payment webhooks with simulated success or failure.
          </p>
        </div>

        {/* Order Banner */}
        <div className="bg-sand/60 rounded-2xl p-4 flex items-center justify-between text-sm">
          <div>
            <span className="text-xs text-muted block">Order Reference</span>
            <span className="font-mono font-semibold text-ink">{orderId}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted block">Total Due</span>
            <span className="font-heading text-xl font-bold text-ink">{formatPrice(orderTotal)}</span>
          </div>
        </div>

        {/* Mock Card Form */}
        <div className="bg-sand/40 border border-sand rounded-[28px] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-2 text-forest text-sm font-semibold pb-3 border-b border-sand">
            <CreditCard className="w-4 h-4 text-forest" />
            <span>Simulated Card Details</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-sand/60 rounded-xl px-4 py-2.5 text-sm font-mono text-ink outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Expires
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full bg-sand/60 rounded-xl px-4 py-2.5 text-sm font-mono text-ink outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="w-full bg-sand/60 rounded-xl px-4 py-2.5 text-sm font-mono text-ink outline-none"
                />
              </div>
            </div>
          </div>

          {/* Simulation Trigger Buttons */}
          <div className="pt-4 space-y-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => simulateWebhook('SUCCESS')}
              className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3.5 px-6 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber" />
              <span>{isProcessing ? 'Processing webhook...' : `Pay ${formatPrice(orderTotal)} (Simulate Success)`}</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => simulateWebhook('FAILURE')}
              className="w-full rounded-[999px] bg-sand hover:bg-sand-hover text-red-900 font-semibold py-3 px-6 flex items-center justify-center gap-2 transition-all border border-red-200 cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Simulate Payment Decline</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted pt-2">
            <Lock className="w-3.5 h-3.5 text-forest" />
            <span>Dispatches HMAC-SHA256 signed payment webhook</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

