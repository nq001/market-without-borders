import React, { useState } from 'react';
import { Tag, Plus, CheckCircle2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Modal } from '../../components/common/Modal';
import { formatPrice } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

interface CouponItem {
  id: string;
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  times_used: number;
  max_uses: number;
  expires_at: string;
  is_active: boolean;
}

interface AdminCouponsScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminCouponsScreen: React.FC<AdminCouponsScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<CouponItem[]>([
    {
      id: 'cpn-1',
      code: 'WELCOME10',
      discount_type: 'PERCENTAGE',
      discount_value: 10,
      times_used: 42,
      max_uses: 500,
      expires_at: 'Dec 31, 2026',
      is_active: true,
    },
    {
      id: 'cpn-2',
      code: 'SAVE50',
      discount_type: 'FIXED',
      discount_value: 5000,
      times_used: 12,
      max_uses: 100,
      expires_at: 'Nov 30, 2026',
      is_active: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [val, setVal] = useState('10');
  const [maxUses, setMaxUses] = useState('100');
  const [expiry, setExpiry] = useState('2026-12-31');

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const numericVal = Number(val);

    // Backend 03-security-plan rule: percentage must be <= 100
    if (type === 'PERCENTAGE' && numericVal > 100) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        description: 'Percentage discount cannot exceed 100%.',
      });
      return;
    }

    const newCoupon: CouponItem = {
      id: `cpn-${Date.now()}`,
      code: code.toUpperCase().trim(),
      discount_type: type,
      discount_value: type === 'PERCENTAGE' ? numericVal : numericVal * 100,
      times_used: 0,
      max_uses: Number(maxUses),
      expires_at: expiry,
      is_active: true,
    };

    setCoupons((prev) => [newCoupon, ...prev]);
    showToast({
      type: 'success',
      title: 'Coupon Created',
      description: `Promo code ${newCoupon.code} is now active.`,
    });
    setIsModalOpen(false);
  };

  return (
    <AdminLayout
      currentPath="/admin/coupons"
      breadcrumbs={['Marketing', 'Coupons']}
      title="Coupons & Discount Promotions"
      actionButton={{ label: 'New Coupon', onClick: () => setIsModalOpen(true) }}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="bg-paper border border-sand rounded-[28px] p-6 space-y-6 shadow-xs max-w-5xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sand text-muted uppercase tracking-wider">
                <th className="pb-3">Promo Code</th>
                <th className="pb-3">Discount</th>
                <th className="pb-3">Usage</th>
                <th className="pb-3">Limit</th>
                <th className="pb-3">Expires On</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-sand/20 transition-colors">
                  <td className="py-4 font-mono font-bold text-sm text-forest">{c.code}</td>
                  <td className="py-4 font-medium text-ink">
                    {c.discount_type === 'PERCENTAGE'
                      ? `${c.discount_value}% Off`
                      : `${formatPrice(c.discount_value)} Fixed Credit`}
                  </td>
                  <td className="py-4 font-semibold text-ink">{c.times_used} uses</td>
                  <td className="py-4 text-muted">{c.max_uses} total</td>
                  <td className="py-4 text-muted">{c.expires_at}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 bg-forest/10 text-forest text-[11px] font-bold px-2.5 py-0.5 rounded-[999px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Promotion Coupon">
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">Coupon Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. FLASH20"
              className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink font-mono uppercase outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink outline-none focus:ring-1 focus:ring-forest cursor-pointer"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                {type === 'PERCENTAGE' ? 'Discount % (Max 100)' : 'Amount (Units)'}
              </label>
              <input
                type="number"
                required
                min="1"
                max={type === 'PERCENTAGE' ? 100 : 10000}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink font-mono outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">Max Redemptions</label>
              <input
                type="number"
                required
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink font-mono outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">Expiration Date</label>
              <input
                type="date"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3 text-sm transition-all shadow-md mt-2 cursor-pointer"
          >
            Create Coupon
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
};

