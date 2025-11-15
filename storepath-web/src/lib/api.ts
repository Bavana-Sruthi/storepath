import axios from 'axios';
import {
  Store,
  StoreWithDistance,
  Product,
  SearchFilters,
  SearchResult,
  PriceComparison,
  ShoppingList,
  OptimizedRoute,
  Reservation,
  StockAlert,
  Review,
  Receipt,
  Location,
  ApiResponse,
  PaginatedResponse,
  PriceHistoryEntry,
  SearchAnalytics,
  DemandHeatmapPoint,
} from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Stores API
export const storesApi = {
  getNearby: async (
    location: Location,
    radius: number = 10
  ): Promise<StoreWithDistance[]> => {
    const { data } = await api.get('/stores/nearby', {
      params: {
        lat: location.lat,
        lng: location.lng,
        radius,
      },
    });
    return data.data;
  },

  getById: async (id: string): Promise<Store> => {
    const { data } = await api.get(`/stores/${id}`);
    return data.data;
  },

  getAll: async (): Promise<Store[]> => {
    const { data } = await api.get('/stores');
    return data.data;
  },

  create: async (store: Partial<Store>): Promise<Store> => {
    const { data } = await api.post('/stores', store);
    return data.data;
  },

  update: async (id: string, updates: Partial<Store>): Promise<Store> => {
    const { data } = await api.put(`/stores/${id}`, updates);
    return data.data;
  },

  updateInventory: async (
    storeId: string,
    inventory: any[]
  ): Promise<void> => {
    await api.put(`/stores/${storeId}/inventory`, { inventory });
  },

  uploadCSV: async (storeId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await api.post(`/stores/${storeId}/inventory/csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Products API
export const productsApi = {
  search: async (filters: SearchFilters): Promise<SearchResult[]> => {
    const { data } = await api.post('/products/search', filters);
    return data.data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  },

  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get('/products');
    return data.data;
  },

  getByCategory: async (category: string): Promise<Product[]> => {
    const { data } = await api.get(`/products/category/${category}`);
    return data.data;
  },

  checkAvailability: async (
    productId: string,
    location: Location
  ): Promise<StoreWithDistance[]> => {
    const { data } = await api.post('/products/availability', {
      productId,
      location,
    });
    return data.data;
  },

  getAlternatives: async (productId: string): Promise<Product[]> => {
    const { data } = await api.get(`/products/${productId}/alternatives`);
    return data.data;
  },

  getSuggestions: async (query: string): Promise<string[]> => {
    const { data } = await api.get('/products/suggestions', {
      params: { q: query },
    });
    return data.data;
  },
};

// Price Comparison API
export const priceApi = {
  compare: async (productId: string, location: Location): Promise<PriceComparison> => {
    const { data } = await api.post('/price/compare', {
      productId,
      location,
    });
    return data.data;
  },

  getHistory: async (
    productId: string,
    storeId?: string
  ): Promise<PriceHistoryEntry[]> => {
    const { data } = await api.get('/price/history', {
      params: { productId, storeId },
    });
    return data.data;
  },
};

// Shopping List API
export const shoppingListApi = {
  getAll: async (): Promise<ShoppingList[]> => {
    const { data } = await api.get('/shopping-lists');
    return data.data;
  },

  getById: async (id: string): Promise<ShoppingList> => {
    const { data } = await api.get(`/shopping-lists/${id}`);
    return data.data;
  },

  create: async (list: Partial<ShoppingList>): Promise<ShoppingList> => {
    const { data } = await api.post('/shopping-lists', list);
    return data.data;
  },

  update: async (
    id: string,
    updates: Partial<ShoppingList>
  ): Promise<ShoppingList> => {
    const { data } = await api.put(`/shopping-lists/${id}`, updates);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/shopping-lists/${id}`);
  },

  optimizeRoute: async (
    listId: string,
    location: Location
  ): Promise<OptimizedRoute> => {
    const { data } = await api.post(`/shopping-lists/${listId}/optimize`, {
      location,
    });
    return data.data;
  },

  share: async (listId: string, userIds: string[]): Promise<void> => {
    await api.post(`/shopping-lists/${listId}/share`, { userIds });
  },
};

