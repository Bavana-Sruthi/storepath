import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // Get the original product
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const originalProduct = { id: productSnap.id, ...productSnap.data() } as Product;

    // Get all products
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    const allProducts: Product[] = [];
    snapshot.forEach((doc) => {
      if (doc.id !== productId) {
        allProducts.push({ id: doc.id, ...doc.data() } as Product);
      }
    });

    // Find alternatives based on category, brand, and price range
    const priceRange = originalProduct.basePrice * 0.2; // 20% price tolerance
    
    const alternatives = allProducts
      .filter((product) => {
        // Same category
        if (product.category !== originalProduct.category) return false;
        
        // Similar price range
        const priceDiff = Math.abs(product.basePrice - originalProduct.basePrice);
        if (priceDiff > priceRange) return false;

        return true;
      })
      .sort((a, b) => {
        // Prioritize same brand
        if (a.brand === originalProduct.brand && b.brand !== originalProduct.brand) return -1;
        if (a.brand !== originalProduct.brand && b.brand === originalProduct.brand) return 1;
        
        // Then sort by price similarity
        const aDiff = Math.abs(a.basePrice - originalProduct.basePrice);
        const bDiff = Math.abs(b.basePrice - originalProduct.basePrice);
        return aDiff - bDiff;
      })
      .slice(0, 5); // Limit to 5 alternatives

    return NextResponse.json({
      success: true,
      data: alternatives,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
