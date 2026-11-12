import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import {
  Store,
  Star,
  ShieldCheck,
  AlertTriangle,
  ShoppingBag,
  ArrowLeft,
  X,
  Send,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface StorefrontScreenProps {
  storeId: string;
  onBackToStores: () => void;
  onNavigateHome: () => void;
  onNavigateOrders?: () => void;
  onNavigateProfile?: () => void;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onSelectProduct?: (productId: string) => void;
}

export const StorefrontScreen: React.FC<StorefrontScreenProps> = ({
  storeId,
  onBackToStores,
  onNavigateHome,
  onNavigateOrders,
  onNavigateProfile,
  onNavigateLogin,
  onNavigateRegister,
  onSelectProduct,
}) => {
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();

  const storeInfo = {
    id: storeId,
    name: storeId === 'store-2' ? 'Heritage Textiles' : 'Artisan Handcrafts',
    category: storeId === 'store-2' ? 'Organic Textiles & Apparel' : 'Handcrafted Decor & Ceramics',
    rating: storeId === 'store-2' ? 4.8 : 4.9,
    description:
      storeId === 'store-2'
        ? 'Dedicated workshop crafting organic hand-spun indigo blankets, linens, and natural wraps.'
        : 'Dedicated family studio crafting terracotta vases, stoneware vessels, and raw oak dining tableware.',
    ownerName: storeId === 'store-2' ? 'David Kim' : 'Fulfillment Staff',
  };

  const catalog =
    storeId === 'store-2'
      ? [
          { id: 'p2', name: 'Organic Indigo Wool Blanket', price: 12000, desc: '100% natural wool woven with organic vegetable indigo dye.' },
          { id: 'p20', name: 'Raw Linen Tablecloth', price: 6500, desc: 'Stone-washed natural flax linen for everyday dining.' },
          { id: 'p21', name: 'Hand-Dyed Cotton Cushion', price: 3800, desc: 'Soft woven cotton dyed with marigold petals and sumac.' },
        ]
      : [
          { id: 'p1', name: 'Terracotta Handcrafted Vase', price: 4500, desc: 'Kiln-fired earthenware with a textured sand finish.' },
          { id: 'p3', name: 'Raw Oak Serving Platter', price: 4500, desc: 'Solid white oak finished with cold-pressed walnut oil.' },
          { id: 'p4', name: 'Ceramic Pour-Over Coffee Dripper', price: 2900, desc: 'Matte glaze dripper designed for precision brewing.' },
          { id: 'p5', name: 'Carved Walnut Spoon Set', price: 2500, desc: 'Set of 3 tasting and serving spoons carved from dark walnut.' },
        ];

  // Section 2.4 & 4: Customer Complaint Modal against Store
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintReason, setComplaintReason] = useState('Defective product received');
  const [complaintDetails, setComplaintDetails] = useState('');

  const handleAddToCart = (item: typeof catalog[0]) => {
    addItem(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: '',
        stock: 20,
        store_id: storeInfo.id,
        store_name: storeInfo.name,
      },
      1,
    );
    showToast({
      type: 'success',
      title: 'Added to Multi-Store Cart',
      description: `"${item.name}" from ${storeInfo.name} added to your shared cart.`,
    });
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintDetails) return;

    showToast({
      type: 'info',
      title: 'Complaint Submitted',
      description: `Your dispute against "${storeInfo.name}" has been forwarded to Platform Administration for verification.`,
    });

    setIsComplaintModalOpen(false);
    setComplaintDetails('');
  };

  return (
    <div className="min-h-screen bg-sand/20 font-sans text-ink flex flex-col justify-between">
      <div>
        <Header
          onNavigateHome={onNavigateHome}
          onNavigateStores={onBackToStores}
          onNavigateOrders={onNavigateOrders}
          onNavigateProfile={onNavigateProfile}
          onNavigateLogin={onNavigateLogin}
          onNavigateRegister={onNavigateRegister}
        />

        {/* Back Link */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-6">
          <button
            type="button"
            onClick={onBackToStores}
            className="text-xs font-semibold text-muted hover:text-forest flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Stores & Categories</span>
          </button>
        </div>

        {/* Storefront Hero Card */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6">
          <div className="bg-paper border border-sand rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-forest uppercase tracking-wider">{storeInfo.category}</span>
                <span className="text-muted">•</span>
                <div className="flex items-center gap-1 text-xs font-bold text-ink">
                  <Star className="w-3.5 h-3.5 text-amber fill-amber" />
                  <span>{storeInfo.rating} Rating</span>
                </div>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-ink">{storeInfo.name}</h1>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">{storeInfo.description}</p>
              <div className="text-xs text-muted">
                Creator: <strong className="text-ink">{storeInfo.ownerName}</strong>
              </div>
            </div>

            {/* Right Actions: File Complaint Button (Section 2.4) */}
            <div className="shrink-0 flex sm:flex-col items-end gap-3">
              <button
                type="button"
                onClick={() => setIsComplaintModalOpen(true)}
                className="px-4 py-2 rounded-[999px] bg-sand/60 hover:bg-sand text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-sand"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>File Store Complaint</span>
              </button>
            </div>
          </div>
        </section>

        {/* Storefront Products Catalog (Section 4.3) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <div className="mb-6">
            <h2 className="font-heading text-xl font-bold text-ink">Available Products from this Store</h2>
            <p className="text-xs text-muted">Items ordered from this store are packed and dispatched directly by the creator.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {catalog.map((prod) => (
              <div
                key={prod.id}
                className="bg-paper p-5 rounded-2xl border border-sand hover:border-forest/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-heading text-base font-bold text-ink">{prod.name}</h3>
                  <p className="text-xs text-muted mt-2 leading-relaxed">{prod.desc}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-sand flex items-center justify-between">
                  <span className="font-heading text-base font-bold text-ink">{formatCurrency(prod.price)}</span>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    className="px-3.5 py-1.5 rounded-[999px] bg-forest hover:bg-forest-light text-paper text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Customer Complaint Modal (Section 2.4 & 4.5) */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper border border-sand rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sand">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-heading text-base font-bold text-ink">Report Store Issue</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComplaintModalOpen(false)}
                className="p-1 rounded-lg hover:bg-sand text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Reason for Complaint</label>
                <select
                  value={complaintReason}
                  onChange={(e) => setComplaintReason(e.target.value)}
                  className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                >
                  <option value="Defective product received">Defective product received</option>
                  <option value="Non-delivery or delayed fulfillment">Non-delivery or delayed fulfillment</option>
                  <option value="Misrepresented item details">Misrepresented item details</option>
                  <option value="Unresponsive customer support">Unresponsive customer support</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Detailed Explanation *</label>
                <textarea
                  rows={4}
                  required
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  placeholder="Describe your issue with this store. This report will be audited directly by Platform Administration."
                  className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2 text-xs text-ink outline-none focus:ring-1 focus:ring-forest resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-sand">
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(false)}
                  className="px-4 py-2 rounded-[999px] bg-sand hover:bg-sand-hover text-ink text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[999px] bg-red-700 hover:bg-red-800 text-paper text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Complaint</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
