import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsSubmitting(true);

    try {
      await login(user?.email || 'customer@example.com', password);
      showToast({
        type: 'success',
        title: 'Session Restored',
        description: 'Your authentication token was rotated without losing your cart items.',
      });
      onSuccess();
      onClose();
    } catch {
      showToast({ type: 'error', title: 'Invalid Password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Session Expired">
      <div className="space-y-4 text-sm">
        <div className="p-4 bg-sand/60 rounded-2xl flex items-start gap-3 text-xs text-muted">
          <Lock className="w-5 h-5 text-amber shrink-0 mt-0.5" />
          <span>
            For security, your session timed out. Enter your password to continue checkout seamlessly without losing any reserved cart items.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">
              Account Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email || 'customer@example.com'}
              className="w-full bg-sand/30 rounded-xl px-4 py-2.5 text-xs text-muted font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-sand/60 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Verifying...' : 'Restore Session & Continue'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-forest" />
          <span>State & cart preserved in memory</span>
        </div>
      </div>
    </Modal>
  );
};

