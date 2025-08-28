import { adminDb } from '../../../lib/firebaseAdmin';
import { 
  verifyAuthToken, 
  getUserRole,
  handleError, 
  sendSuccess, 
  methodNotAllowed 
} from '../utils';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGetAnalytics(req, res);
        break;
      default:
        methodNotAllowed(res, ['GET']);
    }
  } catch (error) {
    handleError(res, error);
  }
}

// GET /api/seller/analytics - Get seller analytics
async function handleGetAnalytics(req, res) {
  const decodedToken = await verifyAuthToken(req);
  const userRole = await getUserRole(decodedToken.uid);

  // Only sellers can access their analytics or admin can access any
  if (userRole !== 'seller' && userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only sellers can access analytics.'
    });
  }

  const { 
    sellerId = decodedToken.uid,
    period = 'month', // 'week', 'month', 'year'
    startDate,
    endDate
  } = req.query;

  // Admin can query any seller's analytics
  const targetSellerId = userRole === 'admin' ? sellerId : decodedToken.uid;

  // Calculate date range
  const now = new Date();
  let start, end;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    end = now;
    switch (period) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  // Get seller basic info
  const sellerDoc = await adminDb.collection('users').doc(targetSellerId).get();
  if (!sellerDoc.exists || sellerDoc.data().role !== 'seller') {
    return res.status(404).json({
      success: false,
      error: 'Seller not found'
    });
  }

  const sellerData = sellerDoc.data();

  // Get orders in date range
  const ordersQuery = adminDb.collection('orders')
    .where('sellerId', '==', targetSellerId)
    .where('createdAt', '>=', start.toISOString())
    .where('createdAt', '<=', end.toISOString());

  const ordersSnapshot = await ordersQuery.get();
  const orders = [];
  ordersSnapshot.forEach(doc => {
    orders.push({ id: doc.id, ...doc.data() });
  });

  // Get products
  const productsQuery = adminDb.collection('products')
    .where('sellerId', '==', targetSellerId);

  const productsSnapshot = await productsQuery.get();
  const products = [];
  productsSnapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });

  // Calculate analytics
  const analytics = {
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
      type: period
    },
    overview: {
      totalRevenue: 0,
      totalOrders: orders.length,
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      averageOrderValue: 0,
      conversionRate: 0
    },
    orders: {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    },
    topProducts: [],
    revenueByDate: [],
    ordersByStatus: []
  };

  // Calculate order statistics
  let totalRevenue = 0;
  const productSales = {};
  const dailyRevenue = {};

  orders.forEach(order => {
    totalRevenue += order.totalAmount || 0;
    analytics.orders[order.status] = (analytics.orders[order.status] || 0) + 1;

    // Track daily revenue
    const date = order.createdAt.split('T')[0];
    dailyRevenue[date] = (dailyRevenue[date] || 0) + (order.totalAmount || 0);

    // Track product sales
    if (order.products) {
      order.products.forEach(product => {
        if (!productSales[product.productId]) {
          productSales[product.productId] = {
            productId: product.productId,
            name: product.name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[product.productId].quantity += product.quantity || 1;
        productSales[product.productId].revenue += (product.price || 0) * (product.quantity || 1);
      });
    }
  });

  analytics.overview.totalRevenue = totalRevenue;
  analytics.overview.averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Get top products by sales
  analytics.topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Format daily revenue data
  analytics.revenueByDate = Object.entries(dailyRevenue)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Format orders by status
  analytics.ordersByStatus = Object.entries(analytics.orders)
    .map(([status, count]) => ({ status, count }))
    .filter(item => item.count > 0);

  sendSuccess(res, analytics, 'Analytics retrieved successfully');
}
