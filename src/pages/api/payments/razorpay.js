import Razorpay from "razorpay";
import { adminAuth } from "../../../lib/firebaseAdmin";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    // Verify Firebase authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authorization token required",
      });
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (authError) {
      console.error("Auth verification failed:", authError);
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    // Extract and validate request data
    const { amount, currency = "INR", receipt, notes = {} } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid amount is required",
      });
    }

    if (!receipt) {
      return res.status(400).json({
        success: false,
        error: "Receipt ID is required",
      });
    }

    // Validate amount limits (Razorpay minimum is ₹1)
    if (amount < 1) {
      return res.status(400).json({
        success: false,
        error: "Minimum amount is ₹1",
      });
    }

    // Validate amount limits (Razorpay maximum for test mode)
    if (amount > 500000) {
      return res.status(400).json({
        success: false,
        error: "Amount exceeds maximum limit",
      });
    }

    // Prepare Razorpay order options
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert rupees to paise
      currency: currency.toUpperCase(),
      receipt: receipt.toString(),
      notes: {
        user_id: decodedToken.uid,
        user_email: decodedToken.email || "",
        ...notes, // Additional notes from request
      },
    };

    console.log("Creating Razorpay order with options:", {
      ...orderOptions,
      amount: `₹${amount} (${orderOptions.amount} paise)`,
    });

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create(orderOptions);

    console.log("Razorpay order created successfully:", razorpayOrder.id);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        id: razorpayOrder.id,
        entity: razorpayOrder.entity,
        amount: razorpayOrder.amount,
        amount_paid: razorpayOrder.amount_paid,
        amount_due: razorpayOrder.amount_due,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
        created_at: razorpayOrder.created_at,
        notes: razorpayOrder.notes,
      },
      message: "Razorpay order created successfully",
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    // Handle specific Razorpay errors
    if (error.error) {
      const razorpayError = error.error;

      // Map common Razorpay error codes to user-friendly messages
      const errorMessages = {
        BAD_REQUEST_ERROR: "Invalid request data provided",
        SERVER_ERROR: "Payment service temporarily unavailable",
        GATEWAY_ERROR: "Payment gateway error occurred",
      };

      return res.status(400).json({
        success: false,
        error:
          errorMessages[razorpayError.code] ||
          razorpayError.description ||
          "Payment order creation failed",
        errorCode: razorpayError.code,
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      error: "Internal server error while creating payment order",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
}
