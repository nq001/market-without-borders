import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { StockBadge } from '../components/common/StockBadge';
import { formatPrice } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { fetchCategories, fetchNewestProducts, Category, Product, FALLBACK_PRODUCTS } from '../api/client';

interface CatalogScreenProps {
  onSelectProduct: (productId: string) => void;
  initialCategoryId?: string;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onNavigateOrders?: () => void;
  onNavigateProfile?: () => void;
  onNavigateAddresses?: () => void;
  onNavigateNotifications?: () => void;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  onSelectProduct,
  initialCategoryId,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateOrders,
  onNavigateProfile,
  onNavigateAddresses,
  onNavigateNotifications,
}) => {
  const { addItem } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId || null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(300000); // 3,000.00 minor units
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [isLoading, setIsLoading] = useState(true);

  // 300ms Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [cRes, pRes] = await Promise.all([
        fetchCategories(),
        fetchNewestProducts(20),
      ]);
      setCategories(cRes.data);
      // Ensure we have products to display
      setProducts(pRes.data.length ? pRes.data : FALLBACK_PRODUCTS);
      setIsLoading(false);
    }
    load();
  }, []);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (debouncedSearch) {
          const matchTitle = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
          const matchSku = p.sku.toLowerCase().includes(debouncedSearch.toLowerCase());
          if (!matchTitle && !matchSku) return false;
        }

        if (selectedCategoryId) {
          const matchCategory =
            p.category_id === selectedCategoryId ||
            p.category?.id === selectedCategoryId ||
            p.category?.parent_id === selectedCategoryId;
          if (!matchCategory) return false;
        }

        if (inStockOnly) {
          const available = p.inventory?.available_quantity ?? 0;
          if (available <= 0) return false;
        }

        if (p.price > priceRange) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return 0;
      });
  }, [products, debouncedSearch, selectedCategoryId, inStockOnly, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header
        onSearch={(q) => setSearchQuery(q)}
        onNavigateLogin={onNavigateLogin}
        onNavigateRegister={onNavigateRegister}
        onNavigateOrders={onNavigateOrders}
        onNavigateProfile={onNavigateProfile}
        onNavigateAddresses={onNavigateAddresses}
        onNavigateNotifications={onNavigateNotifications}
      />

      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 w-full space-y-8">
        {/* Header Breadcrumb & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sand">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-muted">Storefront Catalog</span>
            <h1 className="text-3xl sm:text-4xl font-heading font-normal text-ink mt-1">
              Browse All Products
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-sand/60 rounded-[999px] px-4 py-2 text-xs font-medium text-ink">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none outline-none font-semibold cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar Filter Matrix + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Filter Sidebar */}
          <aside className="bg-sand/40 rounded-[28px] p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-sand">
              <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-forest" />
                <span>Filters</span>
              </h3>
              {(selectedCategoryId || inStockOnly || debouncedSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setInStockOnly(false);
                    setSearchQuery('');
                    setPriceRange(300000);
                  }}
                  className="text-xs text-forest hover:underline font-semibold cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, SKU..."
                  className="w-full bg-sand/60 rounded-[999px] py-2 pl-9 pr-3 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
                />
                <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Categories Tree */}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-2">Categories</label>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategoryId === null ? 'bg-forest text-paper font-semibold' : 'hover:bg-sand text-ink'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selectedCategoryId === cat.id ? 'bg-forest text-paper font-semibold' : 'hover:bg-sand text-ink'
                      }`}
                    >
                      {cat.name}
                    </button>
                    {cat.children && cat.children.length > 0 && (
                      <div className="pl-3 space-y-1">
                        {cat.children.map((child) => (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => setSelectedCategoryId(child.id)}
                            className={`w-full text-left px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                              selectedCategoryId === child.id
                                ? 'bg-amber text-ink font-semibold'
                                : 'text-muted hover:text-ink hover:bg-sand/60'
                            }`}
                          >
                            ↳ {child.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted mb-2">
                <span>Max Price</span>
                <span className="text-ink font-heading text-sm">{formatPrice(priceRange)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="500000"
                step="5000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
            </div>

            {/* In Stock Only Checkbox */}
            <div className="pt-2 border-t border-sand">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-sand text-forest focus:ring-forest cursor-pointer w-4 h-4"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-sand/30 rounded-[24px] animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-sand/20 rounded-[28px] p-8 space-y-3">
                <h4 className="font-heading text-xl text-ink">No matching products found</h4>
                <p className="text-sm text-muted max-w-sm mx-auto">
                  Try adjusting your search keywords, increasing price thresholds, or resetting category filters.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setInStockOnly(false);
                      setSearchQuery('');
                      setPriceRange(300000);
                    }}
                    className="rounded-[999px] bg-forest text-paper px-6 py-2.5 text-xs font-semibold hover:bg-forest-light cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((p) => {
                  const available = p.inventory?.available_quantity ?? 50;

                  return (
                    <div
                      key={p.id}
                      className="bg-sand/50 hover:bg-sand/80 rounded-[24px] p-5 flex flex-col justify-between transition-all duration-200 group border border-transparent hover:border-sand"
                    >
                      <div className="space-y-4">
                        {/* Monogram / Visual Tile */}
                        <div
                          onClick={() => onSelectProduct(p.id)}
                          className="aspect-4/3 w-full bg-gradient-to-br from-[#EBCF9B]/80 to-[#C6D8C9]/80 rounded-2xl flex items-center justify-center relative overflow-hidden cursor-pointer"
                        >
                          <span className="font-heading text-6xl text-forest/20 font-bold group-hover:scale-110 transition-transform duration-300">
                            {p.name.charAt(0)}
                          </span>
                        </div>

                        {/* Metadata */}
                        <div>
                          <div className="flex items-center justify-between text-xs text-muted mb-1">
                            <span>{p.category?.name || 'General'}</span>
                            <span className="font-mono">{p.sku}</span>
                          </div>
                          <h4
                            onClick={() => onSelectProduct(p.id)}
                            className="font-heading text-lg font-semibold text-ink group-hover:text-forest transition-colors cursor-pointer line-clamp-1"
                          >
                            {p.name}
                          </h4>
                          <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
                            {p.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Price & Add to Cart */}
                      <div className="pt-4 mt-4 border-t border-sand/80 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-heading text-xl font-bold text-ink">
                            {formatPrice(p.price)}
                          </div>
                          <StockBadge quantity={available} />
                        </div>

                        <button
                          type="button"
                          disabled={available <= 0}
                          onClick={() =>
                            addItem({
                              id: p.id,
                              name: p.name,
                              sku: p.sku,
                              price: p.price,
                              available_quantity: available,
                            })
                          }
                          className="rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold px-4 py-2 text-xs transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

