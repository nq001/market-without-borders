import React from 'react';

export type OrderStatusType =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED';

interface OrderStatusBadgeProps {
  status: OrderStatusType;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const configs: Record<OrderStatusType, { label: string; bg: string; text: string; dot: string }> = {
    PENDING_PAYMENT: {
      label: 'Pending Payment',
      bg: 'bg-amber/15',
      text: 'text-amber-900',
      dot: 'bg-amber',
    },
    PAID: {
      label: 'Paid & Processing',
      bg: 'bg-forest/15',
      text: 'text-forest',
      dot: 'bg-forest',
    },
    SHIPPED: {
      label: 'Shipped',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      dot: 'bg-blue-600',
    },
    DELIVERED: {
      label: 'Delivered',
      bg: 'bg-[#C6D8C9]',
      text: 'text-forest',
      dot: 'bg-forest',
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      dot: 'bg-gray-400',
    },
    PAYMENT_FAILED: {
      label: 'Payment Failed',
      bg: 'bg-red-50',
      text: 'text-red-800',
      dot: 'bg-red-500',
    },
  };

  const config = configs[status] || configs.PENDING_PAYMENT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[999px] text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

