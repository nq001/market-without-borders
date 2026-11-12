import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Shared Navigation & Header
    'nav.home': 'Home',
    'nav.stores': 'Stores',
    'nav.orders': 'Orders',
    'nav.about': 'About',
    'nav.notifications': 'Notifications',
    'nav.cart': 'Cart',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.signOut': 'Sign Out',
    'nav.dashboard': 'Dashboard',
    'nav.search': 'Search stores, handcrafted items, and categories...',
    'banner.sharedCart': 'One cart for all independent stores. Shop multiple artisans and checkout once!',

    // Admin Sidebar
    'admin.group.overview': 'Overview',
    'admin.group.management': 'Management',
    'admin.group.moderation': 'Moderation',
    'admin.group.business': 'Business',
    'admin.group.system': 'System',
    'admin.dashboard': 'Dashboard',
    'admin.users': 'Users',
    'admin.stores': 'Stores',
    'admin.categories': 'Categories',
    'admin.editRequests': 'Edit Requests',
    'admin.orders': 'Orders',
    'admin.complaints': 'Complaints',
    'admin.reviews': 'Reviews',
    'admin.finance': 'Finance',
    'admin.offersAds': 'Offers & Ads',
    'admin.reports': 'Reports',
    'admin.activityLog': 'Activity Log',
    'admin.adminTeam': 'Admin Team',
    'admin.settings': 'Settings',

    // Owner Sidebar
    'owner.dashboard': 'Dashboard',
    'owner.products': 'Products',
    'owner.inventory': 'Inventory',
    'owner.orders': 'Orders',
    'owner.offers': 'Offers',
    'owner.reviewsComplaints': 'Reviews & Complaints',
    'owner.categories': 'Categories',
    'owner.earnings': 'Earnings',
    'owner.staff': 'Staff',
    'owner.activities': 'Activities',
    'owner.settings': 'Settings',

    // Order Lifecycle Statuses
    'order.status.pending': 'Pending',
    'order.status.confirmed': 'Confirmed',
    'order.status.preparing': 'Preparing',
    'order.status.shipped': 'Shipped',
    'order.status.delivered': 'Delivered',
    'order.status.cancelled': 'Cancelled',
    'order.status.rejected': 'Rejected',
    'order.status.refunded': 'Refunded',

    // Actions & Common
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.approve': 'Approve',
    'action.reject': 'Reject',
    'action.filter': 'Filter',
    'action.search': 'Search',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.view': 'View',
    'action.back': 'Back',
    'common.empty': 'No records found',
    'common.loading': 'Loading...',
  },
  ar: {
    // Shared Navigation & Header
    'nav.home': 'الرئيسية',
    'nav.stores': 'المتاجر',
    'nav.orders': 'الطلبات',
    'nav.about': 'من نحن',
    'nav.notifications': 'الإشعارات',
    'nav.cart': 'سلة المشتريات',
    'nav.profile': 'الملف الشخصي',
    'nav.settings': 'الإعدادات',
    'nav.signOut': 'تسجيل الخروج',
    'nav.dashboard': 'لوحة التحكم',
    'nav.search': 'ابحث عن المتاجر، المنتجات اليدوية، والتصنيفات...',
    'banner.sharedCart': 'سلة تسوق واحدة لجميع المتاجر المستقلة. تسوق من عدة حرفيين وادفع مرة واحدة!',

    // Admin Sidebar
    'admin.group.overview': 'نظرة عامة',
    'admin.group.management': 'الإدارة',
    'admin.group.moderation': 'الإشراف والرقابة',
    'admin.group.business': 'الأعمال والمالية',
    'admin.group.system': 'النظام',
    'admin.dashboard': 'لوحة المعلومات',
    'admin.users': 'المستخدمين',
    'admin.stores': 'المتاجر',
    'admin.categories': 'التصنيفات',
    'admin.editRequests': 'طلبات التعديل',
    'admin.orders': 'الطلبات',
    'admin.complaints': 'الشكاوى',
    'admin.reviews': 'التقييمات',
    'admin.finance': 'المالية',
    'admin.offersAds': 'العروض والإعلانات',
    'admin.reports': 'التقارير',
    'admin.activityLog': 'سجل النشاطات',
    'admin.adminTeam': 'فريق الإدارة',
    'admin.settings': 'الإعدادات العامة',

    // Owner Sidebar
    'owner.dashboard': 'لوحة التحكم',
    'owner.products': 'المنتجات',
    'owner.inventory': 'المخزون',
    'owner.orders': 'الطلبات',
    'owner.offers': 'العروض والخصومات',
    'owner.reviewsComplaints': 'التقييمات والشكاوى',
    'owner.categories': 'التصنيفات',
    'owner.earnings': 'الأرباح والمستحقات',
    'owner.staff': 'فريق العمل',
    'owner.activities': 'سجل النشاطات',
    'owner.settings': 'إعدادات المتجر',

    // Order Lifecycle Statuses
    'order.status.pending': 'قيد الانتظار',
    'order.status.confirmed': 'مؤكد',
    'order.status.preparing': 'قيد التجهيز',
    'order.status.shipped': 'تم الشحن',
    'order.status.delivered': 'تم التوصيل',
    'order.status.cancelled': 'ملغي',
    'order.status.rejected': 'مرفوض',
    'order.status.refunded': 'مسترجع',

    // Actions & Common
    'action.save': 'حفظ',
    'action.cancel': 'إلغاء',
    'action.approve': 'موافقة',
    'action.reject': 'رفض',
    'action.filter': 'تصفية',
    'action.search': 'بحث',
    'action.delete': 'حذف',
    'action.edit': 'تعديل',
    'action.view': 'عرض',
    'action.back': 'رجوع',
    'common.empty': 'لا توجد سجلات متوفرة',
    'common.loading': 'جاري التحميل...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('mwb_language') as Language) || 'en';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('mwb_language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

