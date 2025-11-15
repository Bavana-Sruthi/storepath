import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Store, StoreWithDistance, Location } from '@/types';
import { calculateDistance, isStoreOpen, calculateAccuracyScore, estimateTimeFromDistance } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10');

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Location parameters required' },
        { status: 400 }
      );
    }

    const userLocation: Location = { lat, lng };

    // Get all stores
    const storesRef = collection(db, 'stores');
    const snapshot = await getDocs(storesRef);
    
    const stores: Store[] = [];
    snapshot.forEach((doc) => {
      stores.push({ id: doc.id, ...doc.data() } as Store);
    });

    // Calculate distances and filter by radius
    const storesWithDistance: StoreWithDistance[] = stores
      .map((store) => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          store.location.lat,
          store.location.lng
        );

        if (distance > radius) return null;

        return {
          ...store,
          distance,
          duration: estimateTimeFromDistance(distance),
          isOpen: isStoreOpen(store.hours),
          accuracyScore: calculateAccuracyScore(store.lastInventoryUpdate),
        };
      })
      .filter((store): store is StoreWithDistance => store !== null)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      data: storesWithDistance,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
