"""
LeadQ Chatbot API - Main Entry Point
FastAPI application for the LeadQ AI Assistant (Veda).
"""
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.modules.veda_chatbot.router import router as chatbot_router

# Load environment variables
load_dotenv(dotenv_path=".env")
load_dotenv(dotenv_path="../.env")

app = FastAPI(
    title="LeadQ Chatbot API",
    description="AI-powered chatbot service for LeadQ - powered by Veda",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (documents for RAG)
if os.path.exists("documents"):
    app.mount("/documents", StaticFiles(directory="documents"), name="documents")

# Include chatbot router under /api/v1 prefix
app.include_router(chatbot_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "LeadQ Chatbot API is running", "version": "2.0.0", "assistant": "Veda"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "leadq-chatbot"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002, reload=True)
