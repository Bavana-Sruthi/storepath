import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, userId, userName, rating, comment, photos } = body;

    if (!storeId || !userId || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reviewsRef = collection(db, 'reviews');
    const newReview: Omit<Review, 'id'> = {
      storeId,
      userId,
      userName,
      rating,
      comment: comment || '',
      photos: photos || [],
      helpful: 0,
      createdAt: Date.now(),
    };

    const docRef = await addDoc(reviewsRef, newReview);

    // Update store rating
    const storeRef = doc(db, 'stores', storeId);
    await updateDoc(storeRef, {
      reviewCount: increment(1),
    });

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...newReview },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'storeId required' },
        { status: 400 }
      );
    }

    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('storeId', '==', storeId));
    const snapshot = await getDocs(q);

    const reviews: Review[] = [];
    snapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() } as Review);
    });

    // Sort by most recent
    reviews.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
