import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Heart, Store, ArrowRight, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface FavouritesScreenProps {
  onNavigateHome: () => void;
  onNavigateStores: () => void;
  onNavigateOrders: () => void;
  onNavigateAbout: () => void;
  onNavigateProduct: (productId: string) => void;
  onNavigateStore: (storeId: string) => void;
}

export const FavouritesScreen: React.FC<FavouritesScreenProps> = ({
  onNavigateHome,
  onNavigateStores,
  onNavigateOrders,
  onNavigateAbout,
  onNavigateProduct,
  onNavigateStore,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');

  const [favProducts, setFavProducts] = useState([
    {
      id: 'p1',
      name: 'Terracotta Handcrafted Vase',
      store: 'Artisan Handcrafts',
      storeId: 'store-1',
      price: 4500,
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'p2',
      name: 'Organic Indigo Wool Blanket',
      store: 'Heritage Textiles',
      storeId: 'store-2',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&q=80&w=600',
    },
  ]);

  const [favStores, setFavStores] = useState([
    {
      id: 'store-1',
      name: 'Artisan Handcrafts',
      category: 'Ceramics & Home Decor',
      rating: 4.9,
      productsCount: 28,
    },
    {
      id: 'store-2',
      name: 'Heritage Textiles',
      category: 'Apparel & Textiles',
      rating: 4.8,
      productsCount: 20,
    },
  ]);

  return (
    <div className="min-h-screen bg-sand-light flex flex-col justify-between">
      <div>
        <Header
          onNavigateHome={onNavigateHome}
          onNavigateStores={onNavigateStores}
          onNavigateOrders={onNavigateOrders}
          onNavigateAbout={onNavigateAbout}
        />

        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-ink flex items-center gap-2">
                <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                <span>My Saved Favourites</span>
              </h1>
              <p className="text-sm text-muted mt-1">
                Your bookmarked artisan workshops and handcrafted pieces.
              </p>
            </div>

            <div className="flex bg-sand p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  activeTab === 'products' ? 'bg-forest text-paper shadow-xs' : 'text-ink hover:text-forest'
                }`}
              >
                Saved Products ({favProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('stores')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  activeTab === 'stores' ? 'bg-forest text-paper shadow-xs' : 'text-ink hover:text-forest'
                }`}
              >
                Followed Stores ({favStores.length})
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {favProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-paper rounded-2xl border border-sand overflow-hidden shadow-xs hover:border-forest/40 transition-all flex flex-col justify-between"
                >
                  <div className="aspect-square bg-sand/40 relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFavProducts(favProducts.filter((item) => item.id !== p.id))}
                      className="absolute top-2 right-2 p-2 rounded-full bg-paper/80 backdrop-blur-xs text-red-500 hover:text-red-700 cursor-pointer"
                      title="Remove from favourites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-xs text-muted block">{p.store}</span>
                    <h3 className="font-heading font-bold text-sm text-ink truncate">{p.name}</h3>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-bold text-forest text-sm">{formatCurrency(p.price)}</span>
                      <button
                        type="button"
                        onClick={() => onNavigateProduct(p.id)}
                        className="px-3 py-1.5 rounded-xl bg-forest text-paper text-xs font-semibold hover:bg-forest/90 cursor-pointer"
                      >
                        View Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stores Grid */}
          {activeTab === 'stores' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favStores.map((s) => (
                <div
                  key={s.id}
                  className="bg-paper rounded-2xl border border-sand p-5 shadow-xs flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-forest" />
                      <h3 className="font-heading font-bold text-base text-ink">{s.name}</h3>
                    </div>
                    <p className="text-xs text-muted">{s.category} • {s.productsCount} items</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateStore(s.id)}
                    className="p-2 rounded-xl bg-forest text-paper hover:bg-forest/90 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

