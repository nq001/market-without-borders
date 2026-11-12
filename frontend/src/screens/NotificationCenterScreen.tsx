import React, { useState } from 'react';
import { ArrowLeft, Bell, Check, Package, CheckCircle2, Truck } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useToast } from '../context/ToastContext';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'ORDER_PLACED' | 'ORDER_PAID' | 'SHIPMENT_DISPATCHED';
  is_read: boolean;
}

interface NotificationCenterScreenProps {
  onBack: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationCenterScreen: React.FC<NotificationCenterScreenProps> = ({
  onBack,
  onSelectOrder,
}) => {
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Shipment Dispatched',
      message: 'Your order #ord-94821 has departed our fulfillment warehouse with tracking EXP-99281944.',
      time: '1 hour ago',
      type: 'SHIPMENT_DISPATCHED',
      is_read: false,
    },
    {
      id: 'notif-2',
      title: 'Payment Confirmed',
      message: 'Payment of 1,500.00 verified. Inventory reserved and transferred to packing.',
      time: '3 hours ago',
      type: 'ORDER_PAID',
      is_read: false,
    },
    {
      id: 'notif-3',
      title: 'Order Placed Successfully',
      message: 'Order #ord-94821 registered in PENDING_PAYMENT state with atomic stock hold.',
      time: '3 hours ago',
      type: 'ORDER_PLACED',
      is_read: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    showToast({ type: 'success', title: 'All marked as read' });
  };

  const markOneAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 w-full space-y-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-forest hover:text-amber transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-heading text-ink">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="bg-amber text-ink text-xs font-bold px-3 py-1 rounded-[999px]">
                {unreadCount} unread
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-5 py-2 text-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Check className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="space-y-4 max-w-3xl">
          {notifications.map((notif) => {
            const icons = {
              ORDER_PLACED: <Package className="w-5 h-5 text-forest" />,
              ORDER_PAID: <CheckCircle2 className="w-5 h-5 text-forest" />,
              SHIPMENT_DISPATCHED: <Truck className="w-5 h-5 text-blue-700" />,
            };

            return (
              <div
                key={notif.id}
                onClick={() => markOneAsRead(notif.id)}
                className={`rounded-[24px] p-5 sm:p-6 border transition-all flex items-start gap-4 cursor-pointer ${
                  notif.is_read
                    ? 'bg-sand/30 border-sand text-muted'
                    : 'bg-sand/70 border-sand-hover text-ink shadow-xs ring-1 ring-forest/10'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center shrink-0 shadow-xs">
                  {icons[notif.type]}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-heading font-semibold text-base text-ink">
                      {notif.title}
                    </h4>
                    <span className="text-xs text-muted shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {!notif.is_read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

