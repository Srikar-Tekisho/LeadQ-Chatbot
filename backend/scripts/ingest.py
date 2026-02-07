import os
import glob
from typing import List
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI
import tiktoken

# Load env
load_dotenv(dotenv_path="../.env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_KEY not set.")
    exit(1)

if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not set.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Robust pathing: Get directory of this script, then go up one level to 'documents'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.abspath(os.path.join(BASE_DIR, "../documents"))

def get_embedding(text: str, model="text-embedding-3-small"):
    text = text.replace("\n", " ")
    return openai_client.embeddings.create(input=[text], model=model).data[0].embedding

def chunk_text(text: str, max_tokens=800):
    tokenizer = tiktoken.get_encoding("cl100k_base")
    tokens = tokenizer.encode(text)
    chunks = []
    
    for i in range(0, len(tokens), max_tokens):
        chunk_tokens = tokens[i:i + max_tokens]
        chunk_text = tokenizer.decode(chunk_tokens)
        chunks.append(chunk_text)
    return chunks

def ingest_files():
    print(f"Scanning {DOCS_DIR}...")
    files = glob.glob(os.path.join(DOCS_DIR, "*.*"))
    
    if not files:
        print("No files found.")
        return

    for file_path in files:
        filename = os.path.basename(file_path)
        print(f"Processing {filename}...")
        
        try:
            content = ""
            if filename.lower().endswith(".docx"):
                try:
                    import docx
                    doc = docx.Document(file_path)
                    content = "\n".join([para.text for para in doc.paragraphs])
                except ImportError:
                    print("  -> Error: python-docx not installed. Skipping .docx file.")
                    continue
            else:
                # Assume text/md
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            
            if not content.strip():
                print(f"  -> Warning: Empty content in {filename}. Skipping.")
                continue

            chunks = chunk_text(content)
            print(f"  -> {len(chunks)} chunks generated.")
            
            for i, chunk in enumerate(chunks):
                # print(f"    Embedding chunk {i+1}/{len(chunks)}...")
                vector = get_embedding(chunk)
                
                data = {
                    "content": chunk,
                    "metadata": {"source": filename, "chunk_index": i},
                    "embedding": vector
                }
                
                supabase.table("document_chunks").insert(data).execute()
                
            print(f"  -> {filename} ingested successfully.")
            
        except Exception as e:
            print(f"  -> Error processing {filename}: {e}")

if __name__ == "__main__":
    ingest_files()
