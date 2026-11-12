import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

interface GuestReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GuestReconciliationModal: React.FC<GuestReconciliationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const { reconcileGuestCart } = useCart();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);

    try {
      let ok = false;
      if (mode === 'login') {
        ok = await login(email, password);
      } else {
        ok = await register(email, password, firstName, lastName);
      }

      if (ok) {
        reconcileGuestCart();
        showToast({
          type: 'success',
          title: mode === 'login' ? 'Welcome back!' : 'Account registered!',
          description: 'Your guest cart items are now securely attached to your account.',
        });
        onClose();
        onSuccess();
      }
    } catch {
      showToast({
        type: 'error',
        title: 'Authentication error',
        description: 'Please check your email and credentials.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? 'Sign in to Check Out' : 'Create Account to Check Out'}>
      <p className="text-sm text-muted mb-6">
        Save your items, track real-time delivery milestones, and protect your order with atomic stock reservations.
      </p>

      {/* Tabs */}
      <div className="flex bg-sand/60 p-1 rounded-[999px] mb-6">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 py-2 text-xs font-semibold rounded-[999px] transition-colors cursor-pointer ${
            mode === 'login' ? 'bg-forest text-paper shadow-xs' : 'text-muted hover:text-ink'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 py-2 text-xs font-semibold rounded-[999px] transition-colors cursor-pointer ${
            mode === 'register' ? 'bg-forest text-paper shadow-xs' : 'text-muted hover:text-ink'
          }`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full bg-sand/40 border border-sand-hover rounded-xl px-3.5 py-2 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full bg-sand/40 border border-sand-hover rounded-xl px-3.5 py-2 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-ink mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full bg-sand/40 border border-sand-hover rounded-xl px-3.5 py-2 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full bg-sand/40 border border-sand-hover rounded-xl px-3.5 py-2 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3 text-sm transition-all duration-150 shadow-md mt-2 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Verifying...' : mode === 'login' ? 'Sign In & Continue' : 'Create & Continue'}
        </button>
      </form>
    </Modal>
  );
};

