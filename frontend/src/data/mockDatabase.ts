/**
 * Market Without Borders (MWB) - Central In-Memory Mock Database
 * 
 * Contains full E2E relational data matching the PostgreSQL production schema:
 * - 10 Independent Artisan Stores
 * - Users (Super Admin, Store Owners, Customers)
 * - Categories & Products
 * - Split Orders & Sub-Orders
 * - Store Edit Requests
 * - Customer Complaints & Disputes
 * - Reviews & Ratings
 * - Coupons & Promotions
 */

export interface MockUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OWNER' | 'CUSTOMER';
  approval_status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  store_id?: string;
  store_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface MockStore {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  owner_id: string;
  owner_name: string;
  owner_email: string;
  category_id: string;
  category_name: string;
  rating: number;
  review_count: number;
  product_count: number;
  gross_sales: number; // in minor units ($100.00 = 10000)
  commission_rate: number; // percentage (e.g. 10%)
  logo_url: string;
  banner_url: string;
  city: string;
  country: string;
  created_at: string;
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id?: string | null;
  product_count: number;
  icon?: string;
}

export interface MockProduct {
  id: string;
  store_id: string;
  store_name: string;
  category_id: string;
  category_name: string;
  name: string;
  sku: string;
  description: string;
  price: number; // minor units: $45.00 = 4500
  original_price?: number;
  stock: number;
  is_featured: boolean;
  image_url: string;
  rating: number;
  reviews_count: number;
  created_at: string;
}

export interface MockOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total_amount: number;
  currency: string;
  shipping_address: {
    street: string;
    city: string;
    country: string;
    postal_code: string;
  };
  sub_orders: {
    id: string;
    store_id: string;
    store_name: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
    subtotal: number;
    items_count: number;
  }[];
  items: {
    product_id: string;
    store_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  created_at: string;
}

export interface MockComplaint {
  id: string;
  complaint_number: string;
  order_id: string;
  store_id: string;
  store_name: string;
  customer_name: string;
  customer_email: string;
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REFUNDED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at: string;
}

export interface MockStoreEditRequest {
  id: string;
  store_id: string;
  store_name: string;
  owner_name: string;
  requested_changes: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submitted_at: string;
}

export interface MockCoupon {
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  min_order_amount: number;
  is_active: boolean;
  valid_until: string;
}

