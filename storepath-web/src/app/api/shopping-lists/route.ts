import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ShoppingList } from '@/types';

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

    const listsRef = collection(db, 'shoppingLists');
    const q = query(listsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const lists: ShoppingList[] = [];
    snapshot.forEach((doc) => {
      lists.push({ id: doc.id, ...doc.data() } as ShoppingList);
    });

    return NextResponse.json({
      success: true,
      data: lists,
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
    const { userId, name } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const listsRef = collection(db, 'shoppingLists');
    const newList: Omit<ShoppingList, 'id'> = {
      userId,
      name,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await addDoc(listsRef, newList);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...newList },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { listId, updates } = body;

    if (!listId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const listRef = doc(db, 'shoppingLists', listId);
    await updateDoc(listRef, {
      ...updates,
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: 'Shopping list updated',
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
    const listId = searchParams.get('listId');

    if (!listId) {
      return NextResponse.json(
        { success: false, error: 'listId required' },
        { status: 400 }
      );
    }

    const listRef = doc(db, 'shoppingLists', listId);
    await deleteDoc(listRef);

    return NextResponse.json({
      success: true,
      message: 'Shopping list deleted',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
