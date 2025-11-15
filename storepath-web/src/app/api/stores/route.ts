import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Store } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const storesRef = collection(db, 'stores');
    const snapshot = await getDocs(storesRef);
    
    const stores: Store[] = [];
    snapshot.forEach((doc) => {
      stores.push({ id: doc.id, ...doc.data() } as Store);
    });

    return NextResponse.json({
      success: true,
      data: stores,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const storesRef = collection(db, 'stores');
    
    const newStore = {
      ...body,
      createdAt: Date.now(),
      lastInventoryUpdate: Date.now(),
      rating: 0,
      reviewCount: 0,
      inventory: body.inventory || [],
    };

    const docRef = await addDoc(storesRef, newStore);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...newStore },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
