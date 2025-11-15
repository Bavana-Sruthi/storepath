/**
 * Seed demo data to Firebase
 * Run with: npx ts-node scripts/seedData.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { demoStores, demoProducts, generateInventory } from '../src/lib/demoData';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function seedData() {
  console.log('🌱 Starting data seeding...');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // Seed products first
    console.log('📦 Seeding products...');
    const productIds: string[] = [];
    
    for (const product of demoProducts) {
      const docRef = await addDoc(collection(db, 'products'), product);
      productIds.push(docRef.id);
      console.log(`  ✓ Added product: ${product.name}`);
    }

    // Seed stores with inventory
    console.log('\n🏪 Seeding stores...');
    
    for (const store of demoStores) {
      const inventory = generateInventory(productIds);
      const storeWithInventory = {
        ...store,
        inventory,
      };
      
      await addDoc(collection(db, 'stores'), storeWithInventory);
      console.log(`  ✓ Added store: ${store.name} with ${inventory.length} products`);
    }

    console.log('\n✅ Data seeding completed successfully!');
    console.log(`\nSeeded:`);
    console.log(`  - ${demoProducts.length} products`);
    console.log(`  - ${demoStores.length} stores`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
