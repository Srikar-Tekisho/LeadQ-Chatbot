# Chatbot Service - Technical Specification & Product Requirements Document

## 1. Executive Summary
This document outlines the technical specifications and product requirements for the LeadQ.ai Chatbot Service. The goal is to build a scalable, secure, low-latency, and highly accurate AI assistant that serves as a core component of the LeadQ platform. The system prioritizes deterministic accuracy for critical business queries while leveraging Large Language Models (LLMs) like Gemini 2.0 Flash as a robust fallback for complex, unstructured interactions.

## 2. Core Capabilities

### 2.1 Natural Language Understanding (NLU) & Conversation Management
*   **Multi-turn Support:** The system tracks conversation history (last 'N' messages) to resolve context-dependent queries (e.g., "How much does it cost?" followed by "Is that per user?").
*   **Context Retention:** Session-based memory stores user intent and slots until explicitly reset or the session expires (default: 30 minutes inactivity).
*   **Intent Detection:** A tiered classification system:
    1.  **Exact Match:** Checks against known high-priority phrases.
    2.  **Keyword/Rule-Based:** Heuristic matching for specific domain actions (e.g., "reset password").
    3.  **Semantic Search/LLM:** For ambiguous queries.

### 2.2 Query Types
*   **FAQs:** fast retrieval from a local, indexed Knowledge Base.
*   **Guided Flows:** Button-driven or slot-filling conversations for complex tasks (e.g., "Report a Bug").
*   **Free-form:** LLM-mediated responses for general inquiries within the sales intelligence domain.

## 3. Accuracy & Reliability

### 3.1 Fallback Hierarchy
To ensure accuracy and minimize hallucinations, the system follows a strict execution order:
1.  **Topic Guardrails:** Immediate rejection of out-of-domain queries (e.g., coding help, general trivia).
2.  **Local Knowledge Base (Deterministic):** Precision search against `FAQ_DATA`.
3.  **Local LLM (Performance/Cost):** (Optional) Attempt lightweight local model (e.g., Ollama/Llama 3) if available and confident.
4.  **Cloud LLM Fallback (Robustness):** Call Google Gemini 2.0 Flash with a rigorous system prompt and specific context grounding.
5.  **Graceful User Fallback:** "I can't answer that specifically, but I can help with [X, Y, Z]."

### 3.2 Hallucination Prevention
*   **Grounding:** All LLM prompts must include the relevant Knowledge Base snippet as the *primary* source of truth.
*   **Negative Constraints:** System prompts explicitly instruct the model *not* to invent features or pricing not present in the context.

## 4. Performance

### 4.1 Latency Optimization
*   **Target Response Time:** < 500ms for FAQ/local hits; < 2000ms for LLM fallbacks.
*   **Caching:** Implement an in-memory LRU cache for identical queries seen within a short time window.
*   **Connection Keep-Alive:** Reuse HTTP connections for backend-LLM communication.

## 5. Architecture & Deployment

### 5.1 System Design
*   **Microservice Pattern:** `chatbot-service` runs as an independent FastAPI application on port `5002`.
*   **Frontend Integration:** Exposed via a clear REST API (`POST /chat`) consumed by the React frontend on port `3004`/`3000`.

### 5.2 Local Deployment
*   **Environment Management:** Configuration via `.env` files (loading from root `.env.local` to share secrets).
*   **Port Config:** Configurable via `PORT` env var (Default: 5002).

## 6. Security & Compliance

### 6.1 Input Security
*   **Sanitization:** Input is stripped of potential executable code or SQL injection patterns before processing.
*   **Prompt Injection Defense:** System prompts are sandwiched or delimited to prevent user input from overriding core instructions (e.g., "Ignore previous instructions").

### 6.2 Data Privacy
*   **PII Masking:** Logs must mask email addresses, phone numbers, and potential credit card numbers before writing to storage or console.
*   **Stateless Processing:** The LLM processing layer does not persist user data for training purposes (compliant with Gemini API data usage policies).

## 7. Observability & Monitoring

### 7.1 Logging
*   Structured JSON logs including:
    *   `timestamp`
    *   `sessionId`
    *   `query_category` (FAQ vs. LLM)
    *   `latency_ms`
    *   `model_used` (Gemini, Local, KB)
    *   `status` (Success, Error, Fallback)

### 7.2 Metrics
*   **Error Rate:** % of 5xx responses or LLM timeouts.
*   **Fallback Rate:** % of queries routed to the Cloud LLM vs. Local KB.

## 8. UX & Integration

### 8.1 User Interface
*   **Typing Indicators:** Real-time feedback ("LeadQ Support is typing...") during LLM latency periods.
*   **Rich Responses:** Support for markdown rendering (lists, bold text) in chat bubbles.
*   **Tone:** "Professional, Efficient, Friendly."

