import React, { useState } from 'react';
import { OwnerSidebar } from './OwnerSidebar';
import { OwnerHeader } from './OwnerHeader';

interface OwnerLayoutProps {
  currentPath: string;
  storeName?: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onNavigateHome?: () => void;
  onNavigateAbout?: () => void;
  onOpenNotifications?: () => void;
  onOpenCart?: () => void;
  children: React.ReactNode;
}

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({
  currentPath,
  storeName = 'Artisan Handcrafts',
  onNavigate,
  onLogout,
  onNavigateHome,
  onNavigateAbout,
  onOpenNotifications,
  onOpenCart,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-sand/20 flex font-sans text-ink">
      {/* 6-Section Workspace Sidebar */}
      <OwnerSidebar
        currentPath={currentPath}
        isCollapsed={isSidebarCollapsed}
        storeName={storeName}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Main Workspace View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Conforming Header (Logo, Search, Home, About, Notifications, Cart) */}
        <OwnerHeader
          storeName={storeName}
          onNavigateHome={onNavigateHome}
          onNavigateAbout={onNavigateAbout}
          onOpenNotifications={onOpenNotifications}
          onOpenCart={onOpenCart}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

