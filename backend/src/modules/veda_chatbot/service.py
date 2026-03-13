import os
import time
import uuid
import json
import random
import threading
import re
from typing import Optional, List, Dict, Any, AsyncGenerator

from openai import AsyncOpenAI
from supabase import Client

from src.core.config import settings
from src.core.database import get_supabase

# --- Greeting Detection ---
GREETING_PATTERNS = [
    r"^\s*(hi|hello|hey|hiya|howdy|hola|namaste)\s*[!.?\U0001f44b]*\s*$",
    r"^\s*(good\s*(morning|afternoon|evening|day|night))\s*[!.?]*\s*$",
    r"^\s*(what'?s\s*up|sup|yo|greetings)\s*[!.?]*\s*$",
    r"^\s*(hi\s+there|hello\s+there|hey\s+there)\s*[!.?\U0001f44b]*\s*$",
]
GREETING_COMPILED = [re.compile(p, re.IGNORECASE) for p in GREETING_PATTERNS]

THANK_YOU_PATTERNS = [
    r"^\s*(thanks|thank\s*you|thankyou|ty|thx|thank\s*u|thanks\s*a\s*lot|thank\s*you\s*so\s*much)\s*[!.?]*\s*$",
]
THANK_YOU_COMPILED = [re.compile(p, re.IGNORECASE) for p in THANK_YOU_PATTERNS]

GREETING_RESPONSES = [
    "Hi there! \U0001f44b Welcome to LeadQ! I'm **Veda**, your AI assistant. I'm here to help you with anything related to our platform \u2014 features, setup, integrations, automation, and more.\n\nWhat would you like to explore today?",
    "Hello! \U0001f60a Welcome to LeadQ! I'm **Veda**, and I'm here to make your experience seamless. Whether you need help with contact capture, meeting intelligence, email automation, or anything else \u2014 just ask!\n\nHow can I help you today?",
    "Hey! \U0001f44b Great to see you here! I'm **Veda**, your LeadQ assistant. I can help you with features, setup, VocalQ voice agent, Chrome extension, and much more.\n\nWhat would you like to know?",
]

THANK_YOU_RESPONSES = [
    "You're welcome! \U0001f60a I'm always here if you need more help with LeadQ. Is there anything else you'd like to explore?",
    "Happy to help! \U0001f64c Feel free to ask me anything else about LeadQ anytime. What else can I assist you with?",
]

