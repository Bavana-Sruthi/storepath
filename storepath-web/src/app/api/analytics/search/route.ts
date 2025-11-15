import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SearchAnalytics } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { productId, productName, location } = await request.json();

    if (!productId || !productName || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const analyticsRef = collection(db, 'searchAnalytics');
    const searchData: SearchAnalytics = {
      productId,
      productName,
      searchCount: 1,
      location,
      timestamp: Date.now(),
    };

    await addDoc(analyticsRef, searchData);

    return NextResponse.json({
      success: true,
      message: 'Search tracked',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
