import urllib.request
import urllib.error
import json
import os
import sys

BASE_URL = "http://localhost:8080/api"

def login():
    url = f"{BASE_URL}/auth/login"
    data = {"email": "admin@atelie.com", "password": "ECautomation@3009"}
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read()
            token = json.loads(res_body)["token"]
            print("[PASS] Login successful")
            return token
    except Exception as e:
        print(f"[FAIL] Login failed: {e}")
        sys.exit(1)

def create_product(token):
    url = f"{BASE_URL}/products"
    # Minimize payload, omitting 'marketplace' to test default
    # Let's fetch categories first
    try:
        req_cat = urllib.request.Request(f"{BASE_URL}/categories", headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req_cat) as response:
            cats = json.loads(response.read())
            if not cats:
                print("[WARN] No categories found. Creating dummy category not implemented.")
                sys.exit(1)
            cat_id = cats[0]["id"]
            print(f"[INFO] Using Category ID: {cat_id}")
    except Exception as e:
        print(f"[FAIL] Fetch categories failed: {e}")
        sys.exit(1)

    data = {
        "title": "Test Product Variant",
        "description": "Un producto de prueba",
        "price": 100.0,
        "stock": 10,
        "category": cat_id
    }

    # Now create product
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    })
    try:
        with urllib.request.urlopen(req) as response:
            product = json.loads(response.read())
            # Verify Marketplace
            marketplaces = product.get("marketplaces", [])
            marketplace_ids = product.get("marketplaceIds", [])
            
            # Check if LOJA_VIRTUAL is in marketplaces (by code)
            # Assuming ServiceProviderEntity exposes 'code'
            has_virtual_store = False
            for mp in marketplaces:
                if mp.get("code") == "LOJA_VIRTUAL":
                    has_virtual_store = True
                    break
            
            if has_virtual_store:
                 print("[PASS] Product Marketplace Default contains LOJA_VIRTUAL")
            else:
                 print(f"[FAIL] Marketplaces: {marketplaces}, IDs: {marketplace_ids}")
                 # It might be in IDs if marketplaces are not expanded?
                 # But we don't know the ID of LOJA_VIRTUAL here easily without fetching it.
                 # If list is empty, it failed.
            return product
    except Exception as e:
        print(f"[FAIL] Create product failed: {e}")
        try:
             # Try to read error body if available
             if hasattr(e, 'read'):
                 print(e.read().decode())
        except:
             pass
        sys.exit(1)

def create_variant(token, product_id):
    url = f"{BASE_URL}/products/{product_id}/variants"
    # Omit SKU to test generation
    data = {
         "stockQuantity": 10,
         "active": True
         # size, color removed or optional as per requirements
    }
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    })
    try:
        with urllib.request.urlopen(req) as response:
            variant = json.loads(response.read())
            # Verify SKU
            if variant.get("sku"):
                print(f"[PASS] Variant SKU Generated: {variant.get('sku')}")
            else:
                print("[FAIL] Variant SKU NOT generated")
            return variant
    except Exception as e:
        print(f"[FAIL] Create variant failed: {e}")
        if hasattr(e, 'read'):
             print(e.read().decode())
        sys.exit(1)

if __name__ == "__main__":
    print("Starting API Verification...")
    token = login()
    product = create_product(token)
    variant = create_variant(token, product["id"])
    print("Verification Completed Successfully.")
