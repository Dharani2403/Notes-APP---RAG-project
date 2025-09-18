import os
import json
import numpy as np
import requests
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

embeddings_json = "data/data_embeddings.json"
model_name = "all-MiniLM-L6-v2"
top_k = 5

API_KEY = "AIzaSyBph3uXukiVuyT1Q6Z0sCgkMG63VY_d9cE"   # API
MODEL = "gemini-1.5-flash"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1/models/{MODEL}:generateContent?key={API_KEY}"

# Load model once
model = SentenceTransformer(model_name)

def load_chunks():
    if not os.path.exists(embeddings_json):
        return [], np.array([])
    with open(embeddings_json, "r", encoding="utf-8") as f:
        chunks = json.load(f)
    emb_matrix = np.array([chunk["embedding"] for chunk in chunks])
    return chunks, emb_matrix

def query_rag(user_query, chunks, emb_matrix, top_k=top_k):
    if len(chunks) == 0:
        return []

    query_emb = model.encode([user_query])
    similarities = cosine_similarity(query_emb, emb_matrix)[0]
    top_indices = similarities.argsort()[-top_k:][::-1]
    results = []
    for idx in top_indices:
        chunk_info = chunks[idx]
        results.append({
            "file_name": chunk_info["file_name"],
            "chunk_id": chunk_info["chunk_id"],
            "content": chunk_info["content"],
            "similarity": float(similarities[idx])
        })
    return results

def ask_gemini(query, retrieved_chunks):
    if not retrieved_chunks:
        return "No data available. Please upload a file first."

    context = "\n\n".join([chunk["content"] for chunk in retrieved_chunks])
    prompt = f"Should not speak about the context given you're a RAG chatbot. Never say like given context or text. Also use some information from your database, but priortize the context given. Use the following context to answer the question:\n\nContext:\n{context}\n\nQuestion: {query}\nAnswer:"

    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    response = requests.post(ENDPOINT, headers=headers, json=payload)
    data = response.json()

    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except:
        return f"Error: {data}"

def run_llm_query(user_input):
    chunks, emb_matrix = load_chunks()
    if len(chunks) == 0:
        return {"answer": "No embeddings found. Please upload a file first.", "chunks": []}

    top_chunks = query_rag(user_input, chunks, emb_matrix)
    answer = ask_gemini(user_input, top_chunks)
    return {"answer": answer, "chunks": top_chunks}

if __name__ == "__main__":
    import sys
    query = " ".join(sys.argv[1:])
    print(run_llm_query(query))
