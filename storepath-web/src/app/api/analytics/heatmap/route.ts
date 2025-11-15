import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DemandHeatmapPoint, SearchAnalytics } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const analyticsRef = collection(db, 'searchAnalytics');
    let q = query(
      analyticsRef,
      orderBy('timestamp', 'desc'),
      limit(1000)
    );

    const snapshot = await getDocs(q);

    const searches: SearchAnalytics[] = [];
    snapshot.forEach((doc) => {
      searches.push(doc.data() as SearchAnalytics);
    });

    // Group searches by location and count
    const locationMap = new Map<string, { count: number; location: any; category: string }>();

    searches.forEach((search) => {
      // Round location to 3 decimal places to group nearby searches
      const lat = Math.round(search.location.lat * 1000) / 1000;
      const lng = Math.round(search.location.lng * 1000) / 1000;
      const key = `${lat},${lng}`;

      if (!locationMap.has(key)) {
        locationMap.set(key, {
          count: 0,
          location: { lat, lng },
          category: search.productName,
        });
      }

      const entry = locationMap.get(key)!;
      entry.count += 1;
    });

    // Convert to heatmap points
    const heatmapPoints: DemandHeatmapPoint[] = Array.from(locationMap.values()).map(
      (entry) => ({
        location: entry.location,
        weight: entry.count,
        productCategory: entry.category,
      })
    );

    // Filter by category if specified
    let filteredPoints = heatmapPoints;
    if (category) {
      filteredPoints = heatmapPoints.filter((point) =>
        point.productCategory.toLowerCase().includes(category.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredPoints,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
