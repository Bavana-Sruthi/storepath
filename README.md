# 🛍️ StorePath - Smart Inventory + Store Locator & Navigation App

A full-stack web application built with Next.js 14 that helps users find products in nearby stores,
compare prices, and optimize shopping routes.

## ✨ Features

### 🎯 Core Features

- **GPS Location Detection** - Auto-detect user location with fallback manual input
- **Nearby Store Discovery** - Find stores within customizable radius with distance & ETA
- **Smart Search System** - Search by product name, store, or category with auto-suggestions
- **Store Inventory System** - Real-time inventory tracking with accuracy scores
- **Product Availability Checker** - See which stores have your desired products
- **Google Maps Integration** - Interactive map with route preview and navigation
- **Price Comparison** - Compare online (Amazon/Flipkart) vs nearby store prices

### 🚀 Advanced Features

- **AI-based Product Alternatives** - Get suggestions for similar products
- **Shopping List + Route Optimizer** - Find optimal route to visit multiple stores
- **Back-in-Stock Alerts** - Get notified when products become available
- **Price History Graphs** - Track price changes over time
- **Item Reservation** - Reserve items for 2 hours
- **Receipt Scanner (OCR)** - Extract products from receipt photos
- **Store Reviews** - Rate and review stores with photos
- **Offline Mode** - Cache data for offline access
- **Favorites & Quick Access** - Save favorite stores and products
- **Store Owner Dashboard** - Manage inventory with CSV bulk upload
- **Demand Heatmaps** - Visualize popular product searches
- **Family Account Sync** - Share shopping lists in real-time
- **Indoor Navigation** - Aisle mapping for supported stores

## 🏗️ Tech Stack

### Frontend

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS** for styling
- **ShadCN UI** components
- **Zustand** for state management
- **React Query** for data fetching
- **Recharts** for data visualization

### Backend & Services

- **Firebase** (Authentication, Firestore, Storage, Functions)
- **Google Maps Platform** (Maps, Places, Distance Matrix, Directions)
- **Tesseract.js** for OCR

### Development & Testing

- **Jest** for unit testing
- **React Testing Library** for component testing
- **ESLint** for code quality

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- Google Maps API key

### Step 1: Clone the repository

```bash
git clone <repository-url>
cd storepath
```

### Step 2: Install dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Step 4: Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database**
4. Enable **Authentication** (Email/Password)
5. Enable **Storage**
6. Download service account key and place in project root

### Step 5: Set up Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
    - Maps JavaScript API
    - Places API
    - Distance Matrix API
    - Directions API
    - Geocoding API
4. Create API key and add to `.env.local`

### Step 6: Seed demo data

```bash
npm run seed-data
# or
npx ts-node scripts/seedData.ts
```

### Step 7: Run development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 📁 Project Structure

```
storepath/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── stores/        # Store endpoints
│   │   │   ├── products/      # Product endpoints
│   │   │   ├── shopping-lists/# Shopping list endpoints
│   │   │   ├── reservations/  # Reservation endpoints
│   │   │   └── receipts/      # Receipt OCR endpoints
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── providers.tsx      # App providers
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── SearchBar.tsx
│   │   ├── StoreCard.tsx
│   │   ├── ProductCard.tsx
│   │   ├── MapView.tsx
│   │   ├── PriceComparisonCard.tsx
│   │   ├── PriceHistoryChart.tsx
│   │   └── ShoppingListCard.tsx
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useGeolocation.ts
│   │   ├── useNearbyStores.ts
│   │   ├── useProductSearch.ts
│   │   ├── useGoogleMaps.ts
│   │   └── useOfflineCache.ts
│   │
│   ├── lib/                  # Utilities and configurations
│   │   ├── firebase.ts       # Firebase setup
│   │   ├── api.ts           # API client
│   │   ├── utils.ts         # Helper functions
│   │   └── demoData.ts      # Demo seed data
│   │
│   ├── store/               # State management
│   │   └── useStore.ts      # Zustand store
│   │
│   └── types/               # TypeScript types
│       └── index.ts
│
├── __tests__/               # Test files
│   ├── utils.test.ts
│   ├── components/
│   └── api/
│
├── scripts/                 # Utility scripts
│   └── seedData.ts         # Data seeding script
│
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Firebase Setup for Production

1. Initialize Firebase in your project:

```bash
firebase init
```

2. Select:
    - Firestore
    - Storage
    - Functions (optional)

3. Deploy Firebase rules:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### Environment Variables for Production

Add all variables from `.env.local` to your Vercel project settings.

## 🔑 API Endpoints

### Stores

- `GET /api/stores` - Get all stores
- `GET /api/stores/nearby` - Get nearby stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create store
- `PUT /api/stores/:id` - Update store
- `PUT /api/stores/:id/inventory` - Update inventory

### Products

- `GET /api/products` - Get all products
- `POST /api/products/search` - Search products
- `GET /api/products/suggestions` - Get search suggestions
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/:id/alternatives` - Get product alternatives
- `POST /api/products/availability` - Check product availability

### Shopping Lists

- `GET /api/shopping-lists` - Get user's shopping lists
- `POST /api/shopping-lists` - Create shopping list
- `PUT /api/shopping-lists/:id` - Update shopping list
- `DELETE /api/shopping-lists/:id` - Delete shopping list
- `POST /api/shopping-lists/:id/optimize` - Optimize shopping route

### Reservations

- `POST /api/reservations` - Create reservation
- `GET /api/reservations` - Get user's reservations
- `PUT /api/reservations/:id/cancel` - Cancel reservation
- `PUT /api/reservations/:id/fulfill` - Fulfill reservation

### Other

- `POST /api/receipts/upload` - Upload receipt for OCR
- `POST /api/reviews` - Create review
- `GET /api/reviews/store/:id` - Get store reviews
- `POST /api/analytics/search` - Track search
- `GET /api/analytics/heatmap` - Get demand heatmap

## 🎨 UI/UX Features

- **Modern Design** - Soft colors (blues, purples, pinks, greens)
- **Floating Components** - Cards with shadows and smooth transitions
- **Responsive Layout** - Works on mobile, tablet, and desktop
- **Interactive Maps** - Live location tracking with store markers
- **Smooth Animations** - Fade-in, slide-up effects
- **Toast Notifications** - User feedback for actions
- **Loading States** - Spinners and skeletons

## 📱 Pages

- `/` - Home with nearby stores
- `/search` - Advanced product search
- `/stores/:id` - Store details
- `/products/:id` - Product details
- `/compare` - Price comparison
- `/shopping-lists` - Shopping lists management
- `/navigation/:id` - Route navigation
- `/dashboard` - Store owner dashboard
- `/login` - Authentication
- `/settings` - User settings

## 🔒 Security

- Firebase Authentication for user management
- API route protection with authentication middleware
- Firestore security rules for data access control
- Environment variables for sensitive keys
- CORS configuration for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Google Maps Platform
- Firebase
- Next.js Team
- ShadCN UI
- All open-source contributors

## 📞 Support

For issues or questions:

- Open an issue on GitHub
- Contact: support@storepath.com

---

Built with ❤️ using Next.js 14, Firebase, and Google Maps
