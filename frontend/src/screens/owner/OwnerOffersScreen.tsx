import React, { useState } from 'react';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { Tag, Plus, Trash2, Calendar, Percent } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface StoreCoupon {
  id: string;
  code: string;
  discount_percent: number;
  min_order_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const OwnerOffersScreen: React.FC<{ onNavigate: (path: string) => void; onLogout: () => void }> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<StoreCoupon[]>([
    {
      id: 'c-1',
      code: 'HANDMADE10',
      discount_percent: 10,
      min_order_amount: 50,
      start_date: '2026-11-01',
      end_date: '2026-11-30',
      is_active: true,
    },
    {
      id: 'c-2',
      code: 'CERAMICS20',
      discount_percent: 20,
      min_order_amount: 100,
      start_date: '2026-11-15',
      end_date: '2026-12-01',
      is_active: true,
    },
  ]);

  const [newCode, setNewCode] = useState('');
  const [newPercent, setNewPercent] = useState(15);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const newCoupon: StoreCoupon = {
      id: `c-${Date.now()}`,
      code: newCode.toUpperCase().trim(),
      discount_percent: Number(newPercent),
      min_order_amount: 40,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '2026-12-31',
      is_active: true,
    };

    setCoupons([newCoupon, ...coupons]);
    setNewCode('');
    showToast({
      type: 'success',
      title: 'Store Coupon Created',
      description: `Coupon ${newCoupon.code} will discount eligible items from your store in customer carts.`,
    });
  };

  const handleDelete = (id: string) => {
    setCoupons(coupons.filter((c) => c.id !== id));
    showToast({ type: 'info', title: 'Coupon Removed', description: 'Offer has been deactivated.' });
  };

  return (
    <OwnerLayout currentPath="/owner/offers" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-ink">Store Offers & Coupons</h1>
          <p className="text-sm text-muted mt-1">
            Create promotional discounts applicable only to items purchased from your store.
          </p>
        </div>

        {/* Create Coupon Card */}
        <div className="bg-paper rounded-2xl border border-sand p-6 shadow-xs">
          <h3 className="font-heading font-bold text-base text-ink mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-forest" />
            <span>Generate New Store Coupon</span>
          </h3>
          <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Coupon Code (e.g. POTTERY15)..."
              className="bg-sand/60 rounded-xl px-4 py-2.5 text-xs font-bold text-ink outline-none uppercase focus:ring-1 focus:ring-forest"
              required
            />
            <div className="flex items-center gap-2 bg-sand/60 rounded-xl px-4 py-2.5">
              <span className="text-xs text-muted">Discount:</span>
              <input
                type="number"
                min="5"
                max="75"
                value={newPercent}
                onChange={(e) => setNewPercent(Number(e.target.value))}
                className="w-12 bg-transparent text-xs font-bold text-ink outline-none text-right"
              />
              <span className="text-xs font-bold text-ink">%</span>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-forest text-paper text-xs font-semibold hover:bg-forest/90 cursor-pointer shadow-xs whitespace-nowrap"
            >
              Activate Coupon
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="bg-paper rounded-2xl border border-sand p-5 shadow-xs flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-base text-ink tracking-wide">{c.code}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-[999px] bg-forest text-paper">
                    {c.discount_percent}% OFF
                  </span>
                </div>
                <p className="text-xs text-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Valid {c.start_date} to {c.end_date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="p-2 text-red-600 hover:text-red-800 cursor-pointer"
                title="Delete coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </OwnerLayout>
  );
};