// ==========================================
// 1. 10 ARTISAN STORES
// ==========================================
export const MOCK_STORES: MockStore[] = [
  {
    id: 'store-1',
    name: 'Artisan Handcrafts',
    slug: 'artisan-handcrafts',
    tagline: 'Terracotta vases and fine oak dining ware.',
    description: 'Specializing in wheel-thrown earthenware, glazed stoneware, and sustainably harvested oak serving boards.',
    status: 'ACTIVE',
    owner_id: 'usr-owner-1',
    owner_name: 'Elena Rostova',
    owner_email: 'elena@artisanhandcrafts.com',
    category_id: 'cat-ceramics',
    category_name: 'Handcrafted Decor & Ceramics',
    rating: 4.9,
    review_count: 142,
    product_count: 28,
    gross_sales: 840000,
    commission_rate: 10,
    logo_url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=150&q=80',
    banner_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
    city: 'Florence',
    country: 'Italy',
    created_at: '2026-01-15',
  },
  {
    id: 'store-2',
    name: 'Heritage Textiles',
    slug: 'heritage-textiles',
    tagline: 'Loomed raw cotton rugs, throws, and linen apparel.',
    description: 'Generations of textile artistry producing hand-dyed indigo fabrics, loomed wool blankets, and breathable linen garments.',
    status: 'ACTIVE',
    owner_id: 'usr-owner-2',
    owner_name: 'Marcus Vance',
    owner_email: 'marcus@heritagetextiles.com',
    category_id: 'cat-textiles',
    category_name: 'Organic Textiles & Apparel',
    rating: 4.8,
    review_count: 98,
    product_count: 20,
    gross_sales: 408000,
    commission_rate: 12,
    logo_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=150&q=80',
    banner_url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1200&q=80',
    city: 'Lyon',
    country: 'France',
    created_at: '2026-02-01',
  },
  {
    id: 'store-3',
    name: 'Nomad Leatherworks',
    slug: 'nomad-leatherworks',
    tagline: 'Full-grain vegetable-tanned leather goods and luggage.',
    description: 'Bespoke hand-stitched leather backpacks, weekend duffels, and minimalist cardholders built to last decades.',
    status: 'ACTIVE',
    owner_id: 'usr-owner-3',
    owner_name: 'Tariq Al-Mansoor',
    owner_email: 'tariq@nomadleather.com',
    category_id: 'cat-leather',
    category_name: 'Bespoke Leather Goods',
    rating: 4.9,
    review_count: 114,
    product_count: 18,
    gross_sales: 620000,
    commission_rate: 10,
    logo_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=150&q=80',
    banner_url: 'https://images.unsplash.com/photo-1473188557827-0b1a82f3ef80?auto=format&fit=crop&w=1200&q=80',
    city: 'Marrakech',
    country: 'Morocco',
    created_at: '2026-02-18',
  },
  {
    id: 'store-4',
    name: 'Clay & Flame Studio',
    slug: 'clay-and-flame',
    tagline: 'Kiln-fired earthenware, pottery, and tea vessels.',
    description: 'Contemporary minimalist pottery crafted from organic volcanic clays, reduction fired for earthy textures.',
    status: 'ACTIVE',
    owner_id: 'usr-owner-4',
    owner_name: 'Layla Chen',
    owner_email: 'layla@clayflame.com',
    category_id: 'cat-ceramics',
    category_name: 'Handcrafted Decor & Ceramics',
    rating: 4.7,
    review_count: 64,
    product_count: 15,
    gross_sales: 295000,
    commission_rate: 10,
    logo_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=150&q=80',
    banner_url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
    city: 'Kyoto',
    country: 'Japan',
    created_at: '2026-03-05',
  },
  {
    id: 'store-5',
    name: 'Levant Olive Wood Craft',
    slug: 'levant-olive-wood',
    tagline: 'Natural grain kitchenware and sculptural bowls.',
    description: 'Hand-carved from century-old non-bearing olive wood trees. Finished with natural organic cold-pressed oils.',
    status: 'ACTIVE',
    owner_id: 'usr-owner-5',
    owner_name: 'Ziad Nammour',
    owner_email: 'ziad@levantwood.com',
    category_id: 'cat-woodcraft',
    category_name: 'Fine Woodcraft & Carvings',
    rating: 4.9,
    review_count: 82,
    product_count: 22,
    gross_sales: 510000,
    commission_rate: 10,
    logo_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=150&q=80',
    banner_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    city: 'Bethlehem',
    country: 'Palestine',
    created_at: '2026-03-20',
  },
  {
    id: 'store-6',
    name: 'Pure Botanics Apothecary',
    slug: 'pure-botanics',
    tagline: 'Small-batch botanical skincare, herbal soaps, and scents.',
    description: 'Handcrafted cold-processed soaps, rosewater distillates, and organic cedar balm made with zero synthetic preservatives.',
    status: 'ACTIVE',
    owner_id: 'usr-owner-6',
    owner_name: 'Sarah Lindqvist',
    owner_email: 'sarah@purebotanics.com',
    category_id: 'cat-botanics',
    category_name: 'Natural Botanicals & Fragrance',
    rating: 4.8,
    review_count: 73,
    product_count: 16,
    gross_sales: 340000,
    commission_rate: 15,
    logo_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=150&q=80',
    banner_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
    city: 'Stockholm',
    country: 'Sweden',
    created_at: '2026-04-10',
  },
  {
    id: 'store-7',
    name: 'Damascus Steel & Blades',
    slug: 'damascus-steel',
    tagline: 'Hand-forged culinary knives and folding pocket blades.',
    description: 'Forged 67-layer pattern-welded Damascus steel culinary knives paired with desert ironwood and brass bolster handles.',
    status: 'ACTIVE',
    owner_id: 'usr-owner-7',
    owner_name: 'Kareem Barazi',
    owner_email: 'kareem@damascusblades.com',
    category_id: 'cat-metalwork',
    category_name: 'Forged Metals & Blades',
    rating: 5.0,
    review_count: 160,
    product_count: 12,
    gross_sales: 980000,
    commission_rate: 8,
    logo_url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=150&q=80',
    banner_url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
    city: 'Damascus',
    country: 'Syria',
    created_at: '2026-05-02',
  },
  {
    id: 'store-8',
    name: 'Mediterranean Glassworks',
    slug: 'med-glassworks',
    tagline: 'Blown sea-glass lanterns, carafes, and tumblers.',
    description: 'Traditional mouth-blown glass crafted over open furnace flames using recycled coastal silica and mineral pigments.',
    status: 'ACTIVE',
    owner_id: 'usr-owner-8',
    owner_name: 'Nadia Soler',
    owner_email: 'nadia@medglass.com',
    category_id: 'cat-glass',
    category_name: 'Artisan Glassware',
    rating: 4.6,
    review_count: 51,
    product_count: 14,
    gross_sales: 215000,
    commission_rate: 10,
    logo_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=150&q=80',
    banner_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    city: 'Valencia',
    country: 'Spain',
    created_at: '2026-06-14',
  },
  {
    id: 'store-9',
    name: 'Al-Andalus Rugs & Kilims',
    slug: 'al-andalus-rugs',
    tagline: 'Hand-knotted tribal wool carpets and wall tapestries.',
    description: 'Authentic geometric kilims woven on traditional timber floor looms with plant-based madder and walnut dyes.',
    status: 'ACTIVE',
    owner_id: 'usr-owner-9',
    owner_name: 'Omar Benali',
    owner_email: 'omar@alandalusrugs.com',
    category_id: 'cat-textiles',
    category_name: 'Organic Textiles & Apparel',
    rating: 4.9,
    review_count: 89,
    product_count: 25,
    gross_sales: 730000,
    commission_rate: 10,
    logo_url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=150&q=80',
    banner_url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80',
    city: 'Granada',
    country: 'Spain',
    created_at: '2026-07-21',
  },
  {
    id: 'store-10',
    name: 'Copper & Brass Foundry',
    slug: 'copper-brass-foundry',
    tagline: 'Hand-hammered brass lanterns, trays, and cezve pots.',
    description: 'Master metal-spinners hammering heavy-gauge solid copper and solid brass into Turkish coffee pots and ornamental lanterns.',
    status: 'PENDING',
    owner_id: 'usr-owner-10',
    owner_name: 'Yusuf Demir',
    owner_email: 'yusuf@copperfoundry.com',
    category_id: 'cat-metalwork',
    category_name: 'Forged Metals & Blades',
    rating: 4.7,
    review_count: 42,
    product_count: 11,
    gross_sales: 180000,
    commission_rate: 12,
    logo_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80',
    banner_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    city: 'Istanbul',
    country: 'Turkey',
    created_at: '2026-08-11',
  },
];

