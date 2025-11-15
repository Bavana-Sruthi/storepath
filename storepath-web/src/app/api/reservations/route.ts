import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Reservation } from '@/types';

const RESERVATION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, storeId, quantity, userId } = body;

    if (!productId || !storeId || !quantity || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reservationsRef = collection(db, 'reservations');
    const newReservation: Omit<Reservation, 'id'> = {
      userId,
      storeId,
      productId,
      quantity,
      status: 'active',
      expiresAt: Date.now() + RESERVATION_DURATION,
      createdAt: Date.now(),
    };

    const docRef = await addDoc(reservationsRef, newReservation);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...newReservation },
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
        { status: 400 }
      );
    }

    const reservationsRef = collection(db, 'reservations');
    const q = query(reservationsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const reservations: Reservation[] = [];
    const now = Date.now();

    snapshot.forEach((doc) => {
      const data = doc.data() as Omit<Reservation, 'id'>;
      
      // Auto-expire if past expiration time
      let status = data.status;
      if (status === 'active' && data.expiresAt < now) {
        status = 'expired';
        // Update in database
        updateDoc(doc.ref, { status: 'expired' });
      }

      reservations.push({
        id: doc.id,
        ...data,
        status,
      });
    });

    return NextResponse.json({
      success: true,
      data: reservations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
