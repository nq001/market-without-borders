import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Settings,
  ShoppingCart,
  Activity,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Store,
  Tag,
  Star,
  DollarSign,
  Users,
  Boxes,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface OwnerSidebarProps {
  currentPath: string;
  isCollapsed: boolean;
  storeName?: string;
  onToggleCollapse: () => void;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
}

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  currentPath,
  isCollapsed,
  storeName = 'Artisan Handcrafts',
  onToggleCollapse,
  onNavigate,
  onLogout,
}) => {
  const { t } = useLanguage();

  // Exactly 11 items conforming directly to Section 3.2:
  // 1. Dashboard
  // 2. Products
  // 3. Inventory
  // 4. Orders
  // 5. Offers
  // 6. Reviews & Complaints
  // 7. Categories
  // 8. Earnings
  // 9. Staff
  // 10. Activities
  // 11. Settings
  const navItems = [
    { label: t('owner.dashboard'), path: '/owner', icon: LayoutDashboard },
    { label: t('owner.products'), path: '/owner/products', icon: Package },
    { label: t('owner.inventory'), path: '/owner/inventory', icon: Boxes },
    { label: t('owner.orders'), path: '/owner/orders', icon: ShoppingCart, badge: 2 },
    { label: t('owner.offers'), path: '/owner/offers', icon: Tag },
    { label: t('owner.reviewsComplaints'), path: '/owner/reviews', icon: Star },
    { label: t('owner.categories'), path: '/owner/categories', icon: Layers },
    { label: t('owner.earnings'), path: '/owner/earnings', icon: DollarSign },
    { label: t('owner.staff'), path: '/owner/staff', icon: Users },
    { label: t('owner.activities'), path: '/owner/activities', icon: Activity },
    { label: t('owner.settings'), path: '/owner/settings', icon: Settings, badge: 'Edits' },
  ];

  return (
    <aside
      className={`h-screen bg-sand/70 border-r border-sand transition-all duration-300 flex flex-col justify-between shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding & Collapse Toggle */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="h-16 flex items-center justify-between px-5 border-b border-sand shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-forest" />
              <div className="font-heading font-bold text-sm text-ink truncate max-w-[140px]">
                {storeName}
              </div>
            </div>
          ) : (
            <span className="font-heading font-bold text-xl text-forest">S</span>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-full hover:bg-sand text-muted hover:text-ink transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* 11 Navigation Items */}
        <nav className="p-3 space-y-1.5 overflow-y-auto flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-forest text-paper shadow-xs font-semibold'
                    : 'text-ink hover:bg-sand-hover text-muted hover:text-ink'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate text-left flex-1">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-[999px] font-semibold ${
                      isActive ? 'bg-amber text-ink' : 'bg-sand-hover text-forest'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sign Out */}
      <div className="p-4 border-t border-sand shrink-0">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-ink hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{t('nav.signOut')}</span>}
        </button>
      </div>
    </aside>
  );
};
