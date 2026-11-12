import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Layers, Store, ArrowRight, Star, ExternalLink } from 'lucide-react';

interface StoresDirectoryScreenProps {
  onSelectStore: (storeId: string) => void;
  onNavigateHome: () => void;
  onNavigateOrders?: () => void;
  onNavigateProfile?: () => void;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onNavigateNotifications?: () => void;
}

export const StoresDirectoryScreen: React.FC<StoresDirectoryScreenProps> = ({
  onSelectStore,
  onNavigateHome,
  onNavigateOrders,
  onNavigateProfile,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateNotifications,
}) => {
  // Section 4.3:
  // 1. Click a category to see all stores in that category
  // 2. Click a store to enter it and shop from it

  const categoryStoreMap = [
    {
      id: 'cat-1',
      name: 'Handcrafted Decor & Ceramics',
      description: 'Pottery, tableware, oak serving boards, and carved decorative items.',
      stores: [
        {
          id: 'store-1',
          name: 'Artisan Handcrafts',
          slug: 'artisan-handcrafts',
          rating: 4.9,
          productCount: 28,
          tagline: 'Terracotta vases and fine oak dining ware.',
        },
        {
          id: 'store-4',
          name: 'Clay & Flame Studio',
          slug: 'clay-and-flame',
          rating: 4.7,
          productCount: 14,
          tagline: 'Kiln-fired earthenware and minimalist vessels.',
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'Organic Textiles & Apparel',
      description: 'Hand-woven throws, linen blankets, indigo robes, and embroidered cushions.',
      stores: [
        {
          id: 'store-2',
          name: 'Heritage Textiles',
          slug: 'heritage-textiles',
          rating: 4.8,
          productCount: 16,
          tagline: 'Organic indigo blankets and traditional linen shawls.',
        },
      ],
    },
    {
      id: 'cat-3',
      name: 'Artisanal Pantry & Spices',
      description: 'Single-estate olive oils, organic spices, cold-pressed syrups, and honey.',
      stores: [
        {
          id: 'store-3',
          name: 'Levant Spice & Pantry',
          slug: 'levant-spice',
          rating: 5.0,
          productCount: 21,
          tagline: 'Cold-pressed extra virgin olive oil and mountain zaatar.',
        },
      ],
    },
  ];

  const [selectedCatId, setSelectedCatId] = useState<string>('cat-1');
  const activeCategory = categoryStoreMap.find((c) => c.id === selectedCatId) || categoryStoreMap[0];

  return (
    <div className="min-h-screen bg-sand/20 font-sans text-ink flex flex-col justify-between">
      <div>
        <Header
          onNavigateHome={onNavigateHome}
          onNavigateStores={() => {}}
          onNavigateOrders={onNavigateOrders}
          onNavigateProfile={onNavigateProfile}
          onNavigateLogin={onNavigateLogin}
          onNavigateRegister={onNavigateRegister}
          onNavigateNotifications={onNavigateNotifications}
        />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10">
          <div>
            <h1 className="font-heading text-3xl font-bold text-ink">Marketplace Stores by Category</h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Select a category to view all verified creator stores, or enter an independent storefront to browse their collection.
            </p>
          </div>

          {/* 1. Category Tabs (Section 4.3 Step 1) */}
          <div className="flex flex-wrap gap-2.5 pt-8 pb-6 border-b border-sand">
            {categoryStoreMap.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-5 py-2.5 rounded-[999px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCatId === cat.id
                    ? 'bg-forest text-paper shadow-sm'
                    : 'bg-paper border border-sand hover:bg-sand/60 text-ink'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75">({cat.stores.length})</span>
              </button>
            ))}
          </div>

          {/* 2. Stores in Category (Section 4.3 Step 2) */}
          <div className="py-8">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold text-ink">{activeCategory.name}</h2>
              <p className="text-xs text-muted mt-1">{activeCategory.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCategory.stores.map((st) => (
                <div
                  key={st.id}
                  className="bg-paper p-6 rounded-2xl border border-sand hover:border-forest/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs font-bold text-ink">
                        <Star className="w-4 h-4 text-amber fill-amber" />
                        <span>{st.rating}</span>
                      </div>
                      <span className="text-xs text-muted">{st.productCount} products</span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-ink mt-3">{st.name}</h3>
                    <p className="text-xs text-muted mt-2 leading-relaxed">{st.tagline}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-sand">
                    <button
                      type="button"
                      onClick={() => onSelectStore(st.id)}
                      className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-2.5 text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Enter Store & Shop</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

