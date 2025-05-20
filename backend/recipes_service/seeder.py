import json
import requests

API_URL = "http://localhost:8002/recipes"

def main():
    with open("recipes_seed.json", "r", encoding="utf-8") as f:
        recipes = json.load(f)

    for r in recipes:
        resp = requests.post(API_URL, json=r)
        if resp.ok:
            created = resp.json()
            print(f"✅ Created {created['id']}: {created['name']}")
        else:
            print(f"❌ Failed to create {r['name']}: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    main()