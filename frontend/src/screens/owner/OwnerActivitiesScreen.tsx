import React from 'react';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { Activity, Package, ShoppingCart, Tag, Edit, ShieldCheck } from 'lucide-react';

interface OwnerActivitiesScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  storeName?: string;
}

export const OwnerActivitiesScreen: React.FC<OwnerActivitiesScreenProps> = ({
  onNavigate,
  onLogout,
  storeName = 'Artisan Handcrafts',
}) => {
  // Section 3.6: An activity log recording everything that happens in the store
  const activities = [
    {
      id: 'act-1',
      title: 'Order ORD-8821 placed by Jane Customer',
      detail: '2x Terracotta Handcrafted Vase purchased for $90.00',
      time: '25 mins ago',
      icon: ShoppingCart,
      type: 'order',
    },
    {
      id: 'act-2',
      title: 'Store Edit Request Resubmitted',
      detail: 'Proposed changes sent to Super Admin for approval',
      time: '2 hours ago',
      icon: Edit,
      type: 'settings',
    },
    {
      id: 'act-3',
      title: 'Inventory Restocked',
      detail: 'Added +10 units to Raw Oak Serving Platter',
      time: 'Yesterday at 15:30',
      icon: Package,
      type: 'inventory',
    },
    {
      id: 'act-4',
      title: 'Coupon Campaign Activated',
      detail: '15% Off Fall Promotion (code: FALL15) published',
      time: 'Nov 10 at 11:00',
      icon: Tag,
      type: 'campaign',
    },
    {
      id: 'act-5',
      title: 'Store Health Check Passed',
      detail: 'Verified compliance with marketplace quality standards',
      time: 'Nov 09 at 08:00',
      icon: ShieldCheck,
      type: 'system',
    },
  ];

  return (
    <OwnerLayout currentPath="/owner/activities" storeName={storeName} onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Store Activity Log</h1>
        <p className="text-xs text-muted">Comprehensive audit trail of all transactions, edits, restocks, and operational events in your store.</p>
      </div>

      {/* Activity Timeline (Section 3.6) */}
      <div className="bg-paper border border-sand rounded-2xl p-6 shadow-xs max-w-3xl">
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-sand">
          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="relative flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-forest text-paper flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-ink">{act.title}</h3>
                    <span className="text-[11px] text-muted">{act.time}</span>
                  </div>
                  <p className="text-xs text-muted mt-1">{act.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </OwnerLayout>
  );
};

