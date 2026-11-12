import React from 'react';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import {
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Tag,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface OwnerDashboardScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  storeName?: string;
}

export const OwnerDashboardScreen: React.FC<OwnerDashboardScreenProps> = ({
  onNavigate,
  onLogout,
  storeName = 'Artisan Handcrafts',
}) => {
  // 4 Summary cards according to Section 3.1:
  // - My products
  // - Gross sales of my products
  // - Pending orders
  // - Finished orders
  const stats = {
    myProductsCount: 28,
    grossSales: 639000, // minor units ($6,390.00)
    pendingOrdersCount: 4,
    finishedOrdersCount: 38,
  };

  // 4 Widgets according to Section 3.1:
  // - Recent orders
  // - Popular products
  // - Products with high traffic
  // - My offers
  const recentOrders = [
    { id: 'ORD-8821', customer: 'Jane Customer', total: 14500, status: 'PROCESSING', date: '25 mins ago' },
    { id: 'ORD-8819', customer: 'Sarah Miller', total: 21000, status: 'DELIVERED', date: 'Yesterday' },
    { id: 'ORD-8812', customer: 'Alex Chen', total: 6800, status: 'DELIVERED', date: 'Nov 09' },
  ];

  const popularProducts = [
    { id: 'p1', name: 'Terracotta Handcrafted Vase', sales: 142, revenue: 639000 },
    { id: 'p3', name: 'Raw Oak Serving Platter', sales: 84, revenue: 378000 },
    { id: 'p5', name: 'Carved Walnut Spoon Set', sales: 62, revenue: 155000 },
  ];

  const highTrafficProducts = [
    { name: 'Terracotta Handcrafted Vase', views: '1,240 weekly views', conversion: '11.4%' },
    { name: 'Raw Oak Serving Platter', views: '890 weekly views', conversion: '9.4%' },
    { name: 'Ceramic Pour-Over Dripper', views: '640 weekly views', conversion: '8.1%' },
  ];

  const myOffers = [
    { code: 'FALL15', discount: '15% Off All Ceramics', validUntil: 'Dec 15, 2026', uses: 45 },
    { code: 'POTTERYLOVE', discount: '$10 Off orders over $75', validUntil: 'Nov 30, 2026', uses: 18 },
  ];

  return (
    <OwnerLayout currentPath="/owner" storeName={storeName} onNavigate={onNavigate} onLogout={onLogout}>
      {/* Title */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Store Workspace Dashboard</h1>
        <p className="text-xs text-muted">Manage products, fulfill pending customer orders, and inspect store performance.</p>
      </div>

      {/* 4 Summary Cards (Section 3.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* My Products */}
        <div className="bg-paper p-5 rounded-2xl border border-sand shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">My Products</span>
            <div className="p-2 rounded-xl bg-forest/10 text-forest">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading text-2xl font-bold text-ink">{stats.myProductsCount}</div>
          <div className="mt-2 text-xs text-muted">Active items in store catalog</div>
        </div>

        {/* Gross Sales */}
        <div className="bg-paper p-5 rounded-2xl border border-sand shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Gross Sales</span>
            <div className="p-2 rounded-xl bg-forest/10 text-forest">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading text-2xl font-bold text-ink">{formatCurrency(stats.grossSales)}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% store growth</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-paper p-5 rounded-2xl border border-sand shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Pending Orders</span>
            <div className="p-2 rounded-xl bg-amber/20 text-amber-900">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading text-2xl font-bold text-ink">{stats.pendingOrdersCount}</div>
          <div className="mt-2 text-xs text-amber-800 font-semibold">Requires packaging & shipping</div>
        </div>

        {/* Finished Orders */}
        <div className="bg-paper p-5 rounded-2xl border border-sand shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Finished Orders</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading text-2xl font-bold text-ink">{stats.finishedOrdersCount}</div>
          <div className="mt-2 text-xs text-muted">Successfully delivered to buyers</div>
        </div>
      </div>

      {/* 4 Widgets (Section 3.1) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 1: Recent Orders */}
        <div className="bg-paper p-6 rounded-2xl border border-sand shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-bold text-ink">Recent Orders for My Store</h2>
            <button
              type="button"
              onClick={() => onNavigate('/owner/orders')}
              className="text-xs text-forest hover:underline font-semibold"
            >
              View All Orders
            </button>
          </div>
          <div className="divide-y divide-sand">
            {recentOrders.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-ink">{ord.id} • {ord.customer}</div>
                  <div className="text-xs text-muted mt-0.5">{ord.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-ink">{formatCurrency(ord.total)}</div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-[999px] text-[10px] font-semibold mt-0.5 ${
                      ord.status === 'PROCESSING'
                        ? 'bg-amber text-ink'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: Popular Products */}
        <div className="bg-paper p-6 rounded-2xl border border-sand shadow-xs">
          <h2 className="font-heading text-base font-bold text-ink mb-4">Top-Selling Products</h2>
          <div className="divide-y divide-sand">
            {popularProducts.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-ink">{p.name}</div>
                  <div className="text-xs text-muted mt-0.5">{p.sales} units ordered</div>
                </div>
                <div className="font-bold text-sm text-ink">{formatCurrency(p.revenue)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Products with High Traffic */}
        <div className="bg-paper p-6 rounded-2xl border border-sand shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-amber" />
            <h2 className="font-heading text-base font-bold text-ink">High Traffic Products</h2>
          </div>
          <div className="space-y-3">
            {highTrafficProducts.map((p, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-sand/30 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-ink">{p.name}</div>
                  <div className="text-xs text-muted mt-0.5">{p.views}</div>
                </div>
                <span className="px-2.5 py-1 rounded-[999px] bg-paper text-forest font-semibold text-xs border border-sand">
                  {p.conversion} conv.
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 4: My Offers */}
        <div className="bg-paper p-6 rounded-2xl border border-sand shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-forest" />
            <h2 className="font-heading text-base font-bold text-ink">My Store Offers & Campaigns</h2>
          </div>
          <div className="space-y-3">
            {myOffers.map((offer, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-forest/5 border border-forest/15 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-forest">{offer.code}</div>
                  <div className="text-xs text-ink font-medium mt-0.5">{offer.discount}</div>
                  <div className="text-[10px] text-muted">Expires {offer.validUntil}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-ink">{offer.uses} redeemed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
};

