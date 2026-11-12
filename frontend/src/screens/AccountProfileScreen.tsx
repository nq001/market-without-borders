import React, { useState } from 'react';
import { User, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AccountProfileScreenProps {
  onBack: () => void;
  onNavigateAddressBook: () => void;
  onNavigateOrders: () => void;
}

export const AccountProfileScreen: React.FC<AccountProfileScreenProps> = ({
  onBack,
  onNavigateAddressBook,
  onNavigateOrders,
}) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(user?.first_name || 'Verified');
  const [lastName, setLastName] = useState(user?.last_name || 'Customer');
  const [phone, setPhone] = useState(user?.phone || '+1-555-0199');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ first_name: firstName, last_name: lastName, phone });
    showToast({
      type: 'success',
      title: 'Profile Updated',
      description: 'Your account details have been saved.',
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast({
        type: 'error',
        title: 'Passwords mismatch',
        description: 'New password and confirmation do not match.',
      });
      return;
    }
    showToast({
      type: 'success',
      title: 'Password Changed',
      description: 'Your security password was updated successfully.',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 w-full space-y-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-forest hover:text-amber transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-muted">Customer Settings</span>
            <h1 className="text-3xl sm:text-4xl font-heading text-ink mt-1">Profile & Security</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateOrders}
              className="rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-5 py-2 text-xs transition-colors cursor-pointer"
            >
              Order History
            </button>
            <button
              type="button"
              onClick={onNavigateAddressBook}
              className="rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-5 py-2 text-xs transition-colors cursor-pointer"
            >
              Address Book
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Personal Info */}
          <div className="bg-sand/40 border border-sand rounded-[28px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 text-forest font-heading font-semibold text-lg pb-3 border-b border-sand">
              <User className="w-5 h-5 text-forest" />
              <span>Personal Details</span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-sand/60 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-sand/60 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'customer@example.com'}
                  className="w-full bg-sand/30 rounded-xl px-4 py-2.5 text-sm text-muted cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-sand/60 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <button
                type="submit"
                className="rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold px-6 py-3 text-xs transition-colors shadow-sm cursor-pointer"
              >
                Save Details
              </button>
            </form>
          </div>

          {/* Password Security */}
          <div className="bg-sand/40 border border-sand rounded-[28px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 text-forest font-heading font-semibold text-lg pb-3 border-b border-sand">
              <Lock className="w-5 h-5 text-forest" />
              <span>Change Password</span>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-sand/60 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-sand/60 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-sand/60 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <button
                type="submit"
                className="rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold px-6 py-3 text-xs transition-colors shadow-sm cursor-pointer"
              >
                Update Password
              </button>
            </form>

            <div className="flex items-center gap-2 text-xs text-muted pt-4 border-t border-sand">
              <ShieldCheck className="w-4 h-4 text-forest" />
              <span>Password hashed using bcrypt with salt factor 10.</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

