import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Layers, Store, ArrowRight, Star, MapPin } from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_STORES } from '../data/mockDatabase';

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
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  const categoriesWithAll = [
    {
      id: 'all',
      name: 'All Stores',
      description: 'Explore all 10 independent verified artisan workshops and craft studios.',
      product_count: MOCK_STORES.reduce((acc, s) => acc + s.product_count, 0),
    },
    ...MOCK_CATEGORIES,
  ];

  const filteredStores =
    selectedCatId === 'all'
      ? MOCK_STORES
      : MOCK_STORES.filter((s) => s.category_id === selectedCatId);

  const activeCategory =
    categoriesWithAll.find((c) => c.id === selectedCatId) || categoriesWithAll[0];

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
              Select a category to view verified creator stores, or enter an independent storefront to browse their collection.
            </p>
          </div>

          {/* 1. Category Tabs */}
          <div className="flex flex-wrap gap-2.5 pt-8 pb-6 border-b border-sand">
            {categoriesWithAll.map((cat) => {
              const count =
                cat.id === 'all'
                  ? MOCK_STORES.length
                  : MOCK_STORES.filter((s) => s.category_id === cat.id).length;

              return (
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
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* 2. Stores in Category */}
          <div className="py-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-heading text-xl font-bold text-ink">{activeCategory.name}</h2>
                <p className="text-xs text-muted mt-1">{activeCategory.description}</p>
              </div>
              <span className="text-xs font-medium text-muted bg-paper px-3 py-1 rounded-full border border-sand self-start sm:self-auto">
                Showing {filteredStores.length} stores
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((st) => (
                <div
                  key={st.id}
                  className="bg-paper rounded-2xl border border-sand hover:border-forest/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="relative h-36 bg-sand/40 overflow-hidden">
                    <img
                      src={st.banner_url}
                      alt={st.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-paper/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-ink flex items-center gap-1 shadow-xs">
                      <Star className="w-3.5 h-3.5 text-amber fill-amber" />
                      <span>{st.rating}</span>
                      <span className="text-muted font-normal">({st.review_count})</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-paper/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-muted">
                      {st.product_count} products
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted mb-1.5">
                        <MapPin className="w-3 h-3 text-forest" />
                        <span>{st.city}, {st.country}</span>
                        <span>•</span>
                        <span className="text-forest font-medium">{st.category_name}</span>
                      </div>
                      <h3 className="font-heading text-lg font-bold text-ink">{st.name}</h3>
                      <p className="text-xs text-muted mt-2 leading-relaxed line-clamp-2">{st.tagline}</p>
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
