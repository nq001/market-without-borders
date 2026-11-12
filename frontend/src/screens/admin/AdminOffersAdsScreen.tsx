import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Tag, Sparkles, Plus, Trash2, Calendar, Link, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface AdBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  target_url: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export const AdminOffersAdsScreen: React.FC<{ onNavigate: (path: string) => void; onLogout: () => void }> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'ads' | 'coupons'>('ads');

  const [ads, setAds] = useState<AdBanner[]>([
    {
      id: 'ad-1',
      title: 'Autumn Artisan Showcase',
      subtitle: 'Discover hand-thrown stoneware ceramics and pure woven wool.',
      badge: 'Curated Collection',
      target_url: '/stores',
      is_active: true,
      start_date: '2026-11-01',
      end_date: '2026-11-30',
    },
    {
      id: 'ad-2',
      title: '15% Off Your First Multi-Store Order',
      subtitle: 'Use code ARTISAN15 at checkout across all independent workshops.',
      badge: 'Limited Promotion',
      target_url: '/catalog',
      is_active: true,
      start_date: '2026-11-10',
      end_date: '2026-12-05',
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newBadge, setNewBadge] = useState('');

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAd: AdBanner = {
      id: `ad-${Date.now()}`,
      title: newTitle,
      subtitle: newSubtitle || 'Explore unique handcrafted items on MWB.',
      badge: newBadge || 'Featured',
      target_url: '/stores',
      is_active: true,
      start_date: '2026-11-12',
      end_date: '2026-12-31',
    };

    setAds([newAd, ...ads]);
    setNewTitle('');
    setNewSubtitle('');
    setNewBadge('');
    showToast({
      type: 'success',
      title: 'Home Ad Published',
      description: 'The banner is now live in the customer marketplace hero carousel.',
    });
  };

  const handleDeleteAd = (id: string) => {
    setAds(ads.filter((a) => a.id !== id));
    showToast({ type: 'info', title: 'Ad Removed', description: 'Banner was unpublished.' });
  };

  return (
    <AdminLayout currentPath="/admin/offers-ads" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-ink">Offers & Advertising</h1>
            <p className="text-sm text-muted mt-1">
              Schedule home page hero banners and manage marketplace promotional campaigns.
            </p>
          </div>
        </div>

        {/* Create Ad Form */}
        <div className="bg-paper rounded-2xl border border-sand p-6 shadow-xs">
          <h3 className="font-heading font-bold text-base text-ink mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest" />
            <span>Schedule New Home Page Banner</span>
          </h3>
          <form onSubmit={handleCreateAd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Banner headline (e.g. Winter Craft Festival)..."
              className="bg-sand/60 rounded-xl px-4 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
              required
            />
            <input
              type="text"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="Subheading description..."
              className="bg-sand/60 rounded-xl px-4 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                placeholder="Pill badge (e.g. 20% OFF)..."
                className="flex-1 bg-sand/60 rounded-xl px-4 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-forest text-paper text-xs font-semibold hover:bg-forest/90 cursor-pointer shadow-xs whitespace-nowrap"
              >
                Publish Ad
              </button>
            </div>
          </form>
        </div>

        {/* Existing Ads List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Active Home Page Banners</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-paper rounded-2xl border border-sand p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[999px] bg-amber text-ink">
                      {ad.badge}
                    </span>
                    <span className="text-xs text-forest font-semibold">Active</span>
                  </div>
                  <h4 className="font-heading font-bold text-base text-ink mb-1">{ad.title}</h4>
                  <p className="text-xs text-muted leading-relaxed mb-4">{ad.subtitle}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-sand">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {ad.start_date} to {ad.end_date}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteAd(ad.id)}
                    className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                    title="Remove banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

