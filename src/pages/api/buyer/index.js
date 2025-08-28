import { adminDb } from '../../../lib/firebaseAdmin';
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

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGetBuyers(req, res);
        break;
      case 'POST':
        await handleCreateBuyer(req, res);
        break;
      default:
        methodNotAllowed(res, ['GET', 'POST']);
    }
  } catch (error) {
    handleError(res, error);
  }
}

// GET /api/buyer - Get buyer profile or list buyers (admin only)
async function handleGetBuyers(req, res) {
  const { uid, role, all } = req.query;

  // Verify authentication
  const decodedToken = await verifyAuthToken(req);
  const userRole = await getUserRole(decodedToken.uid);

  if (uid) {
    // Get specific buyer profile
    if (decodedToken.uid !== uid && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Can only access your own profile.'
      });
    }

    const buyerDoc = await adminDb.collection('users').doc(uid).get();

    if (!buyerDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }

    const buyerData = buyerDoc.data();

    // Remove sensitive data
    const { password, ...safeBuyerData } = buyerData;

    return sendSuccess(res, safeBuyerData, 'Buyer profile retrieved successfully');
  }

  // List all buyers (admin only)
  if (all && userRole === 'admin') {
    const { page = 1, limit = 20, search } = req.query;

    let query = adminDb.collection('users').where('role', '==', 'buyer');

    if (search) {
      // Simple search by name or email
      query = query.where('name', '>=', search)
                   .where('name', '<=', search + '\uf8ff');
    }

    const buyers = await getPaginatedResults('users', {
      filters: { role: 'buyer' },
      limit: parseInt(limit),
      startAfter: page > 1 ? (page - 1) * limit : null
    });

    return sendSuccess(res, buyers, 'Buyers retrieved successfully');
  }

  return res.status(400).json({
    success: false,
    error: 'Please provide uid parameter or admin access for listing all buyers'
  });
}

// POST /api/buyer - Create or update buyer profile
async function handleCreateBuyer(req, res) {
  const decodedToken = await verifyAuthToken(req);
  const userRole = await getUserRole(decodedToken.uid);

  // Only allow buyers to update their own profile or admin
  if (userRole !== 'buyer' && userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only buyers can update buyer profiles.'
    });
  }

  const buyerData = sanitizeInput(req.body);

  // Validate required fields for buyer profile
  const requiredFields = ['name', 'email', 'phone'];
  validateRequiredFields(buyerData, requiredFields);

  // Additional validation
  if (buyerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerData.email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  // Prepare buyer document
  const updatedBuyerData = {
    ...buyerData,
    role: 'buyer',
    updatedAt: new Date().toISOString(),
    uid: decodedToken.uid
  };

  // Check if this is a new buyer or update
  const existingBuyer = await adminDb.collection('users').doc(decodedToken.uid).get();

  if (!existingBuyer.exists) {
    // New buyer
    updatedBuyerData.createdAt = new Date().toISOString();
    updatedBuyerData.isActive = true;
    updatedBuyerData.addresses = [];
    updatedBuyerData.wishlist = [];
    updatedBuyerData.orderHistory = [];
  }

  // Save to Firestore
  await adminDb.collection('users').doc(decodedToken.uid).set(updatedBuyerData, { merge: true });

  // Remove sensitive data from response
  const { password, ...safeBuyerData } = updatedBuyerData;

  sendSuccess(
    res, 
    safeBuyerData, 
    existingBuyer.exists ? 'Buyer profile updated successfully' : 'Buyer profile created successfully',
    existingBuyer.exists ? 200 : 201
  );
}