# --- Knowledge Base (Merged & Expanded with Product Documentation) ---
KNOWLEDGE_BASE = {
    "pricing": {
        "keywords": ["price", "cost", "plan", "subscription", "bill", "how much", "pay", "pricing", "free trial", "trial", "starter", "professional", "enterprise", "team plan"],
        "answer": "LeadQ offers four flexible pricing plans:\n\n- **Starter ($29/mo):** 1 user, 500 contacts, 50 deep research credits, basic integrations.\n- **Professional ($79/mo):** 1 user, unlimited contacts, 200 deep research credits, all integrations including VocalQ, Chrome extension.\n- **Team ($199/mo):** Up to 5 users, unlimited contacts, 500 deep research credits, team collaboration features.\n- **Enterprise (Custom):** Unlimited everything, dedicated account manager, custom integrations, SLA guarantee.\n\nWe also offer a **14-day free trial** with full access \u2014 no credit card required!\n\n**Add-Ons:** Extra deep research credits ($10/100), VocalQ overage ($0.15/min).",
        "marketing_links": ["What add-ons are available?", "How does VocalQ calling cost work?", "Can I upgrade my plan anytime?"]
    },
    "features": {
        "keywords": ["feature", "capability", "function", "what can you do", "lead scoring", "services", "do", "what does leadq", "overview"],
        "answer": "LeadQ is your personal sales assistant that captures contacts, remembers every conversation, and automates follow-ups. Here's what it offers:\n\n- **\U0001f4c7 Contact Capture**: Business card scanning, QR codes, NFC tap, manual entry\n- **\U0001f50d Profile Enrichment**: AI-powered person & company research from multiple sources\n- **\U0001f399\ufe0f Meeting Intelligence**: Live transcription, AI-generated meeting summaries (MoM)\n- **\u2709\ufe0f Email Automation**: AI-drafted personalized follow-up emails\n- **\U0001f4de VocalQ Voice Agent**: AI outbound calls that book meetings for you\n- **\U0001f310 Chrome Extension**: Capture leads from LinkedIn, Gmail, and any website\n- **\U0001f4ca Dashboard Analytics**: Real-time conversion tracking, relationship scoring, and pipeline views",
        "marketing_links": ["How does business card scanning work?", "Tell me about VocalQ voice agent", "How does the Chrome Extension work?"]
    },
    "support": {
        "keywords": ["help", "support", "contact support", "issue", "bug", "ticket", "broken", "not working", "problem"],
        "answer": "Our support team is here for you! Here's how to get help:\n\n1. \U0001f4ac **Ask me (Veda)** \u2014 I can answer most questions instantly\n2. \U0001f4e7 **Email** \u2014 support@leadq.ai (general), tech@leadq.ai (technical)\n3. \U0001f3ab **Support Ticket** \u2014 Submit via the Help & Support tab in settings\n4. \U0001f465 **Community** \u2014 Join our Slack at leadq.ai/community\n5. \U0001f4de **Phone** \u2014 Available on Enterprise plan\n\nSupport hours: Mon-Fri, 9 AM - 6 PM IST",
        "marketing_links": ["How do I submit a support ticket?", "Is there phone support available?", "Where can I find video tutorials?"]
    },
    "about": {
        "keywords": ["about leadq", "who are you", "veda", "what does leadq do", "tell me about", "what is leadq"],
        "answer": "I'm **Veda**, your AI Support Assistant! \U0001f60a\n\n**LeadQ** is an all-in-one sales intelligence platform that helps founders, salespeople, and business development professionals manage relationships more effectively. Think of it as a personal sales assistant that:\n\n- Captures contacts from business cards, QR codes, and NFC tags in seconds\n- Records and structures meeting notes with AI assistance\n- Automates follow-ups via email and VocalQ voice calls\n- Enriches profiles with verified information from multiple sources\n- Tracks the full journey of each relationship in one timeline\n\nSo you can focus on building relationships and closing deals!",
        "marketing_links": ["What features does LeadQ offer?", "How do I get started?", "What pricing plans are available?"]
    },
    "integration": {
        "keywords": ["integrate", "connect", "api", "zapier", "webhook", "calendar", "gmail"],
        "answer": "LeadQ connects seamlessly with your favorite tools:\n\n- **Calendar**: Google Calendar, Outlook\n- **Communication**: Gmail, SendGrid\n- **Automation**: Zapier (3,000+ apps)\n- **Voice**: VocalQ AI voice agent with Twilio\n- **Browser**: Chrome Extension for LinkedIn & Gmail\n- **API**: Full REST API with webhooks for custom integrations\n\nConfigure integrations in **Settings \u2192 Integrations** in your dashboard.",
        "marketing_links": ["Tell me about the REST API", "How does the Chrome Extension work?", "How does Zapier integration work?"]
    },
    "security": {
        "keywords": ["security", "gdpr", "soc2", "compliance", "safe", "data", "privacy", "encryption", "ccpa", "dpdpa"],
        "answer": "Security is our top priority at LeadQ:\n\n- \U0001f512 **Encryption**: TLS 1.3 in transit, AES-256 at rest\n- \U0001f6e1\ufe0f **Compliance**: GDPR ready, CCPA compliant, India DPDPA compliant\n- \U0001f3c5 **Certifications**: SOC 2 Type II (in progress Q2 2026), ISO 27001 (Q3 2026)\n- \U0001f511 **Auth**: 2FA support, session timeouts, role-based access control\n- \u2601\ufe0f **Hosting**: AWS multi-AZ with 24/7 monitoring and daily encrypted backups\n- \U0001f50d **Auditing**: Regular penetration testing and security scanning\n\nYour data is never sold to third parties.",
        "marketing_links": ["Where is my data stored?", "How does role-based access control work?", "What are your data retention policies?"]
    },
    "onboarding": {
        "keywords": ["start", "begin", "setup", "install", "configure", "onboard", "getting started", "first", "new user", "sign up"],
        "answer": "Getting started with LeadQ is easy! Here's a quick guide:\n\n**1. Create Your Account** \u2192 Visit leadq.ai/signup, verify your email\n**2. Initial Setup (3 min)** \u2192 Connect calendar, set timezone, choose notifications\n**3. Install Mobile App** \u2192 Available on iOS and Android for on-the-go capture\n**4. Scan Your First Card** \u2192 Tap '+' \u2192 'Scan Business Card' \u2192 Save!\n**5. Record First Meeting** \u2192 Open contact \u2192 'New Meeting' \u2192 Voice note, bullets, or live capture\n**6. Set Up Follow-Up** \u2192 Review suggested actions, choose method (email or call)\n\nCheck your **Today** tab daily for prioritized follow-ups!",
        "marketing_links": ["How does business card scanning work?", "Can I import existing contacts?", "How do I connect my calendar?"]
    },
    "vocalq": {
        "keywords": ["vocalq", "voice", "call", "outbound", "phone", "ai call", "voice agent", "calling", "phone call"],
        "answer": "**VocalQ** is LeadQ's AI voice agent that makes outbound calls on your behalf! \U0001f4de\n\n**Key Capabilities:**\n- Natural, human-like voice with emotional tone\n- Remembers full context from your LeadQ contact history\n- Handles objections and reschedules gracefully\n- Books meetings directly into your calendar\n- Full call transcripts and summaries\n- Multilingual support and concurrent call handling\n\n**Use Cases:** Follow-up calls, appointment setting, lead qualification, payment reminders, sales outreach\n\n**How it works:** Select contacts \u2192 Choose script \u2192 VocalQ calls each one \u2192 Meetings booked, status updated automatically!",
        "marketing_links": ["How do I set up VocalQ?", "What does VocalQ cost per call?", "Can I listen to VocalQ calls in real-time?"]
    },

    "chrome_extension": {
        "keywords": ["chrome", "extension", "browser", "linkedin", "gmail", "clip", "capture from"],
        "answer": "The **LeadQ Chrome Extension** brings contact capture into your browser! \U0001f310\n\n**LinkedIn Capture:**\n- Save contacts from any LinkedIn profile with one click\n- Bulk save from search results (up to 25 at a time)\n- Works with Sales Navigator too!\n\n**Gmail Integration:**\n- Sidebar shows LeadQ contact info for email senders\n- Create contacts from email threads in one click\n- Quick actions: log email, schedule meeting, add notes\n\n**Any Website:**\n- Capture company info from any company homepage\n- Detect and save contact form data\n\nInstall from Chrome Web Store \u2192 Sign in \u2192 Start capturing!",
        "marketing_links": ["How do I install the Chrome Extension?", "Can I bulk save from LinkedIn?", "Does it work in Gmail?"]
    },
    "meeting": {
        "keywords": ["meeting", "transcript", "transcription", "recording", "notes", "mom", "minutes", "summary", "live capture"],
        "answer": "LeadQ's **Meeting Intelligence** captures and structures every conversation:\n\n**Capture Options:**\n- \U0001f399\ufe0f **Voice Note** \u2014 Speak naturally, AI transcribes & structures\n- \u270f\ufe0f **Quick Bullets** \u2014 Type key points, AI generates full MoM\n- \U0001f534 **Live Capture** \u2014 Real-time transcription during meetings\n\n**AI-Generated MoM includes:**\n- Meeting details (date, duration, attendees)\n- Discussion summary with key points\n- Decisions made and commitments\n- Action items with owners and deadlines\n- Next steps and follow-up dates\n\n**Share:** Email, PDF export, or clipboard",
        "marketing_links": ["How does live meeting capture work?", "Can I edit AI-generated summaries?", "How long are recordings stored?"]
    },
    "enrichment": {
        "keywords": ["enrichment", "research", "deep research", "profile", "company data", "linkedin", "enrich"],
        "answer": "LeadQ **automatically enriches** every contact you save:\n\n**Tier 1 (Automatic, ~$0.01/contact):**\n- Company website scraping\n- Industry, size, LinkedIn URL\n- Google search for recent news\n- Public business registries\n\n**Tier 2 - Deep Research (On-demand):**\n- Verified mobile & personal email\n- Full employment history\n- Social media profiles\n- Company funding rounds & decision-makers\n- Direct dial phone numbers\n\n**Credits:** Starter: 50/mo | Professional: 200/mo | Team: 500/mo | Enterprise: Unlimited\n\nTrigger Deep Research from any contact profile \u2192 Results in 5-15 seconds!",
        "marketing_links": ["How does automatic enrichment work?", "What data sources are used?", "Can I turn off auto-enrichment?"]
    }
}


