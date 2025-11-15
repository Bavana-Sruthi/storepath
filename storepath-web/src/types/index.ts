// Location Types
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  timestamp?: number;
}

// Product Types
export interface ProductVariation {
  id: string;
  name: string;
  price: number;
  size?: string;
  color?: string;
  weight?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  basePrice: number;
  imageUrl?: string;
  variations?: ProductVariation[];
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

// Inventory Types
export interface InventoryItem {
  productId: string;
  quantity: number;
  price: number;
  variation?: string;
  lastUpdated: number;
  lowStockThreshold?: number;
}

// Store Types
export interface StoreHours {
  day: string;
  open: string;
  close: string;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  location: Location;
  address: string;
  phone?: string;
  email?: string;
  hours: StoreHours[];
  inventory: InventoryItem[];
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  ownerId: string;
  categories: string[];
  features?: string[]; // e.g., ["parking", "wheelchair_accessible"]
  lastInventoryUpdate: number;
  createdAt: number;
  indoorMap?: IndoorMap;
}

export interface IndoorMap {
  enabled: boolean;
  sections: IndoorSection[];
}

export interface IndoorSection {
  id: string;
  name: string;
  aisle?: string;
  productIds: string[];
}

// Extended Store with distance calculations
export interface StoreWithDistance extends Store {
  distance: number; // in km
  duration: number; // in minutes
  isOpen: boolean;
  accuracyScore: number;
}

// Search Types
export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDistance?: number;
  inStock?: boolean;
  sortBy?: 'distance' | 'price' | 'rating' | 'availability';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  product: Product;
  stores: StoreWithDistance[];
  alternatives?: Product[];
}

// Price Comparison Types
export interface OnlinePrice {
  source: 'amazon' | 'flipkart' | 'other';
  price: number;
  url: string;
  deliveryDays: number;
  inStock: boolean;
}

export interface PriceComparison {
  product: Product;
  nearbyStores: {
    store: StoreWithDistance;
    price: number;
    quantity: number;
  }[];
  onlinePrices: OnlinePrice[];
  recommendation: string;
}

// Shopping List Types
export interface ShoppingListItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  notes?: string;
  checked: boolean;
  priority?: 'low' | 'medium' | 'high';
  addedAt: number;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingListItem[];
  sharedWith?: string[]; // user IDs
  createdAt: number;
  updatedAt: number;
}

export interface OptimizedRoute {
  stores: StoreWithDistance[];
  totalDistance: number;
  totalDuration: number;
  order: number[];
  itemsCovered: {
    productId: string;
    storeId: string;
  }[];
  itemsMissing: string[];
}

// Reservation Types
export interface Reservation {
  id: string;
  userId: string;
  storeId: string;
  productId: string;
  quantity: number;
  expiresAt: number;
  status: 'active' | 'expired' | 'fulfilled' | 'cancelled';
  createdAt: number;
}

// Alert Types
export interface StockAlert {
  id: string;
  userId: string;
  productId: string;
  storeId?: string;
  notifyEmail?: boolean;
  notifyPush?: boolean;
  createdAt: number;
  triggered?: boolean;
}

// Price History Types
export interface PriceHistoryEntry {
  storeId: string;
  productId: string;
  price: number;
  timestamp: number;
}

// Review Types
export interface Review {
  id: string;
  storeId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: number;
  helpful: number;
}

// Receipt Types
export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Receipt {
  id: string;
  userId: string;
  storeId?: string;
  items: ReceiptItem[];
  total: number;
  date: number;
  imageUrl?: string;
  createdAt: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  role: 'customer' | 'store_owner' | 'admin';
  favoriteStores: string[];
  favoriteProducts: string[];
  familyAccountId?: string;
  createdAt: number;
  lastLocation?: Location;
}

// Analytics Types
export interface SearchAnalytics {
  productId: string;
  productName: string;
  searchCount: number;
  location: Location;
  timestamp: number;
}

export interface DemandHeatmapPoint {
  location: Location;
  weight: number;
  productCategory: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Favorite Types
export interface Favorite {
  id: string;
  userId: string;
  type: 'store' | 'product';
  itemId: string;
  addedAt: number;
}

// Offline Cache Types
export interface OfflineCache {
  lastLocation?: Location;
  stores: Store[];
  favorites: Favorite[];
  shoppingLists: ShoppingList[];
  lastUpdated: number;
}
