"""
TRONIC.LK -> products.csv (NO CHECKPOINT - Clean version)
Same as before but NO checkpoint files

Usage:
pip install requests beautifulsoup4 pandas lxml
python3 tronic_no_checkpoint.py
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = "https://tronic.lk"
SITEMAP = "https://tronic.lk/sitemap.xml"
HEADERS = {"User-Agent": "Mozilla/5.0"}
OUTPUT_FILE = "products.csv"

CODE_TO_CATEGORY = {
    "DB": "Development Boards",
    "MD": "Sensor Modules",
    "BU": "Push Buttons & Switches",
    "SW": "Switches",
    "TA": "Tools and Accessories",
    "SP": "Speakers & Amplifiers",
    "CN": "Connectors & Cables",
    "RB": "Robotics & Chassis",
}

KEYWORD_TO_CATEGORY = {
    "arduino": "Development Boards",
    "sensor": "Sensor Modules",
    "motor": "Motors",
    "button": "Push Buttons & Switches",
    "relay": "Relays & Modules",
}

session = requests.Session()
session.headers.update(HEADERS)

def get_product_urls():
    print(f"Fetching sitemap...")
    r = session.get(SITEMAP, timeout=30)
    urls = re.findall(r'https://tronic\.lk/product/[a-z0-9\-]+', r.text)
    return list(dict.fromkeys(urls))

def clean_text(t):
    return re.sub(r'\s+', ' ', str(t)).strip().replace("Sharing is caring, show love and share the product with your friends.", "").strip()

def clean_price_to_number(price_str):
    if not price_str:
        return 0
    s = str(price_str).replace('Rs.', '').replace('Rs', '').replace(',', '').strip()
    m = re.search(r'(\d+\.?\d*)', s)
    if m:
        try:
            return float(m.group(1))
        except:
            return 0
    return 0

def detect_category(name, code, desc=""):
    code = str(code).upper()
    text = f"{name} {desc}".lower()
    for prefix, cat in CODE_TO_CATEGORY.items():
        if code.startswith(prefix):
            return cat
    for keyword, cat in KEYWORD_TO_CATEGORY.items():
        if keyword in text:
            return cat
    return "Electronic Components"

def detect_brand(name):
    nl = str(name).lower()
    if "arduino" in nl: return "Arduino"
    if "esp32" in nl or "esp8266" in nl: return "Espressif"
    return ""

def scrape_product(url):
    try:
        r = session.get(url, timeout=15)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')
        name = code = price_raw = stock_text = description = ""
        specs = {}
        for tr in soup.find_all('tr'):
            tds = tr.find_all(['td', 'th'])
            if len(tds) >= 2:
                key = tds[0].get_text(strip=True).lower()
                val = clean_text(tds[1].get_text(" ", strip=True))
                if key == 'name': name = val
                elif key == 'code': code = val
                elif key == 'price': price_raw = val
                elif 'stock' in key: stock_text = val
        if not name:
            h1 = soup.find('h1')
            if h1:
                h1_text = clean_text(h1.get_text(" ", strip=True))
                if ' - ' in h1_text:
                    parts = h1_text.split(' - ', 1)
                    if len(parts[0]) < 20 and re.match(r'^[A-Z0-9\-]+$', parts[0].strip()):
                        if not code: code = parts[0].strip()
                        name = parts[1].strip()
                    else: name = h1_text
                else: name = h1_text
        name = re.sub(r'^[A-Z0-9\-]+\s*-\s*', '', name).strip()
        if not price_raw:
            m = re.search(r'Rs\.\s*[\d,]+\.\d{2}', r.text)
            if m: price_raw = m.group(0)
        stock_qty = 50
        if stock_text and ('out' in stock_text.lower() or '0' in stock_text): stock_qty = 0
        for p in soup.find_all('p'):
            pt = clean_text(p.get_text(" ", strip=True))
            if len(pt) > 30 and 'Sharing is caring' not in pt:
                description = pt[:1000]
                break
        if not description: description = f"{name} - High quality electronic component."
        for li in soup.find_all('li'):
            li_text = clean_text(li.get_text(" ", strip=True))
            if 5 < len(li_text) < 250 and ':' in li_text:
                k, v = li_text.split(':', 1)
                k = k.strip().lstrip('-• ').strip().lower().replace(' ', '_')
                v = v.strip()
                if len(k) < 60 and len(v) < 200:
                    if 'volt' in k: specs['voltage'] = v
                    elif 'current' in k or 'amp' in k or 'rating' in k:
                        if 'voltage' in specs: specs['current'] = v
                        else: specs['voltage'] = v
                    elif 'communication' in k or 'interface' in k or 'connector' in k: specs['communication'] = v
                    else: specs[k] = v
        row = {
            "name": name[:200],
            "sku": code if code else url.split('/')[-1][:50],
            "category_name": detect_category(name, code, description),
            "description": description,
            "price": clean_price_to_number(price_raw),
            "compareAtPrice": "",
            "stock_qty": stock_qty,
            "brand": detect_brand(name),
        }
        for k, v in specs.items():
            if k not in row: row[k] = v
        return row
    except Exception as e:
        return None

def main():
    urls = get_product_urls()
    print(f"Found {len(urls)} products")
    # urls = urls[:20]  # Test with 20
    all_rows = []
    print(f"Scraping {len(urls)} products...")
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(scrape_product, url): url for url in urls}
        for i, future in enumerate(as_completed(futures), 1):
            result = future.result()
            if result and result.get('name') and result.get('price', 0) > 0:
                all_rows.append(result)
            if i % 100 == 0:
                print(f"  [{i}/{len(urls)}] {len(all_rows)} valid")
    
    df = pd.DataFrame(all_rows)
    df.drop_duplicates(subset=['sku'], inplace=True)
    required = ["name", "sku", "category_name", "description", "price", "compareAtPrice", "stock_qty", "brand"]
    spec_cols = [c for c in df.columns if c not in required]
    df = df[required + sorted(spec_cols)]
    df = df.fillna("")
    df = df[(df['name'] != "") & (df['price'] != 0)]
    df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
    print(f"\n✅ DONE! Only ONE file created: {OUTPUT_FILE} ({len(df)} products)")
    print("No checkpoint files!")

if __name__ == "__main__":
    main()