class ChatService:
    @staticmethod
    def get_openai_client() -> Optional[AsyncOpenAI]:
        if settings.OPENAI_API_KEY:
            return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return None

    @staticmethod
    def log_interaction_to_db(session_id: str, user_id: Optional[str], user_message: str, assistant_response: str, recommendations: List[str], meta: Dict[str, Any]):
        def _log():
            supabase = get_supabase()
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

    @staticmethod
    def _is_greeting(message: str) -> bool:
        """Detect if the message is a simple greeting."""
        clean = message.strip()
        for pattern in GREETING_COMPILED:
            if pattern.match(clean):
                return True
        return False

    @staticmethod
    def _is_thank_you(message: str) -> bool:
        """Detect if the message is a thank-you."""
        clean = message.strip()
        for pattern in THANK_YOU_COMPILED:
            if pattern.match(clean):
                return True
        return False

    @staticmethod
    async def chat_generator(message: str, session_id: str, user_id: Optional[str], regenerate: bool = False, history: Optional[List[Dict[str, str]]] = None) -> AsyncGenerator[str, None]:
        client = ChatService.get_openai_client()
        request_start = time.time()
        print(f"[{request_start}] Incoming chat request: {message}")
        
        user_message_clean = message.lower().strip()
        full_response_text = ""
        recommendations = []
        source = "kb-match"
        found_match = False
        
        yield json.dumps({"type": "status", "chunk": "thinking"}) + "\n"
        
        # --- 0. Greeting & Thank You Detection (instant response, no RAG needed) ---
        if not regenerate:
            if ChatService._is_thank_you(message):
                full_response_text = random.choice(THANK_YOU_RESPONSES)
                recommendations = [
                    "What features does LeadQ offer?",
                    "How does VocalQ voice agent work?",
                    "Tell me about pricing plans"
                ]
                source = "greeting"
                found_match = True
                yield json.dumps({"type": "content", "chunk": full_response_text}) + "\n"
                yield json.dumps({"type": "recommendations", "data": recommendations}) + "\n"
                yield json.dumps({"type": "meta", "sessionId": session_id}) + "\n"
                ChatService.log_interaction_to_db(
                    session_id, user_id, message, full_response_text, recommendations,
                    {"latency_ms": (time.time() - request_start) * 1000, "source": source}
                )
                return

            if ChatService._is_greeting(message):
                full_response_text = random.choice(GREETING_RESPONSES)
                recommendations = [
                    "What can LeadQ do for me?",
                    "How do I get started with LeadQ?",
                    "Tell me about LeadQ pricing"
                ]
                source = "greeting"
                found_match = True
                yield json.dumps({"type": "content", "chunk": full_response_text}) + "\n"
                yield json.dumps({"type": "recommendations", "data": recommendations}) + "\n"
                yield json.dumps({"type": "meta", "sessionId": session_id}) + "\n"
                ChatService.log_interaction_to_db(
                    session_id, user_id, message, full_response_text, recommendations,
                    {"latency_ms": (time.time() - request_start) * 1000, "source": source}
                )
                return

        # 1. RAG Search (Context from both RAG Knowledge Base + Product Documentation)
        context_text = ""
        if client:
            try:
                supabase = get_supabase()
                embedding_response = await client.embeddings.create(
                    input=message,
                    model="text-embedding-3-small"
                )
                query_embedding = embedding_response.data[0].embedding

                rpc_response = supabase.rpc("match_documents", {
                    "query_embedding": query_embedding,
                    "match_threshold": 0.72,  # Broader coverage for product docs + RAG
                    "match_count": 4  # More chunks for richer context from both sources
                }).execute()

                if rpc_response.data:
                    context_chunks = [item['content'] for item in rpc_response.data]
                    context_text = "\n\n---\n\n".join(context_chunks)
                    print(f"[{time.time()}] RAG context found ({len(context_chunks)} chunks).")
            except Exception as e:
                print(f"RAG Error: {e}")

        # 2. Build enhanced system prompt with domain restriction & conversational behavior
        base_personality = """You are **Veda**, LeadQ's warm, friendly, and knowledgeable AI assistant.

CORE IDENTITY:
- You ONLY answer questions related to LeadQ.ai - the sales intelligence platform.
- You are NOT a general-purpose AI. You do not answer questions about weather, sports, politics, coding, math, history, or any topic unrelated to LeadQ.
- If a question is clearly outside the LeadQ domain, respond with: "I appreciate your curiosity! However, I'm specifically designed to assist with **LeadQ.ai** - our sales intelligence platform. I can help you with contact capture, meeting intelligence, email automation, VocalQ voice agent, Chrome extension, pricing, and much more. How can I help you with LeadQ today?"
- NEVER make up features or capabilities that are not documented. Only reference actual LeadQ features.

CRITICAL - FEATURES NOT YET AVAILABLE (DO NOT MENTION AS AVAILABLE):
- **CRM Integrations** are NOT yet implemented. Do NOT mention Salesforce, HubSpot, Zoho, Pipedrive, or any CRM as a supported integration. If asked about CRM, say: "CRM integrations are on our roadmap and coming soon! Currently, LeadQ supports integrations with Google Calendar, Gmail, Zapier, VocalQ, and our Chrome Extension. Would you like to know more about any of these?"
- **WhatsApp Integration** is NOT yet implemented. Do NOT mention WhatsApp as a supported feature. If asked about WhatsApp, say: "WhatsApp integration is planned for a future update! Right now, you can follow up with contacts via email automation and VocalQ voice calls. Want to learn more about those?"
- Even if the provided Context mentions CRM or WhatsApp, do NOT present them as currently available features.

CONVERSATIONAL STYLE:
- Be warm, friendly, and professional - never robotic or overly formal.
- Acknowledge the user's query naturally before answering (e.g., "Great question!" or "Absolutely!").
- Use short paragraphs and bullet points for clarity.
- Use **bold** for key terms, feature names, and important information.
- Use relevant emojis sparingly to add warmth.
- ALWAYS end your response with a contextual follow-up question that encourages deeper product exploration.
- Keep responses concise but comprehensive - aim for 3-6 short paragraphs or bullet sections.

ANSWER QUALITY:
- Provide precise, feature-aligned answers reflecting actual LeadQ capabilities.
- When explaining a feature, include: what it does, key benefits, and how to access it.
- Reference specific UI paths where helpful (e.g., "Go to Settings > Integrations").
- If a feature has pricing implications, mention the relevant plan tier.

FOLLOW-UP QUESTIONS:
- After your answer, ALWAYS suggest exactly 3 UNIQUE follow-up questions.
- Format them on a new line as: ###REC###Question one?|Question two?|Question three?
- Each must be SPECIFIC to a LeadQ feature and contextually related to the user's question.
- Avoid generic suggestions like "Tell me more" - be specific like "How does VocalQ handle call objections?"
- Each question must be DIFFERENT from the others and from the user's original message."""

        if client:
            if context_text:
                source = "rag-openai"
                system_prompt = f"""{base_personality}

CONTEXT FROM LEADQ DOCUMENTATION:
{context_text}

ANSWER PRIORITY:
1. Use the Context above as your PRIMARY source of truth.
2. If the Context covers the topic, provide a clear, structured response based on it.
3. If the Context partially covers it, supplement with your knowledge of LeadQ features.
4. If the Context doesn't cover it and it's about LeadQ, provide your best knowledge about LeadQ.
5. If it's NOT about LeadQ at all, politely redirect to LeadQ topics.
"""
            else:
                source = "llm-openai-fallback"
                system_prompt = f"""{base_personality}

IMPORTANT: No documentation context was found for this query.
- If the question is about LeadQ: Answer based on your knowledge of LeadQ's features (contact capture, business card scanning, profile enrichment, meeting intelligence, email automation, VocalQ voice agent, Chrome extension, pricing, security).
- If the question is NOT about LeadQ: Politely redirect to LeadQ topics.
- Do NOT invent features or make assumptions beyond documented capabilities.
"""
            
            # Prepare conversation history for LLM
            messages_payload = [{"role": "system", "content": system_prompt}]
            if history:
                # Add last 6 messages for richer conversational context
                for h in history[-6:]:
                    messages_payload.append({"role": h["role"], "content": h["content"]})
            
            # Add current message
            messages_payload.append({"role": "user", "content": message})

            try:
                completion = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages_payload,
                    temperature=0.7 if regenerate else 0.3,
                    max_tokens=500,
                    top_p=0.9
                )
                full_raw_response = completion.choices[0].message.content
                
                # Parse Response and Recommendations
                if "###REC###" in full_raw_response:
                    parts = full_raw_response.split("###REC###")
                    full_response_text = parts[0].strip()
                    rec_string = parts[1].strip()
                    raw_recs = [r.strip() for r in rec_string.split("|") if r.strip()]
                    
                    # Deduplicate recommendations
                    seen = set()
                    recommendations = []
                    for r in raw_recs:
                        r_lower = r.lower().strip("?. ")
                        if r_lower not in seen:
                            seen.add(r_lower)
                            recommendations.append(r)
                else:
                    full_response_text = full_raw_response
                    recommendations = ["What features does LeadQ offer?", "How does VocalQ voice agent work?", "Tell me about LeadQ pricing plans"]
                
                yield json.dumps({"type": "content", "chunk": full_response_text}) + "\n"
                yield json.dumps({"type": "recommendations", "data": recommendations}) + "\n"
                found_match = True
            except Exception as e:
                print(f"OpenAI Generation Error: {e}")

        # 3. Static KB Pattern Matching (Final Fallback if LLM fails)
        if not found_match and not regenerate:
            best_topic = None
            best_score = 0
            for topic, data in KNOWLEDGE_BASE.items():
                score = sum(1 for k in data['keywords'] if re.search(r'\b' + re.escape(k) + r'\b', user_message_clean))
                if score > best_score:
                    best_score = score
                    best_topic = topic
            
            if best_topic and best_score > 0:
                print(f"[{time.time()}] Static match found: {best_topic}")
                full_response_text = KNOWLEDGE_BASE[best_topic]["answer"]
                recommendations = KNOWLEDGE_BASE[best_topic]["marketing_links"]
                source = "kb-pattern"
                found_match = True
                
                yield json.dumps({"type": "content", "chunk": full_response_text}) + "\n"
                yield json.dumps({"type": "recommendations", "data": recommendations}) + "\n"

        if not found_match:
            # Even the fallback stays on-brand and helpful
            error_msg = "I'm having a little trouble finding the right info for that. But I'm here to help with anything about **LeadQ**! You can ask me about contact capture, meeting intelligence, VocalQ, email automation, pricing, or any other feature.\n\nWhat would you like to know?"
            yield json.dumps({"type": "content", "chunk": error_msg}) + "\n"
            full_response_text = error_msg
            recommendations = ["What features does LeadQ offer?", "How do I get started with LeadQ?", "Tell me about LeadQ pricing plans"]
            yield json.dumps({"type": "recommendations", "data": recommendations}) + "\n"

        # 4. Log to DB
        yield json.dumps({"type": "meta", "sessionId": session_id}) + "\n"
        ChatService.log_interaction_to_db(
            session_id, user_id, message, full_response_text, recommendations, 
            {"latency_ms": (time.time() - request_start) * 1000, "source": source}
        )

    @staticmethod
    def submit_feedback(message: str, category: str, user_id: Optional[str]):
        supabase = get_supabase()
        supabase.table("feedback_submissions").insert({
            "message": message,
            "category": category,
            "user_id": user_id
        }).execute()
        return {"status": "success"}

    @staticmethod
    def submit_ticket(data: Dict[str, Any]):
        supabase = get_supabase()
        result = supabase.table("support_tickets").insert(data).execute()
        ticket_id = str(uuid.uuid4())
        if result.data and len(result.data) > 0:
            ticket_id = result.data[0].get('id', ticket_id)
        return {"status": "success", "ticket_id": ticket_id}
