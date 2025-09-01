import { adminDb } from '../../../lib/firebaseAdmin';
import admin from 'firebase-admin';
import { 
  verifyAuthToken, 
  getUserRole,
  handleError, 
  sendSuccess, 
  validateRequiredFields, 
  sanitizeInput, 
  methodNotAllowed,
  getPaginatedResults 
} from '../utils';
import { create } from 'domain';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGetOrders(req, res);
        break;
      case 'POST':
        await handleCreateOrder(req, res);
        break;
      default:
        methodNotAllowed(res, ['GET', 'POST']);
    }
  } catch (error) {
    handleError(res, error);
  }
}

// GET /api/orders - Get orders with filtering
async function handleGetOrders(req, res) {
  const decodedToken = await verifyAuthToken(req);
  const userRole = await getUserRole(decodedToken.uid);

  const { 
    id,
    status,
    userId,
    sellerId,
    page = 1,
    limit = 20,
    orderBy = 'createdAt',
    orderDirection = 'desc'
  } = req.query;

  // Get single order by ID
  if (id) {
    const orderDoc = await adminDb.collection('orders').doc(id).get();

    if (!orderDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const orderData = { id: orderDoc.id, ...orderDoc.data() };

    
    

    return sendSuccess(res, orderData, 'Order retrieved successfully');
  }
  //fetch all orders for a specific user
if (userId) {
  console.log("Fetching orders for user (admin):", userId);
  const ordersSnapshot = await adminDb
    .collection("orders")
    .where("userId", "==", userId)
    .orderBy("orderDate", "desc") // Order by orderDate descending
    .limit(10) // Limit to 6 documents
    .get();

  const orders = [];
  ordersSnapshot.forEach((doc) => {
    orders.push({ id: doc.id, ...doc.data() });
  });

  console.log("Orders fetched:", orders.length);
  return sendSuccess(res, orders, "Orders retrieved successfully");
}

  //fetch all orders for a specific seller
  if(sellerId){ 
    console.log("Fetching orders for seller (admin):", sellerId);
    const ordersSnapshot = await adminDb.collection('orders').where('sellerId', '=='
, sellerId).get();
    const orders = [];
    ordersSnapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    console.log("Orders fetched:", orders.length);
    return sendSuccess(res, orders, 'Orders retrieved successfully');
  }
    // Build filters based on user role
  const filters = {};

  if (userRole === 'buyer') {
    filters.buyerId = decodedToken.uid;
  } else if (userRole === 'seller') {
    filters.sellerId = decodedToken.uid;
  } else if (userRole === 'admin') {
    // Admin can filter by buyerId or sellerId
    if (buyerId) filters.buyerId = buyerId;
    if (sellerId) filters.sellerId = sellerId;
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  if (status) {
    filters.status = status;
  }

  const orders = await getPaginatedResults('orders', {
    filters,
    limit: parseInt(limit),
    orderBy,
    orderDirection
  });

  return sendSuccess(res, orders, 'Orders retrieved successfully');
}

// POST /api/orders - Create new order
async function handleCreateOrder(req, res) {
  console.log("Creating new order...");
  const decodedToken = await verifyAuthToken(req);
  console.log("Decoded token:", decodedToken);
  // Only buyers can create orders

  const orderData = sanitizeInput(req.body);
  console.log("Creating order with data:", orderData);
  // Validate required fields
  const requiredFields = ["items", "totalAmount"];
  validateRequiredFields(orderData, requiredFields);

  // Validate products array
  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'At least one product is required'
    });
  }

  // Validate total amount
  if (isNaN(orderData.totalAmount) || orderData.totalAmount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Total amount must be a positive number'
    });
  }

  // Get seller ID from first product (assuming single-seller orders for now)
  const sellerId = orderData.items[0].sellerId;
  console.log("Seller ID:", sellerId);


  // Prepare order document
  const newOrder = {
    ...orderData,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending',
  };
  console.log("New order data before adding system fields:", newOrder);

  // Validate shipping address
  // const requiredAddressFields = ['name', 'street', 'city', 'state', 'zipCode'];
  // validateRequiredFields(orderData.shippingAddress, requiredAddressFields);

  // Create order in Firestore
  const orderRef = await adminDb.collection('orders').add(newOrder);
  console.log("Order created with ID:", orderRef.id);
  // Update product sales count and seller stats
  const batch = adminDb.batch();

  for (const product of orderData.items) {
    const productRef = adminDb.collection('products').doc(product.productId);
    batch.update(productRef, {
      totalSales: admin.firestore.FieldValue.increment(product.quantity || 1),
      updatedAt: new Date().toISOString()
    });
  }

  // Update seller stats
  const sellerRef = adminDb.collection('seller').doc(sellerId);
  batch.update(sellerRef, {
    'sellerStats.totalOrders': admin.firestore.FieldValue.increment(1),
    'sellerStats.totalRevenue': admin.firestore.FieldValue.increment(parseFloat(orderData.totalAmount)),
    updatedAt: new Date().toISOString()
  });

  await batch.commit();

  const createdOrder = { id: orderRef.id, ...newOrder };

  sendSuccess(res, createdOrder, 'Order created successfully', 201);
}

// Helper function to generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `DG-${timestamp.slice(-6)}${random}`;
}
