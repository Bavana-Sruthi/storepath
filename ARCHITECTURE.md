# 🏗️ StorePath - System Architecture

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Next.js 14 App (React 18)                    │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │   Pages     │  │  Components  │  │   Hooks         │ │ │
│  │  │  - Home     │  │  - SearchBar │  │  - Geolocation  │ │ │
│  │  │  - Search   │  │  - StoreCard │  │  - NearbyStores │ │ │
│  │  │  - Store    │  │  - MapView   │  │  - GoogleMaps   │ │ │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                   STATE MANAGEMENT                        │ │
│  │         Zustand (Global) + React Query (Server)          │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐ │
│  │  Stores  │  │ Products │  │  Shopping │  │  Analytics   │ │
│  │   API    │  │   API    │  │  List API │  │     API      │ │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐ │
│  │  Price   │  │ Reviews  │  │  Receipt  │  │ Reservations │ │
│  │   API    │  │   API    │  │  OCR API  │  │     API      │ │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                           │
│  ┌──────────────────┐  ┌───────────────────┐  ┌─────────────┐ │
│  │     Firebase     │  │   Google Maps     │  │  Tesseract  │ │
│  │  - Firestore DB  │  │  - Maps JS API    │  │  - OCR      │ │
│  │  - Auth          │  │  - Places API     │  │             │ │
│  │  - Storage       │  │  - Distance API   │  │             │ │
│  │  - Functions     │  │  - Directions API │  │             │ │
│  └──────────────────┘  └───────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### User Location → Nearby Stores Flow

```
User Opens App
      ↓
Browser Geolocation API
      ↓
useGeolocation Hook
      ↓
Store Location in Zustand
      ↓
useNearbyStores Hook (React Query)
      ↓
GET /api/stores/nearby
      ↓
Firestore: Query Stores
      ↓
Calculate Distances (Haversine)
      ↓
Sort by Distance
      ↓
Return StoreWithDistance[]
      ↓
Cache in React Query (5 min)
      ↓
Display in StoreCard Components
      ↓
Show on MapView with Markers
```

### Product Search Flow

```
User Types Query
      ↓
SearchBar Component (debounced 500ms)
      ↓
GET /api/products/suggestions
      ↓
Display Auto-suggestions
      ↓
User Submits Search
      ↓
POST /api/products/search
      ↓
Firestore: Query Products
      ↓
Filter by Category, Price, etc.
      ↓
Find Stores with Product
      ↓
Sort by Selected Criteria
      ↓
Return SearchResult[]
      ↓
Display ProductCard + Available Stores
```

### Shopping List Route Optimization Flow

```
User Creates Shopping List
      ↓
Add Items to List
      ↓
Click "Optimize Route"
      ↓
POST /api/shopping-lists/:id/optimize
      ↓
Fetch All Stores from Firestore
      ↓
Find Stores with Items
      ↓
Greedy Algorithm:
  1. Select store with most items
  2. Mark items as covered
  3. Repeat until all covered
      ↓
Nearest Neighbor Algorithm:
  1. Start from user location
  2. Find nearest uncovered store
  3. Add to route
  4. Repeat
      ↓
Calculate Total Distance & Time
      ↓
Return OptimizedRoute
      ↓
Display on Map with Numbered Markers
```

---

## 🗄️ Database Schema (Firestore)

### Collections Structure

