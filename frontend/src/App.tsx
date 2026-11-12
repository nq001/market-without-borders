import { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';

// Storefront Screens
import { HomeScreen } from './screens/HomeScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { CategoryShowcaseScreen } from './screens/CategoryShowcaseScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { PaymentSimulationScreen } from './screens/PaymentSimulationScreen';
import { OrderConfirmationScreen } from './screens/OrderConfirmationScreen';
import { OrderHistoryScreen } from './screens/OrderHistoryScreen';
import { OrderDetailScreen } from './screens/OrderDetailScreen';
import { PrintableReceiptScreen } from './screens/PrintableReceiptScreen';
import { AccountProfileScreen } from './screens/AccountProfileScreen';
import { AddressBookScreen } from './screens/AddressBookScreen';
import { NotificationCenterScreen } from './screens/NotificationCenterScreen';
import { AuthScreen } from './screens/AuthScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { StoresDirectoryScreen } from './screens/StoresDirectoryScreen';
import { StorefrontScreen } from './screens/StorefrontScreen';
import { FavouritesScreen } from './screens/FavouritesScreen';
import { AboutScreen } from './screens/AboutScreen';

// Admin Console Screens
import { AdminDashboardScreen } from './screens/admin/AdminDashboardScreen';
import { AdminProductsScreen } from './screens/admin/AdminProductsScreen';
import { AdminCategoriesScreen } from './screens/admin/AdminCategoriesScreen';
import { AdminStoresScreen } from './screens/admin/AdminStoresScreen';
import { AdminEditRequestsScreen } from './screens/admin/AdminEditRequestsScreen';
import { AdminFinanceScreen } from './screens/admin/AdminFinanceScreen';
import { AdminOffersAdsScreen } from './screens/admin/AdminOffersAdsScreen';
import { AdminReportsScreen } from './screens/admin/AdminReportsScreen';
import { AdminTeamScreen } from './screens/admin/AdminTeamScreen';
import { AdminInventoryScreen } from './screens/admin/AdminInventoryScreen';
import { AdminCouponsScreen } from './screens/admin/AdminCouponsScreen';
import { AdminOrdersScreen } from './screens/admin/AdminOrdersScreen';
import { AdminShippingScreen } from './screens/admin/AdminShippingScreen';
import { AdminPaymentsScreen } from './screens/admin/AdminPaymentsScreen';
import { AdminReviewsScreen } from './screens/admin/AdminReviewsScreen';
import { AdminUsersScreen } from './screens/admin/AdminUsersScreen';
import { AdminAuditScreen } from './screens/admin/AdminAuditScreen';
import { AdminTelemetryScreen } from './screens/admin/AdminTelemetryScreen';
import { AdminSettingsScreen } from './screens/admin/AdminSettingsScreen';
import { AdminComplaintsScreen } from './screens/admin/AdminComplaintsScreen';

// Owner / Staff Workspace Screens (Section 3)
import { OwnerDashboardScreen } from './screens/owner/OwnerDashboardScreen';
import { OwnerProductsScreen } from './screens/owner/OwnerProductsScreen';
import { OwnerCategoriesScreen } from './screens/owner/OwnerCategoriesScreen';
import { OwnerSettingsScreen } from './screens/owner/OwnerSettingsScreen';
import { OwnerOrdersScreen } from './screens/owner/OwnerOrdersScreen';
import { OwnerActivitiesScreen } from './screens/owner/OwnerActivitiesScreen';
import { OwnerOffersScreen } from './screens/owner/OwnerOffersScreen';
import { OwnerFeedbackScreen } from './screens/owner/OwnerFeedbackScreen';
import { OwnerEarningsScreen } from './screens/owner/OwnerEarningsScreen';
import { OwnerStaffScreen } from './screens/owner/OwnerStaffScreen';

// System Resilience Screens & Modals
import { NotFoundScreen } from './screens/system/NotFoundScreen';
import { ServerErrorScreen } from './screens/system/ServerErrorScreen';
import { SessionExpiredModal } from './components/system/SessionExpiredModal';
import { StockConflictModal } from './components/system/StockConflictModal';

// Interactive Drawers & Modals
import { CartDrawer } from './components/cart/CartDrawer';
import { GuestReconciliationModal } from './components/cart/GuestReconciliationModal';
import { ReturnRequestDrawer } from './components/orders/ReturnRequestDrawer';
import { ReviewModal } from './components/reviews/ReviewModal';
import { Shield, Store } from 'lucide-react';

export type ScreenState =
  // Storefront (C01 - C15 & Multi-Store Flow)
  | { name: 'home' }
  | { name: 'stores-directory' }
  | { name: 'storefront'; storeId: string }
  | { name: 'catalog'; categoryId?: string }
  | { name: 'product'; productId: string }
  | { name: 'category'; categoryId: string }
  | { name: 'checkout' }
  | { name: 'payment'; orderId: string; total: number }
  | { name: 'order-confirmation'; orderId: string; total: number; status?: 'PAID' | 'PAYMENT_FAILED' }
  | { name: 'orders' }
  | { name: 'order-detail'; orderId: string }
  | { name: 'receipt'; orderId: string }
  | { name: 'profile' }
  | { name: 'addresses' }
  | { name: 'notifications' }
  | { name: 'favourites' }
  | { name: 'about' }
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'forgot-password' }
  // Admin Console (A01 - A13 & Requirements Expansion)
  | { name: 'admin-dashboard' }
  | { name: 'admin-products' }
  | { name: 'admin-stores' }
  | { name: 'admin-categories' }
  | { name: 'admin-edit-requests' }
  | { name: 'admin-finance' }
  | { name: 'admin-offers-ads' }
  | { name: 'admin-reports' }
  | { name: 'admin-team' }
  | { name: 'admin-inventory' }
  | { name: 'admin-coupons' }
  | { name: 'admin-orders' }
  | { name: 'admin-shipping' }
  | { name: 'admin-payments' }
  | { name: 'admin-reviews' }
  | { name: 'admin-users' }
  | { name: 'admin-complaints' }
  | { name: 'admin-audit' }
  | { name: 'admin-telemetry' }
  | { name: 'admin-settings' }
  // Owner / Staff Workspace (Section 3)
  | { name: 'owner-dashboard' }
  | { name: 'owner-products' }
  | { name: 'owner-inventory' }
  | { name: 'owner-orders' }
  | { name: 'owner-offers' }
  | { name: 'owner-reviews' }
  | { name: 'owner-categories' }
  | { name: 'owner-earnings' }
  | { name: 'owner-staff' }
  | { name: 'owner-settings' }
  | { name: 'owner-activities' }
  // System Resilience (S01 - S02)
  | { name: 'not-found' }
  | { name: 'server-error' };

