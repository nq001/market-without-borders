import React, { useState } from 'react';
import { MessageSquare, ShieldCheck, Check, X } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StarRating } from '../../components/common/StarRating';
import { useToast } from '../../context/ToastContext';

interface PendingReview {
  id: string;
  product_name: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  date: string;
}

interface AdminReviewsScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminReviewsScreen: React.FC<AdminReviewsScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<PendingReview[]>([
    {
      id: 'rev-p1',
      product_name: 'Pro Laptop 15"',
      customer_name: 'David Liu',
      rating: 5,
      comment: 'Super fast compilation times in our development environment. Hardware exceeded benchmarks.',
      is_verified_purchase: true,
      date: '20 mins ago',
    },
    {
      id: 'rev-p2',
      product_name: 'USB-C Docking Station',
      customer_name: 'Anonymous Guest',
      rating: 1,
      comment: 'Spam testing promo link: visit my store www.spam.test',
      is_verified_purchase: false,
      date: '1 hour ago',
    },
  ]);

  const handleApprove = (id: string, name: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast({
      type: 'success',
      title: 'Review Approved',
      description: `Review for ${name} published to storefront.`,
    });
  };

  const handleReject = (id: string, name: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast({
      type: 'info',
      title: 'Review Rejected',
      description: `Review flagged and removed from queue.`,
    });
  };

  return (
    <AdminLayout
      currentPath="/admin/reviews"
      breadcrumbs={['Moderation', 'Reviews']}
      title="Customer Review Moderation Queue"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="bg-paper border border-sand rounded-[28px] p-6 space-y-6 shadow-xs max-w-4xl">
        <div className="flex items-center justify-between pb-3 border-b border-sand">
          <div>
            <h3 className="font-heading font-semibold text-lg text-ink">Pending Moderation Queue</h3>
            <p className="text-xs text-muted">Verify authentic customer reviews before public display</p>
          </div>
          <span className="text-xs font-bold text-amber bg-amber/10 px-3 py-1 rounded-[999px]">
            {reviews.length} pending
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="py-16 text-center text-muted space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto text-sand-hover" />
            <h4 className="font-heading text-lg text-ink">Queue is clean!</h4>
            <p className="text-xs">No pending reviews waiting for moderation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-sand/40 border border-sand rounded-2xl p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-heading font-semibold text-sm text-ink block">
                      {rev.product_name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>By {rev.customer_name}</span>
                      <span>•</span>
                      <span>{rev.date}</span>
                      {rev.is_verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forest bg-[#C6D8C9] px-2 py-0.5 rounded-[999px]">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>

                  <StarRating rating={rev.rating} size="sm" />
                </div>

                <p className="text-sm text-ink bg-paper p-3 rounded-xl border border-sand/60">
                  "{rev.comment}"
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleReject(rev.id, rev.product_name)}
                    className="rounded-[999px] bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold px-4 py-2 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(rev.id, rev.product_name)}
                    className="rounded-[999px] bg-forest hover:bg-forest-light text-paper text-xs font-semibold px-5 py-2 flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Publish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

