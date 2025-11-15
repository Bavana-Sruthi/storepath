import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (q.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get products
    const productsRef = collection(db, 'products');
    const productsQuery = query(productsRef, limit(100));
    const snapshot = await getDocs(productsQuery);
    
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });

    // Generate suggestions
    const searchLower = q.toLowerCase();
    const suggestions = new Set<string>();

    products.forEach((product) => {
      // Add product name if it matches
      if (product.name.toLowerCase().includes(searchLower)) {
        suggestions.add(product.name);
      }

      // Add brand if it matches
      if (product.brand.toLowerCase().includes(searchLower)) {
        suggestions.add(product.brand);
      }

      // Add category if it matches
      if (product.category.toLowerCase().includes(searchLower)) {
        suggestions.add(product.category);
      }

      // Add tags if they match
      product.tags?.forEach((tag) => {
        if (tag.toLowerCase().includes(searchLower)) {
          suggestions.add(tag);
        }
      });
    });

    // Convert to array and limit to 10
    const suggestionArray = Array.from(suggestions).slice(0, 10);

    return NextResponse.json({
      success: true,
      data: suggestionArray,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
