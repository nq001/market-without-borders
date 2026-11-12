import React from 'react';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { Layers, Store, ExternalLink } from 'lucide-react';

interface OwnerCategoriesScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  storeName?: string;
}

export const OwnerCategoriesScreen: React.FC<OwnerCategoriesScreenProps> = ({
  onNavigate,
  onLogout,
  storeName = 'Artisan Handcrafts',
}) => {
  // Section 3.3: View all categories. Each category lists every store linked to it.
  const categories = [
    {
      id: 'cat-1',
      name: 'Handcrafted Decor & Ceramics',
      description: 'Handmade pottery, ceramic tableware, wall hangings and artisan statues.',
      linkedStores: ['Artisan Handcrafts (You)', 'Terra Works', 'Stone & Clay Studio'],
    },
    {
      id: 'cat-2',
      name: 'Organic Textiles & Apparel',
      description: 'Hand-woven throws, linen tablecloths, and indigo-dyed apparel.',
      linkedStores: ['Heritage Textiles', 'Nordic Loom'],
    },
    {
      id: 'cat-3',
      name: 'Artisanal Pantry & Spices',
      description: 'Small-batch honey, cold-pressed oils, organic seasonings, and preserves.',
      linkedStores: ['Levant Spice Co.', 'Alpine Orchard'],
    },
  ];

  return (
    <OwnerLayout currentPath="/owner/categories" storeName={storeName} onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Marketplace Categories</h1>
        <p className="text-xs text-muted">Browse marketplace categories and observe peer store distributions across sectors.</p>
      </div>

      {/* Categories View (Section 3.3) */}
      <div className="space-y-4 max-w-4xl">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-paper border border-sand rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 pb-2 border-b border-sand">
              <Layers className="w-5 h-5 text-forest" />
              <h2 className="font-heading text-base font-bold text-ink">{cat.name}</h2>
            </div>
            <p className="text-xs text-muted">{cat.description}</p>

            <div>
              <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                Linked Marketplace Stores ({cat.linkedStores.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.linkedStores.map((st, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      st.includes('(You)')
                        ? 'bg-forest text-paper shadow-xs'
                        : 'bg-sand/60 text-ink border border-sand'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>{st}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </OwnerLayout>
  );
};

