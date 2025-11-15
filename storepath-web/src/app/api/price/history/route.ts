import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PriceHistoryEntry } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const storeId = searchParams.get('storeId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId required' },
        { status: 400 }
      );
    }

    const historyRef = collection(db, 'priceHistory');
    let q = query(
      historyRef,
      where('productId', '==', productId),
      orderBy('timestamp', 'asc')
    );

    if (storeId) {
      q = query(
        historyRef,
        where('productId', '==', productId),
        where('storeId', '==', storeId),
        orderBy('timestamp', 'asc')
      );
    }

    const snapshot = await getDocs(q);

    const history: PriceHistoryEntry[] = [];
    snapshot.forEach((doc) => {
      history.push(doc.data() as PriceHistoryEntry);
    });

    // If no history exists, generate some demo data
    if (history.length === 0) {
      const now = Date.now();
      const daysAgo = 30;
      
      for (let i = daysAgo; i >= 0; i -= 5) {
        history.push({
          storeId: storeId || 'demo-store',
          productId,
          price: 100 + Math.floor(Math.random() * 50),
          timestamp: now - i * 24 * 60 * 60 * 1000,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
