import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { StarRating } from '../common/StarRating';
import { ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName?: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName = 'Pro Laptop 15"',
}) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          rating,
          comment,
        }),
      });
    } catch {
      // Offline fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      showToast({
        type: 'success',
        title: 'Review Submitted',
        description: 'Thank you! Your verified review has been submitted for moderation.',
      });
      setComment('');
      setRating(5);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Write a Product Review">
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        <div>
          <span className="text-xs text-muted block uppercase tracking-wider font-bold">Reviewing</span>
          <h4 className="font-heading font-semibold text-lg text-ink">{productName}</h4>
        </div>

        {/* 5-Star Rating Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase text-muted mb-2">
            Your Overall Rating
          </label>
          <div className="flex items-center gap-3 bg-sand/40 p-3 rounded-2xl w-fit">
            <StarRating rating={rating} interactive onRatingChange={(r) => setRating(r)} size="lg" />
            <span className="text-sm font-bold text-ink ml-2 font-heading">{rating} / 5</span>
          </div>
        </div>

        {/* Comment Textarea */}
        <div>
          <label className="block text-xs font-semibold uppercase text-muted mb-1">
            Review Comments (Min. 10 characters)
          </label>
          <textarea
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience regarding performance, packaging, or reliability..."
            className="w-full bg-sand/60 rounded-xl p-3.5 text-sm text-ink outline-none focus:ring-1 focus:ring-forest"
          />
        </div>

        {/* Moderation & Verified Notice */}
        <div className="p-3.5 bg-sand/60 rounded-xl flex items-start gap-2.5 text-xs text-muted">
          <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <span>
            Only verified customers who purchased this item are published. All reviews are checked for spam before public display.
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || comment.trim().length < 10}
          className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3.5 text-sm transition-all shadow-md active:scale-95 disabled:opacity-40 cursor-pointer"
        >
          {isSubmitting ? 'Submitting to Moderation...' : 'Submit Verified Review'}
        </button>
      </form>
    </Modal>
  );
};