// ==========================================
// 2. USERS (Super Admin, Store Owners, Customers)
// ==========================================
export const MOCK_USERS: MockUser[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@mwb.com',
    first_name: 'Platform',
    last_name: 'SuperAdmin',
    role: 'SUPER_ADMIN',
    approval_status: 'ACTIVE',
    phone: '+1 (555) 019-2831',
    created_at: '2026-01-01',
  },
  {
    id: 'usr-admin-2',
    email: 'ops@mwb.com',
    first_name: 'Operations',
    last_name: 'Manager',
    role: 'ADMIN',
    approval_status: 'ACTIVE',
    phone: '+1 (555) 019-2832',
    created_at: '2026-01-05',
  },
  // Store Owners for each of the 10 stores
  {
    id: 'usr-owner-1',
    email: 'elena@artisanhandcrafts.com',
    first_name: 'Elena',
    last_name: 'Rostova',
    role: 'OWNER',
    approval_status: 'ACTIVE',
    store_id: 'store-1',
    store_name: 'Artisan Handcrafts',
    phone: '+39 055 123 4567',
    created_at: '2026-01-15',
  },
  {
    id: 'usr-owner-2',
    email: 'marcus@heritagetextiles.com',
    first_name: 'Marcus',
    last_name: 'Vance',
    role: 'OWNER',
    approval_status: 'ACTIVE',
    store_id: 'store-2',
    store_name: 'Heritage Textiles',
    phone: '+33 4 72 00 11 22',
    created_at: '2026-02-01',
  },
  {
    id: 'usr-owner-3',
    email: 'tariq@nomadleather.com',
    first_name: 'Tariq',
    last_name: 'Al-Mansoor',
    role: 'OWNER',
    approval_status: 'ACTIVE',
    store_id: 'store-3',
    store_name: 'Nomad Leatherworks',
    phone: '+212 524 88 99 00',
    created_at: '2026-02-18',
  },
  {
    id: 'usr-owner-4',
    email: 'layla@clayflame.com',
    first_name: 'Layla',
    last_name: 'Chen',
    role: 'OWNER',
    approval_status: 'ACTIVE',
    store_id: 'store-4',
    store_name: 'Clay & Flame Studio',
    phone: '+81 75 987 6543',
    created_at: '2026-03-05',
  },
  {
    id: 'usr-owner-5',
    email: 'ziad@levantwood.com',
    first_name: 'Ziad',
    last_name: 'Nammour',
    role: 'OWNER',
    approval_status: 'ACTIVE',
    store_id: 'store-5',
    store_name: 'Levant Olive Wood Craft',
    phone: '+970 2 274 1234',
    created_at: '2026-03-20',
  },
  {
    id: 'usr-owner-6',
    email: 'sarah@purebotanics.com',
    first_name: 'Sarah',
    last_name: 'Lindqvist',
    role: 'OWNER',
    approval_status: 'ACTIVE',
    store_id: 'store-6',
    store_name: 'Pure Botanics Apothecary',
    phone: '+46 8 123 456',
    created_at: '2026-04-10',
  },
  {
    id: 'usr-owner-7',
    email: 'kareem@damascusblades.com',
    first_name: 'Kareem',
    last_name: 'Barazi',
    role: 'OWNER',
    approval_status: 'ACTIVE',
    store_id: 'store-7',
    store_name: 'Damascus Steel & Blades',
    phone: '+963 11 333 4455',
    created_at: '2026-05-02',
  },
  {
    id: 'usr-owner-8',
    email: 'nadia@medglass.com',
    first_name: 'Nadia',
    last_name: 'Soler',
    role: 'OWNER',
    approval_status: 'ACTIVE',
    store_id: 'store-8',
    store_name: 'Mediterranean Glassworks',
    phone: '+34 96 123 7890',
    created_at: '2026-06-14',
  },
  {
    id: 'usr-owner-9',
    email: 'omar@alandalusrugs.com',
    first_name: 'Omar',
    last_name: 'Benali',
    role: 'OWNER',
    approval_status: 'ACTIVE',
    store_id: 'store-9',
    store_name: 'Al-Andalus Rugs & Kilims',
    phone: '+34 958 11 22 33',
    created_at: '2026-07-21',
  },
  {
    id: 'usr-owner-10',
    email: 'yusuf@copperfoundry.com',
    first_name: 'Yusuf',
    last_name: 'Demir',
    role: 'OWNER',
    approval_status: 'PENDING',
    store_id: 'store-10',
    store_name: 'Copper & Brass Foundry',
    phone: '+90 212 555 7788',
    created_at: '2026-08-11',
  },
  // Customers
  {
    id: 'usr-cust-1',
    email: 'customer@mwb.com',
    first_name: 'Amira',
    last_name: 'Khoury',
    role: 'CUSTOMER',
    approval_status: 'ACTIVE',
    phone: '+1 (555) 777-8899',
    created_at: '2026-09-01',
  },
  {
    id: 'usr-cust-2',
    email: 'julian.craft@domain.com',
    first_name: 'Julian',
    last_name: 'Reeves',
    role: 'CUSTOMER',
    approval_status: 'ACTIVE',
    phone: '+44 20 7946 0991',
    created_at: '2026-09-15',
  },
];

