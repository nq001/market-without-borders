import React, { useState } from 'react';
import { Search, Bell, ShoppingBag } from 'lucide-react';
import { Logo } from '../common/Logo';

interface AdminHeaderProps {
  onSearch?: (query: string) => void;
  onNavigateHome?: () => void;
  onNavigateAbout?: () => void;
  onOpenNotifications?: () => void;
  onOpenCart?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onSearch,
  onNavigateHome,
  onNavigateAbout,
  onOpenNotifications,
  onOpenCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="w-full bg-paper border-b border-sand px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* 1. Left: Logo & Search Bar */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <div className="shrink-0 cursor-pointer" onClick={onNavigateHome}>
          <Logo className="h-8 md:h-9 w-auto" />
        </div>

        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores, users, categories or platform items..."
            className="w-full bg-sand/60 rounded-[999px] pl-10 pr-4 py-2 text-xs md:text-sm text-ink placeholder-muted outline-none focus:ring-1 focus:ring-forest transition-all"
          />
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* 2. Middle & Right: Navbar (Home, About) + Two Icons (Notifications, Cart) */}
      <div className="flex items-center gap-6">
        <nav className="hidden sm:flex items-center gap-5 text-xs md:text-sm font-medium text-ink">
          <button
            type="button"
            onClick={onNavigateHome}
            className="hover:text-forest transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={onNavigateAbout}
            className="hover:text-forest transition-colors cursor-pointer"
          >
            About
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNotifications}
            className="p-2 rounded-full hover:bg-sand/70 text-ink transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-amber absolute top-1.5 right-1.5 ring-2 ring-paper" />
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="p-2 rounded-full hover:bg-sand/70 text-ink transition-colors relative cursor-pointer"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
