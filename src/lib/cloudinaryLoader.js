// lib/cloudinaryLoader.js
function cloudinaryLoader({ src, width, quality }) {
  if (!src) throw new Error("cloudinaryLoader: missing src");

  // Allow either a full Cloudinary URL or a public ID with version (v123/...)
  // 1) Strip host+delivery prefix if a full URL was passed
  let publicId = src
    .replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/?/, "")
    .replace(/^\/+/, ""); // remove leading slash

  // Optional: ensure you’re passing a versioned public ID (helps immutable caching)
  // e.g., 'v1757511389/desigifting/products/uwjutl13bt4aczaw5f20.jpg'

  const q = typeof quality === "number" ? quality : "auto";

  // Build the Cloudinary delivery URL with transforms
  return `https://res.cloudinary.com/dxs7yunib/image/upload/f_auto,q_${q},dpr_auto,c_fill,g_auto,w_${width}/${encodeURI(
    publicId
  )}`;
}

module.exports = cloudinaryLoader;
