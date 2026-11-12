import React, { useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthScreenProps {
  onSuccess: () => void;
  onBackToHome: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onBackToHome,
  defaultMode = 'login',
}) => {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
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
        showToast({
          type: 'success',
          title: mode === 'login' ? 'Signed in successfully' : 'Account created',
          description: `Welcome to MWB, ${email}`,
        });
        onSuccess();
      }
    } catch {
      showToast({
        type: 'error',
        title: 'Authentication Failed',
        description: 'Please check your email and password.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between p-4 sm:p-6 lg:p-12 font-sans">
      <div className="max-w-md w-full mx-auto">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="h-9 w-auto" />
          </div>
          <h1 className="text-3xl font-heading font-semibold text-ink">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h1>
          <p className="text-sm text-muted">
            Access guaranteed order tracking, saved shipping addresses, and live stock reservations.
          </p>
        </div>

        {/* Tab switch */}
        <div className="bg-sand/70 p-1 rounded-[999px] flex mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-[999px] transition-all cursor-pointer ${
              mode === 'login' ? 'bg-forest text-paper shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-[999px] transition-all cursor-pointer ${
              mode === 'register' ? 'bg-forest text-paper shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            Create account
          </button>
        </div>

        {/* Form */}
        <div className="bg-sand/40 border border-sand rounded-[28px] p-6 sm:p-8 shadow-xs">
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
                    placeholder="Alex"
                    className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
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
                placeholder="alex@example.com"
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-ink">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => showToast({ type: 'info', title: 'Password Reset', description: 'Enter your email to receive recovery instructions.' })}
                    className="text-xs text-forest hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3.5 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer mt-4"
            >
              {isSubmitting ? 'Verifying credentials...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="pt-6 mt-6 border-t border-sand flex items-center justify-center gap-2 text-xs text-muted">
            <Shield className="w-3.5 h-3.5 text-forest" />
            <span>Encrypted sessions with JWT token rotation</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-muted py-6">
        © 2026 Market Without Borders (MWB). All rights reserved.
      </div>
    </div>
  );
};

