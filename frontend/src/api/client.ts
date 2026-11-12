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
  price: number; // in minor units (e.g. 150000 = 1,500.00)
  category_id?: string;
  category?: Category;
  inventory?: Inventory;
  image_url?: string;
}

// Fallback seed data matching backend initial-seed.ts and MWB spec
export const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'c1-electronics',
    name: 'Electronics',
    slug: 'electronics',
    children: [
      {
        id: 'c2-laptops',
        name: 'Laptops',
        slug: 'laptops',
        parent_id: 'c1-electronics',
        product_count: 12,
      },
    ],
    product_count: 24,
  },
  {
    id: 'c3-accessories',
    name: 'Accessories',
    slug: 'accessories',
    children: [],
    product_count: 38,
  },
  {
    id: 'c4-workspace',
    name: 'Workspace & Audio',
    slug: 'workspace',
    children: [],
    product_count: 15,
  },
];

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p1-pro-laptop-15',
    name: 'Pro Laptop 15"',
    sku: 'LAP-123',
    description: 'High performance laptop for professionals and engineers.',
    price: 150000, // 1,500.00
    category: {
      id: 'c2-laptops',
      name: 'Laptops',
    },
    inventory: {
      available_quantity: 50,
    },
  },
];

const API_BASE = '/api/v1';

export async function fetchCategories(): Promise<{ data: Category[]; isLive: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const categories: Category[] = Array.isArray(json) ? json : json.data ?? [];
    return { data: categories.length ? categories : FALLBACK_CATEGORIES, isLive: true };
  } catch (err) {
    return { data: FALLBACK_CATEGORIES, isLive: false };
  }
}

export async function fetchNewestProducts(limit = 4): Promise<{ data: Product[]; isLive: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/products?sort_by=created_at&order=DESC&limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const products: Product[] = Array.isArray(json) ? json : json.data ?? [];
    return { data: products.length ? products : FALLBACK_PRODUCTS, isLive: true };
  } catch (err) {
    return { data: FALLBACK_PRODUCTS, isLive: false };
  }
}

