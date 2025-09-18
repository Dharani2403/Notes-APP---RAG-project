import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer

def run_json_to_vector(input_json="data/data_chunks.json",
                       output_json="data/data_embeddings.json",
                       model_name="all-MiniLM-L6-v2"):
    """
    Convert text chunks into vector embeddings and save into JSON.
    """
    if not os.path.exists(input_json):
        return {"status": "error", "message": "No chunks found. Upload a file first."}

    # Load chunks
    with open(input_json, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    # Load embedding model
    model = SentenceTransformer(model_name)

    # Extract text
    contents = [chunk["content"] for chunk in chunks]

    # Generate embeddings
    embeddings = model.encode(contents, show_progress_bar=True, normalize_embeddings=True)

    # Attach embeddings
    for chunk, emb in zip(chunks, embeddings):
        chunk["embedding"] = emb.tolist()

    # Ensure output dir exists
    os.makedirs(os.path.dirname(output_json), exist_ok=True)

    # Overwrite embeddings file
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=4, ensure_ascii=False)

    return {"status": "success", "message": f"Embeddings updated for {len(chunks)} chunks using {model_name}"}


if __name__ == "__main__":
    print(run_json_to_vector())