```
firestore/
│
├── stores/
│   └── {storeId}
│       ├── name: string
│       ├── location: { lat, lng }
│       ├── address: string
│       ├── phone: string
│       ├── hours: StoreHours[]
│       ├── inventory: InventoryItem[]
│       ├── rating: number
│       ├── reviewCount: number
│       ├── ownerId: string
│       ├── categories: string[]
│       ├── lastInventoryUpdate: timestamp
│       └── indoorMap: IndoorMap (optional)
│
├── products/
│   └── {productId}
│       ├── name: string
│       ├── description: string
│       ├── category: string
│       ├── brand: string
│       ├── basePrice: number
│       ├── imageUrl: string
│       ├── variations: ProductVariation[]
│       ├── tags: string[]
│       └── timestamps
│
├── users/
│   └── {userId}
│       ├── email: string
│       ├── name: string
│       ├── role: 'customer' | 'store_owner' | 'admin'
│       ├── favoriteStores: string[]
│       ├── favoriteProducts: string[]
│       ├── familyAccountId: string
│       └── lastLocation: Location
│
├── shoppingLists/
│   └── {listId}
│       ├── userId: string
│       ├── name: string
│       ├── items: ShoppingListItem[]
│       ├── sharedWith: string[]
│       └── timestamps
│
├── reservations/
│   └── {reservationId}
│       ├── userId: string
│       ├── storeId: string
│       ├── productId: string
│       ├── quantity: number
│       ├── status: enum
│       ├── expiresAt: timestamp
│       └── createdAt: timestamp
│
├── reviews/
│   └── {reviewId}
│       ├── storeId: string
│       ├── userId: string
│       ├── rating: number (1-5)
│       ├── comment: string
│       ├── photos: string[]
│       ├── helpful: number
│       └── createdAt: timestamp
│
├── alerts/
│   └── {alertId}
│       ├── userId: string
│       ├── productId: string
│       ├── storeId: string (optional)
│       ├── notifyEmail: boolean
│       ├── triggered: boolean
│       └── createdAt: timestamp
│
├── receipts/
│   └── {receiptId}
│       ├── userId: string
│       ├── storeId: string (optional)
│       ├── items: ReceiptItem[]
│       ├── total: number
│       ├── imageUrl: string
│       └── createdAt: timestamp
│
├── priceHistory/
│   └── {entryId}
│       ├── storeId: string
│       ├── productId: string
│       ├── price: number
│       └── timestamp: number
│
└── searchAnalytics/
    └── {analyticsId}
        ├── productId: string
        ├── productName: string
        ├── searchCount: number
        ├── location: { lat, lng }
        └── timestamp: number
```

---

## 🔌 API Endpoint Structure

### REST API Design

```
/api/
├── stores/
│   ├── GET    /                    # All stores
│   ├── POST   /                    # Create store
│   ├── GET    /nearby              # Nearby stores
│   ├── GET    /:id                 # Store details
│   ├── PUT    /:id                 # Update store
│   └── PUT    /:id/inventory       # Update inventory
│
├── products/
│   ├── GET    /                    # All products
│   ├── POST   /search              # Search products
│   ├── GET    /suggestions         # Auto-suggestions
│   ├── GET    /:id                 # Product details
│   ├── GET    /:id/alternatives    # AI alternatives
│   └── POST   /availability        # Check availability
│
├── shopping-lists/
│   ├── GET    /                    # User's lists
│   ├── POST   /                    # Create list
│   ├── GET    /:id                 # List details
│   ├── PUT    /:id                 # Update list
│   ├── DELETE /:id                 # Delete list
│   ├── POST   /:id/optimize        # Optimize route
│   └── POST   /:id/share           # Share list
│
├── reservations/
│   ├── GET    /                    # User reservations
│   ├── POST   /                    # Create reservation
│   ├── PUT    /:id/cancel          # Cancel reservation
│   └── PUT    /:id/fulfill         # Fulfill reservation
│
├── reviews/
│   ├── GET    /                    # Store reviews
│   ├── POST   /                    # Create review
│   ├── POST   /:id/helpful         # Mark helpful
│   └── POST   /:id/photos          # Upload photos
│
├── alerts/
│   ├── GET    /                    # User alerts
│   ├── POST   /                    # Create alert
│   └── DELETE /:id                 # Delete alert
│
├── receipts/
│   ├── GET    /                    # User receipts
│   ├── POST   /upload              # OCR upload
│   └── GET    /:id                 # Receipt details
│
├── price/
│   ├── POST   /compare             # Price comparison
│   └── GET    /history             # Price history
│
├── analytics/
│   ├── POST   /search              # Track search
│   ├── GET    /heatmap             # Demand heatmap
│   └── GET    /store/:id           # Store insights
│
└── auth/
    ├── POST   /login               # User login
    ├── POST   /register            # User signup
    ├── POST   /logout              # User logout
    └── GET    /me                  # Current user
```

---

## 🧩 Component Hierarchy

