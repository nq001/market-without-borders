import React from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  Layers,
  FileText,
  ShoppingCart,
  AlertTriangle,
  Star,
  DollarSign,
  Tag,
  BarChart3,
  Activity,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useLanguage } from '../../context/LanguageContext';

interface AdminSidebarProps {
  currentPath: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPath,
  isCollapsed,
  onToggleCollapse,
  onNavigate,
  onLogout,
}) => {
  const { t } = useLanguage();

  // Exactly 14 items grouped under Section 2.2 headers:
  // Overview: 1. Dashboard
  // Management: 2. Users, 3. Stores, 4. Categories, 5. Edit Requests, 6. Orders
  // Moderation: 7. Complaints, 8. Reviews
  // Business: 9. Finance, 10. Offers & Ads, 11. Reports
  // System: 12. Activity Log, 13. Admin Team, 14. Settings
  const groups = [
    {
      title: t('admin.group.overview'),
      items: [
        { label: t('admin.dashboard'), path: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      title: t('admin.group.management'),
      items: [
        { label: t('admin.users'), path: '/admin/users', icon: Users, badge: 'Approvals' },
        { label: t('admin.stores'), path: '/admin/stores', icon: Store },
        { label: t('admin.categories'), path: '/admin/categories', icon: Layers },
        { label: t('admin.editRequests'), path: '/admin/edit-requests', icon: FileText, badge: 'New' },
        { label: t('admin.orders'), path: '/admin/orders', icon: ShoppingCart },
      ],
    },
    {
      title: t('admin.group.moderation'),
      items: [
        { label: t('admin.complaints'), path: '/admin/complaints', icon: AlertTriangle, badge: 'Alert' },
        { label: t('admin.reviews'), path: '/admin/reviews', icon: Star },
      ],
    },
    {
      title: t('admin.group.business'),
      items: [
        { label: t('admin.finance'), path: '/admin/finance', icon: DollarSign },
        { label: t('admin.offersAds'), path: '/admin/offers-ads', icon: Tag },
        { label: t('admin.reports'), path: '/admin/reports', icon: BarChart3 },
      ],
    },
    {
      title: t('admin.group.system'),
      items: [
        { label: t('admin.activityLog'), path: '/admin/audit', icon: Activity },
        { label: t('admin.adminTeam'), path: '/admin/admin-team', icon: Shield },
        { label: t('admin.settings'), path: '/admin/settings', icon: Settings },
      ],
    },
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
          {!isCollapsed && <Logo className="h-7 w-auto" />}
          {isCollapsed && <span className="font-heading font-bold text-xl text-forest">M</span>}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-full hover:bg-sand text-muted hover:text-ink transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* 14 Navigation Items Grouped Under Section 2.2 */}
        <nav className="p-3 space-y-4 overflow-y-auto flex-1">
          {groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted px-3.5 block mb-1">
                  {group.title}
                </span>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
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
            </div>
          ))}
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
