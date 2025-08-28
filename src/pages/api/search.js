import { adminDb } from '../../../lib/firebaseAdmin';
import { 
  handleError, 
  sendSuccess, 
  methodNotAllowed 
} from '../utils';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleSearch(req, res);
        break;
      default:
        methodNotAllowed(res, ['GET']);
    }
  } catch (error) {
    handleError(res, error);
  }
}

// GET /api/search - Search across products and sellers
async function handleSearch(req, res) {
  const { 
    q: searchQuery,
    type = 'all', // 'products', 'sellers', 'all'
    limit = 20,
    page = 1
  } = req.query;

  if (!searchQuery || searchQuery.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required'
    });
  }

  const query = searchQuery.toLowerCase().trim();
  const results = {
    products: [],
    sellers: [],
    totalResults: 0
  };

  // Search products
  if (type === 'all' || type === 'products') {
    const productsQuery = adminDb.collection('products')
      .where('isActive', '==', true)
      .limit(parseInt(limit));

    const productsSnapshot = await productsQuery.get();

    productsSnapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };

      // Simple text search in name, description, and tags
      const matchesSearch = 
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.tags?.some(tag => tag.toLowerCase().includes(query));

      if (matchesSearch) {
        results.products.push({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          images: product.images || [],
          rating: product.rating || 0,
          totalSales: product.totalSales || 0,
          sellerId: product.sellerId,
          tags: product.tags || [],
          type: 'product'
        });
      }
    });
  }

  // Search sellers
  if (type === 'all' || type === 'sellers') {
    const sellersQuery = adminDb.collection('users')
      .where('role', '==', 'seller')
      .where('isActive', '==', true)
      .limit(parseInt(limit));

    const sellersSnapshot = await sellersQuery.get();

    sellersSnapshot.forEach(doc => {
      const seller = { id: doc.id, ...doc.data() };

      // Simple text search in business name, name, and description
      const matchesSearch = 
        seller.businessName?.toLowerCase().includes(query) ||
        seller.name?.toLowerCase().includes(query) ||
        seller.description?.toLowerCase().includes(query);

      if (matchesSearch) {
        results.sellers.push({
          id: seller.id,
          businessName: seller.businessName,
          name: seller.name,
          description: seller.description,
          rating: seller.rating || 0,
          reviewCount: seller.reviewCount || 0,
          totalProducts: seller.sellerStats?.totalProducts || 0,
          logo: seller.logo,
          isVerified: seller.isVerified || false,
          type: 'seller'
        });
      }
    });
  }

  results.totalResults = results.products.length + results.sellers.length;

  // Sort combined results by relevance (simple scoring)
  const allResults = [
    ...results.products.map(p => ({ ...p, score: calculateRelevanceScore(p, query) })),
    ...results.sellers.map(s => ({ ...s, score: calculateRelevanceScore(s, query) }))
  ].sort((a, b) => b.score - a.score);

  const paginatedResults = allResults.slice(
    (parseInt(page) - 1) * parseInt(limit),
    parseInt(page) * parseInt(limit)
  );

  sendSuccess(res, {
    query: searchQuery,
    results: paginatedResults,
    totalResults: allResults.length,
    page: parseInt(page),
    limit: parseInt(limit),
    hasMore: paginatedResults.length === parseInt(limit)
  }, 'Search completed successfully');
}

// Simple relevance scoring function
function calculateRelevanceScore(item, query) {
  let score = 0;

  // Exact matches get higher scores
  const name = (item.name || item.businessName || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  const tags = item.tags || [];

  if (name === query) score += 100;
  else if (name.includes(query)) score += 50;

  if (description.includes(query)) score += 25;

  tags.forEach(tag => {
    if (tag.toLowerCase() === query) score += 75;
    else if (tag.toLowerCase().includes(query)) score += 35;
  });

  // Boost popular items slightly
  if (item.rating) score += item.rating * 2;
  if (item.totalSales) score += Math.min(item.totalSales, 50);

  return score;
}
