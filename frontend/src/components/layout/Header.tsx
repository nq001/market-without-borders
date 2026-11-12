import React, { useState } from 'react';
import { Search, ShoppingBag, User as UserIcon, LogOut, Settings, Bell, Store, Globe } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { isMockDataEnabled } from '../../api/client';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onNavigateHome?: () => void;
  onNavigateStores?: () => void; // Shows all categories & linked stores (Section 4.1)
  onNavigateOrders?: () => void; // Track orders (Section 4.1)
  onNavigateAbout?: () => void;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onNavigateProfile?: () => void;
  onNavigateAddresses?: () => void;
  onNavigateNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onNavigateHome,
  onNavigateStores,
  onNavigateOrders,
  onNavigateAbout,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateProfile,
  onNavigateNotifications,
}) => {
  const { itemCount, openCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="w-full relative z-30">
      {/* 1. Announcement Bar */}
      <div className="w-full bg-ink text-sand py-2.5 px-4 text-center text-xs md:text-sm tracking-normal">
        {isMockDataEnabled ? (
          <span className="flex items-center justify-center gap-2 flex-wrap">
            <span className="bg-forest-light/30 text-paper font-semibold px-2 py-0.5 rounded text-[11px] uppercase tracking-wide">
              Live Demo Mode
            </span>
            <span>Running on pre-loaded seed data. Enterprise NestJS + PostgreSQL backend is complete.</span>
            <span className="text-sand/80 underline cursor-pointer">Contact us for live DB demo</span>
          </span>
        ) : (
          <span>One cart for all independent stores. Shop multiple artisans and checkout once!</span>
        )}
      </div>

      {/* 2. Main Navigation Bar (Section 4.1) */}
      <nav className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-4 md:py-6 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center cursor-pointer" onClick={onNavigateHome}>
          <Logo className="h-8 md:h-10 w-auto" />
        </div>

        {/* Search Field */}
        <form
          onSubmit={handleSearchSubmit}
          className="order-3 md:order-2 w-full md:w-auto md:flex-1 md:max-w-md mx-auto"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stores, handcrafted items, and categories..."
              className="w-full bg-sand hover:bg-sand-hover focus:bg-white text-ink placeholder-muted rounded-[999px] py-2.5 pl-11 pr-4 text-sm transition-colors duration-150 outline-none focus:ring-2 focus:ring-forest/20"
            />
            <Search className="w-5 h-5 text-muted absolute left-3.5 pointer-events-none" />
          </div>
        </form>

        {/* 4 Navigation Links (Section 4.1): Home, Stores, Orders, About */}
        <div className="order-2 md:order-3 flex items-center gap-4 sm:gap-6">
          <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-ink">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-forest transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={onNavigateStores}
              className="hover:text-forest transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Stores</span>
            </button>
            <button
              type="button"
              onClick={onNavigateOrders}
              className="hover:text-forest transition-colors cursor-pointer"
            >
              Orders
            </button>
            <button
              type="button"
              onClick={onNavigateAbout}
              className="hover:text-forest transition-colors cursor-pointer"
            >
              About
            </button>
          </div>

          {/* Language Toggle & 2 Icons: Notifications, Cart */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-2.5 py-1.5 rounded-full hover:bg-sand/70 text-ink text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            title="Toggle English / العربية"
          >
            <Globe className="w-3.5 h-3.5 text-forest" />
            <span>{language === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          <button
            type="button"
            onClick={onNavigateNotifications}
            className="p-2 rounded-full hover:bg-sand/70 text-ink transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-amber absolute top-1.5 right-1.5 ring-2 ring-paper" />
          </button>

          <button
            type="button"
            onClick={openCart}
            className="p-2 rounded-full hover:bg-sand/70 text-ink transition-colors relative cursor-pointer"
            title="Shared Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-forest text-paper text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {/* User State & Menu (Settings, Sign out) */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((o) => !o)}
                className="rounded-[999px] bg-sand/70 hover:bg-sand text-ink px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-forest" />
                <span className="max-w-[120px] truncate">{user?.first_name || user?.email}</span>
              </button>

              {/* User Dropdown Menu with Settings & Sign out (Section 4.1) */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-paper border border-sand rounded-2xl shadow-xl py-2 z-50 text-xs text-ink"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-sand text-muted">
                    Signed in as <strong className="text-ink block truncate">{user?.email}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={onNavigateProfile}
                    className="w-full px-4 py-2.5 text-left hover:bg-sand/60 flex items-center gap-2.5 cursor-pointer font-medium"
                  >
                    <Settings className="w-4 h-4 text-forest" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-sand my-1" />

                  <button
                    type="button"
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-red-700 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onNavigateLogin}
                className="rounded-[999px] px-4 py-2 text-xs md:text-sm font-medium text-ink hover:text-forest transition-colors cursor-pointer"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={onNavigateRegister}
                className="rounded-[999px] bg-forest hover:bg-forest-light text-paper px-5 py-2 text-xs md:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
