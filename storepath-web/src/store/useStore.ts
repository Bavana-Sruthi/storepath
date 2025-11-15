import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Location,
  User,
  Store,
  Product,
  ShoppingList,
  Favorite,
  StoreWithDistance,
} from '@/types';

interface AppState {
  // User & Auth
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;

  // Location
  userLocation: Location | null;
  setUserLocation: (location: Location) => void;
  locationPermission: 'granted' | 'denied' | 'prompt';
  setLocationPermission: (permission: 'granted' | 'denied' | 'prompt') => void;

  // Stores
  nearbyStores: StoreWithDistance[];
  setNearbyStores: (stores: StoreWithDistance[]) => void;
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;

  // Products
  searchResults: Product[];
  setSearchResults: (results: Product[]) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Shopping Lists
  shoppingLists: ShoppingList[];
  setShoppingLists: (lists: ShoppingList[]) => void;
  activeShoppingList: ShoppingList | null;
  setActiveShoppingList: (list: ShoppingList | null) => void;
  addToShoppingList: (listId: string, productId: string, productName: string, quantity: number) => void;
  removeFromShoppingList: (listId: string, itemId: string) => void;
  toggleShoppingItem: (listId: string, itemId: string) => void;

  // Favorites
  favoriteStores: string[];
  favoriteProducts: string[];
  addFavoriteStore: (storeId: string) => void;
  removeFavoriteStore: (storeId: string) => void;
  addFavoriteProduct: (productId: string) => void;
  removeFavoriteProduct: (productId: string) => void;
  isFavoriteStore: (storeId: string) => boolean;
  isFavoriteProduct: (productId: string) => boolean;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mapView: boolean;
  setMapView: (view: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Offline Cache
  lastSync: number;
  setLastSync: (timestamp: number) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  userLocation: null,
  locationPermission: 'prompt' as const,
  nearbyStores: [],
  selectedStore: null,
  searchResults: [],
  selectedProduct: null,
  shoppingLists: [],
  activeShoppingList: null,
  favoriteStores: [],
  favoriteProducts: [],
  sidebarOpen: false,
  mapView: false,
  searchQuery: '',
  lastSync: 0,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // User & Auth
      setUser: (user) =>
        set({ user, isAuthenticated: user !== null }),

      // Location
      setUserLocation: (location) =>
        set({ userLocation: location }),
      
      setLocationPermission: (permission) =>
        set({ locationPermission: permission }),

      // Stores
      setNearbyStores: (stores) =>
        set({ nearbyStores: stores }),
      
      setSelectedStore: (store) =>
        set({ selectedStore: store }),

      // Products
      setSearchResults: (results) =>
        set({ searchResults: results }),
      
      setSelectedProduct: (product) =>
        set({ selectedProduct: product }),

      // Shopping Lists
      setShoppingLists: (lists) =>
        set({ shoppingLists: lists }),
      
      setActiveShoppingList: (list) =>
        set({ activeShoppingList: list }),
      
      addToShoppingList: (listId, productId, productName, quantity) =>
        set((state) => {
          const lists = state.shoppingLists.map((list) => {
            if (list.id === listId) {
              const newItem = {
                id: `${Date.now()}-${Math.random()}`,
                productId,
                productName,
                quantity,
                checked: false,
                addedAt: Date.now(),
              };
              return {
                ...list,
                items: [...list.items, newItem],
                updatedAt: Date.now(),
              };
            }
            return list;
          });
          
          const activeList = lists.find((l) => l.id === listId) || null;
          return { shoppingLists: lists, activeShoppingList: activeList };
        }),
      
      removeFromShoppingList: (listId, itemId) =>
        set((state) => {
          const lists = state.shoppingLists.map((list) => {
            if (list.id === listId) {
              return {
                ...list,
                items: list.items.filter((item) => item.id !== itemId),
                updatedAt: Date.now(),
              };
            }
            return list;
          });
          
          const activeList = lists.find((l) => l.id === listId) || null;
          return { shoppingLists: lists, activeShoppingList: activeList };
        }),
      
      toggleShoppingItem: (listId, itemId) =>
        set((state) => {
          const lists = state.shoppingLists.map((list) => {
            if (list.id === listId) {
              return {
                ...list,
                items: list.items.map((item) =>
                  item.id === itemId
                    ? { ...item, checked: !item.checked }
                    : item
                ),
                updatedAt: Date.now(),
              };
            }
            return list;
          });
          
          const activeList = lists.find((l) => l.id === listId) || null;
          return { shoppingLists: lists, activeShoppingList: activeList };
        }),

      // Favorites
      addFavoriteStore: (storeId) =>
        set((state) => ({
          favoriteStores: [...state.favoriteStores, storeId],
        })),
      
      removeFavoriteStore: (storeId) =>
        set((state) => ({
          favoriteStores: state.favoriteStores.filter((id) => id !== storeId),
        })),
      
      addFavoriteProduct: (productId) =>
        set((state) => ({
          favoriteProducts: [...state.favoriteProducts, productId],
        })),
      
      removeFavoriteProduct: (productId) =>
        set((state) => ({
          favoriteProducts: state.favoriteProducts.filter((id) => id !== productId),
        })),
      
      isFavoriteStore: (storeId) =>
        get().favoriteStores.includes(storeId),
      
      isFavoriteProduct: (productId) =>
        get().favoriteProducts.includes(productId),

      // UI State
      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }),
      
      setMapView: (view) =>
        set({ mapView: view }),
      
      setSearchQuery: (query) =>
        set({ searchQuery: query }),

      // Offline Cache
      setLastSync: (timestamp) =>
        set({ lastSync: timestamp }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'storepath-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        favoriteStores: state.favoriteStores,
        favoriteProducts: state.favoriteProducts,
        userLocation: state.userLocation,
        shoppingLists: state.shoppingLists,
        lastSync: state.lastSync,
      }),
    }
  )
);