```
App (layout.tsx)
├── Providers (React Query + Toaster)
│
└── Page (page.tsx)
    ├── Header
    │   ├── Logo
    │   ├── SearchBar
    │   │   └── Suggestions Dropdown
    │   └── View Toggle Buttons
    │
    ├── Main Content
    │   ├── List View
    │   │   └── StoreCard[]
    │   │       ├── Store Info
    │   │       ├── Distance/Time
    │   │       ├── Rating Badge
    │   │       ├── Favorite Button
    │   │       └── Navigate Button
    │   │
    │   ├── Grid View
    │   │   └── StoreCard[] (in grid)
    │   │
    │   └── Map View
    │       └── MapView Component
    │           ├── User Marker
    │           ├── Store Markers
    │           ├── Info Windows
    │           └── Route Polyline
    │
    └── Bottom Navigation
        ├── Search Tab
        ├── Nearby Tab
        ├── Lists Tab
        └── More Tab
```

---

## 🔐 Security Architecture

### Authentication Flow

```
User → Login Form
      ↓
Firebase Auth
      ↓
ID Token Generated
      ↓
Stored in localStorage
      ↓
Included in API Requests (Authorization header)
      ↓
API Route: Verify Token
      ↓
Access Firestore with User Context
```

### Security Rules (Firestore)

```javascript
// Stores: Public read, owner write
match /stores/{storeId} {
  allow read: if true;
  allow write: if request.auth.uid == resource.data.ownerId;
}

// Products: Public read, authenticated write
match /products/{productId} {
  allow read: if true;
  allow write: if request.auth != null;
}

// Shopping Lists: Owner + shared users access
match /shoppingLists/{listId} {
  allow read, write: if request.auth.uid == resource.data.userId ||
                       request.auth.uid in resource.data.sharedWith;
}

// Reviews: Public read, owner write
match /reviews/{reviewId} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update, delete: if request.auth.uid == resource.data.userId;
}
```

---

## 🚀 Performance Optimization Strategy

### Client-Side

1. **React Query Caching**
    - 5-min stale time for stores
    - 1-min stale time for products
    - 10-min refetch interval

2. **Debouncing**
    - Search input: 500ms
    - Location updates: 1000ms

3. **Code Splitting**
    - Dynamic imports for heavy components
    - Route-based splitting (automatic)

4. **Image Optimization**
    - Next.js Image component
    - WebP format with fallbacks
    - Lazy loading

### Server-Side

1. **Firestore Optimization**
    - Composite indexes for complex queries
    - Limit query results (pagination)
    - Cache frequently accessed data

2. **API Route Optimization**
    - Minimize database calls
    - Batch operations where possible
    - Return only required fields

3. **Google Maps Optimization**
    - Load API only when needed
    - Reuse map instances
    - Debounce marker updates

---

## 📱 Responsive Design Strategy

### Breakpoints

```
Mobile:    < 768px   (sm)
Tablet:    768px     (md)
Desktop:   1024px    (lg)
Large:     1280px    (xl)
```

### Adaptive Components

- **SearchBar**: Full width on mobile, fixed width on desktop
- **StoreCard**: Stack on mobile, grid on tablet/desktop
- **MapView**: Full height on mobile, partial on desktop
- **Navigation**: Bottom bar on mobile, sidebar on desktop

---

## 🔄 Real-Time Sync Architecture

### Shopping List Sync

```
User A adds item
      ↓
Update Firestore
      ↓
Firestore onSnapshot listener
      ↓
User B receives update
      ↓
React Query invalidates cache
      ↓
UI updates automatically
```

### Location Tracking

```
watchPosition (browser API)
      ↓
Update every 10 seconds
      ↓
Store in Zustand
      ↓
Trigger nearby stores refetch
      ↓
Update map markers
```

---

## 🧪 Testing Strategy

### Unit Tests

- Utility functions (utils.ts)
- State management (store)
- Custom hooks

### Component Tests

- Render testing
- User interaction testing
- Props validation

### Integration Tests

- API route testing
- Database operations
- External API mocking

### E2E Tests (Future)

- User flows
- Critical paths
- Cross-browser testing

---

This architecture ensures **scalability**, **maintainability**, and **performance** for StorePath!
