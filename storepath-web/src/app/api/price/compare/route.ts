import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, PriceComparison, OnlinePrice, Location, Store } from '@/types';
import { calculateDistance, estimateTimeFromDistance, isStoreOpen, calculateAccuracyScore } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { productId, location } = await request.json();

    if (!productId || !location) {
      return NextResponse.json(
        { success: false, error: 'productId and location required' },
        { status: 400 }
      );
    }

    // Get product
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = { id: productSnap.id, ...productSnap.data() } as Product;

    // Get all stores
    const storesRef = collection(db, 'stores');
    const storesSnap = await getDocs(storesRef);
    
    const stores: Store[] = [];
    storesSnap.forEach((doc) => {
      stores.push({ id: doc.id, ...doc.data() } as Store);
    });

    // Find stores with this product
    const nearbyStores = stores
      .map((store) => {
        const inventoryItem = store.inventory.find(
          (item) => item.productId === productId && item.quantity > 0
        );

        if (!inventoryItem) return null;

        const distance = calculateDistance(
          location.lat,
          location.lng,
          store.location.lat,
          store.location.lng
        );

        return {
          store: {
            ...store,
            distance,
            duration: estimateTimeFromDistance(distance),
            isOpen: isStoreOpen(store.hours),
            accuracyScore: calculateAccuracyScore(store.lastInventoryUpdate),
          },
          price: inventoryItem.price,
          quantity: inventoryItem.quantity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.price - b.price);

    // Mock online prices (in real app, would call actual APIs)
    const onlinePrices: OnlinePrice[] = [
      {
        source: 'amazon',
        price: product.basePrice + Math.floor(Math.random() * 100),
        url: `https://amazon.in/search?k=${encodeURIComponent(product.name)}`,
        deliveryDays: 2,
        inStock: Math.random() > 0.2,
      },
      {
        source: 'flipkart',
        price: product.basePrice + Math.floor(Math.random() * 100),
        url: `https://flipkart.com/search?q=${encodeURIComponent(product.name)}`,
        deliveryDays: 3,
        inStock: Math.random() > 0.2,
      },
    ];

    // Generate recommendation
    let recommendation = '';
    const nearbyBest = nearbyStores[0];
    const onlineBest = onlinePrices.find((p) => p.inStock);

    if (nearbyBest && onlineBest) {
      const savings = onlineBest.price - nearbyBest.price;
      if (savings > 50) {
        recommendation = `Nearby store is ₹${savings} cheaper and only ${nearbyBest.store.distance}km away. We recommend buying locally!`;
      } else if (savings < -50) {
        recommendation = `Online is ₹${Math.abs(savings)} cheaper, but you'll wait ${onlineBest.deliveryDays} days. Nearby store has it now!`;
      } else {
        recommendation = `Prices are similar! Save time by buying from nearby store ${nearbyBest.store.name}.`;
      }
    } else if (nearbyBest) {
      recommendation = `Available at ${nearbyBest.store.name} for ₹${nearbyBest.price}. Only ${nearbyBest.store.distance}km away!`;
    } else if (onlineBest) {
      recommendation = `Not available nearby. Order online from ${onlineBest.source} for ₹${onlineBest.price}.`;
    } else {
      recommendation = 'Product not currently available nearby or online.';
    }

    const comparison: PriceComparison = {
      product,
      nearbyStores,
      onlinePrices,
      recommendation,
    };

    return NextResponse.json({
      success: true,
      data: comparison,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
