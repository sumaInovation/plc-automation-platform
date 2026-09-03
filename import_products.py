import csv
from pymongo import MongoClient
from datetime import datetime
import re

MONGODB_URI="mongodb+srv://sumanga:1234@cluster0.othjbmr.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGODB_URI)
db = client["test"]
products_collection = db["products"]
categories_collection = db["categories"]

def slugify(text, sku=""):
    """Slug + sku = unique slug"""
    base = text.lower().strip()
    base = re.sub(r'[^a-z0-9]+', '-', base)
    base = re.sub(r'-+', '-', base).strip('-')
    # SKU ekath add karanawa unique karanna
    if sku:
        return f"{base}-{sku.lower()}"
    return base

def get_or_create_category(name):
    category = categories_collection.find_one({"name": name})
    if category:
        return category["_id"]
    new_category = {
        "name": name,
        "slug": slugify(name),
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
    result = categories_collection.insert_one(new_category)
    print(f"  ✓ Created new category: {name}")
    return result.inserted_id

def import_products(csv_file):
    with open(csv_file, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames:
            reader.fieldnames = [h.strip().lstrip('\ufeff') for h in reader.fieldnames]
        
        count = 0
        skipped = 0
        for row in reader:
            row = {k.strip().lstrip('\ufeff'): v for k, v in row.items()}
            
            if not row.get("sku"):
                continue

            # SKU eken check karanna, slug eken newei (slug duplicate wenna puluwan)
            existing = products_collection.find_one({"sku": row["sku"]})
            if existing:
                print(f"  ⚠ Skipped (duplicate SKU): {row.get('name','')} - {row.get('sku','')}")
                skipped += 1
                continue

            category_id = get_or_create_category(row["category_name"])

            reserved_cols = {"name", "sku", "category_name", "description", "price", "compareAtPrice", "stock_qty", "brand"}
            specs = {k: v for k, v in row.items() if k not in reserved_cols and str(v).strip()}

            # UNIQUE SLUG with SKU
            unique_slug = slugify(row["name"], row["sku"])

            product = {
                "name": row["name"],
                "slug": unique_slug,  # e.g. digit-7-segment-red...-ds0012
                "sku": row["sku"],
                "category": category_id,
                "description": row["description"],
                "price": float(row["price"]) if row["price"] else 0,
                "compareAtPrice": float(row["compareAtPrice"]) if row.get("compareAtPrice", "").strip() else None,
                "stock_qty": int(float(row["stock_qty"])) if row["stock_qty"] else 50,
                "brand": row.get("brand", ""),
                "images": [],
                "specs": specs,
                "isActive": True,
                "avgRating": 0,
                "reviewCount": 0,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow(),
            }

            try:
                products_collection.insert_one(product)
                count += 1
                print(f"  ✓ Imported: {row['name']} - {row['sku']}")
            except Exception as e:
                if "duplicate key" in str(e).lower():
                    print(f"  ⚠ Skipped (duplicate slug): {row['name']} - trying with extra unique")
                    # Try with timestamp
                    product["slug"] = f"{unique_slug}-{int(datetime.utcnow().timestamp())}"
                    try:
                        products_collection.insert_one(product)
                        count += 1
                        print(f"  ✓ Imported with new slug: {row['name']}")
                    except:
                        skipped += 1
                        print(f"  ❌ Failed: {row['name']}")
                else:
                    print(f"  ❌ Error: {e}")
                    skipped += 1

        print(f"\n✅ Done! {count} imported, {skipped} skipped")

if __name__ == "__main__":
    import_products("products.csv")
