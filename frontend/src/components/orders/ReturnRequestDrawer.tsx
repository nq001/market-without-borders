import React, { useState } from 'react';
import { Drawer } from '../common/Drawer';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ReturnRequestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export const ReturnRequestDrawer: React.FC<ReturnRequestDrawerProps> = ({
  isOpen,
  onClose,
  orderId,
}) => {
  const { showToast } = useToast();
  const [reason, setReason] = useState('performance_issue');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      showToast({
        type: 'success',
        title: 'Return Authorized',
        description: `RMA #RMA-${Date.now().toString().slice(-6)} generated for Order #${orderId}. Check your email for the prepaid return shipping label.`,
      });
      onClose();
    }, 1000);
  };

  const footer = (
    <div className="space-y-3">
      <button
        type="submit"
        form="return-form"
        disabled={isSubmitting}
        className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3.5 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Generating RMA...' : 'Submit Return Request'}
      </button>
      <p className="text-xs text-muted text-center">
        Returns processed within 30 days of delivery.
      </p>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Request Return & Refund" footer={footer}>
      <form id="return-form" onSubmit={handleSubmit} className="space-y-6 text-sm">
        <div className="p-4 bg-sand/60 rounded-2xl flex items-start gap-3 text-xs text-muted">
          <RotateCcw className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <span>
            Returning items from <strong>Order #{orderId}</strong>. Stock will be restored to warehouse upon return inspection.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-muted mb-2">
            Select Reason for Return
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-sand/60 rounded-xl px-4 py-2.5 text-ink outline-none focus:ring-1 focus:ring-forest cursor-pointer"
          >
            <option value="performance_issue">Performance issue / Not as expected</option>
            <option value="wrong_item">Received wrong item or size</option>
            <option value="damaged">Item damaged in transit</option>
            <option value="no_longer_needed">No longer needed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-muted mb-2">
            Additional Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe any specifics about the item's condition..."
            className="w-full bg-sand/60 rounded-xl p-3 text-ink outline-none focus:ring-1 focus:ring-forest"
          />
        </div>

        <div className="p-4 bg-amber/10 border border-amber/30 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          <span>
            Instant refund is credited to your original payment method once the package tracking confirms carrier handover.
          </span>
        </div>
      </form>
    </Drawer>
  );
};

