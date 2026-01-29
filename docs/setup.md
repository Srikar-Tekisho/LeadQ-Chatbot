# Getting Started with LeadQ

This guide provides instructions on how to set up and run the LeadQ Settings Dashboard and Chatbot locally.

## Prerequisites
- Node.js (for Frontend)
- Python 3.8+ (for Backend)
- Supabase Account and Project

## 1. Frontend (Vercel)

The frontend is a React application built with Vite.

### Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and provide your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Run Locally
To run all frontend services (Dashboard, Chatbot, Onboarding, Settings):
```bash
npm run dev:all
```
- **Dashboard:** [http://localhost:3002](http://localhost:3002)
- **Chatbot:** [http://localhost:3004](http://localhost:3004)

## 2. Backend (Render)

The backend is a FastAPI service handling RAG, Ticket creation, and Feedback.

### Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and Activate Virtual Environment:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```
3. Install Dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` with `SUPABASE_URL`, `SUPABASE_KEY` (Service Role Key recommended for backend), and other necessary keys.

### Run Locally
Start the FastAPI server:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 5002 --reload
```
The API will be available at [http://localhost:5002](http://localhost:5002).

## Documentation
- [Technical Specification](./technical_spec.md)
- [API Reference](./api_reference.md)