// ==========================================
// 3. CATEGORIES
// ==========================================
export const MOCK_CATEGORIES: MockCategory[] = [
  {
    id: 'cat-ceramics',
    name: 'Handcrafted Decor & Ceramics',
    slug: 'ceramics-decor',
    description: 'Wheel-thrown pottery, earthenware bowls, terracotta vessels, and glazed decorative vases.',
    product_count: 43,
  },
  {
    id: 'cat-textiles',
    name: 'Organic Textiles & Apparel',
    slug: 'textiles-apparel',
    description: 'Hand-loomed kilims, raw linen robes, plant-dyed throws, and artisanal embroideries.',
    product_count: 45,
  },
  {
    id: 'cat-leather',
    name: 'Bespoke Leather Goods',
    slug: 'leather-goods',
    description: 'Vegetable-tanned full-grain leather bags, minimalist wallets, belts, and travelers journal covers.',
    product_count: 18,
  },
  {
    id: 'cat-woodcraft',
    name: 'Fine Woodcraft & Carvings',
    slug: 'woodcraft-carvings',
    description: 'Aged olive wood serving boards, hand-carved mortar & pestles, and walnut keepsake boxes.',
    product_count: 22,
  },
  {
    id: 'cat-metalwork',
    name: 'Forged Metals & Blades',
    slug: 'metals-blades',
    description: 'Layered Damascus culinary chef knives, hammered copper Turkish pots, and cast brass hardware.',
    product_count: 23,
  },
  {
    id: 'cat-botanics',
    name: 'Natural Botanicals & Fragrance',
    slug: 'botanicals-fragrance',
    description: 'Cold-pressed artisan soaps, pure botanical extracts, beeswax candles, and natural amber oils.',
    product_count: 16,
  },
  {
    id: 'cat-glass',
    name: 'Artisan Glassware',
    slug: 'artisan-glassware',
    description: 'Free-blown recycled sea-glass tumblers, oil carafes, and lantern globes.',
    product_count: 14,
  },
];

