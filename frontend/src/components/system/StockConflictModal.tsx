import React from 'react';
import { Modal } from '../common/Modal';
import { AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

interface StockConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjustCart: () => void;
  conflictItemName?: string;
  availableRemaining?: number;
}

export const StockConflictModal: React.FC<StockConflictModalProps> = ({
  isOpen,
  onClose,
  onAdjustCart,
  conflictItemName = 'Pro Laptop 15"',
  availableRemaining = 1,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="High Demand Stock Notice">
      <div className="space-y-4 text-sm">
        <div className="p-4 bg-amber/10 border border-amber/30 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
          <AlertCircle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold mb-1">Concurrency Conflict Detected (HTTP 409)</strong>
            <span>
              Another buyer finalized checkout simultaneously for <strong>{conflictItemName}</strong>. Only <strong>{availableRemaining}</strong> unit(s) remain in warehouse inventory.
            </span>
          </div>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          To protect stock accuracy and prevent overselling, our atomic invariant guard has paused your checkout. You can adjust your requested quantity to proceed immediately.
        </p>

        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onAdjustCart();
            }}
            className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3 text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Update Cart to {availableRemaining} Unit(s)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold py-2.5 text-xs transition-colors cursor-pointer"
          >
            Review Other Products
          </button>
        </div>
      </div>
    </Modal>
  );
};

