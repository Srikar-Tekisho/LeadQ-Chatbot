import os
import time
import uuid
import json
from typing import Optional, List, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

from openai import AsyncOpenAI

# Load environment variables
load_dotenv(dotenv_path=".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# Initialize Supabase
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected to Supabase")
    except Exception as e:
        print(f"Failed to connect to Supabase: {e}")

# Initialize OpenAI
client = None
if OPENAI_API_KEY:
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    print(f"Connected to OpenAI ({OPENAI_MODEL})")
else:
    print("WARNING: OPENAI_API_KEY not found. LLM fallback will not work.")

app = FastAPI(title="LeadQ Chatbot API", version="2.0.0")

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
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import StreamingResponse

# --- System Prompt & Domain Context ---
SYSTEM_PROMPT = """
You are Veda, the AI Sales Assistant and Support Agent for LeadQ.
LeadQ is an all-in-one sales intelligence platform.

### CORE RULES:
1. **Domain Restriction:** ONLY answer questions related to LeadQ, sales intelligence, CRM, lead scoring, and email outreach.
2. **Refusal:** If a user asks about general knowledge, politely refuse.
3. **Accuracy:** Do NOT hallucinate features.
4. **Tone:** Professional, helpful, and concise.
5. **Formatting:** formatting your response in Markdown is highly encouraged.
"""

# --- Models ---
class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    user_id: Optional[str] = None

class FeedbackRequest(BaseModel):
    user_id: Optional[str] = None
    message: str
    category: str = "General"

class TicketRequest(BaseModel):
    user_id: Optional[str] = None
    category: str
    priority: str = "Medium"
    subject: str
    description: str

# --- Knowledge Base (Expanded) ---
KNOWLEDGE_BASE = {
    "pricing": {
        "keywords": ["price", "cost", "plan", "subscription", "bill", "how much"],
        "answer": "LeadQ offers three transparent pricing tiers:\n\n- **Starter ($29/mo):** Perfect for individuals. Includes basic lead scoring and 500 emails/mo.\n- **Professional ($99/mo):** Best for small teams. Includes advanced analytics, CRM integration, and 3 user seats.\n- **Enterprise (Custom):** For scaling orgs. Unlimited users, dedicated success manager, and API access.",
        "marketing_links": ["What features are in Professional?", "How do I upgrade?", "Tell me about Enterprise"]
    },
    "features": {
        "keywords": ["feature", "capability", "function", "what can you do", "lead scoring", "services"],
        "answer": "LeadQ empowers your sales team with:\n\n- **AI Lead Scoring:** Instantly rank leads by conversion probability.\n- **Automated Outreach:** Personalized multi-channel sequences.\n- **CRM Sync:** Two-way sync with Salesforce, HubSpot, and Pipedrive.\n- **Deep Analytics:** Real-time visibility into pipeline health.",
        "marketing_links": ["How does Lead Scoring work?", "Which CRMs do you support?", "Show me Analytics"]
    },
    "support": {
        "keywords": ["help", "support", "contact", "issue", "bug", "ticket", "broken"],
        "answer": "We're here to help! You can:\n\n1. Email **support@leadq.ai** (24/7 coverage)\n2. Submit a ticket via the **Help & Support** tab.\n3. Ask me specific questions about features or setup.",
        "marketing_links": ["How to submit a ticket?", "Where is the documentation?", "I found a bug"]
    },
    "integration": {
        "keywords": ["integrate", "connect", "salesforce", "hubspot", "pipedrive", "zoho", "api"],
        "answer": "LeadQ connects seamlessly with your existing stack. We support:\n\n- **Native Integrations:** Salesforce, HubSpot, Zoho, Pipedrive.\n- **Via Zapier:** Connect to 2,000+ other apps.\n- **API:** Full REST API access for Enterprise plans.",
        "marketing_links": ["How to connect Salesforce?", "Do you support Zapier?", "API Documentation"]
    },
    "security": {
        "keywords": ["security", "gdpr", "soc2", "compliance", "safe", "data"],
        "answer": "Security is our top priority. LeadQ is **SOC2 Type II compliant** and **GDPR ready**. Your data is encrypted at rest and in transit.",
        "marketing_links": ["Where is data stored?", "Is it GDPR compliant?", "View Privacy Policy"]
    },
    "onboarding": {
        "keywords": ["start", "begin", "setup", "install", "configure", "onboard"],
        "answer": "Getting started is easy:\n1. Connect your email account.\n2. Import your leads (CSV or CRM).\n3. Set up your first scoring rule.\n\nVisit the **Onboarding** tab for a guided walkthrough.",
        "marketing_links": ["Help me import leads", "How to connect email?", "Start walkthrough"]
    }
}

@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "service": "chatbot-backend-fastapi", 
        "version": "2.0.0", 
        "db_connected": supabase is not None,
        "llm_connected": client is not None
    }