// ==========================================
// 4. PRODUCTS (Curated catalog for 10 stores)
// ==========================================
export const MOCK_PRODUCTS: MockProduct[] = [
  // Store 1: Artisan Handcrafts
  {
    id: 'prod-101',
    store_id: 'store-1',
    store_name: 'Artisan Handcrafts',
    category_id: 'cat-ceramics',
    category_name: 'Handcrafted Decor & Ceramics',
    name: 'Tuscan Terracotta Amphora Vase',
    sku: 'AH-VAS-01',
    description: 'Wheel-thrown earthenware amphora finished with subtle chalky ash patina.',
    price: 8500, // $85.00
    original_price: 11000,
    stock: 24,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviews_count: 38,
    created_at: '2026-02-10',
  },
  {
    id: 'prod-102',
    store_id: 'store-1',
    store_name: 'Artisan Handcrafts',
    category_id: 'cat-ceramics',
    category_name: 'Handcrafted Decor & Ceramics',
    name: 'Glazed Stoneware Pasta Bowl (Set of 4)',
    sku: 'AH-BWL-04',
    description: 'Heavy stoneware bowls with hand-applied speckled oatmeal glaze. Microwave and dishwasher safe.',
    price: 12000, // $120.00
    stock: 15,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    reviews_count: 42,
    created_at: '2026-02-14',
  },
  {
    id: 'prod-103',
    store_id: 'store-1',
    store_name: 'Artisan Handcrafts',
    category_id: 'cat-ceramics',
    category_name: 'Handcrafted Decor & Ceramics',
    name: 'Sculptural Ceramic Candle Pedestal',
    sku: 'AH-CND-09',
    description: 'Hand-carved curved silhouette pedestal designed for wide pillar candles.',
    price: 4500,
    stock: 30,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviews_count: 19,
    created_at: '2026-03-01',
  },

  // Store 2: Heritage Textiles
  {
    id: 'prod-201',
    store_id: 'store-2',
    store_name: 'Heritage Textiles',
    category_id: 'cat-textiles',
    category_name: 'Organic Textiles & Apparel',
    name: 'Indigo-Dyed Loomed Linen Throw',
    sku: 'HT-LNN-01',
    description: '100% natural European flax linen dyed with fermented indigo leaves.',
    price: 14500, // $145.00
    original_price: 17500,
    stock: 18,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviews_count: 27,
    created_at: '2026-02-20',
  },
  {
    id: 'prod-202',
    store_id: 'store-2',
    store_name: 'Heritage Textiles',
    category_id: 'cat-textiles',
    category_name: 'Organic Textiles & Apparel',
    name: 'Hand-Woven Raw Cotton Scarf',
    sku: 'HT-SCF-07',
    description: 'Lightweight breathable organic cotton woven on wooden shuttle looms.',
    price: 5500,
    stock: 45,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviews_count: 31,
    created_at: '2026-03-02',
  },

  // Store 3: Nomad Leatherworks
  {
    id: 'prod-301',
    store_id: 'store-3',
    store_name: 'Nomad Leatherworks',
    category_id: 'cat-leather',
    category_name: 'Bespoke Leather Goods',
    name: 'Saddle-Stitched Voyager Leather Duffle',
    sku: 'NL-DUF-01',
    description: 'Full-grain 5oz vegetable-tanned Italian leather with solid antiqued brass buckles.',
    price: 34000, // $340.00
    original_price: 38000,
    stock: 8,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    reviews_count: 56,
    created_at: '2026-03-01',
  },
  {
    id: 'prod-302',
    store_id: 'store-3',
    store_name: 'Nomad Leatherworks',
    category_id: 'cat-leather',
    category_name: 'Bespoke Leather Goods',
    name: 'Bifold Minimalist Cardholder',
    sku: 'NL-WLT-03',
    description: 'Ultra-slim design holding 8 cards plus folded currency with hand-burnished edges.',
    price: 4800,
    stock: 50,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1473188557827-0b1a82f3ef80?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviews_count: 24,
    created_at: '2026-03-12',
  },

  // Store 5: Levant Olive Wood Craft
  {
    id: 'prod-501',
    store_id: 'store-5',
    store_name: 'Levant Olive Wood Craft',
    category_id: 'cat-woodcraft',
    category_name: 'Fine Woodcraft & Carvings',
    name: 'Live-Edge Olive Wood Charcuterie Board',
    sku: 'OW-BRD-01',
    description: 'Single solid slab of wild olive wood showcasing dramatic natural grain rings.',
    price: 9200,
    original_price: 11500,
    stock: 14,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviews_count: 48,
    created_at: '2026-03-25',
  },

  // Store 7: Damascus Steel & Blades
  {
    id: 'prod-701',
    store_id: 'store-7',
    store_name: 'Damascus Steel & Blades',
    category_id: 'cat-metalwork',
    category_name: 'Forged Metals & Blades',
    name: '8" Forged Damascus Santoku Chef Knife',
    sku: 'DS-KNF-08',
    description: '67-layer folded VG-10 steel core blade with desert ironwood and brass pins.',
    price: 21000, // $210.00
    original_price: 25000,
    stock: 10,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    reviews_count: 94,
    created_at: '2026-05-10',
  },

  // Store 9: Al-Andalus Rugs & Kilims
  {
    id: 'prod-901',
    store_id: 'store-9',
    store_name: 'Al-Andalus Rugs & Kilims',
    category_id: 'cat-textiles',
    category_name: 'Organic Textiles & Apparel',
    name: 'Geometric Tribal Wool Kilim Runner',
    sku: 'AR-RUG-09',
    description: 'Hand-knotted from mountain fleece wool with natural madder and pomegranate dyes.',
    price: 28000, // $280.00
    stock: 6,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviews_count: 36,
    created_at: '2026-07-25',
  },

  // Store 10: Copper & Brass Foundry
  {
    id: 'prod-1001',
    store_id: 'store-10',
    store_name: 'Copper & Brass Foundry',
    category_id: 'cat-metalwork',
    category_name: 'Forged Metals & Blades',
    name: 'Hand-Hammered Solid Copper Cezve Pot',
    sku: 'CB-POT-01',
    description: 'Traditional Turkish coffee pot lined with pure food-grade tin and carved walnut handle.',
    price: 6400,
    stock: 22,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviews_count: 21,
    created_at: '2026-08-15',
  },
];

