import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import FastAPI, HTTPException, Body, UploadFile, File
import shutil
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
import time
import re

from openai import AsyncOpenAI

# Load environment variables
load_dotenv(dotenv_path="../.env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

supabase: Client = None
openai_client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected to Supabase")
    except Exception as e:
        print(f"Failed to connect to Supabase: {e}")

if OPENAI_API_KEY:
    try:
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        print("Connected to OpenAI (Async)")
    except Exception as e:
        print(f"Failed to initialize OpenAI: {e}")

app = FastAPI(title="LeadQ Chatbot API", version="1.0.0")

# CORS Configuration
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
    "http://127.0.0.1:3004",
    # Add other origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    user_id: Optional[str] = None # Added user_id support

class ChatResponse(BaseModel):
    response: str
    recommendations: List[str] = []
    sessionId: str
    meta: Dict[str, Any] = {}

class FeedbackRequest(BaseModel):
    user_id: Optional[str] = None
    message: str
    category: str = "General"

class TicketRequest(BaseModel):
    user_id: Optional[str] = None
    category: str  # Technical, Billing, Feature
    priority: str = "Medium" # Low, Medium, High, Urgent
    subject: str
    description: str

# Mock Knowledge Base - Expanded
KNOWLEDGE_BASE = {
    "pricing": {
        "keywords": ["price", "cost", "plan", "subscription", "bill"],
        "answer": "LeadQ offers three pricing tiers:\n- **Starter**: $29/mo for basic lead scoring and email outreach.\n- **Professional**: $99/mo for advanced analytics, CRM integration, and 3 users.\n- **Enterprise**: Custom pricing for unlimited users and dedicated support.",
        "marketing_links": ["What is the Starter plan?", "Tell me about Enterprise pricing", "How do I upgrade?"]
    },
    "features": {
        "keywords": ["feature", "do", "capability", "function"],
        "answer": "LeadQ provides a suite of sales intelligence tools:\n- **AI Lead Scoring**: Automatically rank leads based on conversion probability.\n- **Automated Outreach**: Personalized email sequences driven by AI.\n- **CRM Sync**: Seamless integration with Salesforce, HubSpot, and Pipedrive.\n- **Analytics Dashboard**: Real-time insights into your funnel performance.",
        "marketing_links": ["How does lead scoring work?", "Explain automated outreach", "What CRMs do you support?"]
    },
    "support": {
        "keywords": ["help", "support", "contact", "issue", "bug", "ticket"],
        "answer": "Our support team is available 24/7. You can:\n- Email us at **support@leadq.ai**\n- Submit a ticket via the **Help & Support** tab in settings.\n- Chat with me (Veda) for immediate assistance!",
        "marketing_links": ["Open a support ticket", "Where is the settings tab?", "I found a bug"]
    },
    "about": {
        "keywords": ["leadq", "what is", "who are you", "veda"],
        "answer": "I am **Veda**, your AI Support Assistant. LeadQ is an all-in-one sales intelligence platform designed to help teams close more deals with less effort using AI-driven insights.",
        "marketing_links": ["What features do you have?", "How much does it cost?", "Can I see a demo?"]
    },
    "integration": {
        "keywords": ["integrate", "connect", "salesforce", "hubspot", "api"],
        "answer": "We support native integrations with major CRMs including Salesforce, HubSpot, Zoho, and Pipedrive. You can configure these in the **Integrations** section of your dashboard.",
        "marketing_links": ["How to connect Salesforce?", "Do you support HubSpot?", "Is there an API?"]
    }
}

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "chatbot-backend-fastapi", "version": "1.0.0", "db_connected": supabase is not None}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    start_time = time.time()
    session_id = request.sessionId if request.sessionId else str(uuid.uuid4())
    user_message = request.message.lower()
    
    response_text = ""
    recommendations = []
    found_match = False

    # 1. Store Session if new or update last_active
    if supabase:
        try:
            # Upsert session (simplified)
            # In production, check if exists first or rely on conflict resolution if PK matches, 
            # here we just log the session existence roughly. 
            # ideally: insert if not exists, else update last_active_at
            pass 
        except Exception: 
            pass

    # 2. Generate Response (RAG + Facade)
    context_text = ""
    
    # Embedding & Search
    try:
        if openai_client:
            # Get User Embedding (Async)
            # Note: openai_client should be AsyncOpenAI for true async, 
            # checking if we initialized it as such or if we need to change init.
            # Assuming we change init below, we use await here.
            embedding_response = await openai_client.embeddings.create(
                input=[user_message],
                model="text-embedding-3-small"
            )
            query_embedding = embedding_response.data[0].embedding
            
            # Query Supabase Vector Store
            if supabase:
                rpc_response = supabase.rpc("match_documents", {
                    "query_embedding": query_embedding,
                    "match_threshold": 0.78, # Increased to reduce hallucinations
                    "match_count": 2 # Reduced to improve speed
                }).execute()
                
                if rpc_response.data:
                    context_chunks = [item['content'] for item in rpc_response.data]
                    context_text = "\n\n".join(context_chunks)
                    print(f"Retrieved {len(context_chunks)} chunks for context.")
    except Exception as e:
        print(f"RAG Error: {e}")

    # Fallback to local KB if no context found (or hybrid approach)
    # For now, let's prioritize RAG if context exists, else use KB
    
    if context_text and openai_client:
        # Generate with LLM using Context
        system_prompt = f"""You are Veda, LeadQ's AI assistant. Answer ONLY from the Context below.

Rules:
- Be concise: 2-4 sentences max, ~50-80 words
- Use **bold** for key terms
- If info is NOT in Context, say: "I don't have that information. Would you like to open a support ticket?"
- NEVER guess or make up information
- End with: ###REC###Q1|Q2|Q3 (3 short follow-up questions, max 8 words each)

Context:
{context_text}
"""
        
        try:
            completion = await openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.message}
                ],
                temperature=0.1,
                max_tokens=300,
                top_p=0.9
            )
            full_response = completion.choices[0].message.content
            
            # Parse Response and Recommendations
            if "###REC###" in full_response:
                parts = full_response.split("###REC###")
                response_text = parts[0].strip()
                rec_string = parts[1].strip()
                recommendations = [r.strip() for r in rec_string.split("|") if r.strip()]
            else:
                response_text = full_response
                recommendations = []
                
            found_match = True
        except Exception as e:
            print(f"LLM Generation Error: {e}")
            response_text = "I'm having trouble connecting to my brain right now. Please try again."

    if not found_match:
        # Fallback to Pattern Matching KB
        for topic, data in KNOWLEDGE_BASE.items():
            # Use strict word boundary regex to avoid false positives (e.g., "plan" in "planner")
            if any(re.search(r'\b' + re.escape(k) + r'\b', user_message.lower()) for k in data['keywords']):
                response_text = data["answer"]
                recommendations = data["marketing_links"]
                found_match = True
                break
    
    if not found_match and not context_text:
        # Final Fallback: Controlled General LLM
        # If the user asks something relevant that isn't in our value store yet (like general definitions),
        # we allow the LLM to answer BUT restrict it to the domain.
        
        fallback_prompt = f"""You are Veda, LeadQ's AI assistant for Sales & CRM topics only.

User asked: "{user_message}"

Rules:
- If about Sales/Marketing/CRM/LeadQ: Answer in 2-3 sentences
- If unrelated (movies, sports, etc): Say "I specialize in LeadQ and Sales Intelligence. I can't help with that."
- End with: ###REC###Q1|Q2|Q3
"""

        try:
             completion = await openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": fallback_prompt},
                    {"role": "user", "content": request.message}
                ],
                temperature=0.2,
                max_tokens=250
            )
             
             full_response = completion.choices[0].message.content
             if "###REC###" in full_response:
                parts = full_response.split("###REC###")
                response_text = parts[0].strip()
                rec_string = parts[1].strip()
                recommendations = [r.strip() for r in rec_string.split("|") if r.strip()]
             else:
                response_text = full_response
                recommendations = ["What features does LeadQ have?", "How can you help me?", "Contact Support"]
                
             found_match = True

        except Exception as e:
            print(f"Fallback Generation Error: {e}")
            response_text = "I'm not sure about that based on my current knowledge. Would you like me to open a support ticket for you?"
            recommendations = ["Open Ticket", "Contact Support"]
    
    latency = (time.time() - start_time) * 1000
    
    # 3. Store Message in DB
    if supabase:
        try:
            # Assumes session_id is UUID valid (generated above)
            try:
                supabase.table("chat_sessions").upsert({"id": session_id, "user_id": request.user_id}).execute()
            except Exception as e:
                print(f"Session upsert error: {e}")

            supabase.table("chat_messages").insert({
               "session_id": session_id,
               "role": "user",
               "content": request.message
            }).execute()

            supabase.table("chat_messages").insert({
               "session_id": session_id,
               "role": "assistant",
               "content": response_text,
               "recommendations": recommendations,
               "meta": {"latency_ms": latency, "source": "rag-openai"}
            }).execute()
            
        except Exception as e:
            print(f"DB Error (Chat): {e}")

    return ChatResponse(
        response=response_text,
        recommendations=recommendations,
        sessionId=session_id,
        meta={
            "source": "rag-openai" if context_text else "fastapi-kb",
            "latency_ms": latency
        }
    )

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(".txt") and not file.filename.endswith(".md"):
             return {"status": "error", "message": "Only .txt and .md files are supported for now."}

        file_path = os.path.join("documents", file.filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Trigger Ingestion
        # Lazy import to avoid circular dep if any, or just convenience
        from scripts.ingest import ingest_files
        ingest_files()
        
        return {"status": "success", "message": f"File {file.filename} uploaded and ingested successfully."}
    except Exception as e:
        print(f"Upload failed: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    print(f"Feedback received: {request}")
    if supabase:
        try:
            result = supabase.table("feedback_submissions").insert({
                "message": request.message,
                "category": request.category,
                "user_id": request.user_id
            }).execute()
            print("Stored in DB:", result)
        except Exception as e:
            print(f"DB Error (Feedback): {e}")
            return {"status": "error", "message": "Failed to store feedback"}
            
    return {"status": "success", "message": "Feedback submitted successfully"}

@app.post("/ticket")
async def submit_ticket(request: TicketRequest):
    ticket_id = str(uuid.uuid4())
    print(f"Ticket received: {request}")

    if supabase:
        try:
            data = {
                "subject": request.subject,
                "description": request.description,
                "category": request.category,
                "priority": request.priority,
                "user_id": request.user_id
            }
            # Remove None values
            data = {k: v for k, v in data.items() if v is not None}
            
            result = supabase.table("support_tickets").insert(data).execute()
            if result.data:
                ticket_id = result.data[0]['id']
        except Exception as e:
            print(f"DB Error (Ticket): {e}")
            return {"status": "error", "message": f"Failed to create ticket: {str(e)}"}

    return {
        "status": "success", 
        "message": "Ticket created successfully", 
        "ticket_id": ticket_id
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)
