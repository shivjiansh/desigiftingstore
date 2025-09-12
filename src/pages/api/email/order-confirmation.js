// pages/api/email/order-confirmation.js
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
      customerEmail,
      customerName,
      orderId,
      productName,
      sellerName,
      amount,
      customization,
      expectedDelivery,
      orderUrl,
      deliveryAddress,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      customerEmail: "Customer email",
      customerName: "Customer name",
      orderId: "Order ID",
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
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
        field: "customerEmail",
      });
    }

    // Prepare email data
    const orderData = {
      customerEmail,
      customerName,
      orderId,
      productName: productName || "Custom Gift",
      sellerName: sellerName || "DesiGifting Partner",
      amount: parseFloat(amount) || 0,
      customization: customization || "Standard",
      expectedDelivery:
        expectedDelivery ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
          "en-IN"
        ),
      orderUrl:
        orderUrl ||
        `${
          process.env.NEXTAUTH_URL || "https://desigifting.store"
        }/orders/${orderId}`,
      deliveryAddress: deliveryAddress || "",
    };

    // Send order confirmation email
    console.log(
      `📧 Sending order confirmation email to ${customerEmail} for order #${orderId}`
    );

    const result = await emailService.sendOrderConfirmation(orderData);

    if (result.success) {
      console.log(
        `✅ Order confirmation email sent successfully - Message ID: ${result.messageId}`
      );

      return res.status(200).json({
        success: true,
        message: "Order confirmation email sent successfully",
        data: {
          messageId: result.messageId,
          orderId: orderId,
          customerEmail: customerEmail,
          emailUsage: {
            dailyCount: result.dailyCount,
            remaining:
              (process.env.EMAIL_DAILY_LIMIT || 500) - result.dailyCount,
            limit: process.env.EMAIL_DAILY_LIMIT || 500,
          },
        },
      });
    } else {
      console.error(`❌ Order confirmation email failed: ${result.error}`);

      return res.status(500).json({
        success: false,
        error: result.error || "Failed to send email",
        orderId: orderId,
        emailUsage: {
          dailyCount: result.dailyCount,
          remaining: (process.env.EMAIL_DAILY_LIMIT || 500) - result.dailyCount,
          limit: process.env.EMAIL_DAILY_LIMIT || 500,
        },
      });
    }
  } catch (error) {
    console.error("❌ Order confirmation API error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
      orderId: req.body?.orderId || null,
    });
  }
}