// ==========================================
// 5. SPLIT ORDERS & SUB-ORDERS
// ==========================================
export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'ord-1001',
    order_number: 'MWB-2026-001',
    customer_id: 'usr-cust-1',
    customer_name: 'Amira Khoury',
    customer_email: 'customer@mwb.com',
    status: 'PROCESSING',
    total_amount: 23000, // $230.00
    currency: 'USD',
    shipping_address: {
      street: '742 Evergreen Terrace',
      city: 'Portland',
      country: 'United States',
      postal_code: '97201',
    },
    sub_orders: [
      {
        id: 'sub-ord-1001-A',
        store_id: 'store-1',
        store_name: 'Artisan Handcrafts',
        status: 'PROCESSING',
        subtotal: 8500,
        items_count: 1,
      },
      {
        id: 'sub-ord-1001-B',
        store_id: 'store-2',
        store_name: 'Heritage Textiles',
        status: 'SHIPPED',
        subtotal: 14500,
        items_count: 1,
      },
    ],
    items: [
      {
        product_id: 'prod-101',
        store_id: 'store-1',
        product_name: 'Tuscan Terracotta Amphora Vase',
        quantity: 1,
        unit_price: 8500,
        total_price: 8500,
      },
      {
        product_id: 'prod-201',
        store_id: 'store-2',
        product_name: 'Indigo-Dyed Loomed Linen Throw',
        quantity: 1,
        unit_price: 14500,
        total_price: 14500,
      },
    ],
    created_at: '2026-11-10T14:32:00Z',
  },
  {
    id: 'ord-1002',
    order_number: 'MWB-2026-002',
    customer_id: 'usr-cust-2',
    customer_name: 'Julian Reeves',
    customer_email: 'julian.craft@domain.com',
    status: 'DELIVERED',
    total_amount: 34000,
    currency: 'USD',
    shipping_address: {
      street: '12 Kensington Gardens',
      city: 'London',
      country: 'United Kingdom',
      postal_code: 'W8 4PX',
    },
    sub_orders: [
      {
        id: 'sub-ord-1002-A',
        store_id: 'store-3',
        store_name: 'Nomad Leatherworks',
        status: 'DELIVERED',
        subtotal: 34000,
        items_count: 1,
      },
    ],
    items: [
      {
        product_id: 'prod-301',
        store_id: 'store-3',
        product_name: 'Saddle-Stitched Voyager Leather Duffle',
        quantity: 1,
        unit_price: 34000,
        total_price: 34000,
      },
    ],
    created_at: '2026-11-05T09:15:00Z',
  },
];

