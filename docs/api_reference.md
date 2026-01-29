# LeadQ Chatbot API Reference

Base URL: `http://localhost:5002`

## Endpoints

### Health Check
**GET** `/health`

Returns the status of the service and Supabase connection.

**Response:**
```json
{
  "status": "ok",
  "service": "chatbot-backend-fastapi",
  "version": "1.0.0",
  "db_connected": true
}
```

### Chat
**POST** `/chat`

Sends a message to the chatbot.

**Request Body:**
```json
{
  "message": "string",
  "sessionId": "string (optional)",
  "user_id": "string (optional)"
}
```

**Response:**
```json
{
  "response": "string",
  "recommendations": ["string"],
  "sessionId": "string",
  "meta": {
    "source": "fastapi-knowledge-base",
    "latency_ms": 123.45
  }
}
```

### Submit Feedback
**POST** `/feedback`

Submits user feedback.

**Request Body:**
```json
{
  "user_id": "string (optional)",
  "message": "string",
  "category": "General" 
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Feedback submitted successfully"
}
```

### Submit Support Ticket
**POST** `/ticket`

Creates a new support ticket.

**Request Body:**
```json
{
  "user_id": "string (optional)",
  "category": "Technical | Billing | Feature",
  "priority": "Medium",
  "subject": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Ticket created successfully",
  "ticket_id": "uuid"
}
```
