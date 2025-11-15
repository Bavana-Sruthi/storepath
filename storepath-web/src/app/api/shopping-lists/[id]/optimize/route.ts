import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ShoppingList, Store, Location, OptimizedRoute, StoreWithDistance } from '@/types';
import { calculateDistance, estimateTimeFromDistance } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { location } = await request.json();
    
    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { success: false, error: 'Location required' },
        { status: 400 }
      );
    }

    // Get shopping list
    const listRef = doc(db, 'shoppingLists', params.id);
    const listSnap = await getDoc(listRef);

    if (!listSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Shopping list not found' },
        { status: 404 }
      );
    }

    const shoppingList = { id: listSnap.id, ...listSnap.data() } as ShoppingList;

    // Get all stores
    const storesRef = collection(db, 'stores');
    const storesSnap = await getDocs(storesRef);
    
    const stores: Store[] = [];
    storesSnap.forEach((doc) => {
      stores.push({ id: doc.id, ...doc.data() } as Store);
    });

    // Find which stores have which items
    const storeItemMap = new Map<string, Set<string>>();
    
    shoppingList.items.forEach((item) => {
      stores.forEach((store) => {
        const inventoryItem = store.inventory.find(
          (inv) => inv.productId === item.productId && inv.quantity > 0
        );
        
        if (inventoryItem) {
          if (!storeItemMap.has(store.id)) {
            storeItemMap.set(store.id, new Set());
          }
          storeItemMap.get(store.id)!.add(item.productId);
        }
      });
    });

    // Calculate distances
    const storesWithDistance: StoreWithDistance[] = stores
      .filter((store) => storeItemMap.has(store.id))
      .map((store) => {
        const distance = calculateDistance(
          location.lat,
          location.lng,
          store.location.lat,
          store.location.lng
        );

        return {
          ...store,
          distance,
          duration: estimateTimeFromDistance(distance),
          isOpen: true, // Simplified
          accuracyScore: 100, // Simplified
        };
      });

    // Greedy algorithm: Select stores that cover most items first
    const selectedStores: StoreWithDistance[] = [];
    const coveredItems = new Set<string>();
    const itemsCovered: { productId: string; storeId: string }[] = [];

    while (coveredItems.size < shoppingList.items.length && storeItemMap.size > 0) {
      let bestStore: StoreWithDistance | null = null;
      let bestCoverage = 0;

      storesWithDistance.forEach((store) => {
        const storeItems = storeItemMap.get(store.id);
        if (!storeItems) return;

        const newItems = Array.from(storeItems).filter((item) => !coveredItems.has(item));
        if (newItems.length > bestCoverage) {
          bestCoverage = newItems.length;
          bestStore = store;
        }
      });

      if (!bestStore) break;

      selectedStores.push(bestStore);
      const storeItems = storeItemMap.get(bestStore.id)!;
      storeItems.forEach((productId) => {
        coveredItems.add(productId);
        itemsCovered.push({ productId, storeId: bestStore!.id });
      });
      storeItemMap.delete(bestStore.id);
    }

    // Optimize store visit order by distance (nearest neighbor)
    const orderedStores: StoreWithDistance[] = [];
    const order: number[] = [];
    let currentLocation = location;

    while (selectedStores.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      selectedStores.forEach((store, index) => {
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          store.location.lat,
          store.location.lng
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      const nearestStore = selectedStores.splice(nearestIndex, 1)[0];
      orderedStores.push(nearestStore);
      order.push(orderedStores.length - 1);
      currentLocation = nearestStore.location;
    }

    // Calculate total distance and duration
    const totalDistance = orderedStores.reduce((sum, store) => sum + store.distance, 0);
    const totalDuration = orderedStores.reduce((sum, store) => sum + store.duration, 0);

    // Find items that couldn't be covered
    const itemsMissing = shoppingList.items
      .filter((item) => !coveredItems.has(item.productId))
      .map((item) => item.productId);

    const optimizedRoute: OptimizedRoute = {
      stores: orderedStores,
      totalDistance,
      totalDuration,
      order,
      itemsCovered,
      itemsMissing,
    };

    return NextResponse.json({
      success: true,
      data: optimizedRoute,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
