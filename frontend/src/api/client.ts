import {
  MOCK_STORES,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_USERS,
  MOCK_ORDERS,
  MOCK_COMPLAINTS,
  MOCK_STORE_EDIT_REQUESTS,
  MockStore,
  MockCategory,
  MockProduct,
  MockUser,
  MockOrder,
  MockComplaint,
  MockStoreEditRequest,
} from '../data/mockDatabase';

export interface Category {
  id: string;
  name: string;
  slug?: string;
  parent_id?: string | null;
  children?: Category[];
  product_count?: number;
}

export interface Inventory {
  id?: string;
  quantity?: number;
  available_quantity: number;
  reserved_quantity?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number; // in minor units (e.g. 8500 = $85.00)
  category_id?: string;
  category?: Category;
  inventory?: Inventory;
  image_url?: string;
  store_id?: string;
  store_name?: string;
}

export const FALLBACK_CATEGORIES: Category[] = MOCK_CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  product_count: c.product_count,
}));

export const FALLBACK_PRODUCTS: Product[] = MOCK_PRODUCTS.map((p) => ({
  id: p.id,
  name: p.name,
  sku: p.sku,
  description: p.description,
  price: p.price,
  image_url: p.image_url,
  store_id: p.store_id,
  store_name: p.store_name,
  category: {
    id: p.category_id,
    name: p.category_name,
  },
  inventory: {
    available_quantity: p.stock,
  },
}));

// Environment Variable Control
// If VITE_USE_MOCK_DATA is 'true' (or omitted for demo), use mockDatabase.
// If VITE_USE_MOCK_DATA is 'false', connect to the live backend API.
export const isMockDataEnabled: boolean =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
  import.meta.env.VITE_USE_MOCK_DATA === undefined;

export const API_BASE: string =
  import.meta.env.VITE_API_BASE_URL || '/api/v1';

// ==========================================
// API Methods with Mock vs Live Switching
// ==========================================

export async function fetchStores(): Promise<{ data: MockStore[]; isLive: boolean }> {
  if (isMockDataEnabled) {
    return { data: MOCK_STORES, isLive: false };
  }
  try {
    const res = await fetch(`${API_BASE}/stores`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const stores: MockStore[] = Array.isArray(json) ? json : json.data ?? [];
    return { data: stores.length ? stores : MOCK_STORES, isLive: true };
  } catch {
    return { data: MOCK_STORES, isLive: false };
  }
}

export async function fetchStoreById(idOrSlug: string): Promise<{ data: MockStore | null; isLive: boolean }> {
  if (isMockDataEnabled) {
    const found = MOCK_STORES.find((s) => s.id === idOrSlug || s.slug === idOrSlug) || null;
    return { data: found, isLive: false };
  }
  try {
    const res = await fetch(`${API_BASE}/stores/${idOrSlug}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: json.data || json, isLive: true };
  } catch {
    const found = MOCK_STORES.find((s) => s.id === idOrSlug || s.slug === idOrSlug) || null;
    return { data: found, isLive: false };
  }
}

export async function fetchCategories(): Promise<{ data: Category[]; isLive: boolean }> {
  if (isMockDataEnabled) {
    const mapped: Category[] = MOCK_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      product_count: c.product_count,
    }));
    return { data: mapped, isLive: false };
  }
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const categories: Category[] = Array.isArray(json) ? json : json.data ?? [];
    return { data: categories, isLive: true };
  } catch {
    const mapped: Category[] = MOCK_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      product_count: c.product_count,
    }));
    return { data: mapped, isLive: false };
  }
}

export async function fetchNewestProducts(limit = 4): Promise<{ data: Product[]; isLive: boolean }> {
  if (isMockDataEnabled) {
    const mapped: Product[] = MOCK_PRODUCTS.slice(0, limit).map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      store_id: p.store_id,
      store_name: p.store_name,
      category: {
        id: p.category_id,
        name: p.category_name,
      },
      inventory: {
        available_quantity: p.stock,
      },
    }));
    return { data: mapped, isLive: false };
  }
  try {
    const res = await fetch(`${API_BASE}/products?sort_by=created_at&order=DESC&limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const products: Product[] = Array.isArray(json) ? json : json.data ?? [];
    return { data: products, isLive: true };
  } catch {
    const mapped: Product[] = MOCK_PRODUCTS.slice(0, limit).map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      store_id: p.store_id,
      store_name: p.store_name,
      category: {
        id: p.category_id,
        name: p.category_name,
      },
      inventory: {
        available_quantity: p.stock,
      },
    }));
    return { data: mapped, isLive: false };
  }
}

export async function fetchUsers(): Promise<{ data: MockUser[]; isLive: boolean }> {
  if (isMockDataEnabled) {
    return { data: MOCK_USERS, isLive: false };
  }
  try {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: Array.isArray(json) ? json : json.data ?? [], isLive: true };
  } catch {
    return { data: MOCK_USERS, isLive: false };
  }
}

export async function fetchOrders(): Promise<{ data: MockOrder[]; isLive: boolean }> {
  if (isMockDataEnabled) {
    return { data: MOCK_ORDERS, isLive: false };
  }
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: Array.isArray(json) ? json : json.data ?? [], isLive: true };
  } catch {
    return { data: MOCK_ORDERS, isLive: false };
  }
}

export async function fetchComplaints(): Promise<{ data: MockComplaint[]; isLive: boolean }> {
  if (isMockDataEnabled) {
    return { data: MOCK_COMPLAINTS, isLive: false };
  }
  try {
    const res = await fetch(`${API_BASE}/complaints`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: Array.isArray(json) ? json : json.data ?? [], isLive: true };
  } catch {
    return { data: MOCK_COMPLAINTS, isLive: false };
  }
}

export async function fetchStoreEditRequests(): Promise<{ data: MockStoreEditRequest[]; isLive: boolean }> {
  if (isMockDataEnabled) {
    return { data: MOCK_STORE_EDIT_REQUESTS, isLive: false };
  }
  try {
    const res = await fetch(`${API_BASE}/store-edit-requests`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: Array.isArray(json) ? json : json.data ?? [], isLive: true };
  } catch {
    return { data: MOCK_STORE_EDIT_REQUESTS, isLive: false };
  }
}
