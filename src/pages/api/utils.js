import { adminAuth, adminDb } from '../../lib/firebaseAdmin';

// Verify Firebase ID token
export const verifyAuthToken = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
};

// Get user role from custom claims
export const getUserRole = async (uid) => {
  try {
    const userRecord = await adminAuth.getUser(uid);
    return userRecord.customClaims?.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

// Check if user has required role
export const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const decodedToken = await verifyAuthToken(req);
      const userRole = await getUserRole(decodedToken.uid);

      if (!userRole || userRole !== requiredRole) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required role: ${requiredRole}`,
          code: 'insufficient_permissions'
        });
      }

      req.user = { ...decodedToken, role: userRole };
      return next();
    } catch (error) {
      return handleError(res, error, 'Authentication failed');
    }
  };
};

// Generic error handler
export const handleError = (res, error, defaultMessage = 'Internal server error') => {
  console.error('API Error:', error);

  const statusCode = error.message.includes('token') ? 401 
                   : error.message.includes('Access denied') ? 403
                   : error.message.includes('not found') ? 404
                   : error.message.includes('already exists') ? 409
                   : 500;

  res.status(statusCode).json({
    success: false,
    error: error.message || defaultMessage,
    timestamp: new Date().toISOString()
  });
};

// Success response helper
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Validate required fields
export const validateRequiredFields = (data, requiredFields) => {
  const missing = requiredFields.filter(field => 
    !data.hasOwnProperty(field) || 
    data[field] === null || 
    data[field] === undefined || 
    (typeof data[field] === 'string' && data[field].trim() === '')
  );

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

// Sanitize user input
export const sanitizeInput = (data) => {
  const sanitized = {};
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? item.trim() : item
      );
    } else {
      sanitized[key] = value;
    }
  });
  return sanitized;
};

// Pagination helper for Firestore
export const getPaginatedResults = async (collectionName, options = {}) => {
  const {
    filters = {},
    orderBy = 'createdAt',
    orderDirection = 'desc',
    limit = 20,
    startAfter = null
  } = options;

  let query = adminDb.collection(collectionName);

  // Apply filters
  Object.entries(filters).forEach(([field, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value) && value.length > 0) {
        query = query.where(field, 'array-contains-any', value);
      } else {
        query = query.where(field, '==', value);
      }
    }
  });

  // Apply ordering
  query = query.orderBy(orderBy, orderDirection);

  // Apply pagination
  if (startAfter) {
    const startAfterDoc = await adminDb.collection(collectionName).doc(startAfter).get();
    if (startAfterDoc.exists) {
      query = query.startAfter(startAfterDoc);
    }
  }

  // Apply limit
  query = query.limit(limit);

  const snapshot = await query.get();

  const results = [];
  snapshot.forEach(doc => {
    results.push({ id: doc.id, ...doc.data() });
  });

  return {
    results,
    hasMore: results.length === limit,
    lastDoc: results.length > 0 ? results[results.length - 1].id : null,
    totalFound: results.length
  };
};

// Method not allowed handler
export const methodNotAllowed = (res, allowedMethods) => {
  res.setHeader('Allow', allowedMethods.join(', '));
  res.status(405).json({
    success: false,
    error: `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`
  });
};