function MainApp() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { openCart } = useCart();
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(() => {
    // If the browser already has an active authenticated admin session in localStorage
    try {
      const saved = localStorage.getItem('mwb_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.roles?.includes('ADMIN')) {
          return { name: 'admin-dashboard' };
        }
      }
    } catch {
      // ignore
    }
    return { name: 'home' };
  });

  // Guard: When user is authenticated as ADMIN, always force and lock them to Admin Console
  useEffect(() => {
    if (isAdmin && !currentScreen.name.startsWith('admin-')) {
      setCurrentScreen({ name: 'admin-dashboard' });
    }
  }, [isAdmin, currentScreen.name]);

  // System & Transactional Modals
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isReturnDrawerOpen, setIsReturnDrawerOpen] = useState(false);
  const [activeReturnOrderId, setActiveReturnOrderId] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeReviewProductId, setActiveReviewProductId] = useState('p1-pro-laptop-15');
  const [isSessionExpiredOpen, setIsSessionExpiredOpen] = useState(false);
  const [isStockConflictOpen, setIsStockConflictOpen] = useState(false);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setIsGuestModalOpen(true);
    } else {
      setCurrentScreen({ name: 'checkout' });
    }
  };

  // Admin route mapper
  const handleAdminNavigate = (path: string) => {
    switch (path) {
      case '/admin':
        setCurrentScreen({ name: 'admin-dashboard' });
        break;
      case '/admin/products':
        setCurrentScreen({ name: 'admin-products' });
        break;
      case '/admin/categories':
        setCurrentScreen({ name: 'admin-categories' });
        break;
      case '/admin/stores':
        setCurrentScreen({ name: 'admin-stores' });
        break;
      case '/admin/edit-requests':
        setCurrentScreen({ name: 'admin-edit-requests' });
        break;
      case '/admin/finance':
        setCurrentScreen({ name: 'admin-finance' });
        break;
      case '/admin/offers-ads':
        setCurrentScreen({ name: 'admin-offers-ads' });
        break;
      case '/admin/reports':
        setCurrentScreen({ name: 'admin-reports' });
        break;
      case '/admin/admin-team':
        setCurrentScreen({ name: 'admin-team' });
        break;
      case '/admin/inventory':
        setCurrentScreen({ name: 'admin-inventory' });
        break;
      case '/admin/coupons':
        setCurrentScreen({ name: 'admin-coupons' });
        break;
      case '/admin/orders':
        setCurrentScreen({ name: 'admin-orders' });
        break;
      case '/admin/shipping':
        setCurrentScreen({ name: 'admin-shipping' });
        break;
      case '/admin/payments':
        setCurrentScreen({ name: 'admin-payments' });
        break;
      case '/admin/reviews':
        setCurrentScreen({ name: 'admin-reviews' });
        break;
      case '/admin/customers':
      case '/admin/users':
        setCurrentScreen({ name: 'admin-users' });
        break;
      case '/admin/complaints':
        setCurrentScreen({ name: 'admin-complaints' });
        break;
      case '/admin/audit':
        setCurrentScreen({ name: 'admin-audit' });
        break;
      case '/admin/telemetry':
        setCurrentScreen({ name: 'admin-telemetry' });
        break;
      case '/admin/settings':
        setCurrentScreen({ name: 'admin-settings' });
        break;
      default:
        setCurrentScreen({ name: 'admin-dashboard' });
        break;
    }
  };

  // Owner route mapper
  const handleOwnerNavigate = (path: string) => {
    switch (path) {
      case '/owner':
        setCurrentScreen({ name: 'owner-dashboard' });
        break;
      case '/owner/products':
        setCurrentScreen({ name: 'owner-products' });
        break;
      case '/owner/categories':
        setCurrentScreen({ name: 'owner-categories' });
        break;
      case '/owner/inventory':
        setCurrentScreen({ name: 'owner-inventory' });
        break;
      case '/owner/offers':
        setCurrentScreen({ name: 'owner-offers' });
        break;
      case '/owner/reviews':
        setCurrentScreen({ name: 'owner-reviews' });
        break;
      case '/owner/earnings':
        setCurrentScreen({ name: 'owner-earnings' });
        break;
      case '/owner/staff':
        setCurrentScreen({ name: 'owner-staff' });
        break;
      case '/owner/settings':
        setCurrentScreen({ name: 'owner-settings' });
        break;
      case '/owner/orders':
        setCurrentScreen({ name: 'owner-orders' });
        break;
      case '/owner/activities':
        setCurrentScreen({ name: 'owner-activities' });
        break;
      default:
        setCurrentScreen({ name: 'owner-dashboard' });
        break;
    }
  };

  const isAdminView = currentScreen.name.startsWith('admin-');
  const isOwnerView = currentScreen.name.startsWith('owner-');

  const renderActiveScreen = () => {
    switch (currentScreen.name) {
      // Storefront (Phase 2 & Phase 4 Multi-Store)
      case 'home':
        return (
          <HomeScreen
            onNavigateLogin={() => setCurrentScreen({ name: 'login' })}
            onNavigateRegister={() => setCurrentScreen({ name: 'register' })}
            onNavigateOrders={() => setCurrentScreen({ name: 'orders' })}
            onNavigateProfile={() => setCurrentScreen({ name: 'profile' })}
            onNavigateAddresses={() => setCurrentScreen({ name: 'addresses' })}
            onNavigateNotifications={() => setCurrentScreen({ name: 'notifications' })}
            onNavigateCatalog={() => setCurrentScreen({ name: 'catalog' })}
            onNavigateStores={() => setCurrentScreen({ name: 'stores-directory' })}
            onSelectStore={(stId) => setCurrentScreen({ name: 'storefront', storeId: stId })}
            onSelectCategory={(catId) => setCurrentScreen({ name: 'category', categoryId: catId })}
            onSelectProduct={(pId) => setCurrentScreen({ name: 'product', productId: pId })}
          />
        );
      case 'stores-directory':
        return (
          <StoresDirectoryScreen
            onSelectStore={(stId) => setCurrentScreen({ name: 'storefront', storeId: stId })}
            onNavigateHome={() => setCurrentScreen({ name: 'home' })}
            onNavigateOrders={() => setCurrentScreen({ name: 'orders' })}
            onNavigateProfile={() => setCurrentScreen({ name: 'profile' })}
            onNavigateLogin={() => setCurrentScreen({ name: 'login' })}
            onNavigateRegister={() => setCurrentScreen({ name: 'register' })}
            onNavigateNotifications={() => setCurrentScreen({ name: 'notifications' })}
          />
        );
      case 'storefront':
        return (
          <StorefrontScreen
            storeId={currentScreen.storeId}
            onBackToStores={() => setCurrentScreen({ name: 'stores-directory' })}
            onNavigateHome={() => setCurrentScreen({ name: 'home' })}
            onNavigateOrders={() => setCurrentScreen({ name: 'orders' })}
            onNavigateProfile={() => setCurrentScreen({ name: 'profile' })}
            onNavigateLogin={() => setCurrentScreen({ name: 'login' })}
            onNavigateRegister={() => setCurrentScreen({ name: 'register' })}
            onSelectProduct={(pId) => setCurrentScreen({ name: 'product', productId: pId })}
          />
        );
      case 'catalog':
        return (
          <CatalogScreen
            initialCategoryId={currentScreen.categoryId}
            onSelectProduct={(pId) => setCurrentScreen({ name: 'product', productId: pId })}
            onNavigateLogin={() => setCurrentScreen({ name: 'login' })}
            onNavigateRegister={() => setCurrentScreen({ name: 'register' })}
            onNavigateOrders={() => setCurrentScreen({ name: 'orders' })}
            onNavigateProfile={() => setCurrentScreen({ name: 'profile' })}
            onNavigateAddresses={() => setCurrentScreen({ name: 'addresses' })}
            onNavigateNotifications={() => setCurrentScreen({ name: 'notifications' })}
          />
        );
      case 'product':
        return (
          <ProductDetailScreen
            productId={currentScreen.productId}
            onBack={() => setCurrentScreen({ name: 'catalog' })}
            onOpenReviewModal={() => {
              setActiveReviewProductId(currentScreen.productId);
              setIsReviewModalOpen(true);
            }}
            onNavigateLogin={() => setCurrentScreen({ name: 'login' })}
            onNavigateRegister={() => setCurrentScreen({ name: 'register' })}
            onNavigateOrders={() => setCurrentScreen({ name: 'orders' })}
            onNavigateProfile={() => setCurrentScreen({ name: 'profile' })}
            onNavigateAddresses={() => setCurrentScreen({ name: 'addresses' })}
            onNavigateNotifications={() => setCurrentScreen({ name: 'notifications' })}
          />
        );
      case 'category':
        return (
          <CategoryShowcaseScreen
            categoryId={currentScreen.categoryId}
            onSelectSubcategory={(subId) => setCurrentScreen({ name: 'catalog', categoryId: subId })}
            onSelectProduct={(pId) => setCurrentScreen({ name: 'product', productId: pId })}
            onBack={() => setCurrentScreen({ name: 'catalog' })}
          />
        );
      case 'checkout':
        return (
          <CheckoutScreen
            onBackToCart={() => setCurrentScreen({ name: 'home' })}
            onProceedToPayment={(orderId, orderTotal) =>
              setCurrentScreen({ name: 'payment', orderId, total: orderTotal })
            }
          />
        );
      case 'payment':
        return (
          <PaymentSimulationScreen
            orderId={currentScreen.orderId}
            orderTotal={currentScreen.total}
            onPaymentSuccess={(orderId) =>
              setCurrentScreen({ name: 'order-confirmation', orderId, total: currentScreen.total, status: 'PAID' })
            }
            onPaymentFailed={(orderId) =>
              setCurrentScreen({
                name: 'order-confirmation',
                orderId,
                total: currentScreen.total,
                status: 'PAYMENT_FAILED',
              })
            }
            onCancel={() => setCurrentScreen({ name: 'checkout' })}
          />
        );
      case 'order-confirmation':
        return (
          <OrderConfirmationScreen
            orderId={currentScreen.orderId}
            orderTotal={currentScreen.total}
            initialStatus={currentScreen.status || 'PAID'}
            onViewOrderDetails={(id) => setCurrentScreen({ name: 'order-detail', orderId: id })}
            onRetryPayment={(id, oTotal) => setCurrentScreen({ name: 'payment', orderId: id, total: oTotal })}
            onContinueShopping={() => setCurrentScreen({ name: 'catalog' })}
          />
        );
      case 'orders':
        return (
          <OrderHistoryScreen
            onSelectOrder={(id) => setCurrentScreen({ name: 'order-detail', orderId: id })}
            onContinueShopping={() => setCurrentScreen({ name: 'catalog' })}
            onRequestReturn={(id) => {
              setActiveReturnOrderId(id);
              setIsReturnDrawerOpen(true);
            }}
          />
        );
      case 'order-detail':
        return (
          <OrderDetailScreen
            orderId={currentScreen.orderId}
            onBack={() => setCurrentScreen({ name: 'orders' })}
            onPrintInvoice={(id) => setCurrentScreen({ name: 'receipt', orderId: id })}
          />
        );
      case 'receipt':
        return (
          <PrintableReceiptScreen
            orderId={currentScreen.orderId}
            onBack={() => setCurrentScreen({ name: 'order-detail', orderId: currentScreen.orderId })}
          />
        );
      case 'profile':
        return (
          <AccountProfileScreen
            onBack={() => setCurrentScreen({ name: 'home' })}
            onNavigateAddressBook={() => setCurrentScreen({ name: 'addresses' })}
            onNavigateOrders={() => setCurrentScreen({ name: 'orders' })}
          />
        );
      case 'addresses':
        return <AddressBookScreen onBack={() => setCurrentScreen({ name: 'profile' })} />;
      case 'notifications':
        return (
          <NotificationCenterScreen
            onBack={() => setCurrentScreen({ name: 'home' })}
            onSelectOrder={(id) => setCurrentScreen({ name: 'order-detail', orderId: id })}
          />
        );
      case 'favourites':
        return (
          <FavouritesScreen
            onNavigateHome={() => setCurrentScreen({ name: 'home' })}
            onNavigateStores={() => setCurrentScreen({ name: 'stores-directory' })}
            onNavigateOrders={() => setCurrentScreen({ name: 'orders' })}
            onNavigateAbout={() => setCurrentScreen({ name: 'about' })}
            onNavigateProduct={(pId) => setCurrentScreen({ name: 'product', productId: pId })}
            onNavigateStore={(stId) => setCurrentScreen({ name: 'storefront', storeId: stId })}
          />
        );
      case 'about':
        return (
          <AboutScreen
            onNavigateHome={() => setCurrentScreen({ name: 'home' })}
            onNavigateStores={() => setCurrentScreen({ name: 'stores-directory' })}
            onNavigateOrders={() => setCurrentScreen({ name: 'orders' })}
            onNavigateAbout={() => setCurrentScreen({ name: 'about' })}
          />
        );
      case 'login':
        return (
          <AuthScreen
            defaultMode="login"
            onSuccess={() => {
              // Note: If user is admin, the useEffect guard will redirect to 'admin-dashboard' automatically.
              // For customer users, navigate to home.
              setCurrentScreen({ name: 'home' });
            }}
            onBackToHome={() => setCurrentScreen({ name: 'home' })}
          />
        );
      case 'register':
        return (
          <AuthScreen
            defaultMode="register"
            onSuccess={() => setCurrentScreen({ name: 'home' })}
            onBackToHome={() => setCurrentScreen({ name: 'home' })}
          />
        );
      case 'forgot-password':
        return <ForgotPasswordScreen onBackToLogin={() => setCurrentScreen({ name: 'login' })} />;

      // Admin Console (Phase 3)
      case 'admin-dashboard':
        return (
          <AdminDashboardScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-products':
        return (
          <AdminProductsScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-categories':
        return (
          <AdminCategoriesScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-inventory':
        return (
          <AdminInventoryScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-coupons':
        return (
          <AdminCouponsScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-orders':
        return (
          <AdminOrdersScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
            onDispatchShipment={() => setCurrentScreen({ name: 'admin-shipping' })}
          />
        );
      case 'admin-shipping':
        return (
          <AdminShippingScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-payments':
        return (
          <AdminPaymentsScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-reviews':
        return (
          <AdminReviewsScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-users':
        return (
          <AdminUsersScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-complaints':
        return (
          <AdminComplaintsScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-audit':
        return (
          <AdminAuditScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-telemetry':
        return (
          <AdminTelemetryScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-settings':
        return (
          <AdminSettingsScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-stores':
        return (
          <AdminStoresScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-edit-requests':
        return (
          <AdminEditRequestsScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-finance':
        return (
          <AdminFinanceScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-offers-ads':
        return (
          <AdminOffersAdsScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-reports':
        return (
          <AdminReportsScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'admin-team':
        return (
          <AdminTeamScreen
            onNavigate={handleAdminNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );

      // Owner / Staff Workspace (Section 3)
      case 'owner-dashboard':
        return (
          <OwnerDashboardScreen
            onNavigate={handleOwnerNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'owner-products':
        return (
          <OwnerProductsScreen
            onNavigate={handleOwnerNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'owner-categories':
        return (
          <OwnerCategoriesScreen
            onNavigate={handleOwnerNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'owner-settings':
        return (
          <OwnerSettingsScreen
            onNavigate={handleOwnerNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'owner-orders':
        return (
          <OwnerOrdersScreen
            onNavigate={handleOwnerNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'owner-activities':
        return (
          <OwnerActivitiesScreen
            onNavigate={handleOwnerNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'owner-offers':
        return (
          <OwnerOffersScreen
            onNavigate={handleOwnerNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'owner-reviews':
        return (
          <OwnerFeedbackScreen
            onNavigate={handleOwnerNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'owner-earnings':
        return (
          <OwnerEarningsScreen
            onNavigate={handleOwnerNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );
      case 'owner-staff':
        return (
          <OwnerStaffScreen
            onNavigate={handleOwnerNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen({ name: 'home' });
            }}
          />
        );

      // System Resilience (Phase 4)
      case 'not-found':
        return (
          <NotFoundScreen
            onBackToHome={() => setCurrentScreen({ name: 'home' })}
            onNavigateCatalog={() => setCurrentScreen({ name: 'catalog' })}
          />
        );
      case 'server-error':
        return (
          <ServerErrorScreen
            onRetry={() => setCurrentScreen({ name: 'home' })}
            onBackToHome={() => setCurrentScreen({ name: 'home' })}
          />
        );

      default:
        return (
          <HomeScreen
            onNavigateLogin={() => setCurrentScreen({ name: 'login' })}
            onNavigateRegister={() => setCurrentScreen({ name: 'register' })}
            onNavigateOrders={() => setCurrentScreen({ name: 'orders' })}
            onNavigateProfile={() => setCurrentScreen({ name: 'profile' })}
            onNavigateAddresses={() => setCurrentScreen({ name: 'addresses' })}
            onNavigateNotifications={() => setCurrentScreen({ name: 'notifications' })}
            onNavigateCatalog={() => setCurrentScreen({ name: 'catalog' })}
            onSelectProduct={(pId) => setCurrentScreen({ name: 'product', productId: pId })}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Floating View Portal Pill: Only displayed for non-admin preview/development */}
      {!isAdmin && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            type="button"
            onClick={() => {
              if (isAdminView) {
                setCurrentScreen({ name: 'home' });
              } else {
                setCurrentScreen({ name: 'admin-dashboard' });
              }
            }}
            className="rounded-[999px] bg-ink/90 hover:bg-ink text-sand text-xs font-semibold px-4 py-2.5 shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer border border-sand/30"
          >
            {isAdminView ? (
              <>
                <Store className="w-4 h-4 text-amber" />
                <span>Switch to Customer Storefront</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-amber" />
                <span>Switch to Merchant Admin Console</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main View Area */}
      {renderActiveScreen()}

      {/* Drawers & Modals */}
      <CartDrawer
        onProceedToCheckout={handleProceedToCheckout}
        onNavigateCatalog={() => setCurrentScreen({ name: 'catalog' })}
      />

      <GuestReconciliationModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onSuccess={() => {
          setIsGuestModalOpen(false);
          setCurrentScreen({ name: 'checkout' });
        }}
      />

      <ReturnRequestDrawer
        isOpen={isReturnDrawerOpen}
        onClose={() => setIsReturnDrawerOpen(false)}
        orderId={activeReturnOrderId}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        productId={activeReviewProductId}
      />

      <SessionExpiredModal
        isOpen={isSessionExpiredOpen}
        onClose={() => setIsSessionExpiredOpen(false)}
        onSuccess={() => setIsSessionExpiredOpen(false)}
      />

      <StockConflictModal
        isOpen={isStockConflictOpen}
        onClose={() => setIsStockConflictOpen(false)}
        onAdjustCart={() => {
          setIsStockConflictOpen(false);
          openCart();
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;
