import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Store as StoreIcon,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Tag,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface AdminDashboardScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onViewStore?: (storeId: string) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onNavigate,
  onLogout,
  onViewStore,
}) => {
  const [stats, setStats] = useState({
    activeStores: 2,
    suspendedStores: 0,
    totalProducts: 48,
    activeUsers: 24,
    pendingUsers: 3,
    grossSales: 1248000, // minor units ($12,480.00)
  });

  const recentOrders = [
    { id: 'ORD-8821', customer: 'Jane Customer', store: 'Artisan Handcrafts', amount: 14500, status: 'PAID', time: '10 mins ago' },
    { id: 'ORD-8820', customer: 'David Kim', store: 'Heritage Textiles', amount: 8900, status: 'SHIPPED', time: '25 mins ago' },
    { id: 'ORD-8819', customer: 'Sarah Miller', store: 'Artisan Handcrafts', amount: 21000, status: 'DELIVERED', time: '1 hour ago' },
    { id: 'ORD-8818', customer: 'Elena Rostova', store: 'Heritage Textiles', amount: 5400, status: 'PAID', time: '3 hours ago' },
  ];

  const popularProducts = [
    { id: 'p1', name: 'Terracotta Handcrafted Vase', store: 'Artisan Handcrafts', salesCount: 142, revenue: 639000 },
    { id: 'p2', name: 'Organic Indigo Wool Blanket', store: 'Heritage Textiles', salesCount: 98, revenue: 1176000 },
    { id: 'p3', name: 'Raw Oak Serving Platter', store: 'Artisan Handcrafts', salesCount: 84, revenue: 378000 },
  ];

  const highTrafficCategories = [
    { name: 'Ceramics & Pottery', storeCount: 8, visits: '14.2k monthly' },
    { name: 'Textiles & Rugs', storeCount: 12, visits: '22.8k monthly' },
    { name: 'Wooden Crafts', storeCount: 6, visits: '9.4k monthly' },
  ];

  const storesWithOffers = [
    { id: 's1', name: 'Artisan Handcrafts', offer: '15% OFF entire catalog', code: 'FALL15', activeCoupons: 3 },
    { id: 's2', name: 'Heritage Textiles', offer: 'Free shipping over $100', code: 'FREESHIP', activeCoupons: 1 },
  ];

  return (
    <AdminLayout currentPath="/admin" onNavigate={onNavigate} onLogout={onLogout}>
      {/* 1. Header Title & Platform Quick Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Marketplace Overview</h1>
          <p className="text-xs text-muted">Platform administration and multi-store performance telemetry.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All Stores Operational
          </span>
        </div>
      </div>

      {/* 2. Four Summary Cards (Section 2.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stores Card */}
        <div className="bg-paper p-5 rounded-2xl border border-sand shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Stores</span>
            <div className="p-2 rounded-xl bg-forest/10 text-forest">
              <StoreIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading text-2xl font-bold text-ink">{stats.activeStores + stats.suspendedStores} Total</div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="font-medium text-emerald-700">{stats.activeStores} Active</span>
            <span className="text-muted">•</span>
            <span className="font-medium text-amber-700">{stats.suspendedStores} Suspended</span>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-paper p-5 rounded-2xl border border-sand shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Products</span>
            <div className="p-2 rounded-xl bg-forest/10 text-forest">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading text-2xl font-bold text-ink">{stats.totalProducts} Active</div>
          <div className="mt-2 text-xs text-muted">Distributed across {stats.activeStores} stores</div>
        </div>

        {/* Users Card */}
        <div className="bg-paper p-5 rounded-2xl border border-sand shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Users</span>
            <div className="p-2 rounded-xl bg-forest/10 text-forest">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading text-2xl font-bold text-ink">{stats.activeUsers + stats.pendingUsers} Total</div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="font-medium text-emerald-700">{stats.activeUsers} Active</span>
            <span className="text-muted">•</span>
            <span className="font-semibold text-amber bg-amber/10 px-2 py-0.5 rounded-full">{stats.pendingUsers} Pending Approval</span>
          </div>
        </div>

        {/* Gross Sales Card */}
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
            <span>+18.4% this month</span>
          </div>
        </div>
      </div>

      {/* 3. Four Widgets (Section 2.1) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 1: Recent Customer Orders */}
        <div className="bg-paper p-6 rounded-2xl border border-sand shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-bold text-ink">Recent Customer Orders</h2>
            <button
              type="button"
              onClick={() => onNavigate('/admin/categories')}
              className="text-xs text-forest hover:underline font-medium"
            >
              Stores Directory
            </button>
          </div>
          <div className="divide-y divide-sand">
            {recentOrders.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-ink">{ord.id} • {ord.customer}</div>
                  <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                    <span>{ord.store}</span>
                    <span>•</span>
                    <span>{ord.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-ink">{formatCurrency(ord.amount)}</div>
                  <span className="inline-block px-2 py-0.5 rounded-[999px] text-[10px] font-semibold bg-forest/10 text-forest mt-0.5">
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: Popular Products */}
        <div className="bg-paper p-6 rounded-2xl border border-sand shadow-xs">
          <h2 className="font-heading text-base font-bold text-ink mb-4">Popular Products Across Stores</h2>
          <div className="divide-y divide-sand">
            {popularProducts.map((prod) => (
              <div key={prod.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-ink">{prod.name}</div>
                  <div className="text-xs text-muted mt-0.5">{prod.store}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-ink">{formatCurrency(prod.revenue)}</div>
                  <div className="text-xs text-muted">{prod.salesCount} sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Categories with High Traffic */}
        <div className="bg-paper p-6 rounded-2xl border border-sand shadow-xs">
          <h2 className="font-heading text-base font-bold text-ink mb-4">Categories with High Traffic</h2>
          <div className="space-y-3">
            {highTrafficCategories.map((cat, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-sand/30 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-ink">{cat.name}</div>
                  <div className="text-xs text-muted">{cat.storeCount} linked stores</div>
                </div>
                <span className="px-2.5 py-1 rounded-[999px] bg-paper text-forest font-semibold text-xs border border-sand">
                  {cat.visits}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 4: Stores with Offers */}
        <div className="bg-paper p-6 rounded-2xl border border-sand shadow-xs">
          <h2 className="font-heading text-base font-bold text-ink mb-4">Stores with Active Offers</h2>
          <div className="space-y-3">
            {storesWithOffers.map((store) => (
              <div key={store.id} className="p-3.5 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-ink">{store.name}</div>
                  <div className="text-xs text-amber-900 font-medium mt-0.5">{store.offer}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold bg-amber text-ink px-2.5 py-1 rounded-md">
                    {store.code}
                  </span>
                  <div className="text-[10px] text-muted mt-1">{store.activeCoupons} active campaigns</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
