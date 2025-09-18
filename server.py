from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from file_extract import run_file_extract
from json_to_vector import run_json_to_vector
from llm_query import run_llm_query
import os

app = Flask(__name__, static_folder="frontend/build", static_url_path="/")
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload_file():
    file = request.files["file"]
    path = os.path.join(DATA_DIR, file.filename)
    file.save(path)

    run_file_extract(path)
    run_json_to_vector()

    return jsonify({"status": "success", "message": f"{file.filename} processed & embeddings updated"})

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    query = data.get("message", "")
    result = run_llm_query(query)
    return jsonify(result)

# Serve React frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
