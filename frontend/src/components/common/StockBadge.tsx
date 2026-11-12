import React from 'react';

interface StockBadgeProps {
  quantity: number;
  lowStockThreshold?: number;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  quantity,
  lowStockThreshold = 5,
}) => {
  if (quantity <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-[999px]">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span>Out of stock</span>
      </span>
    );
  }

  if (quantity <= lowStockThreshold) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#EBCF9B] text-ink text-xs font-semibold px-3 py-1 rounded-[999px]">
        <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
        <span>Low stock · Only {quantity} left</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 bg-[#C6D8C9] text-forest text-xs font-semibold px-3 py-1 rounded-[999px]">
      <span className="w-2 h-2 rounded-full bg-forest" />
      <span>In stock · {quantity} available</span>
    </span>
  );
};

