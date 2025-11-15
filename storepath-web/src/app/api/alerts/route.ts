import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StockAlert } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, storeId, notifyEmail, notifyPush } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const alertsRef = collection(db, 'alerts');
    const newAlert: Omit<StockAlert, 'id'> = {
      userId,
      productId,
      storeId,
      notifyEmail: notifyEmail || true,
      notifyPush: notifyPush || false,
      createdAt: Date.now(),
      triggered: false,
    };

    const docRef = await addDoc(alertsRef, newAlert);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...newAlert },
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

    const alertsRef = collection(db, 'alerts');
    const q = query(alertsRef, where('userId', '==', userId), where('triggered', '==', false));
    const snapshot = await getDocs(q);

    const alerts: StockAlert[] = [];
    snapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() } as StockAlert);
    });

    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'alertId required' },
        { status: 400 }
      );
    }

    const alertRef = doc(db, 'alerts', alertId);
    await deleteDoc(alertRef);

    return NextResponse.json({
      success: true,
      message: 'Alert deleted',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
