import admin from "firebase-admin";

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

// Helper: normalize a createdAt value to a JS Date
function toDate(createdAt) {
  if (!createdAt) return null;
  // Firestore Timestamp has toDate()
  if (typeof createdAt.toDate === "function") return createdAt.toDate();
  // If it's already a Date
  if (createdAt instanceof Date) return createdAt;
  // If it's a number (epoch ms)
  if (typeof createdAt === "number") return new Date(createdAt);
  // Otherwise try string parse
  const d = new Date(createdAt);
  return isNaN(d.getTime()) ? null : d;
}

// Create zeroed daily stats array (Sunday=0 to Saturday=6)
function createZeroedDailyStats() {
  return [
    { day: 0, orders: [], sales: 0 }, // Sunday
    { day: 1, orders: [], sales: 0 }, // Monday
    { day: 2, orders: [], sales: 0 }, // Tuesday
    { day: 3, orders: [], sales: 0 }, // Wednesday
    { day: 4, orders: [], sales: 0 }, // Thursday
    { day: 5, orders: [], sales: 0 }, // Friday
    { day: 6, orders: [], sales: 0 }, // Saturday
  ];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  // ✅ FIXED: Mandatory API key validation
  const apiKey = req.headers["x-api-key"] || req.headers["authorization"];
  const expectedApiKey = process.env.WEEKLY_PAYOUT_API_KEY;

  // Check if API key is configured
  if (!expectedApiKey) {
    console.error(
      "WEEKLY_PAYOUT_API_KEY is not configured in environment variables"
    );
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Validate API key (must be provided and must match)
  if (!apiKey || apiKey !== expectedApiKey) {
    console.warn("Unauthorized access attempt with invalid or missing API key");
    return res
      .status(403)
      .json({ error: "Unauthorized - Invalid or missing API key" });
  }

  console.log("Weekly payout job triggered at:", new Date().toISOString());

  try {
    const paymentsSnapshot = await db.collection("payments").get();
    console.log("job run huyi!!!!!!!");
    if (paymentsSnapshot.empty) {
      console.log("No payment documents found.");
      return res.status(200).json({ message: "No payment documents found." });
    }

    const now = new Date();
    const periodEnd = now.toISOString();
    const periodStart = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const batch = db.batch();
    let processedSellers = 0;
    let totalPayoutAmount = 0;

    for (const doc of paymentsSnapshot.docs) {
      const sellerId = doc.id;
      const data = doc.data() || {};

      // Get current week's data
      const dailyStats = Array.isArray(data.dailyStats) ? data.dailyStats : [];
      const totalSales = data.totalSales || 0;
      const cod = data.cod || 0;

      // Skip if no sales this week
      if (totalSales === 0) {
        console.log(`Seller ${sellerId}: no sales this week`);
        continue;
      }

      // Calculate totals from dailyStats
      let totalOrders = 0;
      const dailyBreakdown = [];

      for (const dayStat of dailyStats) {
        const dayOrders = Array.isArray(dayStat.orders) ? dayStat.orders : [];
        totalOrders += dayOrders.length;

        dailyBreakdown.push({
          day: dayStat.day,
          orders: dayOrders.length,
          sales: dayStat.sales || 0,
        });
      }

      // Calculate payout details
      const platformFee = +(totalSales * 0.05).toFixed(2);
      const earnings = +(totalSales - platformFee).toFixed(2);
      const digitalSales = +(totalSales - cod).toFixed(2);

      // Count order types from dailyStats
      let codTransactions = 0;
      for (const dayStat of dailyStats) {
        if (Array.isArray(dayStat.orders)) {
          codTransactions += dayStat.orders.filter(
            (order) =>
              order.paymentType === "COD" || order.paymentMethod === "COD"
          ).length;
        }
      }
      const digitalTransactions = totalOrders - codTransactions;

      const transactionId = `TXN${Date.now()}${sellerId
        .substring(0, 6)
        .toUpperCase()}`;

      // Get payout method (active method)
      const payoutMethods = Array.isArray(data.payoutMethods)
        ? data.payoutMethods
        : [];
      const activeMethod = payoutMethods.find((m) => m.isDefault);
      const payoutMethodInfo = activeMethod
        ? activeMethod.type === "bank"
          ? `${activeMethod.bankName} - ****${activeMethod.accountNumber?.slice(
              -4
            )}`
          : `UPI - ${activeMethod.upiId}`
        : "No active payout method";

      // Create payout record
      const payoutRecord = {
        id: transactionId,
        transactionId,
        date: now.toISOString(),
        createdAt: now.toISOString(),
        periodStart,
        periodEnd,
        weekEnding: `Week ending ${now.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`,
        numberOfOrders: totalOrders,
        codTransactions,
        digitalTransactions,
        totalSales: +totalSales.toFixed(2),
        codAmount: +cod.toFixed(2),
        digitalAmount: +digitalSales.toFixed(2),
        platformFee,
        earnings,
        amount: earnings, // For compatibility
        method: payoutMethodInfo,
        status: activeMethod ? "completed" : "pending",
        dailyBreakdown, // Include daily breakdown for transparency
        remarks: activeMethod
          ? "Payout processed successfully"
          : "Awaiting payout method setup",
      };

      const sellerRef = db.collection("payments").doc(sellerId);

      // Reset weekly data and add payout to history
      batch.update(sellerRef, {
        paymentHistory: admin.firestore.FieldValue.arrayUnion(payoutRecord),
        totalSales: 0,
        cod: 0,
        dailyStats: createZeroedDailyStats(),
        lastPayoutDate: now.toISOString(),
        lastPayoutAmount: earnings,
        updatedAt: now.toISOString(),
      });

      totalPayoutAmount += earnings;
      processedSellers++;

      console.log(
        `Queued payout for seller ${sellerId}: ₹${earnings} (${totalOrders} orders, ${totalSales} sales)`
      );
    }

    await batch.commit();
    console.log(
      `Weekly payout batch committed. Processed ${processedSellers} sellers, total payout: ₹${totalPayoutAmount.toFixed(
        2
      )}`
    );

    return res.status(200).json({
      message: "Weekly payout completed successfully",
      processedSellers,
      totalPayoutAmount: +totalPayoutAmount.toFixed(2),
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Weekly payout error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}
