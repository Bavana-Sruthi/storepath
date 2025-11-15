# 🚀 Deployment Guide - StorePath

Complete guide to deploy StorePath to production.

## 📋 Pre-deployment Checklist

- [ ] Firebase project created
- [ ] Google Maps API key obtained
- [ ] Environment variables configured
- [ ] Demo data seeded
- [ ] Tests passing
- [ ] Build successful locally

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `storepath-prod`
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Firebase Services

#### Firestore Database

```bash
firebase init firestore
```

Create `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all stores and products
    match /stores/{storeId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /shoppingLists/{listId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid in resource.data.sharedWith);
    }
    
    match /reservations/{reservationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

#### Authentication

1. Go to Authentication > Sign-in method
2. Enable Email/Password
3. Enable Google (optional)
4. Configure authorized domains

#### Storage

```bash
firebase init storage
```

Create `storage.rules`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{userId}/{receiptId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /reviews/{reviewId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Deploy Firebase Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 4. Get Firebase Config

1. Go to Project Settings > General
2. Scroll to "Your apps"
3. Click "Web" icon
4. Copy configuration

## 🗺️ Google Maps Setup

### 1. Enable Required APIs

Go to [Google Cloud Console](https://console.cloud.google.com/):

1. Create new project or select existing
2. Enable these APIs:
    - Maps JavaScript API
    - Places API
    - Distance Matrix API
    - Directions API
    - Geocoding API

### 2. Create API Key

1. Go to Credentials
2. Click "Create Credentials" > "API Key"
3. Click "Restrict Key"
4. Add application restrictions:
    - HTTP referrers: `https://yourdomain.com/*`
5. Add API restrictions:
    - Select the 5 APIs listed above

### 3. Set up Billing

Google Maps requires billing to be enabled. Set up a billing account and monitor usage.

## 🌐 Vercel Deployment

### 1. Prepare for Deployment

```bash
# Test production build locally
npm run build
npm run start
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Option B: GitHub Integration

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
    - Framework Preset: Next.js
    - Root Directory: ./
    - Build Command: `npm run build`
    - Output Directory: `.next`

### 3. Add Environment Variables

In Vercel Dashboard > Project Settings > Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=storepath-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=storepath-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=storepath-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

### 4. Configure Domains

1. Go to Project Settings > Domains
2. Add custom domain
3. Configure DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

## 📊 Post-Deployment Tasks

### 1. Seed Production Data

```bash
# Connect to production Firebase
firebase use production

# Run seed script
npm run seed-data
```

### 2. Test Production

- [ ] GPS location detection works
- [ ] Nearby stores loading
- [ ] Search functionality
- [ ] Maps integration
- [ ] Price comparison
- [ ] Shopping lists
- [ ] Reservations
- [ ] Receipt upload

### 3. Set up Monitoring

#### Vercel Analytics

1. Go to Project Settings > Analytics
2. Enable Web Analytics

#### Firebase Monitoring

1. Enable Crashlytics
2. Set up Performance Monitoring
3. Configure Cloud Functions logging

#### Google Maps Usage

1. Monitor API usage in Google Cloud Console
2. Set up billing alerts

## 🔐 Security Hardening

### 1. Firestore Indexes

Create indexes for common queries:

```bash
# Create composite indexes
firestore indexes:create
```

`firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "stores",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "categories", "arrayConfig": "CONTAINS" },
        { "fieldPath": "rating", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "basePrice", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### 2. Rate Limiting

Add rate limiting to API routes (consider using Vercel Edge Config or Upstash):

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add rate limiting logic
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### 3. CORS Configuration

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ];
  },
};
```

## 📈 Performance Optimization

### 1. Enable Vercel Edge Functions

Move frequently accessed API routes to Edge Functions for lower latency.

### 2. Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image';

<Image 
  src={product.imageUrl} 
  alt={product.name}
  width={300}
  height={300}
  priority
/>
```

### 3. Database Optimization

- Enable Firestore caching
- Use composite indexes
- Implement pagination for large lists

### 4. Code Splitting

Next.js handles this automatically, but verify:

```bash
npm run build
# Check bundle sizes in output
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🐛 Troubleshooting

### Build Fails

- Check all environment variables are set
- Verify TypeScript errors: `npm run lint`
- Clear cache: `rm -rf .next node_modules && npm install`

### Firebase Connection Issues

- Verify API keys are correct
- Check Firebase project settings
- Ensure billing is enabled

### Google Maps Not Loading

- Verify API key is correct
- Check API restrictions
- Ensure billing is enabled
- Verify domain is whitelisted

### Slow Performance

- Enable Vercel Analytics to identify bottlenecks
- Check Firestore query performance
- Monitor Google Maps API usage
- Optimize images

## 📱 Mobile App (Optional)

To create a mobile version:

1. Use React Native with same backend
2. Or create PWA:

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // ... other config
});
```

## 🎉 Go Live!

1. Test everything thoroughly
2. Update DNS records
3. Monitor logs for 24 hours
4. Gather user feedback
5. Iterate and improve

---

Need help? Create an issue on GitHub or contact support@storepath.com
