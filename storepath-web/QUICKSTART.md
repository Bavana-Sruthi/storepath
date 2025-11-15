# 🚀 StorePath - Quick Start Guide

Get StorePath running in under 10 minutes!

## ⚡ Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Firebase account** (free tier works)
- **Google Cloud account** (for Maps API)

## 📋 Step-by-Step Setup

### 1️⃣ Install Dependencies (2 min)

```bash
cd storepath
npm install
```

### 2️⃣ Firebase Setup (3 min)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" → Enter name → Create
3. Click "Web" icon (</>) → Register app
4. Copy config values

5. Enable Firestore:
    - Build → Firestore Database → Create database
    - Start in **test mode** (change later)

6. Enable Authentication:
    - Build → Authentication → Get started
    - Enable "Email/Password"

7. Enable Storage:
    - Build → Storage → Get started

### 3️⃣ Google Maps Setup (2 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable APIs:
    - Maps JavaScript API
    - Places API
    - Distance Matrix API
    - Directions API
    - Geocoding API

4. Create API Key:
    - APIs & Services → Credentials
    - Create Credentials → API Key
    - Copy the key

### 4️⃣ Environment Variables (1 min)

Create `.env.local` file in root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

### 5️⃣ Seed Demo Data (1 min)

```bash
npx ts-node scripts/seedData.ts
```

This creates:

- 5 demo stores in Bangalore area
- 15 products across categories
- Inventory for each store

### 6️⃣ Run Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## ✅ Verify Everything Works

### Test Location Detection

1. Allow location access when prompted
2. Should see "Getting your location..."
3. Map should center on your location

### Test Store Discovery

1. Should see nearby stores (or demo stores if in India)
2. Click on store cards
3. Try "Navigate" button

### Test Search

1. Type in search bar (e.g., "milk", "bread")
2. Should see auto-suggestions
3. Results should appear

### Test Map View

1. Click map icon in header
2. Should see interactive Google Map
3. Click store markers

## 🛠️ Troubleshooting

### "Location not found"

- **Solution**: Enable browser location permissions
- Chrome: Site Settings → Location → Allow

### "Map not loading"

- **Solution**: Check Google Maps API key
- Verify APIs are enabled
- Check browser console for errors

### "No stores found"

- **Solution**: Seed data might not have loaded
- Run seed script again
- Check Firebase Console → Firestore

### "Firebase not initialized"

- **Solution**: Check environment variables
- Ensure `.env.local` exists
- Restart dev server after adding env vars

### Build errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## 📱 Test on Mobile

### Local Network Testing

1. Find your computer's IP address
    - Windows: `ipconfig`
    - Mac/Linux: `ifconfig`
2. On mobile browser: `http://YOUR_IP:3000`
3. Allow location access

### Features to Test on Mobile

- ✅ Touch-friendly UI
- ✅ Bottom navigation
- ✅ Swipe gestures on map
- ✅ Location tracking
- ✅ Responsive layouts

## 🎨 Customize Demo Data

Edit `src/lib/demoData.ts`:

```typescript
// Change store locations
const demoStores = [
  {
    name: 'Your Store Name',
    location: { lat: YOUR_LAT, lng: YOUR_LNG },
    // ... other fields
  }
];

// Add products
const demoProducts = [
  {
    name: 'Your Product',
    category: 'Your Category',
    // ... other fields
  }
];
```

Then re-run seed script:

```bash
npx ts-node scripts/seedData.ts
```

## 🔐 Production Deployment (5 min)

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Add Environment Variables in Vercel

1. Go to project settings
2. Environment Variables
3. Add all from `.env.local`
4. Redeploy

### Update Firebase Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide.

## 📚 Next Steps

### Learn the Codebase

1. Read [README.md](README.md) for full features
2. Check [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for architecture
3. Explore components in `src/components/`

### Add Features

- Implement remaining pages (products, compare, etc.)
- Add authentication UI
- Create store owner dashboard
- Build mobile app with React Native

### Customize Design

- Edit `tailwind.config.ts` for colors
- Modify `src/app/globals.css` for animations
- Update components in `src/components/ui/`

## 🎯 Common Tasks

### Add a New Product

```typescript
// In Firestore console or via API
{
  name: "New Product",
  category: "Category",
  brand: "Brand",
  basePrice: 99,
  description: "Description",
  tags: ["tag1", "tag2"],
  createdAt: Date.now(),
  updatedAt: Date.now()
}
```

### Add a New Store

```typescript
{
  name: "Store Name",
  location: { lat: 12.9716, lng: 77.5946 },
  address: "Full address",
  phone: "+91 1234567890",
  hours: [...], // Use defaultHours from demoData
  inventory: [],
  rating: 4.5,
  reviewCount: 0,
  categories: ["Groceries"],
  ownerId: "owner-id",
  lastInventoryUpdate: Date.now(),
  createdAt: Date.now()
}
```

### Run Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

### Lint Code

```bash
npm run lint
```

### Build for Production

```bash
npm run build
npm start
```

## 🆘 Need Help?

### Documentation

- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Code structure

### Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Google Maps API](https://developers.google.com/maps/documentation)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

### Common Issues

- Check browser console for errors
- Verify all API keys are correct
- Ensure Firebase billing is enabled (for Maps)
- Check network tab for failed requests

## 🎉 You're Ready!

You now have a fully functional StorePath application running locally.

**What's working:**
✅ GPS location detection
✅ Nearby store discovery
✅ Smart product search
✅ Google Maps integration
✅ Price comparison
✅ Shopping lists
✅ Route optimization
✅ And 20+ more features!

Happy coding! 🚀
