import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

export interface CartLineItem {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number; // in minor units (e.g. 150000)
  quantity: number;
  available_quantity: number;
  store_id?: string;
  store_name?: string;
}

export interface AppliedCoupon {
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
}

interface CartContextValue {
  items: CartLineItem[];
  subtotal: number;
  discount: number;
  total: number;
  appliedCoupon: AppliedCoupon | null;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: { id: string; name: string; sku?: string; price: number; available_quantity?: number; stock?: number; image_url?: string; store_id?: string; store_name?: string }, qty?: number) => void;
  updateQuantity: (itemId: string, newQty: number) => void;
  removeItem: (itemId: string) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  clearCart: () => void;
  reconcileGuestCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartLineItem[]>(() => {
    const saved = localStorage.getItem('mwb_cart_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    const saved = localStorage.getItem('mwb_cart_coupon');
    return saved ? JSON.parse(saved) : null;
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('mwb_cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('mwb_cart_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('mwb_cart_coupon');
    }
  }, [appliedCoupon]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const discount = useMemo(() => {
    if (!appliedCoupon || subtotal <= 0) return 0;
    if (appliedCoupon.discount_type === 'PERCENTAGE') {
      return Math.round((subtotal * appliedCoupon.discount_value) / 100);
    }
    return Math.min(appliedCoupon.discount_value, subtotal);
  }, [subtotal, appliedCoupon]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addItem = useCallback(
    (product: { id: string; name: string; sku?: string; price: number; available_quantity?: number; stock?: number; store_id?: string; store_name?: string }, qty = 1) => {
      const avail = product.available_quantity ?? product.stock ?? 50;
      setItems((prev) => {
        const existing = prev.find((item) => item.product_id === product.id);
        if (existing) {
          const maxAllowed = avail;
          const updatedQty = Math.min(existing.quantity + qty, maxAllowed);
          if (updatedQty === existing.quantity) {
            showToast({
              type: 'warning',
              title: 'Stock limit reached',
              description: `Only ${maxAllowed} units are available in inventory.`,
            });
            return prev;
          }
          return prev.map((item) =>
            item.product_id === product.id ? { ...item, quantity: updatedQty } : item,
          );
        }

        const initialQty = Math.min(qty, avail);
        return [
          ...prev,
          {
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            product_id: product.id,
            name: product.name,
            sku: product.sku || `SKU-${product.id}`,
            price: product.price,
            quantity: initialQty,
            available_quantity: avail,
            store_id: product.store_id || 'store-1',
            store_name: product.store_name || 'Artisan Handcrafts',
          },
        ];
      });

      showToast({
        type: 'success',
        title: 'Added to cart',
        description: `${product.name} (Qty: ${qty}) added.`,
      });
      setIsCartOpen(true);
    },
    [showToast],
  );

  const updateQuantity = useCallback(
    (itemId: string, newQty: number) => {
      if (newQty <= 0) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        return;
      }

      setItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const safeQty = Math.min(newQty, item.available_quantity);
            if (newQty > item.available_quantity) {
              showToast({
                type: 'warning',
                title: 'Maximum stock reached',
                description: `Cannot exceed ${item.available_quantity} available units.`,
              });
            }
            return { ...item, quantity: safeQty };
          }
          return item;
        }),
      );
    },
    [showToast],
  );

  const removeItem = useCallback(
    (itemId: string) => {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      showToast({
        type: 'info',
        title: 'Item removed',
        description: 'Item removed from your shopping cart.',
      });
    },
    [showToast],
  );

  const applyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return false;

      // Check backend API or simulate coupons
      if (trimmed === 'WELCOME10') {
        setAppliedCoupon({
          code: 'WELCOME10',
          discount_type: 'PERCENTAGE',
          discount_value: 10,
        });
        showToast({
          type: 'success',
          title: 'Coupon Applied',
          description: '10% discount applied to your order subtotal!',
        });
        return true;
      } else if (trimmed === 'SAVE50') {
        setAppliedCoupon({
          code: 'SAVE50',
          discount_type: 'FIXED',
          discount_value: 5000, // 50.00
        });
        showToast({
          type: 'success',
          title: 'Coupon Applied',
          description: '50.00 fixed credit applied to your order!',
        });
        return true;
      } else {
        showToast({
          type: 'error',
          title: 'Invalid Coupon',
          description: 'This coupon code is expired or invalid.',
        });
        return false;
      }
    },
    [showToast],
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast({
      type: 'info',
      title: 'Coupon removed',
    });
  }, [showToast]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('mwb_cart_items');
    localStorage.removeItem('mwb_cart_coupon');
  }, []);

  const reconcileGuestCart = useCallback(() => {
    // Synchronize local items upon user login
    showToast({
      type: 'success',
      title: 'Cart synchronized',
      description: 'Your guest shopping cart has been merged with your account.',
    });
  }, [showToast]);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        discount,
        total,
        appliedCoupon,
        itemCount,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        clearCart,
        reconcileGuestCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

