# Portfolio Chat Feature Implementation

## Overview
Implemented a RAG-based chat system where visitors can interact with a portfolio owner's AI assistant.

## Backend Changes

### 1. Updated `backend/schemas.py`
- Added `ChatRequest` schema with `message` field
- Added `ChatResponse` schema with `response` and optional `context` fields

### 2. Updated `backend/ai_service.py`
- Added `query_user_data()` function that:
  - Queries Pinecone vector DB for relevant context using the namespace
  - Falls back to user data from database if Pinecone unavailable
  - Uses OpenRouter API (GPT-4o-mini) to generate conversational responses
  - Returns natural language answers about the user

### 3. Updated `backend/main.py`
- Added `/api/chat/{username}` POST endpoint
- Accepts chat messages and returns AI-generated responses
- Uses RAG to answer questions based on user's resume and profile data

## Frontend Changes

### 1. Created `components/Navigation.tsx`
- Reusable navigation component with buttons: Me, Skills, Contact, Resume, Projects
- Handles routing to different portfolio sections
- Highlights current active page

### 2. Created `app/[username]/me/page.tsx`
- Chat interface with message history
- Shows initial greeting with user's bio, title, and skills
- "Ask me anything" input field
- Real-time chat with AI assistant
- Scrollable message history
- Loading states and error handling

### 3. Updated `app/[username]/page.tsx`
- Replaced individual navigation buttons with Navigation component
- Updated API endpoint to use backend (http://localhost:8000)
- Cleaner, more maintainable code

### 4. Created Placeholder Pages
- `app/[username]/skills/page.tsx`
- `app/[username]/contact/page.tsx`
- `app/[username]/resume/page.tsx`
- `app/[username]/projects/page.tsx`
- All include Navigation component for consistent UX

## How It Works

1. **Visitor lands on portfolio**: `localhost:3000/[username]`
   - Sees user's name, title, bio, avatar
   - Navigation buttons: Me, Skills, Contact, Resume, Projects

2. **Visitor clicks "Me"**: Routes to `localhost:3000/[username]/me`
   - Initial message displays user's bio, skills, and greeting
   - Input field appears: "Ask me anything..."
   - Navigation remains visible at top

3. **Visitor asks question**:
   - Frontend sends POST to `/api/chat/{username}`
   - Backend queries Pinecone vector DB using user's namespace
   - LLM generates response based on resume data and context
   - Response appears in chat interface

4. **RAG Pipeline**:
   - Question → Create embedding → Query Pinecone → Retrieve context
   - Context + Question → LLM → Natural language response
   - Falls back to database user data if vector DB unavailable

## API Endpoints

### POST `/api/chat/{username}`
**Request:**
```json
{
  "message": "What are your skills?"
}
```

**Response:**
```json
{
  "response": "I'm skilled in Python, JavaScript, React, Node.js...",
  "context": null
}
```

## Next Steps (Not Implemented Yet)
- Skills page: Display skills with proficiency levels
- Contact page: Show contact form and social links
- Resume page: Display/download resume PDF
- Projects page: Showcase projects with images and links

## Tech Stack
- **Backend**: FastAPI, Pinecone, OpenRouter (GPT-4o-mini)
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL (via SQLAlchemy)
- **Vector DB**: Pinecone
