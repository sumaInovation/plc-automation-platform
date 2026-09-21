import { MongoClient } from "mongodb";

// Set these in your .env.local (and in your hosting provider's env settings)
// MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net
// MONGODB_DB=suma_automation
// SITE_URL=https://sumaautomation.lk

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "suma_automation";
const SITE_URL = process.env.SITE_URL || "https://sumaautomation.lk";

let cachedClient = null;

async function getDb() {
  if (cachedClient) return cachedClient.db(DB_NAME);
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client.db(DB_NAME);
}

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Adjust these field names to match your actual MongoDB "products" collection schema
function buildItem(p) {
  const id = escapeXml(p.sku || p._id?.toString());
  const title = escapeXml(p.title || p.name || "");
  const description = escapeXml(p.description || "");
  const link = `${SITE_URL}/products/${p.slug || p._id}`;
  const imageLink = escapeXml(p.imageUrl || (Array.isArray(p.images) && p.images[0]) || "");
  const priceValue = Number(p.price || 0).toFixed(2);
  const price = `${priceValue} LKR`;
  const inStock = p.stock === undefined ? true : Number(p.stock) > 0;
  const availability = inStock ? "in stock" : "out of stock";
  const brand = escapeXml(p.brand || "Suma Automation");
  const hasIdentifier = Boolean(p.gtin || p.mpn);

  return `
  <item>
    <g:id>${id}</g:id>
    <title>${title}</title>
    <description>${description}</description>
    <link>${escapeXml(link)}</link>
    <g:image_link>${imageLink}</g:image_link>
    <g:availability>${availability}</g:availability>
    <g:price>${price}</g:price>
    <g:brand>${brand}</g:brand>
    <g:condition>new</g:condition>
    <g:identifier_exists>${hasIdentifier ? "yes" : "no"}</g:identifier_exists>
    ${p.gtin ? `<g:gtin>${escapeXml(p.gtin)}</g:gtin>` : ""}
    ${p.mpn ? `<g:mpn>${escapeXml(p.mpn)}</g:mpn>` : ""}
  </item>`;
}

export async function GET() {
  try {
    const db = await getDb();

    // Only feed products that should actually be shown — adjust the filter
    // to match your schema (e.g. published: true, hidden: { $ne: true })
    const products = await db
      .collection("products")
      .find({})
      .toArray();

    const items = products.map(buildItem).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>Suma Automation Product Feed</title>
  <link>${SITE_URL}</link>
  <description>Product feed for Google Merchant Center</description>
  ${items}
</channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    console.error("Product feed generation failed:", err);
    return new Response("Failed to generate product feed", { status: 500 });
  }
}

// Ensures the route re-queries MongoDB instead of being statically cached at build time
export const dynamic = "force-dynamic";