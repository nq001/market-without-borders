import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  currentPath: string;
  breadcrumbs?: string[];
  title?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onNavigateHome?: () => void;
  onNavigateAbout?: () => void;
  onOpenNotifications?: () => void;
  onOpenCart?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPath,
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
      {/* Sidebar (Five Core Sections) */}
      <AdminSidebar
        currentPath={currentPath}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Conforming Header (Logo, Search, Home, About, Notifications, Cart) */}
        <AdminHeader
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
