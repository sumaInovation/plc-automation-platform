import json

# Input file path
input_file = "/home/suma/Downloads/merged_output.json"
# Output file path
output_file = "/home/suma/Downloads/sku_list.txt"

# Read the merged JSON
with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Extract all SKUs
skus = []
for item in data:
    sku = item.get('sku')
    if sku:
        skus.append(sku)

# Save as text file (one SKU per line)
with open(output_file, 'w', encoding='utf-8') as f:
    for sku in skus:
        f.write(sku + '\n')

print(f"✅ Extracted {len(skus)} SKUs")
print(f"📁 Saved to: {output_file}")

# Show first 10 SKUs as preview
print("\n📋 First 10 SKUs:")
for i, sku in enumerate(skus[:10], 1):
    print(f"   {i}. {sku}")