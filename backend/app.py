import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from database import get_next_batch

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/generate-destinations', methods=['GET'])
def generate_destinations():
    # 1. Try to get data from Supabase
    destinations = get_next_batch(limit=4)

    # 2. If DB is empty, tell frontend to wait
    if not destinations:
        return jsonify({"message": "No cached destinations. Please run seed.py"}), 503

    # 3. Transform snake_case to camelCase for frontend
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
            "isPersonalized": dest.get("is_personalized", False)
        })

    return jsonify(transformed)

if __name__ == '__main__':
    app.run(debug=True, port=5001)