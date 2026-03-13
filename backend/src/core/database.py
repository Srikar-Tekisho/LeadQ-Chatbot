"""
Minimal Database Client for LeadQ Chatbot (Standalone)
"""
from supabase import create_client, Client
from src.core.config import settings

_supabase_client: Client = None


def get_supabase() -> Client:
    """Get or create the Supabase client instance."""
    global _supabase_client
    if _supabase_client is None:
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                print("Connected to Supabase")
            except Exception as e:
                print(f"Failed to connect to Supabase: {e}")
    return _supabase_client