import threading

# Helper function for background logging (Runs in threadpool to allow non-blocking response)
def log_interaction_to_db(session_id: str, user_id: Optional[str], user_message: str, assistant_response: str, recommendations: List[str], meta: Dict[str, Any]):
    def _log():
        if not supabase:
            return
        try:
            # Upsert Session
            supabase.table("chat_sessions").upsert({"id": session_id, "user_id": user_id}).execute()
            
            # Log User Message
            supabase.table("chat_messages").insert({
                "session_id": session_id,
                "role": "user",
                "content": user_message
            }).execute()

            # Log Assistant Message
            supabase.table("chat_messages").insert({
                "session_id": session_id,
                "role": "assistant",
                "content": assistant_response,
                "recommendations": recommendations,
                "meta": meta
            }).execute()
            print(f"[{time.time()}] Logged interaction to Supabase.")
        except Exception as e:
            print(f"DB Log Error: {e}")
            
    # Run in a separate thread to avoid blocking the async event loop
    thread = threading.Thread(target=_log)
    thread.start()

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    request_start = time.time()
    print(f"[{request_start}] Incoming chat request")
    
    session_id = request.sessionId if request.sessionId else str(uuid.uuid4())
    user_message = request.message.lower().strip()
    
    full_response_text = ""
    recommendations = []
    source = "kb-exact"
    
    async def response_generator():
        nonlocal full_response_text
        nonlocal recommendations
        nonlocal source
        
        yield json.dumps({"type": "status", "chunk": "thinking"}) + "\n"
        
        t0 = time.time()
        print(f"[{t0}] Generator started, initial chunk sent. (Delta: {t0 - request_start:.4f}s)")

        # 1. Exact/Keyword Matching
        static_match = None
        for topic, data in KNOWLEDGE_BASE.items():
            if any(keyword in user_message for keyword in data["keywords"]):
                static_match = data
                break
        
        if static_match:
            print(f"[{time.time()}] Static match found: {topic}")
            answer = static_match["answer"]
            full_response_text = answer
            recommendations = static_match["marketing_links"]
            
            yield json.dumps({"type": "content", "chunk": answer}) + "\n"
            yield json.dumps({"type": "recommendations", "data": recommendations}) + "\n"
            
        else:
            # 2. LLM Fallback
            source = "llm-openai"
            t1 = time.time()
            print(f"[{t1}] Starting LLM request. (Delta: {t1 - request_start:.4f}s)")
            
            if not client:
                error_msg = "Error: LLM client not initialized."
                full_response_text = error_msg
                yield json.dumps({"type": "content", "chunk": error_msg}) + "\n"
                return

            try:
                stream = await client.chat.completions.create(
                    model=OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_message}
                    ],
                    stream=True
                )
                
                t2 = time.time()
                print(f"[{t2}] LLM stream obtained. (LLM Init Latency: {t2 - t1:.4f}s)")
                
                first_chunk_received = False
                async for chunk in stream:
                    content = chunk.choices[0].delta.content
                    if not first_chunk_received:
                        t3 = time.time()
                        print(f"[{t3}] First LLM chunk received. (TTFT: {t3 - t2:.4f}s)")
                        first_chunk_received = True

                    if content:
                        full_response_text += content
                        yield json.dumps({"type": "content", "chunk": content}) + "\n"
                        # Force a minimal sleep if things are too bursty, but usually not needed
                        # await asyncio.sleep(0) 

                recommendations = ["Who is LeadQ?", "Features overview", "Contact Support"]
                yield json.dumps({"type": "recommendations", "data": recommendations}) + "\n"
                
            except Exception as e:
                print(f"LLM Error: {e}")
                import traceback
                traceback.print_exc()
                error_chunk = "I'm having trouble connecting to my brain. Please try again."
                full_response_text += error_chunk
                yield json.dumps({"type": "content", "chunk": error_chunk}) + "\n"

        # 3. Log to DB
        yield json.dumps({"type": "meta", "sessionId": session_id}) + "\n"
        log_interaction_to_db(session_id, request.user_id, request.message, full_response_text, recommendations, {"latency_ms": (time.time() - request_start) * 1000, "source": source})

    return StreamingResponse(response_generator(), media_type="application/x-ndjson")

@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    if supabase:
        supabase.table("feedback_submissions").insert({
            "message": request.message,
            "category": request.category,
            "user_id": request.user_id
        }).execute()
    return {"status": "success"}

@app.post("/ticket")
async def submit_ticket(request: TicketRequest):
    ticket_id = str(uuid.uuid4())
    if supabase:
        data = request.model_dump(exclude_none=True)
        result = supabase.table("support_tickets").insert(data).execute()
        if result.data:
            ticket_id = result.data[0]['id']
    return {"status": "success", "ticket_id": ticket_id}

