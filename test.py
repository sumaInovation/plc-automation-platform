"""
TRONIC.LK Scraper V5 - With Full Specifications/Attributes
Extracts: Name, Code, Price, Description + Full Specs Table as separate columns

Example product page has:
- Specification:
  - Tail configuration: Wiring terminal
  - Switch Rating: 3A/250VAC
  etc...

Now we parse those into separate columns + JSON
"""
import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import json

BASE = "https://tronic.lk"
SITEMAP = "https://tronic.lk/sitemap.xml"
HEADERS = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"}

session = requests.Session()
session.headers.update(HEADERS)

def get_urls():
    r = session.get(SITEMAP, timeout=30)
    urls = re.findall(r'https://tronic\.lk/product/[a-z0-9\-]+', r.text)
    return list(dict.fromkeys(urls))

def clean(t):
    return re.sub(r'\s+', ' ', t).strip().replace("Sharing is caring, show love and share the product with your friends.", "").strip()

def scrape_with_specs(url):
    try:
        r = session.get(url, timeout=15)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')

        name = code = price = stock = ""
        description = ""
        specs_dict = {}

        # Get table data
        for tr in soup.find_all('tr'):
            tds = tr.find_all(['td','th'])
            if len(tds) >= 2:
                key = tds[0].get_text(strip=True).lower()
                val = clean(tds[1].get_text(" ", strip=True))
                if key == 'name':
                    name = val
                elif key == 'code':
                    code = val
                elif key == 'price':
                    price = val
                elif 'stock' in key:
                    stock = val

        # Fallback name from H1
        if not name:
            h1 = soup.find('h1')
            if h1:
                h1_text = clean(h1.get_text(" ", strip=True))
                if ' - ' in h1_text:
                    parts = h1_text.split(' - ', 1)
                    if len(parts[0]) < 20 and re.match(r'^[A-Z0-9\-]+$', parts[0].strip()):
                        name = parts[1].strip()
                        if not code:
                            code = parts[0].strip()
                    else:
                        name = h1_text
                else:
                    name = h1_text

        if not price:
            m = re.search(r'Rs\.\s*[\d,]+\.\d{2}', r.text)
            if m:
                price = m.group(0)

        # --- NEW: Extract Specifications / Attributes ---
        # Look for Product Details section
        # Tronic pages have structure like:
        # Product Details
        # **Specification:**
        # - Tail configuration: Wiring terminal
        # - Switch Rating: 3A/250VAC
        # etc.
        
        # Get the main content area
        content_text = soup.get_text("\n", strip=True)
        
        # Find specification block
        # Strategy: Find all <li> or lines starting with "-"
        spec_items = []
        # Method 1: Look for <li> tags
        for li in soup.find_all('li'):
            li_text = clean(li.get_text(" ", strip=True))
            if len(li_text) > 5 and len(li_text) < 300:
                # If it contains colon, treat as key:value
                if ':' in li_text:
                    k,v = li_text.split(':', 1)
                    k = k.strip().lstrip('- ').strip()
                    v = v.strip()
                    if len(k) < 60:  # Reasonable key length
                        specs_dict[k] = v
                        spec_items.append(li_text)
                else:
                    # It's a feature bullet
                    specs_dict[f"Feature_{len(spec_items)+1}"] = li_text
                    spec_items.append(li_text)
        
        # Method 2: If no li found, parse text after "Specification" or "Features"
        if not specs_dict:
            # Find text blocks after Specification keyword
            for header in soup.find_all(string=re.compile(r'(Specification|Features|Product Details)', re.I)):
                # Get next sibling text
                parent = header.parent
                if parent:
                    # Look for next div or p
                    next_text = ""
                    for sibling in parent.find_next_siblings():
                        txt = sibling.get_text("\n", strip=True)
                        if len(txt) > 20:
                            next_text += "\n" + txt
                        if len(next_text) > 2000:
                            break
                    # Parse lines with colon
                    for line in next_text.split('\n'):
                        line = line.strip().lstrip('-• ').strip()
                        if ':' in line and len(line) < 200:
                            k,v = line.split(':', 1)
                            k = k.strip()
                            v = v.strip()
                            if len(k) < 60 and len(v) < 200:
                                specs_dict[k] = v

        # Description - first paragraph(s) before specs
        desc_candidates = []
        for p in soup.find_all('p'):
            p_text = clean(p.get_text(" ", strip=True))
            if len(p_text) > 30 and 'Sharing is caring' not in p_text:
                desc_candidates.append(p_text)
        
        if desc_candidates:
            description = desc_candidates[0][:1000]
        else:
            # Use meta description
            meta = soup.find('meta', attrs={'name':'description'})
            if meta:
                description = clean(meta.get('content',''))[:1000]

        # Build final result
        result = {
            "Product Name": name,
            "Product Code": code,
            "Price": price,
            "In Stock": stock,
            "Description": description,
            "Specifications_JSON": json.dumps(specs_dict, ensure_ascii=False) if specs_dict else "",
            "URL": url
        }
        
        # Add each spec as separate column (for Excel)
        for k,v in specs_dict.items():
            # Clean key for column name
            col_name = f"Spec_{re.sub(r'[^A-Za-z0-9]+', '_', k).strip('_')[:30]}"
            result[col_name] = v

        return result

    except Exception as e:
        print(f"Error {url}: {e}")
        return None

def main():
    urls = get_urls()
    print(f"Total URLs: {len(urls)}")
    
    # Test with specific product that has specs
    test_url = "https://tronic.lk/product/stainless-steel-metal-push-button-16mm-flat-top"
    print(f"\nTesting spec extraction for: {test_url}")
    test_data = scrape_with_specs(test_url)
    if test_data:
        print(f"Name: {test_data['Product Name']}")
        print(f"Specs found: {len([k for k in test_data.keys() if k.startswith('Spec_')])}")
        for k,v in test_data.items():
            if k.startswith('Spec_'):
                print(f"  {k}: {v}")
    
    all_data = []
    print(f"\nStarting full scrape with specs...")
    
    with ThreadPoolExecutor(max_workers=10) as ex:
        futures = {ex.submit(scrape_with_specs, u): u for u in urls[:200]}  # Test first 200 for speed
        for i, f in enumerate(as_completed(futures), 1):
            data = f.result()
            if data:
                all_data.append(data)
            if i % 50 == 0:
                print(f"[{i}/{len(futures)}] {len(all_data)} saved")
    
    df = pd.DataFrame(all_data)
    # Fill NaN with empty
    df = df.fillna("")
    
    df.to_excel("tronic_with_specs_200.xlsx", index=False)
    print(f"\nDONE! Saved {len(df)} products with specs")
    print(f"Columns: {list(df.columns)[:15]}...")

if __name__ == "__main__":
    main()
