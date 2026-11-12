import React, { useState } from 'react';
import { ArrowLeft, KeyRound, Mail, CheckCircle2 } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useToast } from '../context/ToastContext';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBackToLogin,
}) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('reset');
      showToast({
        type: 'info',
        title: 'Reset Code Dispatched',
        description: `A 6-digit recovery token was sent to ${email}. (Use 123456 for test)`,
      });
    }, 800);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !token) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('done');
      showToast({
        type: 'success',
        title: 'Password Updated',
        description: 'You can now sign in with your updated credentials.',
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between p-4 sm:p-6 lg:p-12 font-sans">
      <div className="max-w-md w-full mx-auto">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>

        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="h-9 w-auto" />
          </div>
          <h1 className="text-3xl font-heading font-semibold text-ink">
            {step === 'request'
              ? 'Recover Password'
              : step === 'reset'
                ? 'Enter Reset Code'
                : 'Password Reset!'}
          </h1>
          <p className="text-sm text-muted">
            {step === 'request'
              ? 'Enter your registered email address to receive password recovery instructions.'
              : step === 'reset'
                ? 'Enter the verification token and choose your new password.'
                : 'Your password has been successfully updated.'}
          </p>
        </div>

        <div className="bg-sand/40 border border-sand rounded-[28px] p-6 sm:p-8 shadow-xs">
          {step === 'request' && (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-sand/60 rounded-xl px-4 py-2.5 pl-10 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
                  />
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3.5 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer mt-2"
              >
                {isSubmitting ? 'Sending instructions...' : 'Send Recovery Code'}
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">6-Digit Reset Code</label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full bg-sand/60 rounded-xl px-4 py-2.5 text-sm text-ink font-mono text-center tracking-widest outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">New Password (Min. 8 chars)</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-sand/60 rounded-xl px-4 py-2.5 pl-10 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
                  />
                  <KeyRound className="w-4 h-4 text-muted absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3.5 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer mt-2"
              >
                {isSubmitting ? 'Updating...' : 'Set New Password'}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-forest mx-auto" />
              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3.5 text-sm transition-all shadow-md cursor-pointer"
              >
                Proceed to Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-muted py-6">
        © 2026 Market Without Borders (MWB).
      </div>
    </div>
  );
};

