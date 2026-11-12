import React, { useState } from 'react';
import { CreditCard, ShieldCheck, RotateCcw, Eye, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Drawer } from '../../components/common/Drawer';
import { Modal } from '../../components/common/Modal';
import { formatPrice } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

interface PaymentEvent {
  id: string;
  order_id: string;
  amount: number;
  type: 'payment.succeeded' | 'payment.failed' | 'payment.refunded';
  hmac_verified: boolean;
  signature: string;
  timestamp: string;
  payload: Record<string, any>;
}

interface AdminPaymentsScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminPaymentsScreen: React.FC<AdminPaymentsScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();

  const [events, setEvents] = useState<PaymentEvent[]>([
    {
      id: 'evt-88192',
      order_id: 'ord-94821',
      amount: 150000,
      type: 'payment.succeeded',
      hmac_verified: true,
      signature: 'sha256=9b7f18a203f7e...',
      timestamp: 'Nov 10, 2026, 10:15 AM',
      payload: { event_id: 'evt-88192', order_id: 'ord-94821', amount: 150000, provider: 'MOCK_GATEWAY' },
    },
    {
      id: 'evt-88191',
      order_id: 'ord-94820',
      amount: 36000,
      type: 'payment.succeeded',
      hmac_verified: true,
      signature: 'sha256=11e9a4f828ca...',
      timestamp: 'Nov 10, 2026, 09:31 AM',
      payload: { event_id: 'evt-88191', order_id: 'ord-94820', amount: 36000, provider: 'MOCK_GATEWAY' },
    },
    {
      id: 'evt-88190',
      order_id: 'ord-94817',
      amount: 54000,
      type: 'payment.failed',
      hmac_verified: true,
      signature: 'sha256=48ac90bfa1...',
      timestamp: 'Nov 10, 2026, 07:10 AM',
      payload: { event_id: 'evt-88190', order_id: 'ord-94817', amount: 54000, error: 'INSUFFICIENT_FUNDS' },
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState<PaymentEvent | null>(null);
  const [refundTargetOrder, setRefundTargetOrder] = useState<PaymentEvent | null>(null);
  const [refundAmount, setRefundAmount] = useState('150000');
  const [restockInventory, setRestockInventory] = useState(true);

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTargetOrder) return;

    const refEvent: PaymentEvent = {
      id: `evt-ref-${Date.now().toString().slice(-5)}`,
      order_id: refundTargetOrder.order_id,
      amount: Number(refundAmount),
      type: 'payment.refunded',
      hmac_verified: true,
      signature: 'sha256=refund_signed_hmac...',
      timestamp: 'Just now',
      payload: {
        order_id: refundTargetOrder.order_id,
        refund_amount: Number(refundAmount),
        restock_applied: restockInventory,
      },
    };

    setEvents((prev) => [refEvent, ...prev]);
    showToast({
      type: 'success',
      title: 'Refund Executed',
      description: `Refund of ${formatPrice(Number(refundAmount))} issued for ${refundTargetOrder.order_id}.${restockInventory ? ' Items restocked.' : ''}`,
    });
    setRefundTargetOrder(null);
  };

  return (
    <AdminLayout
      currentPath="/admin/payments"
      breadcrumbs={['Finance', 'Payment Streams']}
      title="Payment Webhook Streams & Audit"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="bg-paper border border-sand rounded-[28px] p-6 space-y-6 shadow-xs max-w-5xl">
        <div className="flex items-center justify-between pb-3 border-b border-sand">
          <div>
            <h3 className="font-heading font-semibold text-lg text-ink">HMAC-SHA256 Webhook Stream</h3>
            <p className="text-xs text-muted">Timing-safe signature verification matching backend security specs</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sand text-muted uppercase tracking-wider">
                <th className="pb-3">Event ID</th>
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Event Type</th>
                <th className="pb-3">HMAC Signature</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-sand/20 transition-colors">
                  <td className="py-4 font-mono font-bold text-ink">{evt.id}</td>
                  <td className="py-4 font-mono text-muted">{evt.order_id}</td>
                  <td className="py-4 font-heading font-semibold text-ink">
                    {formatPrice(evt.amount)}
                  </td>
                  <td className="py-4 font-mono">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-[999px] ${
                        evt.type === 'payment.succeeded'
                          ? 'bg-forest/10 text-forest'
                          : evt.type === 'payment.refunded'
                            ? 'bg-amber/15 text-amber-900'
                            : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {evt.type}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 text-forest font-semibold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                      Verified
                    </span>
                  </td>
                  <td className="py-4 text-muted">{evt.timestamp}</td>
                  <td className="py-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(evt)}
                      className="p-1 text-muted hover:text-forest transition-colors cursor-pointer"
                      title="Inspect Raw JSON"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {evt.type === 'payment.succeeded' && (
                      <button
                        type="button"
                        onClick={() => {
                          setRefundTargetOrder(evt);
                          setRefundAmount(evt.amount.toString());
                        }}
                        className="p-1 text-muted hover:text-amber transition-colors cursor-pointer"
                        title="Issue Refund"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw JSON Inspector Drawer */}
      <Drawer
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={`Webhook Audit: ${selectedEvent?.id}`}
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-sand/40 rounded-xl space-y-1">
              <div><strong>Order Reference:</strong> {selectedEvent.order_id}</div>
              <div><strong>Signature:</strong> {selectedEvent.signature}</div>
              <div><strong>Security Status:</strong> Timing-Safe Verified</div>
            </div>

            <div>
              <span className="font-sans font-semibold text-muted uppercase tracking-wider block mb-2">
                Payload Snapshot
              </span>
              <pre className="p-4 bg-ink text-sand rounded-2xl overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(selectedEvent.payload, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Drawer>

      {/* Refund Execution Modal */}
      <Modal
        isOpen={!!refundTargetOrder}
        onClose={() => setRefundTargetOrder(null)}
        title={`Execute Refund: ${refundTargetOrder?.order_id}`}
      >
        <form onSubmit={handleRefundSubmit} className="space-y-4 text-sm">
          <div className="p-3 bg-amber/10 border border-amber/30 rounded-xl flex items-center gap-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber shrink-0" />
            <span>This will issue financial reversal and emit an order refund event.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">
              Refund Amount (in minor units cents)
            </label>
            <input
              type="number"
              required
              min="1"
              max={refundTargetOrder?.amount}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink font-mono outline-none focus:ring-1 focus:ring-forest"
            />
            <span className="text-xs text-muted block mt-1">
              Refunding: <strong className="text-ink">{formatPrice(Number(refundAmount) || 0)}</strong>
            </span>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={restockInventory}
                onChange={(e) => setRestockInventory(e.target.checked)}
                className="rounded border-sand text-forest focus:ring-forest cursor-pointer w-4 h-4"
              />
              <span>Restock order line items back to available inventory</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3 text-sm transition-all shadow-md mt-2 cursor-pointer"
          >
            Confirm & Execute Refund
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
};

