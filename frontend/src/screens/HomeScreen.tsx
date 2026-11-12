import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import {
  Store,
  Flame,
  Layers,
  Tag,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface HomeScreenProps {
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onNavigateOrders?: () => void;
  onNavigateProfile?: () => void;
  onNavigateAddresses?: () => void;
  onNavigateNotifications?: () => void;
  onNavigateCatalog?: () => void;
  onNavigateStores?: () => void;
  onSelectStore?: (storeId: string) => void;
  onSelectCategory?: (categoryId: string) => void;
  onSelectProduct?: (productId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  onNavigateOrders,
  onNavigateProfile,
  onNavigateNotifications,
  onNavigateCatalog,
  onNavigateStores,
  onSelectStore,
  onSelectCategory,
  onSelectProduct,
}) => {
  // Section 4.2 Data conforming strictly to:
  // - Ad space
  // - Stores with the most orders
  // - Orders with high demand
  // - Categories with high traffic
  // - Stores with offers

  const topStores = [
    {
      id: 'store-1',
      name: 'Artisan Handcrafts',
      category: 'Ceramics & Decor',
      rating: 4.9,
      orderCount: '1,420+ orders',
      description: 'Specialist studio crafting terracotta vases and oak tableware.',
    },
    {
      id: 'store-2',
      name: 'Heritage Textiles',
      category: 'Textiles & Rugs',
      rating: 4.8,
      orderCount: '980+ orders',
      description: 'Organic hand-spun indigo blankets, linens, and natural wool wraps.',
    },
    {
      id: 'store-3',
      name: 'Levant Spice & Pantry',
      category: 'Artisanal Pantry',
      rating: 5.0,
      orderCount: '860+ orders',
      description: 'Small-batch cold-pressed oils, zaatar blends, and wildflower honey.',
    },
  ];

  const highDemandProducts = [
    {
      id: 'p1',
      name: 'Terracotta Handcrafted Vase',
      store: 'Artisan Handcrafts',
      price: 4500,
      demandLabel: 'High Demand • Selling Fast',
    },
    {
      id: 'p2',
      name: 'Organic Indigo Wool Blanket',
      store: 'Heritage Textiles',
      price: 12000,
      demandLabel: 'Popular Pick • 98 ordered this week',
    },
    {
      id: 'p3',
      name: 'Raw Oak Serving Platter',
      store: 'Artisan Handcrafts',
      price: 4500,
      demandLabel: 'Trending • Handcrafted in small batches',
    },
  ];

  const highTrafficCategories = [
    { id: 'cat-1', name: 'Handcrafted Decor & Ceramics', storeCount: 14, popularIn: 'Vases, dinnerware, sculptures' },
    { id: 'cat-2', name: 'Organic Textiles & Apparel', storeCount: 22, popularIn: 'Linens, woven blankets, throws' },
    { id: 'cat-3', name: 'Artisanal Pantry & Spices', storeCount: 9, popularIn: 'Pure oils, organic tea, preserves' },
    { id: 'cat-4', name: 'Handmade Jewelry & Gems', storeCount: 18, popularIn: 'Silver rings, raw gemstones' },
  ];

  const storesWithOffers = [
    {
      id: 'store-1',
      name: 'Artisan Handcrafts',
      badge: '15% OFF Entire Catalog',
      code: 'FALL15',
      note: 'Valid on orders over $50',
    },
    {
      id: 'store-2',
      name: 'Heritage Textiles',
      badge: 'Free Express Shipping',
      code: 'FREESHIP',
      note: 'Auto-applied at multi-store checkout',
    },
  ];

  return (
    <div className="min-h-screen bg-sand/20 font-sans text-ink flex flex-col justify-between">
      <div>
        {/* Conforming Header (4 Links: Home, Stores, Orders, About) */}
        <Header
          onNavigateHome={() => {}}
          onNavigateStores={onNavigateStores || onNavigateCatalog}
          onNavigateOrders={onNavigateOrders}
          onNavigateAbout={() => {}}
          onNavigateLogin={onNavigateLogin}
          onNavigateRegister={onNavigateRegister}
          onNavigateProfile={onNavigateProfile}
          onNavigateNotifications={onNavigateNotifications}
        />

        {/* 1. Hero & Ad Space Banner (Section 4.2) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-6">
          <div className="w-full bg-forest text-paper rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-forest-light/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-paper/10 text-sand text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber" />
                <span>Featured Marketplace Campaign</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                Authentic Craftsmanship from Independent Studios
              </h1>
              <p className="text-sand/80 text-sm sm:text-base leading-relaxed">
                Discover independent stores worldwide. Buy ceramics, textiles, and pantry goods from multiple creators in a single shared cart.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onNavigateStores || onNavigateCatalog}
                  className="rounded-[999px] bg-amber hover:bg-amber-light text-ink font-semibold px-6 py-3 text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Explore All Stores
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Stores with the Most Orders (Section 4.2) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink">Stores with Most Orders</h2>
              <p className="text-xs text-muted">Trusted creator workshops with the highest customer volume.</p>
            </div>
            <button
              type="button"
              onClick={onNavigateStores || onNavigateCatalog}
              className="text-xs font-semibold text-forest hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topStores.map((st) => (
              <div
                key={st.id}
                onClick={() => onSelectStore && onSelectStore(st.id)}
                className="bg-paper p-6 rounded-2xl border border-sand hover:border-forest/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-forest uppercase tracking-wider">{st.category}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-ink">
                      <Star className="w-3.5 h-3.5 text-amber fill-amber" />
                      <span>{st.rating}</span>
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-ink mt-2">{st.name}</h3>
                  <p className="text-xs text-muted mt-2 leading-relaxed">{st.description}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-sand flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-800">{st.orderCount}</span>
                  <span className="text-forest font-semibold flex items-center gap-1">
                    <span>Visit Store</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Orders with High Demand (Section 4.2) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-5 h-5 text-amber" />
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink">High-Demand Products</h2>
              <p className="text-xs text-muted">Trending goods being ordered rapidly across the marketplace.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {highDemandProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProduct && onSelectProduct(p.id)}
                className="bg-paper p-5 rounded-2xl border border-sand hover:border-forest/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
                    {p.demandLabel}
                  </span>
                  <h3 className="font-heading text-base font-bold text-ink">{p.name}</h3>
                  <div className="text-xs text-muted mt-1">From: <strong className="text-forest">{p.store}</strong></div>
                </div>
                <div className="mt-4 pt-3 border-t border-sand flex items-center justify-between">
                  <span className="font-heading text-base font-bold text-ink">{formatCurrency(p.price)}</span>
                  <button
                    type="button"
                    className="p-2 rounded-full bg-forest text-paper hover:bg-forest-light transition-all shadow-xs"
                    title="View item"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Categories with High Traffic (Section 4.2) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-forest" />
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink">High-Traffic Categories</h2>
              <p className="text-xs text-muted">Browse multi-store aisles experiencing peak customer engagement.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {highTrafficCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                className="p-5 rounded-2xl bg-sand/40 border border-sand hover:bg-sand/70 transition-all cursor-pointer"
              >
                <h3 className="font-heading text-sm font-bold text-ink">{cat.name}</h3>
                <div className="text-xs font-semibold text-forest mt-1">{cat.storeCount} independent stores</div>
                <p className="text-[11px] text-muted mt-2">{cat.popularIn}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Stores with Offers (Section 4.2) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-5 h-5 text-amber" />
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink">Stores with Active Offers</h2>
              <p className="text-xs text-muted">Creator promotions and exclusive coupon discounts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {storesWithOffers.map((o) => (
              <div
                key={o.id}
                className="p-6 rounded-2xl bg-amber/10 border border-amber/30 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-heading text-base font-bold text-ink">{o.name}</h3>
                  <div className="text-sm font-bold text-amber-900 mt-1">{o.badge}</div>
                  <div className="text-xs text-muted mt-0.5">{o.note}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold bg-amber text-ink px-3 py-1.5 rounded-lg shadow-xs">
                    {o.code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};
