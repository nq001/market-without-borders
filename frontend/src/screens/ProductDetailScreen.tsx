import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Minus, ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { StockBadge } from '../components/common/StockBadge';
import { StarRating } from '../components/common/StarRating';
import { formatPrice } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { Product, FALLBACK_PRODUCTS } from '../api/client';

export interface ReviewItem {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

interface ProductDetailScreenProps {
  productId: string;
  onBack: () => void;
  onOpenReviewModal: () => void;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onNavigateOrders?: () => void;
  onNavigateProfile?: () => void;
  onNavigateAddresses?: () => void;
  onNavigateNotifications?: () => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  productId,
  onBack,
  onOpenReviewModal,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateOrders,
  onNavigateProfile,
  onNavigateAddresses,
  onNavigateNotifications,
}) => {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      user_name: 'Alex M.',
      rating: 5,
      comment: 'Exceptional build quality and lightning-fast delivery. The minor-unit precision guarantee is totally reliable.',
      is_verified_purchase: true,
      created_at: '2 days ago',
    },
    {
      id: 'rev-2',
      user_name: 'Sarah K.',
      rating: 4,
      comment: 'Very solid performance for engineering workloads. Stock reservation during checkout worked seamlessly.',
      is_verified_purchase: true,
      created_at: '1 week ago',
    },
  ]);

  useEffect(() => {
    // Look up product or use fallback
    const found = FALLBACK_PRODUCTS.find((p: Product) => p.id === productId) || FALLBACK_PRODUCTS[0];
    setProduct(found);
    setQuantity(1);
  }, [productId]);

  if (!product) return null;

  const availableStock = product.inventory?.available_quantity ?? 50;

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header
        onNavigateLogin={onNavigateLogin}
        onNavigateRegister={onNavigateRegister}
        onNavigateOrders={onNavigateOrders}
        onNavigateProfile={onNavigateProfile}
        onNavigateAddresses={onNavigateAddresses}
        onNavigateNotifications={onNavigateNotifications}
      />

      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 w-full space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-forest hover:text-amber transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </button>
        </div>

        {/* Product Hero Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Monogram & Visual Showcase */}
          <div className="lg:col-span-6 bg-sand/60 rounded-[32px] aspect-square flex items-center justify-center relative overflow-hidden border border-sand">
            <span className="font-heading text-9xl text-forest/20 font-bold select-none">
              {product.name.charAt(0)}
            </span>
            <div className="absolute top-6 left-6">
              <StockBadge quantity={availableStock} />
            </div>
          </div>

          {/* Right Column: Invariant Controls & Add to Cart */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted font-bold mb-1">
                {product.category?.name || 'Hardware'} • SKU: {product.sku}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading text-ink font-normal leading-tight">
                {product.name}
              </h1>

              {/* Rating summary */}
              <div className="flex items-center gap-3 mt-3">
                <StarRating rating={4.5} size="sm" />
                <span className="text-xs text-muted font-medium">
                  4.8 out of 5 ({reviews.length} verified reviews)
                </span>
              </div>
            </div>

            {/* Price Presentation */}
            <div className="p-6 bg-sand/40 rounded-[24px] space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-4xl sm:text-5xl font-bold text-ink">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-muted uppercase tracking-wider">
                  No hidden markup
                </span>
              </div>
              <p className="text-xs text-forest font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span>Price verified in minor units with atomic stock reservation.</span>
              </p>
            </div>

            <p className="text-sm sm:text-base text-muted leading-relaxed">
              {product.description}
            </p>

            {/* Invariant-Bounded Quantity Stepper */}
            <div className="pt-2 space-y-3">
              <label className="block text-xs font-bold uppercase text-muted">
                Quantity (Max {availableStock} available)
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-sand rounded-full p-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sand-hover text-ink disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-ink">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    disabled={quantity >= availableStock}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sand-hover text-ink disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  disabled={availableStock <= 0}
                  onClick={() =>
                    addItem(
                      {
                        id: product.id,
                        name: product.name,
                        sku: product.sku,
                        price: product.price,
                        available_quantity: availableStock,
                      },
                      quantity,
                    )
                  }
                  className="flex-1 rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3.5 px-8 text-sm transition-all duration-150 shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Add {quantity} to cart
                </button>
              </div>
            </div>

            {/* Guarantee Cards */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-sand">
              <div className="p-3 bg-sand/30 rounded-xl text-xs text-muted">
                <strong className="block text-ink font-heading mb-0.5">Instant Lock</strong>
                Reserved during checkout session.
              </div>
              <div className="p-3 bg-sand/30 rounded-xl text-xs text-muted">
                <strong className="block text-ink font-heading mb-0.5">Verified Purchase</strong>
                Authentic moderated customer reviews only.
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="pt-12 border-t border-sand space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted font-bold">Feedback</span>
              <h2 className="text-2xl sm:text-3xl font-heading text-ink mt-1">
                Verified Customer Reviews
              </h2>
            </div>

            <button
              type="button"
              onClick={onOpenReviewModal}
              className="rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-6 py-2.5 text-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <MessageSquare className="w-4 h-4 text-forest" />
              <span>Write a Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-sand/40 rounded-[24px] p-6 space-y-3 border border-sand/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-ink">{rev.user_name}</span>
                    {rev.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 bg-[#C6D8C9] text-forest text-[10px] font-bold px-2 py-0.5 rounded-[999px]">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">{rev.created_at}</span>
                </div>

                <StarRating rating={rev.rating} size="sm" />

                <p className="text-sm text-muted leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

