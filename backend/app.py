import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from database import get_random_batch, get_destinations_by_tags

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route('/api/destinations/random', methods=['GET'])
def random_destinations():
    # 1. Let database.py do the work
    destinations = get_random_batch(limit=4)

    if not destinations:
        return jsonify({"message": "Database is empty"}), 404

    # 2. Transform snake_case (DB) to camelCase (Frontend)
    transformed = []
    for dest in destinations:
        transformed.append({
            "id": str(dest.get("id")),
            "name": dest.get("name"),
            "location": dest.get("location"),
            "description": dest.get("description"),
            "tags": dest.get("tags", []),
            "imagePrompt": dest.get("image_prompt", ""),
            "imageUrl": dest.get("image_url"), # Now this is a URL, not Base64!
            "isPersonalized": dest.get("is_personalized", False)
        })

    return jsonify(transformed)


@app.route('/api/destinations/personalized', methods=['GET'])
def personalized_destinations():
    """
    Fetches destinations that match the user's preferred tags.

    Query Parameters:
        tags: Comma-separated list of tags (e.g., "beach,mountain,temple")

    Returns:
        JSON array of destinations matching any of the provided tags
    """
    # Get the tags from query parameter
    tags_param = request.args.get('tags', '')

    if not tags_param:
        return jsonify({"error": "No tags provided"}), 400

    # Split the comma-separated tags into a list
    tags = [tag.strip() for tag in tags_param.split(',') if tag.strip()]

    if not tags:
        return jsonify({"error": "No valid tags provided"}), 400

    # Fetch destinations matching these tags
    destinations = get_destinations_by_tags(tags, limit=4)

    if not destinations:
        return jsonify({"message": "No destinations found matching your interests"}), 404

    # Transform snake_case (DB) to camelCase (Frontend)
    transformed = []
    for dest in destinations:
        transformed.append({
            "id": str(dest.get("id")),
            "name": dest.get("name"),
            "location": dest.get("location"),
            "description": dest.get("description"),
            "tags": dest.get("tags", []),
            "imagePrompt": dest.get("image_prompt", ""),
            "imageUrl": dest.get("image_url"),
            "isPersonalized": True  # Mark as personalized since it matched user's tags
        })

    return jsonify(transformed)


if __name__ == '__main__':
    app.run(debug=True, port=5001)