// ==========================================
// 6. COMPLAINTS & DISPUTES
// ==========================================
export const MOCK_COMPLAINTS: MockComplaint[] = [
  {
    id: 'cmp-01',
    complaint_number: 'CMP-2026-88',
    order_id: 'ord-1001',
    store_id: 'store-1',
    store_name: 'Artisan Handcrafts',
    customer_name: 'Amira Khoury',
    customer_email: 'customer@mwb.com',
    reason: 'Shipping package arrived with a cosmetic chip in the terracotta base.',
    status: 'OPEN',
    priority: 'HIGH',
    created_at: '2026-11-11T16:20:00Z',
  },
  {
    id: 'cmp-02',
    complaint_number: 'CMP-2026-82',
    order_id: 'ord-1002',
    store_id: 'store-3',
    store_name: 'Nomad Leatherworks',
    customer_name: 'Julian Reeves',
    customer_email: 'julian.craft@domain.com',
    reason: 'Customer requested complimentary leather conditioner strap treatment.',
    status: 'RESOLVED',
    priority: 'LOW',
    created_at: '2026-11-07T11:00:00Z',
  },
];

// ==========================================
// 7. STORE EDIT REQUESTS
// ==========================================
export const MOCK_STORE_EDIT_REQUESTS: MockStoreEditRequest[] = [
  {
    id: 'edr-01',
    store_id: 'store-1',
    store_name: 'Artisan Handcrafts',
    owner_name: 'Elena Rostova',
    requested_changes: {
      tagline: 'Terracotta vases, fine oak dining ware, and custom ceramic commissions.',
      commission_rate: 8,
    },
    status: 'PENDING',
    submitted_at: '2026-11-12T10:00:00Z',
  },
  {
    id: 'edr-02',
    store_id: 'store-2',
    store_name: 'Heritage Textiles',
    owner_name: 'Marcus Vance',
    requested_changes: {
      category_name: 'Organic Textiles & Fine Apparel',
    },
    status: 'APPROVED',
    submitted_at: '2026-11-08T15:30:00Z',
  },
];