### 8.2 Integration Points
*   **Dashboard:** Floating widget accessible from all dashboard views.
*   **Context Awareness:** (Future) Chatbot knows which page the user is on (e.g., "Settings") to prioritize relevant answers.

## 9. Configuration & Extensibility

### 9.1 Environment Variables
| Variable | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| `PORT` | Service Port | No | 5002 |
| `GEMINI_API_KEY` | Google AI API Key | Yes | - |
| `LOG_LEVEL` | Logging verbosity | No | info |

### 9.2 Extensibility
*   **Pluggable Providers:** The `getChatResponse` function is designed to easily swap `GoogleGenerativeAI` with `OpenAI` or `Anthropic` SDKs if needed.
*   **Knowledge Base:** Depending on scale, `FAQ_DATA` can be migrated from a validated JSON object to a vector database (e.g., Pinecone/Supabase pgvector) without changing the API contract.

## 10. Voice-to-Text (Speech-to-Text) Feature

### 10.1 Feature Overview
Enables users to dictate messages directly into the chatbot using their device's microphone. This feature replicates the seamless voice experience found in modern AI tools like ChatGPT, lowering the friction for query entry, particularly for longer or complex sales queries.

### 10.2 UI/UX Design
*   **Visual Integration:**
    *   **Microphone Icon:** Embedded inside the text input field, positioned to the left of the Send button (or replacing it when input is empty, though simultaneous availability is preferred).
    *   **Styling:** Minimalist design using `lucide-react` icons (Mic/MicOff).
*   **Interactive States:**
    1.  **Idle:** Gray/Neutral icon. Click to start.
    2.  **Listening:**
        *   **Visual:** Icon turns active color (e.g., Red or Primary Brand Color).
        *   **Animation:** A "ripple" or "pulse" CSS animation rings the icon to indicate active audio capture.
        *   **Input Field:** Placeholder text changes to "Listening..." or transcribed text appears in real-time (ghost text).
    3.  **Processing/Finalizing:** Short transitional state if needed.
    4.  **Error/Denied:** Icon shows a slash or tooltip explaining permission denial.

### 10.3 Technical Implementation (Frontend)

#### A. Core Technology: Web Speech API
*   **API:** `window.SpeechRecognition` (Standard) or `window.webkitSpeechRecognition` (Chrome/Safari).
*   **Rationale:** Provides zero-latency, client-side (or browser-optimised) transcription without incurring third-party API costs for every keystroke. Best for "drafting" text.

#### B. Logic Flow
1.  **Start:** User clicks Mic. `recognition.start()` is called.
2.  **Capture:**
    *   `recognition.interimResults = true`: Capture partial phrases to update the UI immediately ("I want to...", "I want to see leads...").
    *   `recognition.continuous = false`: Automatically stop after the user pauses (sentence end).
3.  **Populate:** Update the Chat Input React state (`inputValue`) with the transcript.
4.  **Handoff:** User reviews the text and clicks Send (or hits Enter). We do *not* auto-send to allow for correction of homophones (e.g., "LeadQ" vs "Lead Cue").

#### C. Component Updates (`Chatbot.tsx`)
*   **New State:** `isListening` (boolean).
*   **New Handler:** `toggleListening()`: Handles start/stop and permission errors.
*   **Effect Hook:** Manage the `SpeechRecognition` instance lifecycle to prevent memory leaks or zombie listeners.

### 10.4 Privacy & Security
*   **Permissions:** Just-in-time request. The browser will prompt "Allow Microphone?" on the first use.
*   **Data Handling:** Audio is ephemeral. It is streamed to the browser's engine for transcription and discarded. No audio files are uploaded to LeadQ servers.

### 10.5 Error Handling & Fallback Strategy
| Error Code | User Feedback | Recovery |
| :--- | :--- | :--- |
| `not-allowed` | Toast/Tooltip: "Microphone access blocked." | Disable feature for session. |
| `no-speech` | "Didn't catch that. Try again." | Reset button to Idle. |
| `network` | "Offline. Voice unavailable." | Fallback to text. |
| `browser-unsupported` | (Hidden) | Feature checks capability on mount; hides icon if unsupported (e.g., Firefox Desktop requires config). |

### 10.6 Configuration & Extensibility
*   **Env Variable:** `VITE_ENABLE_VOICE_INPUT=true` allows toggling the feature globally.
*   **Language:** Configurable via `recognition.lang` (default: `en-US` or user's browser locale).
*   **Future Upgrade Path:** Design allows swapping the `SpeechRecognition` hook with a cloud-based WebSocket stream (e.g., OpenAI Realtime API) if higher accuracy for technical jargon is required later.
