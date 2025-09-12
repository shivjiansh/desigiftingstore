// lib/emailService.js
import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
        secureProtocol: "TLSv1_2_method",
        ciphers: "SSLv3",
      },
      // Gmail-optimized settings for ECONNRESET prevention
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000, // 60 seconds
      pool: true, // Enable connection pooling
      maxConnections: 5, // Limit concurrent connections
      maxMessages: 100, // Messages per connection
      rateLimit: 14, // 14 emails per second (Gmail limit)
    });

    // Handle pool events
    this.transporter.on("idle", () => {
      if (process.env.EMAIL_DEBUG === "true") {
        console.log("📧 Email transporter is idle");
      }
    });

    this.transporter.on("error", (error) => {
      console.error("📧 Transporter pool error:", error);
      this.lastError = error;
    });

    this.dailyCount = 0;
    this.resetDate = new Date().toDateString();
    this.lastError = null;

    // Verify connection on startup
    this.verifyConnection();
  }

  // Verify SMTP connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      if (process.env.EMAIL_DEBUG === "true") {
        console.log("✅ SMTP connection verified successfully");
      }
      return true;
    } catch (error) {
      console.error("❌ SMTP connection failed:", error);
      this.lastError = error;
      return false;
    }
  }

  // Check daily limit
  checkDailyLimit() {
    const today = new Date().toDateString();
    if (today !== this.resetDate) {
      this.dailyCount = 0;
      this.resetDate = today;
    }

    const limit = parseInt(process.env.EMAIL_DAILY_LIMIT) || 500;
    if (this.dailyCount >= limit) {
      throw new Error(
        `Daily email limit of ${limit} reached. Try again tomorrow.`
      );
    }
  }

  // Send email with error handling and retry logic
  async sendEmail(mailOptions, retryCount = 0) {
    try {
      this.checkDailyLimit();

      const defaultOptions = {
        from: `${process.env.FROM_NAME || "DesiGifting"} <${
          process.env.FROM_EMAIL || process.env.GMAIL_USER
        }>`,
      };

      const finalOptions = { ...defaultOptions, ...mailOptions };

      const info = await this.transporter.sendMail(finalOptions);
      this.dailyCount++;

      if (process.env.EMAIL_DEBUG === "true") {
        console.log(
          `✅ Email sent to ${finalOptions.to} - ID: ${info.messageId}`
        );
        console.log(
          `📊 Daily count: ${this.dailyCount}/${
            parseInt(process.env.EMAIL_DAILY_LIMIT) || 500
          }`
        );
      }

      return {
        success: true,
        messageId: info.messageId,
        dailyCount: this.dailyCount,
      };
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      this.lastError = error;

      // Retry logic for ECONNRESET and similar connection errors
      if (
        (error.code === "ESOCKET" ||
          error.code === "ECONNRESET" ||
          error.code === "ETIMEDOUT" ||
          error.code === "ENOTFOUND") &&
        retryCount < 3
      ) {
        console.log(
          `🔄 Retrying email send (attempt ${retryCount + 1}/3) for error: ${
            error.code
          }`
        );

        // Exponential backoff: wait 1s, 2s, 4s
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );

        return this.sendEmail(mailOptions, retryCount + 1);
      }

      return {
        success: false,
        error: error.message,
        code: error.code,
        dailyCount: this.dailyCount,
        retryCount: retryCount,
      };
    }
  }

  // Order confirmation email for buyers
  async sendOrderConfirmation(orderData) {
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
    } = orderData;

    const mailOptions = {
      to: customerEmail,
      subject: `🎉 Order Confirmed - DesiGifting #${orderId.slice(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - DesiGifting</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f7f7f7;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #10b981, #059669); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content { 
              padding: 40px 30px; 
            }
            .order-box { 
              background: #f8fafc; 
              border: 2px solid #e5e7eb; 
              border-radius: 12px; 
              padding: 25px; 
              margin: 25px 0; 
              border-left: 5px solid #10b981;
            }
            .order-box h3 {
              margin: 0 0 20px 0;
              color: #1f2937;
              font-size: 18px;
            }
            .button { 
              display: inline-block;
              background: linear-gradient(135deg, #10b981, #059669); 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
            }
            .steps {
              background: #eff6ff;
              border-radius: 12px;
              padding: 25px;
              margin: 25px 0;
            }
            .steps h3 {
              color: #1e40af;
              margin: 0 0 15px 0;
            }
            .steps ol {
              margin: 0;
              padding-left: 20px;
              color: #1e40af;
            }
            .footer { 
              text-align: center; 
              background: #f9fafb;
              padding: 30px 20px; 
              color: #6b7280; 
              font-size: 14px; 
            }
            .footer a {
              color: #10b981;
              text-decoration: none;
            }
            @media (max-width: 600px) {
              .container { margin: 10px; }
              .header, .content { padding: 20px; }
              .order-box { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 Thank You for Your Order!</h1>
              <p>Your personalized gift is being crafted with love</p>
            </div>
            
            <div class="content">
              <p style="font-size: 18px;">Hi <strong>${customerName}</strong>,</p>
              
              <p>Great news! Your order has been confirmed and our talented artisan partner <strong>${sellerName}</strong> is starting to create your personalized gift.</p>
              
              <div class="order-box">
                <h3>📦 Order Details</h3>
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>Product:</strong> ${productName}</p>
                <p><strong>Artisan Partner:</strong> ${sellerName}</p>
                <p><strong>Personalization:</strong> ${
                  customization || "Standard"
                }</p>
                <p><strong>Amount Paid:</strong> &#8377;${amount}</p>
                <p><strong>Expected Delivery:</strong> ${expectedDelivery}</p>
                ${
                  deliveryAddress
                    ? `<p><strong>Delivery Address:</strong> ${deliveryAddress}</p>`
                    : ""
                }
              </div>
              
              <div class="steps">
                <h3>🎨 What happens next?</h3>
                <ol>
                  <li><strong>Crafting begins:</strong> Our artisan starts creating your personalized gift</li>
                  <li><strong>Quality check:</strong> We ensure everything meets our high standards</li>
                  <li><strong>Shipping notification:</strong> You'll receive tracking details when it ships</li>
                  <li><strong>Delivery:</strong> Enjoy your perfect personalized gift!</li>
                </ol>
              </div>
              
              ${
                orderUrl
                  ? `
              <div style="text-align: center;">
                <a href="${orderUrl}" class="button">Track Your Order</a>
              </div>
              `
                  : ""
              }
              
              <p>If you have any questions, just reply to this email or contact our support team.</p>
              
              <p style="margin-top: 30px; font-size: 16px;">
                Thank you for choosing DesiGifting! ❤️
              </p>
            </div>
            
            <div class="footer">
              <p><strong>DesiGifting</strong> - India's Premier Personalized Gifts Marketplace</p>
              <p>🌐 <a href="https://desigifting.store">desigifting.store</a> | 📧 <a href="mailto:support@desigifting.store">support@desigifting.store</a></p>
              <p style="font-size: 12px; margin-top: 20px; color: #9ca3af;">
                This email was sent to ${customerEmail}. You're receiving this because you placed an order with DesiGifting.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    return await this.sendEmail(mailOptions);
  }

  // New order alert for sellers
  async sendSellerOrderAlert(sellerData) {
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
    } = sellerData;

    const mailOptions = {
      to: sellerEmail,
      subject: `🎉 New Order Received - #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Alert - DesiGifting</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f0f9ff; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: #059669; color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px; }
            .order-box { background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
            .urgent { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>You have a new order on DesiGifting</p>
            </div>
            
            <div class="content">
              <p>Hi <strong>${sellerName}</strong>,</p>
              
              <div class="urgent">
                <strong>⏰ Action Required:</strong> Please confirm this order within 2 hours to maintain your seller rating.
              </div>
              
              <div class="order-box">
                <h3>📋 New Order Details</h3>
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Product:</strong> ${productName}</p>
                <p><strong>Customization Required:</strong> ${
                  customization || "Standard"
                }</p>
                <p><strong>Order Value:</strong> &#8377;${amount}</p>
                <p><strong>Expected Delivery:</strong> ${expectedDelivery}</p>
              </div>
              
              <h3>📝 Next Steps:</h3>
              <ol>
                <li><strong>Accept the order</strong> in your seller dashboard</li>
                <li><strong>Review customization requirements</strong> carefully</li>
                <li><strong>Update production timeline</strong> if needed</li>
                <li><strong>Start crafting</strong> this amazing personalized gift!</li>
              </ol>
              
              ${
                dashboardUrl
                  ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" class="button">View Order in Dashboard</a>
              </div>
              `
                  : ""
              }
              
              <p>Remember: Happy customers lead to great reviews and more orders! 🌟</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    return await this.sendEmail(mailOptions);
  }
  // Add this method to your EmailService class
  async sendSellerOnboardingEmail(sellerData) {
    const {
      email,
      name,
      businessName,
      dashboardUrl,
      userType = "seller",
    } = sellerData;

    const mailOptions = {
      to: email,
      subject: `🎉 Welcome to DesiGifting Seller Program - Let's Start Your Journey!`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DesiGifting Seller Program</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f0f9ff; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px; }
          .welcome-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .steps-box { background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
          .stat-number { font-size: 20px; font-weight: bold; color: #059669; }
          .tip-box { background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to DesiGifting!</h1>
            <p>Your seller journey starts now</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            
            <div class="welcome-box">
              <h3>🚀 Congratulations on Joining DesiGifting!</h3>
              <p>We're thrilled to welcome <strong>${businessName}</strong> to India's fastest-growing personalized gifts marketplace. Your creative journey begins today!</p>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">50,000+</div>
                <div>Active Buyers</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">99%</div>
                <div>Profit Share</div>
              </div>
            </div>
            
            <div class="steps-box">
              <h3>📋 What's Next? Your Onboarding Checklist:</h3>
              <ol>
                <li><strong>Account Review:</strong> Our team will verify your business information within 24 hours</li>
                <li><strong>Complete Your Profile:</strong> Add your logo, banner, and business description</li>
                <li><strong>Upload Your First Products:</strong> List your amazing personalized creations</li>
                <li><strong>Set Up Payment:</strong> Add your bank details for seamless payouts</li>
                <li><strong>Start Selling:</strong> Begin receiving orders from day one!</li>
              </ol>
            </div>
            
            ${
              dashboardUrl
                ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" class="button">Access Your Seller Dashboard</a>
            </div>
            `
                : ""
            }
            
            <div class="tip-box">
              <h4 style="margin: 0 0 10px 0; color: #059669;">💡 Pro Tips for Success:</h4>
              <ul style="margin: 0; color: #047857;">
                <li>High-quality product photos increase sales by 40%</li>
                <li>Detailed product descriptions attract more buyers</li>
                <li>Fast response times build customer trust</li>
                <li>Custom order capabilities boost your earnings</li>
              </ul>
            </div>
            
            <h3>🆘 Need Help Getting Started?</h3>
            <p>Our seller support team is here for you:</p>
            <ul>
              <li>📧 Email: <a href="mailto:seller-support@desigifting.store">seller-support@desigifting.store</a></li>
              <li>📱 WhatsApp: +91-9876543210</li>
              <li>📚 <a href="${
                process.env.NEXT_PUBLIC_BASE_URL
              }/seller-guide">Seller Success Guide</a></li>
              <li>🎥 <a href="${
                process.env.NEXT_PUBLIC_BASE_URL
              }/seller-tutorials">Video Tutorials</a></li>
            </ul>
            
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <h4 style="color: #1f2937; margin: 0 0 10px 0;">🎯 Your Success Mantra</h4>
              <p style="font-style: italic; margin: 0; color: #4b5563;">"Every personalized gift you create brings joy to someone's life. Let's make magic together!"</p>
            </div>
            
            <p style="margin-top: 30px; font-size: 16px;">
              Welcome to the DesiGifting family! We can't wait to see your amazing creations. 🎁<br><br>
              <strong>Happy Selling!</strong><br>
              <em>Team DesiGifting</em>
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p><strong>DesiGifting Seller Program</strong> - India's Premier Personalized Gifts Marketplace</p>
            <p>🌐 <a href="https://desigifting.store">desigifting.store</a> | 📧 <a href="mailto:seller-support@desigifting.store">seller-support@desigifting.store</a></p>
            <p style="margin-top: 15px; color: #9ca3af;">
              This email was sent to ${email}. You're receiving this because you registered as a seller with DesiGifting.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    return await this.sendEmail(mailOptions);
  }

  // Payment confirmation email
  async sendPaymentConfirmation(paymentData) {
    const {
      customerEmail,
      customerName,
      orderId,
      amount,
      paymentMethod,
      transactionId,
    } = paymentData;

    const mailOptions = {
      to: customerEmail,
      subject: `💰 Payment Confirmed - Order #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation - DesiGifting</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f7f7f7; }
            .container { background: white; border-radius: 12px; overflow: hidden; margin: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .payment-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Payment Successful!</h2>
            </div>
            <div class="content">
              <p>Hi <strong>${customerName}</strong>,</p>
              <p>We've successfully received your payment for order <strong>#${orderId}</strong>.</p>
              
              <div class="payment-box">
                <h3>💳 Payment Details</h3>
                <p><strong>Amount Paid:</strong> &#8377;${amount}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString(
                  "en-IN"
                )}</p>
              </div>
              
              <p>Your order is now confirmed and will be processed shortly.</p>
              <p>Thank you for choosing DesiGifting! 🎁</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    return await this.sendEmail(mailOptions);
  }

  // Get daily usage stats
  getUsageStats() {
    const limit = parseInt(process.env.EMAIL_DAILY_LIMIT) || 500;
    return {
      dailyCount: this.dailyCount,
      remaining: limit - this.dailyCount,
      resetDate: this.resetDate,
      limit: limit,
    };
  }

  // Get health status of email service
  async getHealthStatus() {
    const isConnected = await this.verifyConnection();
    return {
      connected: isConnected,
      dailyUsage: this.getUsageStats(),
      lastError: this.lastError
        ? {
            message: this.lastError.message,
            code: this.lastError.code,
            time: new Date().toISOString(),
          }
        : null,
      poolStatus: {
        isIdle: this.transporter.isIdle(),
        queueSize: this.transporter.queueSize || 0,
      },
    };
  }

  // Close connection pool gracefully
  async close() {
    if (this.transporter) {
      this.transporter.close();
      console.log("📧 Email service connection pool closed");
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

// Graceful shutdown handler
process.on("SIGINT", async () => {
  await emailService.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await emailService.close();
  process.exit(0);
});

export default emailService;
