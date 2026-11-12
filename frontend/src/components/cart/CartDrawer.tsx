import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/currency';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onNavigateCatalog: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onNavigateCatalog,
}) => {
  const {
    items,
    subtotal,
    discount,
    total,
    appliedCoupon,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponCode);
    setIsApplying(false);
    setCouponCode('');
  };

  const footerContent = items.length > 0 && (
    <div className="space-y-4">
      {/* Price Summary Breakdown */}
      <div className="space-y-2 text-sm text-ink">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-forest font-medium">
            <span>Coupon Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-ink pt-2 border-t border-sand">
          <span>Estimated Total</span>
          <span className="font-heading text-xl">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        type="button"
        onClick={() => {
          closeCart();
          onProceedToCheckout();
        }}
        className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3.5 px-6 flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-center text-xs text-muted">
        Atomic stock reservation starts when you proceed to checkout.
      </p>
    </div>
  );

  return (
    <Drawer
      isOpen={isCartOpen}
      onClose={closeCart}
      title={`Your Cart (${items.length})`}
      footer={footerContent}
      width="md"
    >
      {items.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-sand flex items-center justify-center text-muted">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h4 className="font-heading text-lg font-semibold text-ink">Your cart is empty</h4>
          <p className="text-sm text-muted max-w-xs mx-auto">
            Discover verified inventory with atomic stock reservations.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                closeCart();
                onNavigateCatalog();
              }}
              className="rounded-[999px] bg-forest text-paper px-6 py-2.5 text-sm font-semibold hover:bg-forest-light transition-colors cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Multi-Store Items Partitioning (Section 4.4) */}
          <div className="space-y-6">
            {Object.entries(
              items.reduce((acc, item) => {
                const sName = item.store_name || 'Artisan Handcrafts';
                if (!acc[sName]) acc[sName] = [];
                acc[sName].push(item);
                return acc;
              }, {} as Record<string, typeof items>),
            ).map(([storeName, storeItems]) => (
              <div key={storeName} className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-forest uppercase tracking-wider px-1">
                  <span>Store:</span>
                  <span className="text-ink">{storeName}</span>
                  <span className="text-muted text-[10px]">({storeItems.length} items)</span>
                </div>

                <div className="space-y-2.5">
                  {storeItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-sand/40 rounded-2xl p-4 flex items-center justify-between gap-4 border border-sand/50"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-muted uppercase tracking-wider">{item.sku}</span>
                        <h5 className="font-medium text-sm text-ink truncate">{item.name}</h5>
                        <div className="mt-1 font-semibold text-sm text-ink font-heading">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>

                      {/* Stepper & Remove */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center bg-sand rounded-full p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-sand-hover text-ink transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-ink">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.available_quantity}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-sand-hover text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-muted hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Entry Section */}
          <div className="pt-2 border-t border-sand">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-[#C6D8C9]/60 rounded-xl p-3 text-xs text-forest font-medium">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-forest" />
                  <span>
                    Coupon <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discount_type === 'PERCENTAGE' ? `${appliedCoupon.discount_value}%` : formatPrice(appliedCoupon.discount_value)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-red-700 hover:underline font-semibold ml-2 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Promo coupon (e.g. WELCOME10)"
                  className="flex-1 bg-sand/60 rounded-[999px] px-4 py-2 text-xs text-ink placeholder-muted outline-none focus:ring-1 focus:ring-forest"
                />
                <button
                  type="submit"
                  disabled={isApplying || !couponCode.trim()}
                  className="rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-4 py-2 text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
};

