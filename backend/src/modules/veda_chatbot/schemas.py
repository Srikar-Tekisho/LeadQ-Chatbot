from typing import Optional, List, Dict
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    user_id: Optional[str] = None
    regenerate: bool = False
    history: Optional[List[Dict[str, str]]] = None

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
