import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { formatPrice } from '../utils/currency';
import { StockBadge } from '../components/common/StockBadge';
import { useCart } from '../context/CartContext';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS, Category, Product } from '../api/client';

interface CategoryShowcaseScreenProps {
  categoryId: string;
  onSelectSubcategory: (subId: string) => void;
  onSelectProduct: (productId: string) => void;
  onBack: () => void;
}

export const CategoryShowcaseScreen: React.FC<CategoryShowcaseScreenProps> = ({
  categoryId,
  onSelectSubcategory,
  onSelectProduct,
  onBack,
}) => {
  const { addItem } = useCart();
  const category = FALLBACK_CATEGORIES.find((c: Category) => c.id === categoryId) || FALLBACK_CATEGORIES[0];
  const products = FALLBACK_PRODUCTS;

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 w-full space-y-10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-forest hover:text-amber transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Categories</span>
        </button>

        {/* Category Hero Banner */}
        <section className="bg-sand/80 rounded-[32px] p-8 sm:p-14 space-y-4">
          <span className="text-xs uppercase tracking-wider font-bold text-muted">Department</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading text-ink">
            {category.name}
          </h1>
          <p className="text-sm sm:text-base text-muted max-w-xl leading-relaxed">
            Engineered hardware and certified accessories with real-time inventory synchronization.
          </p>

          {/* Subcategory Filter Pills */}
          {category.children && category.children.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <span className="text-xs font-semibold text-muted mr-1">Subcategories:</span>
              {category.children.map((sub: Category) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSelectSubcategory(sub.id)}
                  className="rounded-[999px] bg-sand hover:bg-forest hover:text-paper text-ink font-semibold px-5 py-2 text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>{sub.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Products in this category */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-heading text-ink">
              Products in {category.name}
            </h3>
            <span className="text-xs text-muted font-medium">
              Showing {products.length} verified item(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p: Product) => {
              const available = p.inventory?.available_quantity ?? 50;
              return (
                <div
                  key={p.id}
                  className="bg-sand/40 hover:bg-sand/70 rounded-[24px] p-5 flex flex-col justify-between transition-colors border border-sand"
                >
                  <div className="space-y-4">
                    <div
                      onClick={() => onSelectProduct(p.id)}
                      className="aspect-4/3 w-full bg-gradient-to-br from-[#EBCF9B] to-[#C6D8C9] rounded-2xl flex items-center justify-center cursor-pointer"
                    >
                      <span className="font-heading text-6xl text-forest/20 font-bold">
                        {p.name.charAt(0)}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-muted font-mono">{p.sku}</span>
                      <h4
                        onClick={() => onSelectProduct(p.id)}
                        className="font-heading text-lg font-semibold text-ink hover:text-forest transition-colors cursor-pointer"
                      >
                        {p.name}
                      </h4>
                      <p className="text-xs text-muted line-clamp-2 mt-1">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-sand flex items-center justify-between">
                    <div>
                      <div className="font-heading text-xl font-bold text-ink">
                        {formatPrice(p.price)}
                      </div>
                      <StockBadge quantity={available} />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          id: p.id,
                          name: p.name,
                          sku: p.sku,
                          price: p.price,
                          available_quantity: available,
                        })
                      }
                      className="rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold px-4 py-2 text-xs transition-colors cursor-pointer"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

