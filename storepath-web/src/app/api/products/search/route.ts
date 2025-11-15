import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, SearchFilters, SearchResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const filters: SearchFilters = await request.json();

    // Get all products
    const productsRef = collection(db, 'products');
    let productsQuery = query(productsRef);

    // Apply category filter if specified
    if (filters.category) {
      productsQuery = query(productsRef, where('category', '==', filters.category));
    }

    const snapshot = await getDocs(productsQuery);
    
    let products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });

    // Apply text search filter
    if (filters.query) {
      const searchLower = filters.query.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply price filters
    if (filters.minPrice !== undefined) {
      products = products.filter((p) => p.basePrice >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      products = products.filter((p) => p.basePrice <= filters.maxPrice!);
    }

    // Get stores for availability check
    const storesRef = collection(db, 'stores');
    const storesSnapshot = await getDocs(storesRef);
    const stores: any[] = [];
    storesSnapshot.forEach((doc) => {
      stores.push({ id: doc.id, ...doc.data() });
    });

    // Create search results with store information
    const results: SearchResult[] = products.map((product) => {
      // Find stores that have this product
      const storesWithProduct = stores.filter((store) =>
        store.inventory?.some((item: any) => item.productId === product.id && item.quantity > 0)
      );

      return {
        product,
        stores: storesWithProduct,
        alternatives: [], // Will be populated by separate endpoint
      };
    });

    // Apply in-stock filter
    let filteredResults = results;
    if (filters.inStock) {
      filteredResults = results.filter((r) => r.stores.length > 0);
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredResults.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'price':
            comparison = a.product.basePrice - b.product.basePrice;
            break;
          case 'availability':
            comparison = b.stores.length - a.stores.length;
            break;
          case 'distance':
            // Would need user location for accurate distance sorting
            comparison = b.stores.length - a.stores.length;
            break;
          default:
            comparison = 0;
        }

        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return NextResponse.json({
      success: true,
      data: filteredResults,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
