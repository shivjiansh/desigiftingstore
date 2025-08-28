// pages/api/test.js
export default function handler(req, res) {
  try {
    console.log("=== Basic Test API Called ===");
    console.log("Method:", req.method);
    console.log("Timestamp:", new Date().toISOString());

    const response = {
      success: true,
      message: "API is working!",
      method: req.method,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      platform: process.platform,
      arch: process.arch,
    };

    console.log("Response:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("Basic test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}
