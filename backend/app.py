import os
import json
import base64
import time
from flask import Flask, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# --- FALLBACK DATA (Used when API quota is empty) ---
MOCK_DESTINATIONS = [
    {
        "name": "Kyoto (Mock)",
        "location": "Japan",
        "description": "A stunning city of temples and cherry blossoms. (API Quota Limit Reached - Showing Backup)",
        "tags": ["Culture", "History", "Nature"],
        "imageUrl": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
        "isPersonalized": False
    },
    {
        "name": "Santorini (Mock)",
        "location": "Greece",
        "description": "White buildings and blue domes overlooking the sea. (API Quota Limit Reached - Showing Backup)",
        "tags": ["Sea", "Romance", "Views"],
        "imageUrl": "https://images.unsplash.com/photo-1613395877344-13d4c280d04f?auto=format&fit=crop&w=800&q=80",
        "isPersonalized": True
    }
]

@app.route('/api/generate-destinations', methods=['GET'])
def generate_destinations():
    print("Request received. Attempting to call Gemini...")
    try:
        # 1. Ask Gemini for IDEAS (Text)
        # We lower the count to 3 to save quota
        response = client.models.generate_content(
            model='gemini-2.0-flash', 
            contents="Generate 3 breathtaking, exotic travel bucket list destinations. "
                     "Return JSON with fields: name, location, description, tags (list of strings), "
                     "imagePrompt (vivid visual description), isPersonalized (boolean).",
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema={
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "name": {"type": "STRING"},
                            "location": {"type": "STRING"},
                            "description": {"type": "STRING"},
                            "tags": {"type": "ARRAY", "items": {"type": "STRING"}},
                            "imagePrompt": {"type": "STRING"},
                            "isPersonalized": {"type": "BOOLEAN"}
                        },
                        "required": ["name", "location", "description", "tags", "imagePrompt", "isPersonalized"]
                    }
                }
            )
        )
        
        destinations = json.loads(response.text)
        
        # 2. Generate IMAGES (with a pause to avoid 429)
        for dest in destinations:
            print(f"Generating image for: {dest['name']}")
            try:
                # PAUSE: Wait 4 seconds between images to respect the rate limit
                time.sleep(4) 
                
                img_response = client.models.generate_images(
                    model='imagen-4.0-fast-generate-001', # Using the '001' version as discussed
                    prompt=dest['imagePrompt'],
                    config=types.GenerateImagesConfig(
                        number_of_images=1,
                    )
                )
                
                if img_response.generated_images:
                    img_bytes = img_response.generated_images[0].image.image_bytes
                    b64_img = base64.b64encode(img_bytes).decode('utf-8')
                    dest['imageUrl'] = f"data:image/png;base64,{b64_img}"
                else:
                    dest['imageUrl'] = "https://via.placeholder.com/800x600?text=Generation+Failed"
                    
            except Exception as e:
                print(f"Image Gen Failed for {dest['name']}: {e}")
                # Fallback image
                dest['imageUrl'] = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80"

        return jsonify(destinations)

    except Exception as e:
        # IF WE HIT THE RATE LIMIT (429), USE MOCK DATA
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            print(">>> QUOTA EXHAUSTED. SWITCHING TO MOCK DATA. <<<")
            return jsonify(MOCK_DESTINATIONS)
        
        print(f"Major Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)