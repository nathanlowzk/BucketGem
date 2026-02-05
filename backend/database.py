import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv
import random

load_dotenv()

# Initialize Supabase Client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("❌ Supabase credentials missing. Check your .env file.")

supabase: Client = create_client(url, key)

def init_db():
    # With Supabase, we don't need to "create" the DB file locally.
    # We can just print a success message to confirm the credentials work.
    print("✅ Connected to Supabase Cloud Database.")

def add_destination(dest):
    """
    Saves a single destination to the Supabase 'destinations' table.
    """
    # Prepare the data object
    # Note: We don't need json.dumps(tags) because Supabase handles lists automatically
    data = {
        "name": dest['name'],
        "location": dest['location'],
        "description": dest['description'],
        "tags": dest['tags'], 
        "image_url": dest['imageUrl'],
        "is_personalized": dest['isPersonalized'],
        "viewed": False
    }
    
    try:
        response = supabase.table("destinations").insert(data).execute()
        return response
    except Exception as e:
        print(f"❌ Error saving to Supabase: {e}")
        return None
    
def get_random_batch(limit=4):
    """
    Fetches all destinations and returns 4 random ones.
    """
    try:
        # 1. Fetch data (assuming 'supabase' variable exists in this file)
        response = supabase.table('destinations').select('*').execute()
        all_data = response.data

        # 2. Pick random items
        if not all_data:
            return []

        count = min(limit, len(all_data))
        return random.sample(all_data, count)

    except Exception as e:
        print(f"Error fetching random batch: {e}")
        return []


def get_destinations_by_tags(tags: list, limit=4):
    """
    Fetches destinations that have at least one matching tag.

    Args:
        tags: List of tag strings to match against (e.g., ["beach", "mountain", "temple"])
        limit: Maximum number of destinations to return

    Returns:
        List of destinations that match any of the provided tags, randomly sampled
    """
    try:
        # Fetch all destinations from the database
        response = supabase.table('destinations').select('*').execute()
        all_data = response.data

        if not all_data:
            return []

        # Filter destinations that have at least one matching tag
        # We normalize both the destination tags and search tags to lowercase for matching
        normalized_search_tags = [tag.lower() for tag in tags]

        matching_destinations = []
        for dest in all_data:
            dest_tags = dest.get('tags', [])
            # Normalize destination tags to lowercase
            normalized_dest_tags = [t.lower() for t in dest_tags]

            # Check if any of the destination's tags match any of the search tags
            has_match = any(tag in normalized_search_tags for tag in normalized_dest_tags)

            if has_match:
                matching_destinations.append(dest)

        # If no matches found, return empty list
        if not matching_destinations:
            return []

        # Return a random sample of the matching destinations
        count = min(limit, len(matching_destinations))
        return random.sample(matching_destinations, count)

    except Exception as e:
        print(f"Error fetching destinations by tags: {e}")
        return []