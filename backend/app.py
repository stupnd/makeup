import requests
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    
    # Dummy response (Replace with actual skin tone detection logic)
    return jsonify({"skin_tone": "Medium"}), 200


SEPHORA_API_URL = "https://sephora14.p.rapidapi.com/searchByKeyword"
HEADERS = {
    "x-rapidapi-key": "2b9f4f7fb2msh9c0c1810d22e013p131d0bjsn5d7338c8515d",  # Replace with your actual API key
    "x-rapidapi-host": "sephora14.p.rapidapi.com",
}

# Define dynamic search terms based on user input
def generate_search_terms(makeup_style, skin_type, finish):
    search_terms = {}

    # Foundation
    if makeup_style == "natural":
        search_terms["foundation"] = "lightweight foundation"
    elif makeup_style == "glam":
        search_terms["foundation"] = "full coverage foundation"
    elif makeup_style == "bold":
        search_terms["foundation"] = "matte foundation"

    # Modify for skin type
    if skin_type == "oily":
        search_terms["foundation"] = "matte oil-free foundation"
        search_terms["setting spray"] = "long-lasting setting spray"
    elif skin_type == "dry":
        search_terms["foundation"] = "hydrating foundation"
        search_terms["blush"] = "cream blush"
        search_terms["setting spray"] = "dewy setting spray"
    elif skin_type == "combination":
        search_terms["foundation"] = "balancing foundation"

    # Lipstick
    if makeup_style == "natural":
        search_terms["lipstick"] = "nude lipstick"
    elif makeup_style == "glam":
        search_terms["lipstick"] = "bold red lipstick"
    elif makeup_style == "bold":
        search_terms["lipstick"] = "deep red lipstick"

    # Blush
    if makeup_style == "natural":
        search_terms["blush"] = "soft pink blush"
    elif makeup_style == "glam":
        search_terms["blush"] = "rosy blush"
    elif makeup_style == "bold":
        search_terms["blush"] = "bright pink blush"

    # Finish Preference
    if finish == "matte":
        search_terms["foundation"] = "matte foundation"
        search_terms["lipstick"] = "matte lipstick"
    elif finish == "dewy":
        search_terms["foundation"] = "hydrating foundation"
        search_terms["blush"] = "glowy blush"

    # Add other products
    search_terms["lip balm"] = "tinted lip balm"
    search_terms["lip liner"] = "nude lip liner"
    search_terms["contour"] = "cream contour"
    search_terms["setting spray"] = search_terms.get("setting spray", "long-lasting setting spray")

    return search_terms

@app.route("/full-makeup-recommend", methods=["POST"])
def recommend_makeup():
    data = request.json
    makeup_style = data.get("makeupStyle", "natural")
    skin_type = data.get("skinType", "normal")
    finish = data.get("finish", "matte")

    # Generate dynamic search terms
    search_terms = generate_search_terms(makeup_style, skin_type, finish)
    recommendations = {}

    for category, search_term in search_terms.items():
        params = {"search": search_term, "page": "1", "sortBy": "NEW"}
        response = requests.get(SEPHORA_API_URL, headers=HEADERS, params=params)

        if response.status_code == 200:
            api_data = response.json()
            products = api_data.get("products", [])[:5]  # Get first 5 products

            recommendations[category] = [
                {
                    "name": product.get("displayName", "No Name Found"),
                    "brand": product.get("brandName", "No Brand Found"),
                    "image": product.get("heroImage", "No Image Found"),
                    "link": product.get("targetUrl", "No Link Found"),
                    "price": product.get("currentSku", {}).get("listPrice", "No Price Found"),
                }
                for product in products
            ]
        else:
            print(f"API Error: {response.json()}")  # Debugging print
            recommendations[category] = []

    return jsonify({"recommendations": recommendations})

if __name__ == "__main__":
    app.run(debug=True)
