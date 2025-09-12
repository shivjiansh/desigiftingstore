// pages/api/email/seller-alert.js
import emailService from "../../../lib/emailService";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const {
      sellerEmail,
      sellerName,
      orderId,
      customerName,
      productName,
      amount,
      customization,
      expectedDelivery,
      dashboardUrl,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      sellerEmail: "Seller email",
      sellerName: "Seller name",
      orderId: "Order ID",
      customerName: "Customer name",
      productName: "Product name",
      amount: "Order amount",
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          error: `${label} is required`,
          field: field,
        });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sellerEmail)) {
      return res.status(400).json({
        success: false,
        error: "Invalid seller email format",
        field: "sellerEmail",
      });
    }

    // Validate amount is a number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be a valid positive number",
        field: "amount",
      });
    }

    // Prepare seller data
    const sellerData = {
      sellerEmail,
      sellerName,
      orderId,
      customerName,
      productName,
      amount: numericAmount,
      customization: customization || "Standard",
      expectedDelivery:
        expectedDelivery ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
          "en-IN"
        ),
      dashboardUrl:
        dashboardUrl ||
        `${
          process.env.NEXTAUTH_URL || "https://desigifting.store"
        }/seller/orders/${orderId}`,
    };

    // Send seller alert email
    console.log(
      `📧 Sending seller alert email to ${sellerEmail} for order #${orderId}`
    );

    const result = await emailService.sendSellerOrderAlert(sellerData);

    if (result.success) {
      console.log(
        `✅ Seller alert email sent successfully - Message ID: ${result.messageId}`
      );

      return res.status(200).json({
        success: true,
        message: "Seller alert email sent successfully",
        data: {
          messageId: result.messageId,
          orderId: orderId,
          sellerEmail: sellerEmail,
          emailUsage: {
            dailyCount: result.dailyCount,
            remaining:
              (process.env.EMAIL_DAILY_LIMIT || 500) - result.dailyCount,
            limit: process.env.EMAIL_DAILY_LIMIT || 500,
          },
        },
      });
    } else {
      console.error(`❌ Seller alert email failed: ${result.error}`);

      return res.status(500).json({
        success: false,
        error: result.error || "Failed to send seller alert email",
        orderId: orderId,
        emailUsage: {
          dailyCount: result.dailyCount,
          remaining: (process.env.EMAIL_DAILY_LIMIT || 500) - result.dailyCount,
          limit: process.env.EMAIL_DAILY_LIMIT || 500,
        },
      });
    }
  } catch (error) {
    console.error("❌ Seller alert API error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "local"
          ? error.message
          : "Something went wrong",
      orderId: req.body?.orderId || null,
    });
  }
}