// ==========================================
// 8. ACTIVE COUPONS
// ==========================================
export const MOCK_COUPONS: MockCoupon[] = [
  {
    code: 'WELCOME10',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    min_order_amount: 5000,
    is_active: true,
    valid_until: '2026-12-31',
  },
  {
    code: 'ARTISAN20',
    discount_type: 'FIXED',
    discount_value: 2000, // $20.00 off
    min_order_amount: 10000,
    is_active: true,
    valid_until: '2026-12-31',
  },
];

// ==========================================
// Query Helpers for Frontend Screens
// ==========================================
export function getMockStores(): MockStore[] {
  return [...MOCK_STORES];
}

export function getMockStoreById(id: string): MockStore | undefined {
  return MOCK_STORES.find((s) => s.id === id || s.slug === id);
}

export function getMockProducts(): MockProduct[] {
  return [...MOCK_PRODUCTS];
}

export function getMockProductsByStore(storeId: string): MockProduct[] {
  return MOCK_PRODUCTS.filter((p) => p.store_id === storeId);
}

export function getMockCategories(): MockCategory[] {
  return [...MOCK_CATEGORIES];
}

export function getMockUsers(): MockUser[] {
  return [...MOCK_USERS];
}

export function getMockOrders(): MockOrder[] {
  return [...MOCK_ORDERS];
}

export function getMockComplaints(): MockComplaint[] {
  return [...MOCK_COMPLAINTS];
}

export function getMockStoreEditRequests(): MockStoreEditRequest[] {
  return [...MOCK_STORE_EDIT_REQUESTS];
}

export function getMockCoupons(): MockCoupon[] {
  return [...MOCK_COUPONS];
}
