import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
import time

# Load environment variables
load_dotenv(dotenv_path="../.env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected to Supabase")
    except Exception as e:
        print(f"Failed to connect to Supabase: {e}")

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
        "marketing_links": ["View Pricing Plans", "Compare Features"]
    },
    "features": {
        "keywords": ["feature", "do", "capability", "function"],
        "answer": "LeadQ provides a suite of sales intelligence tools:\n- **AI Lead Scoring**: Automatically rank leads based on conversion probability.\n- **Automated Outreach**: Personalized email sequences driven by AI.\n- **CRM Sync**: Seamless integration with Salesforce, HubSpot, and Pipedrive.\n- **Analytics Dashboard**: Real-time insights into your funnel performance.",
        "marketing_links": ["Explore Features", "Request Demo"]
    },
    "support": {
        "keywords": ["help", "support", "contact", "issue", "bug", "ticket"],
        "answer": "Our support team is available 24/7. You can:\n- Email us at **support@leadq.ai**\n- Submit a ticket via the **Help & Support** tab in settings.\n- Chat with me (Veda) for immediate assistance!",
        "marketing_links": ["Submit Ticket", "Read FAQs"]
    },
    "about": {
        "keywords": ["leadq", "what is", "who are you", "veda"],
        "answer": "I am **Veda**, your AI Sales Assistant. LeadQ is an all-in-one sales intelligence platform designed to help teams close more deals with less effort using AI-driven insights.",
        "marketing_links": ["About Us", "Our Mission"]
    },
    "integration": {
        "keywords": ["integrate", "connect", "salesforce", "hubspot", "api"],
        "answer": "We support native integrations with major CRMs including Salesforce, HubSpot, Zoho, and Pipedrive. You can configure these in the **Integrations** section of your dashboard.",
        "marketing_links": ["Integration Setup", "API Docs"]
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

    # 2. Generate Response
    for topic, data in KNOWLEDGE_BASE.items():
        if any(keyword in user_message for keyword in data["keywords"]):
            response_text = data["answer"]
            recommendations = data["marketing_links"]
            found_match = True
            break
    
    if not found_match:
        if "hello" in user_message or "hi" in user_message:
             response_text = "Hello! I am Veda, your AI assistant. I can help you with pricing, features, integrations, and support. How can I assist you today?"
             recommendations = ["Show Pricing", "Explain Features", "Contact Support"]
        else:
            response_text = "I can definitely help with that. Could you provide a bit more detail? I'm an expert on LeadQ's **Pricing**, **Features**, and **Integrations**."
            recommendations = ["Pricing", "Features", "Support", "Integrations"]
    
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
               "meta": {"latency_ms": latency, "source": "fastapi-kb"}
            }).execute()
            
        except Exception as e:
            print(f"DB Error (Chat): {e}")

    return ChatResponse(
        response=response_text,
        recommendations=recommendations,
        sessionId=session_id,
        meta={
            "source": "fastapi-knowledge-base",
            "latency_ms": latency
        }
    )

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
