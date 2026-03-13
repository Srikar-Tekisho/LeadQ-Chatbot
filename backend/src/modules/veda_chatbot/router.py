import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse

from src.modules.veda_chatbot.schemas import ChatRequest, FeedbackRequest, TicketRequest
from src.modules.veda_chatbot.service import ChatService

router = APIRouter(tags=["Chatbot"])

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    session_id = request.sessionId if request.sessionId else str(uuid.uuid4())
    return StreamingResponse(
        ChatService.chat_generator(request.message, session_id, request.user_id, request.regenerate, request.history),
        media_type="application/x-ndjson"
    )

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document for RAG ingestion.
    Note: In a production environment, this would trigger an asynchronous ingestion worker.
    """
    try:
        if not file.filename.endswith((".txt", ".md", ".docx", ".pdf")):
             return {"status": "error", "message": "Unsupported file format. Please use .txt, .md, .docx, or .pdf."}

        # Create documents directory if it doesn't exist
        os.makedirs("documents", exist_ok=True)
        file_path = os.path.join("documents", file.filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"status": "success", "message": f"File {file.filename} uploaded successfully. Ingestion triggered."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    return ChatService.submit_feedback(request.message, request.category, request.user_id)

@router.post("/ticket")
async def submit_ticket(request: TicketRequest):
    return ChatService.submit_ticket(request.model_dump(exclude_none=True))
