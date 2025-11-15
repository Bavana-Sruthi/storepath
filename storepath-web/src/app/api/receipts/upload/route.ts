import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Receipt, ReceiptItem } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('receipt') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { success: false, error: 'File and userId required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Perform OCR
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();

    // Parse receipt text (simplified parsing logic)
    const items: ReceiptItem[] = parseReceiptText(text);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Save to database
    const receiptsRef = collection(db, 'receipts');
    const newReceipt: Omit<Receipt, 'id'> = {
      userId,
      items,
      total,
      date: Date.now(),
      createdAt: Date.now(),
    };

    const docRef = await addDoc(receiptsRef, newReceipt);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...newReceipt },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function parseReceiptText(text: string): ReceiptItem[] {
  const items: ReceiptItem[] = [];
  const lines = text.split('\n');

  // Simple parsing logic - looks for patterns like:
  // "Product Name    ₹123.45" or "Product Name    123.45"
  const priceRegex = /₹?\s*(\d+\.?\d*)/;

  lines.forEach((line) => {
    const match = line.match(priceRegex);
    if (match) {
      const price = parseFloat(match[1]);
      if (price > 0) {
        const name = line.replace(priceRegex, '').trim();
        if (name) {
          items.push({
            name,
            price,
            quantity: 1,
          });
        }
      }
    }
  });

  return items;
}

export const config = {
  api: {
    bodyParser: false,
  },
};
