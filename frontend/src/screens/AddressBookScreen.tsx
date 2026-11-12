import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, ArrowLeft, MapPin } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export interface AddressItem {
  id: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  country: string;
  postal_code: string;
  is_default: boolean;
}

interface AddressBookScreenProps {
  onBack: () => void;
}

export const AddressBookScreen: React.FC<AddressBookScreenProps> = ({ onBack }) => {
  const { showToast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: 'addr-1',
      full_name: 'Jane Doe',
      phone: '+1 555-0182',
      street: '100 Market Street, Suite 400',
      city: 'San Francisco',
      country: 'United States',
      postal_code: '94105',
      is_default: true,
    },
    {
      id: 'addr-2',
      full_name: 'Jane Doe (Office)',
      phone: '+1 555-0199',
      street: '500 Howard Street',
      city: 'San Francisco',
      country: 'United States',
      postal_code: '94105',
      is_default: false,
    },
  ]);

  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newCountry, setNewCountry] = useState('United States');
  const [newPostal, setNewPostal] = useState('');

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id })),
    );
    showToast({ type: 'success', title: 'Default Address Updated' });
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast({ type: 'info', title: 'Address Removed' });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress: AddressItem = {
      id: `addr-${Date.now()}`,
      full_name: newFullName,
      phone: newPhone,
      street: newStreet,
      city: newCity,
      country: newCountry,
      postal_code: newPostal,
      is_default: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, newAddress]);
    setIsAddOpen(false);
    showToast({ type: 'success', title: 'Address Added' });

    setNewFullName('');
    setNewPhone('');
    setNewStreet('');
    setNewCity('');
    setNewPostal('');
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
          <span>Back to Profile</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-muted">Customer Settings</span>
            <h1 className="text-3xl sm:text-4xl font-heading text-ink mt-1">Saved Addresses</h1>
          </div>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold px-6 py-2.5 text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-[24px] p-6 border transition-all flex flex-col justify-between space-y-4 ${
                addr.is_default
                  ? 'bg-sand/70 border-forest/30 shadow-xs ring-1 ring-forest/20'
                  : 'bg-sand/40 border-sand hover:bg-sand/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-semibold text-base text-ink">{addr.full_name}</span>
                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-forest bg-[#C6D8C9] px-2.5 py-0.5 rounded-[999px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Default
                    </span>
                  )}
                </div>

                <div className="text-xs text-muted space-y-1">
                  <div>{addr.street}</div>
                  <div>
                    {addr.city}, {addr.postal_code}
                  </div>
                  <div>{addr.country}</div>
                  <div className="pt-1 text-ink font-medium">{addr.phone}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-sand text-xs">
                {!addr.is_default ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-forest hover:underline font-semibold cursor-pointer"
                  >
                    Set as default
                  </button>
                ) : (
                  <span className="text-muted text-[11px]">Primary delivery</span>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="text-muted hover:text-red-700 p-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Address Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Delivery Address">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2 text-ink outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">Phone</label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2 text-ink outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">Street Address</label>
            <input
              type="text"
              required
              value={newStreet}
              onChange={(e) => setNewStreet(e.target.value)}
              className="w-full bg-sand/60 rounded-xl px-3.5 py-2 text-ink outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">City</label>
              <input
                type="text"
                required
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2 text-ink outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">Country</label>
              <input
                type="text"
                required
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2 text-ink outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">Postal Code</label>
              <input
                type="text"
                required
                value={newPostal}
                onChange={(e) => setNewPostal(e.target.value)}
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2 text-ink outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3 text-sm transition-all shadow-md mt-2 cursor-pointer"
          >
            Save Address
          </button>
        </form>
      </Modal>

      <Footer />
    </div>
  );
};

