import { adminDb } from "../../../lib/firebaseAdmin";
import { handleError, sendSuccess, methodNotAllowed } from "../utils";

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        await handleGetSellers(req, res);
        break;
      default:
        methodNotAllowed(res, ["GET"]);
    }
  } catch (error) {
    handleError(res, error);
  }
}

async function handleGetSellers(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      location,
      sortBy = "rating",
    } = req.query;

    // Build base query for active sellers
    let query = adminDb
      .collection("seller")
        ;

    // Apply filters
    if (location && location !== "all") {
      query = query.where("location", "==", location);
    }

    // Execute query
    const sellersSnapshot = await query.get();
    console.log(sellersSnapshot);
    let sellers = [];

    for (const doc of sellersSnapshot.docs) {
      const sellerData = { id: doc.id, ...doc.data() };

      // Get seller's product count and stats
      const productsSnapshot = await adminDb
        .collection("products")
        .where("sellerId", "==", doc.id)
        .where("status", "==", "active")
        .get();

      sellerData.productCount = productsSnapshot.size;

      // Calculate total sales and revenue
      let totalSales = 0;
      let totalRevenue = 0;

      productsSnapshot.forEach((productDoc) => {
        const product = productDoc.data();
        totalSales += product.totalSales || 0;
        totalRevenue += (product.totalSales || 0) * (product.price || 0);
      });

      sellerData.totalSales = totalSales;
      sellerData.totalRevenue = totalRevenue;

      // Get reviews and ratings
      const reviewsSnapshot = await adminDb
        .collection("ratings")
        .where("sellerId", "==", doc.id)
        .get();

      if (reviewsSnapshot.size > 0) {
        let totalRating = 0;
        reviewsSnapshot.forEach((reviewDoc) => {
          totalRating += reviewDoc.data().rating || 0;
        });
        sellerData.rating = totalRating / reviewsSnapshot.size;
        sellerData.reviewCount = reviewsSnapshot.size;
      } else {
        sellerData.rating = 0;
        sellerData.reviewCount = 0;
      }

      // Add categories based on products
      const categories = new Set();
      productsSnapshot.forEach((productDoc) => {
        const product = productDoc.data();
        if (product.category) {
          categories.add(product.category);
        }
      });
      sellerData.categories = Array.from(categories);

      // Calculate years active
      if (sellerData.createdAt) {
        const joinDate = new Date(sellerData.createdAt);
        const currentDate = new Date();
        sellerData.yearsActive = Math.max(
          1,
          Math.floor((currentDate - joinDate) / (365 * 24 * 60 * 60 * 1000))
        );
      } else {
        sellerData.yearsActive = 1;
      }

      // Convert timestamps
      sellerData.createdAt =
        sellerData.createdAt?.toDate?.()?.toISOString() || sellerData.createdAt;
      sellerData.updatedAt =
        sellerData.updatedAt?.toDate?.()?.toISOString() || sellerData.updatedAt;
      sellerData.joinedAt = sellerData.createdAt;

      sellers.push(sellerData);
      console.log("hahahahah",sellers);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      sellers = sellers.filter(
        (seller) =>
          seller.businessName?.toLowerCase().includes(searchLower) ||
          seller.name?.toLowerCase().includes(searchLower) ||
          seller.description?.toLowerCase().includes(searchLower) ||
          seller.categories?.some((cat) =>
            cat.toLowerCase().includes(searchLower)
          )
      );
    }

    // Apply category filter
    if (category && category !== "all") {
      sellers = sellers.filter((seller) =>
        seller.categories?.includes(category)
      );
    }

    // Sort sellers
    sellers.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "products":
          return (b.productCount || 0) - (a.productCount || 0);
        case "sales":
          return (b.totalSales || 0) - (a.totalSales || 0);
        case "name":
          return (a.businessName || "").localeCompare(b.businessName || "");
        case "newest":
          return new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0);
        default:
          return 0;
      }
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedSellers = sellers.slice(startIndex, endIndex);

    const result = {
      sellers: paginatedSellers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: sellers.length,
        totalPages: Math.ceil(sellers.length / parseInt(limit)),
        hasMore: endIndex < sellers.length,
      },
      stats: {
        totalSellers: sellers.length,
        avgRating:
          sellers.length > 0
            ? sellers.reduce((sum, s) => sum + (s.rating || 0), 0) /
              sellers.length
            : 0,
        totalProducts: sellers.reduce(
          (sum, s) => sum + (s.productCount || 0),
          0
        ),
        categories: [...new Set(sellers.flatMap((s) => s.categories || []))],
      },
    };
    console.log("Sellers fetched:", result);

    return sendSuccess(res, result, "Sellers retrieved successfully");
  } catch (error) {
    console.error("Error fetching sellers:", error);
    throw error;
  }
}
