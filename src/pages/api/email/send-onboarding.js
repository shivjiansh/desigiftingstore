// pages/api/email/send-onboarding.js
import emailService from "../../../lib/emailService";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      message: "This endpoint only accepts POST requests",
    });
  }

  try {
    const { email, name, businessName, userType } = req.body;

    // Validate required fields
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        message: "Valid email is required",
      });
    }

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        message: "Valid name is required",
      });
    }

    if (!businessName || typeof businessName !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        message: "Valid business name is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email",
        message: "Please provide a valid email address",
      });
    }

    // Log the onboarding email attempt
    console.log(
      `📧 Attempting to send onboarding email to: ${email} (${name} - ${businessName})`
    );

    // Send onboarding email using EmailService
    const emailResult = await emailService.sendSellerOnboardingEmail({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      businessName: businessName.trim(),
      userType: userType || "seller",
    });

    if (emailResult.success) {
      console.log(
        `✅ Seller onboarding email sent successfully to ${email} - Message ID: ${emailResult.messageId}`
      );

      return res.status(200).json({
        success: true,
        message: "Seller onboarding email sent successfully",
        data: {
          messageId: emailResult.messageId,
          recipient: email,
          businessName: businessName,
          dailyCount: emailResult.dailyCount || 0,
        },
      });
    } else {
      console.error(
        `❌ Failed to send onboarding email to ${email}:`,
        emailResult.error
      );

      return res.status(500).json({
        success: false,
        error: "Email sending failed",
        message: "Unable to send onboarding email. Please try again later.",
        details: emailResult.error,
        code: emailResult.code,
      });
    }
  } catch (error) {
    console.error("🚨 Onboarding email API error:", error);

    // Handle specific error types
    if (error.message.includes("Daily email limit")) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        message: "Daily email limit reached. Please try again tomorrow.",
        retryAfter: "24 hours",
      });
    }

    if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
      return res.status(503).json({
        success: false,
        error: "Service temporarily unavailable",
        message:
          "Email service is temporarily unavailable. Please try again in a few minutes.",
        retryAfter: "5 minutes",
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        "An unexpected error occurred while sending the email. Please try again later.",
    });
  }
}

// Export configuration for larger request body size if needed
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};
