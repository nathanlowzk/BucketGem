import time
import random
import os
import json
import uuid
from difflib import SequenceMatcher
from pathlib import Path
from google import genai
from google.genai import types
from dotenv import load_dotenv
from services.database import init_db, add_destination, get_all_destination_names
from supabase import create_client

load_dotenv()

# --- CONFIGURATION ---
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

init_db()

# --- LOAD DATA FROM JSON ---
data_path = Path(__file__).parent / "data" / "region_themes.json"
with open(data_path, "r") as f:
    theme_data = json.load(f)

REGION_THEMES = theme_data["region_themes"]
TRAVEL_STYLES = theme_data["travel_styles"]


DUPLICATE_THRESHOLD = 0.75  # Similarity ratio above this = duplicate

def normalize_name(name: str) -> str:
    """Normalize a destination name for comparison: lowercase, strip punctuation, sort words."""
    import re
    name = re.sub(r'[^\w\s]', '', name.lower())
    return ' '.join(sorted(name.split()))

def is_duplicate(new_name: str, existing_entries: list[dict]) -> str | None:
    """
    Check if a new destination name is a fuzzy duplicate of any existing name.
    existing_entries: list of {"name": ..., "country": ...} dicts.
    Returns the matched existing name if duplicate, None otherwise.
    """
    norm_new = normalize_name(new_name)
    for entry in existing_entries:
        norm_existing = normalize_name(entry['name'])
        ratio = SequenceMatcher(None, norm_new, norm_existing).ratio()
        if ratio >= DUPLICATE_THRESHOLD:
            return entry['name']
    return None


def upload_image(image_bytes, destination_name):
    try:
        clean_name = destination_name.replace(" ", "-").lower()[:20]
        filename = f"{clean_name}-{uuid.uuid4().hex[:6]}.png"
        bucket_name = "travel-photos"
        supabase.storage.from_(bucket_name).upload(
            path=filename, file=image_bytes, file_options={"content-type": "image/png"}
        )
        return supabase.storage.from_(bucket_name).get_public_url(filename)
    except Exception as e:
        print(f"   ⚠️ Upload Failed: {e}")
        return None

