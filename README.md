# LeadQ Settings Dashboard & Chatbot

This repository contains the LeadQ Dashboard application (Frontend) and the AI Chatbot Service (Backend).

## Repository Structure

*   **/frontend**: React + Vite application (Dashboard, Settings, Onboarding, Chatbot UI).
*   **/backend**: FastAPI application (AI Chatbot, Supabase integration).

## Getting Started

### 1. Frontend (Vercel)

The frontend is a React application built with Vite.

**Setup:**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your VITE_SUPABASE_URL and Keys
```

**Run Locally:**
```bash
npm run dev:all
# Dashboard: http://localhost:3002
# Chatbot: http://localhost:3004
```

### 2. Backend (Render)

The backend is a FastAPI service handling RAG, Ticket creation, and Feedback.

**Setup:**
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with SUPABASE_URL and SUPABASE_KEY
```

**Run Locally:**
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 5002 --reload
```

## Deployment

### Deploy Frontend to Vercel
1.  Connect this repo to Vercel.
2.  Set **Root Directory** to `frontend`.
3.  Set **Build Command** to `npm run build` (or specific build script).
4.  Set **Output Directory** to `dist`.
5.  Add Environment Variables from `frontend/.env.example`.

### Deploy Backend to Render
1.  Connect this repo to Render (Web Service).
2.  Set **Root Directory** to `backend`.
3.  Set **Build Command** to `pip install -r requirements.txt`.
4.  Set **Start Command** to `uvicorn main:app --host 0.0.0.0 --port 10000`.
5.  Add Environment Variables `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`.