// Reservations API
export const reservationsApi = {
  create: async (
    productId: string,
    storeId: string,
    quantity: number
  ): Promise<Reservation> => {
    const { data } = await api.post('/reservations', {
      productId,
      storeId,
      quantity,
    });
    return data.data;
  },

  getAll: async (): Promise<Reservation[]> => {
    const { data } = await api.get('/reservations');
    return data.data;
  },

  cancel: async (id: string): Promise<void> => {
    await api.put(`/reservations/${id}/cancel`);
  },

  fulfill: async (id: string): Promise<void> => {
    await api.put(`/reservations/${id}/fulfill`);
  },
};

// Stock Alerts API
export const alertsApi = {
  create: async (alert: Partial<StockAlert>): Promise<StockAlert> => {
    const { data } = await api.post('/alerts', alert);
    return data.data;
  },

  getAll: async (): Promise<StockAlert[]> => {
    const { data } = await api.get('/alerts');
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/alerts/${id}`);
  },
};

// Reviews API
export const reviewsApi = {
  getByStore: async (storeId: string): Promise<Review[]> => {
    const { data } = await api.get(`/reviews/store/${storeId}`);
    return data.data;
  },

  create: async (review: Partial<Review>): Promise<Review> => {
    const { data } = await api.post('/reviews', review);
    return data.data;
  },

  markHelpful: async (id: string): Promise<void> => {
    await api.post(`/reviews/${id}/helpful`);
  },

  uploadPhotos: async (reviewId: string, files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));
    const { data } = await api.post(`/reviews/${reviewId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  },
};

// Receipt OCR API
export const receiptApi = {
  upload: async (file: File): Promise<Receipt> => {
    const formData = new FormData();
    formData.append('receipt', file);
    const { data } = await api.post('/receipts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  },

  getAll: async (): Promise<Receipt[]> => {
    const { data } = await api.get('/receipts');
    return data.data;
  },

  getById: async (id: string): Promise<Receipt> => {
    const { data } = await api.get(`/receipts/${id}`);
    return data.data;
  },
};

// Analytics API
export const analyticsApi = {
  trackSearch: async (
    productId: string,
    productName: string,
    location: Location
  ): Promise<void> => {
    await api.post('/analytics/search', {
      productId,
      productName,
      location,
    });
  },

  getHeatmap: async (
    category?: string
  ): Promise<DemandHeatmapPoint[]> => {
    const { data } = await api.get('/analytics/heatmap', {
      params: { category },
    });
    return data.data;
  },

  getStoreInsights: async (storeId: string): Promise<any> => {
    const { data } = await api.get(`/analytics/store/${storeId}`);
    return data.data;
  },
};

// Favorites API
export const favoritesApi = {
  addStore: async (storeId: string): Promise<void> => {
    await api.post('/favorites/stores', { storeId });
  },

  removeStore: async (storeId: string): Promise<void> => {
    await api.delete(`/favorites/stores/${storeId}`);
  },

  addProduct: async (productId: string): Promise<void> => {
    await api.post('/favorites/products', { productId });
  },

  removeProduct: async (productId: string): Promise<void> => {
    await api.delete(`/favorites/products/${productId}`);
  },

  getAll: async (): Promise<any> => {
    const { data } = await api.get('/favorites');
    return data.data;
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<any> => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data.data;
  },

  register: async (
    email: string,
    password: string,
    name: string,
    role: string
  ): Promise<any> => {
    const { data } = await api.post('/auth/register', {
      email,
      password,
      name,
      role,
    });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('authToken');
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<any> => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
};

// Google Maps API utilities
export const mapsApi = {
  getDirections: async (
    origin: Location,
    destination: Location
  ): Promise<any> => {
    const { data } = await api.post('/maps/directions', {
      origin,
      destination,
    });
    return data.data;
  },

  getDistanceMatrix: async (
    origins: Location[],
    destinations: Location[]
  ): Promise<any> => {
    const { data } = await api.post('/maps/distance-matrix', {
      origins,
      destinations,
    });
    return data.data;
  },

  geocode: async (address: string): Promise<Location> => {
    const { data } = await api.get('/maps/geocode', {
      params: { address },
    });
    return data.data;
  },

  reverseGeocode: async (location: Location): Promise<string> => {
    const { data } = await api.post('/maps/reverse-geocode', location);
    return data.data;
  },
};

export default api;