def generate_single_destination(existing_entries: list[dict]) -> dict | None:
    """
    Generates ONE completely random destination with its own unique theme.
    existing_entries: list of {"name": ..., "country": ...} dicts from the DB + this batch.
    Returns {"name": ..., "country": ...} if successful, or None if failed.
    """

    # 1. Randomize EVERYTHING for this single slot
    c_region = random.choice(list(REGION_THEMES.keys()))
    # c_region = "Japan & East Asia"
    c_theme = random.choice(REGION_THEMES[c_region])
    c_style = random.choice(TRAVEL_STYLES)

    print(f"🎲 Rolling: {c_theme} in {c_region} ({c_style})...")

    destination_data = None
    max_dedup_attempts = 3  # How many times to retry if we get a duplicate
    avoid_names = []  # Names to explicitly tell Gemini to avoid (built up on retries)

    # 2. Text Generation (with dedup retries)
    for dedup_attempt in range(max_dedup_attempts):
        # Extra hint on retry to push Gemini away from the duplicate
        retry_hint = ""
        if dedup_attempt > 0:
            retry_hint = " Pick a lesser-known or more unusual destination this time."

        # Build avoid text from same-country names (only on retries, once we know the country)
        avoid_text = ""
        if avoid_names:
            # On retry: filter existing entries to same country + any previously generated dupes
            country = avoid_names[0].get('_country', '')
            same_country_names = [e['name'] for e in existing_entries if e.get('country', '').lower() == country.lower()]
            all_avoid = same_country_names + [n['name'] for n in avoid_names]
            # Deduplicate the list
            all_avoid = list(dict.fromkeys(all_avoid))
            avoid_text = f" Do NOT generate any of these already-existing destinations: {', '.join(all_avoid)}."

        for _ in range(3):  # API retry logic (for errors)
            try:
                prompt_text = (
                    f"Generate 1 real, specific travel bucket list destination in {c_region} "
                    f"that features {c_theme}. It must be perfect for {c_style}. "
                    "Do not invent places. Return JSON with fields: name, location, description, tags, imagePrompt, isPersonalized, country, region. "
                    "The 'country' field must be the exact country name (e.g., 'Japan', 'Thailand', 'Italy'). "
                    "The 'region' field must be an array containing one or more of these exact values where applicable: "
                    "'Oceania', 'East Asia', 'Middle East', 'South East Asia', 'Europe', 'North America', 'South America', 'Central America', 'Africa'. "
                    f"Most destinations belong to one region, but some may belong to multiple.{avoid_text}{retry_hint}"
                )

                response = client.models.generate_content(
                    model='gemini-3-flash-preview',
                    contents=prompt_text,
                    config=types.GenerateContentConfig(
                        response_mime_type='application/json',
                        temperature=1.0,
                        response_schema={
                            "type": "OBJECT",
                            "properties": {
                                "name": {"type": "STRING"},
                                "location": {"type": "STRING"},
                                "description": {"type": "STRING"},
                                "tags": {"type": "ARRAY", "items": {"type": "STRING"}},
                                "imagePrompt": {"type": "STRING"},
                                "isPersonalized": {"type": "BOOLEAN"},
                                "country": {"type": "STRING"},
                                "region": {"type": "ARRAY", "items": {"type": "STRING"}}
                            },
                            "required": ["name", "location", "description", "tags", "imagePrompt", "isPersonalized", "country", "region"]
                        }
                    )
                )
                destination_data = json.loads(response.text)
                break
            except Exception as e:
                print(f"   ⚠️ Text Error: {e}. Retrying...")
                time.sleep(2)

        if not destination_data:
            print("   ❌ Text failed. Skipping.")
            return None

        # 3. Fuzzy duplicate check (against ALL existing names, not just same country)
        matched = is_duplicate(destination_data['name'], existing_entries)
        if matched:
            print(f"   🔁 Duplicate detected: '{destination_data['name']}' ≈ '{matched}'. Retrying ({dedup_attempt + 1}/{max_dedup_attempts})...")
            # Track this name + its country so next retry can build a targeted avoid list
            avoid_names.append({'name': destination_data['name'], '_country': destination_data.get('country', '')})
            destination_data = None
            continue
        else:
            # Not a duplicate, proceed
            break

    if not destination_data:
        print("   ❌ Could not generate a unique destination after retries. Skipping.")
        return None

    # 4. Image Generation
    lighting = random.choice(["soft morning light", "golden hour", "moody overcast", "blue hour"])
    vibe = random.choice(["peaceful", "vibrant", "cinematic", "ethereal"])

    my_prompt = f"A stunning editorial travel photograph of {destination_data['name']}, {destination_data['location']}. {destination_data['imagePrompt']}. Shot on Fujifilm GFX 100S, medium format, 45mm lens, {lighting}, {vibe}, high resolution, sharp focus, professional color grading, Condé Nast Traveler style. The scene is COMPLETELY DEVOID of people. Any wildlife present must be in the far distance, no close-ups. Avoid large group of wildlife if any, keep it to few animals max."

    try:
        print(f"   🎨 Painting {destination_data['name']}...")
        time.sleep(15) # Safety pause for Image API

        img_response = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=my_prompt,
            config=types.GenerateImagesConfig(number_of_images=1, aspect_ratio="16:9")
        )

        if img_response.generated_images:
            img_bytes = img_response.generated_images[0].image.image_bytes
            print("   ☁️ Uploading...")
            public_url = upload_image(img_bytes, destination_data['name'])

            if public_url:
                destination_data['imageUrl'] = public_url
                add_destination(destination_data)
                print(f"   ✅ SUCCESS: {destination_data['name']}")
                return {"name": destination_data['name'], "country": destination_data.get('country', '')}
        else:
            print("   ❌ No image.")

    except Exception as e:
        print(f"   ⚠️ Image Error: {e}")
        if "429" in str(e):
            print("   ⏳ Rate Limit. Sleeping 30s...")
            time.sleep(30)

    return None

def generate_batch():
    # Fetch all existing destination names + countries once at the start
    existing_entries = get_all_destination_names()
    print(f"📋 Loaded {len(existing_entries)} existing destinations for dedup check.")
    print("🚀 Starting Batch (Generating 10 distinct items)...\n")

    for _ in range(10):
        new_entry = generate_single_destination(existing_entries)
        # Add the new entry to the in-memory list so we also avoid duplicates within this batch
        if new_entry:
            existing_entries.append(new_entry)
        time.sleep(2) # Pause between items

if __name__ == "__main__":
    generate_batch()
    print("\n🎉 Done.")
