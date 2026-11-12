import React, { useState } from 'react';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { MessageSquare, AlertTriangle, Star, CornerDownRight, Flag, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ProductReview {
  id: string;
  customer_name: string;
  product_name: string;
  rating: number;
  comment: string;
  created_at: string;
  reply?: string;
}

interface StoreComplaint {
  id: string;
  customer_name: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  admin_notes?: string;
  created_at: string;
}

export const OwnerFeedbackScreen: React.FC<{ onNavigate: (path: string) => void; onLogout: () => void }> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'reviews' | 'complaints'>('reviews');
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});

  const [reviews, setReviews] = useState<ProductReview[]>([
    {
      id: 'rev-1',
      customer_name: 'David Kim',
      product_name: 'Terracotta Handcrafted Vase',
      rating: 5,
      comment: 'Superb craftsmanship. The glaze is even more vibrant in person.',
      created_at: 'Nov 10, 2026',
      reply: 'Thank you so much David! Enjoy the artisan ceramics.',
    },
    {
      id: 'rev-2',
      customer_name: 'Sarah Miller',
      product_name: 'Raw Oak Serving Platter',
      rating: 4,
      comment: 'Nice weight and wood finish, though shipping took 4 days.',
      created_at: 'Nov 11, 2026',
    },
  ]);

  const [complaints] = useState<StoreComplaint[]>([
    {
      id: 'cmp-101',
      customer_name: 'Jane Customer',
      reason: 'Defective product received',
      details: 'Vase arrived with a hairline crack on the rim.',
      status: 'PENDING',
      admin_notes: 'Please communicate directly with customer to issue replacement.',
      created_at: 'Nov 12, 2026',
    },
  ]);

  const handleSendReply = (reviewId: string) => {
    const text = replyInput[reviewId];
    if (!text?.trim()) return;

    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, reply: text } : r)),
    );
    setReplyInput((prev) => ({ ...prev, [reviewId]: '' }));
    showToast({
      type: 'success',
      title: 'Reply Published',
      description: 'Your response is now displayed beneath the customer review.',
    });
  };

  const handleReportReview = (reviewId: string) => {
    showToast({
      type: 'info',
      title: 'Review Reported to Admin',
      description: 'Our moderation team will review the comment for platform terms compliance.',
    });
  };

  return (
    <OwnerLayout currentPath="/owner/reviews" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-ink">Reviews & Complaints</h1>
            <p className="text-sm text-muted mt-1">
              Engage with customer reviews and respond to store dispute investigations.
            </p>
          </div>
          <div className="flex bg-sand/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                activeTab === 'reviews' ? 'bg-forest text-paper shadow-xs' : 'text-ink hover:text-forest'
              }`}
            >
              Product Reviews ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('complaints')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                activeTab === 'complaints' ? 'bg-forest text-paper shadow-xs' : 'text-ink hover:text-forest'
              }`}
            >
              Complaints ({complaints.length})
            </button>
          </div>
        </div>

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-paper rounded-2xl border border-sand p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-ink">{r.product_name}</h3>
                    <p className="text-xs text-muted">Review by {r.customer_name} • {r.created_at}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < r.rating ? 'text-amber fill-amber' : 'text-sand fill-sand'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-ink leading-relaxed">{r.comment}</p>

                {r.reply ? (
                  <div className="p-3.5 rounded-xl bg-forest/5 border border-forest/20 text-xs space-y-1">
                    <span className="font-bold text-forest block">Your Merchant Response:</span>
                    <p className="text-ink">{r.reply}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={replyInput[r.id] || ''}
                      onChange={(e) => setReplyInput({ ...replyInput, [r.id]: e.target.value })}
                      placeholder="Write a public merchant response..."
                      className="flex-1 bg-sand/60 rounded-xl px-4 py-2 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendReply(r.id)}
                      className="px-4 py-2 rounded-xl bg-forest text-paper text-xs font-semibold hover:bg-forest/90 cursor-pointer"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReportReview(r.id)}
                      className="p-2 text-muted hover:text-red-700 cursor-pointer"
                      title="Report abusive review to admin"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div key={c.id} className="bg-paper rounded-2xl border border-sand p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-red-800 uppercase tracking-wider">{c.reason}</span>
                    <p className="text-xs text-muted">Filed by {c.customer_name} • {c.created_at}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-[999px] text-[10px] font-bold bg-amber text-ink">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-ink leading-relaxed bg-sand/30 p-3.5 rounded-xl">{c.details}</p>
                {c.admin_notes && (
                  <div className="text-xs text-forest bg-forest/5 p-3 rounded-xl border border-forest/20">
                    <span className="font-bold">Super Admin Instruction: </span>
                    <span>{c.admin_notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
};

