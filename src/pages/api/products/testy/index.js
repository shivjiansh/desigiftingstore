// pages/api/firebase-debug.js
export default async function handler(req, res) {
  try {
    const { adminDb } = await import("../../../../lib/firebaseAdmin");

    // Simple test query
    const testDoc = await adminDb.collection("test").limit(1).get();

    res.status(200).json({
      success: true,
      message: "Firebase connection successful!",
      docCount: testDoc.size,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }
}
