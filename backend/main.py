from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from dotenv import load_dotenv
import httpx
import json
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import validator

from database import get_db, engine, create_tables
from models import User, Project, Experience, Analytics, ChatLog
from schemas import UserCreate, UserResponse, UserUpdate, LoginRequest, Token, ChatRequest, ChatResponse
from auth import authenticate_user, create_access_token, get_current_user, get_password_hash
from ai_service import process_resume, create_namespace, query_user_data, query_user_data_stream
from cloudinary_service import upload_resume as upload_to_cloudinary, upload_image
from cache import get_cache, set_cache, invalidate_user_cache
from email_service import send_welcome_email, send_resume_processed_email

load_dotenv()

# Create tables on startup
create_tables()

app = FastAPI(title="QuickFolio API", version="1.0.0")
# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000","https://quickfolio.in"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: HTTPException(status_code=429, detail="Rate limit exceeded"))

@app.get("/")
async def root():
    return {"message": "QuickFolio API"}

@app.get("/api/check-username/{username}")
async def check_username(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    return {"available": user is None}

@app.post("/api/auth/signup")
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    user_dict = user.dict()
    user_dict["password"] = get_password_hash(user_dict["password"])
    
    db_user = User(**user_dict)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create namespace in Pinecone
    create_namespace(db_user.namespace_id)
    
    # Generate access token
    access_token = create_access_token(data={"sub": db_user.username})
    
    # Send welcome email
    print(f"\n=== SENDING WELCOME EMAIL ===")
    print(f"To: {db_user.email}")
    print(f"Name: {db_user.name}")
    print(f"Username: {db_user.username}")
    email_sent = send_welcome_email(db_user.email, db_user.name, db_user.username)
    print(f"Email sent status: {email_sent}")
    
    return {
        "user": db_user,
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.post("/api/auth/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/{username}", response_model=UserResponse)
async def get_user(username: str, db: Session = Depends(get_db)):
    cache_key = f"user:{username}"
    cached = await get_cache(cache_key)
    if cached:
        return cached
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    analytics = Analytics(user_id=user.id, event_type="view")
    db.add(analytics)
    db.commit()
    
    await set_cache(cache_key, user.__dict__)
    return user

@app.put("/api/users/{username}", response_model=UserResponse)
async def update_user(
    username: str, 
    user_update: UserUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    await invalidate_user_cache(username)
    return user

@app.post("/api/upload-avatar/{username}")
async def upload_avatar(
    username: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_content = await file.read()
    avatar_url = await upload_image(file_content, f"{username}_avatar", "quickfolio/avatars")
    
    if not avatar_url:
        raise HTTPException(status_code=500, detail="Upload failed")
    
    user.avatar_url = avatar_url
    db.commit()
    db.refresh(user)
    
    return {"avatar_url": avatar_url}

@app.post("/api/upload-project-image/{username}")
async def upload_project_image(
    username: str,
    project_id: Optional[str] = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_content = await file.read()
    import time
    image_url = await upload_image(file_content, f"{username}_project_{int(time.time())}", "quickfolio/projects")
    
    if not image_url:
        raise HTTPException(status_code=500, detail="Upload failed")
    
    # Update project if project_id provided
    if project_id:
        project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
        if project:
            project.image_url = image_url
            db.commit()
    
    return {"image_url": image_url}

@app.post("/api/upload-resume/{username}")
async def upload_resume(
    username: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    file_content = await file.read()
    
    # Upload to Cloudinary
    resume_url = await upload_to_cloudinary(file_content, f"{username}_{file.filename}")
    
    # Reset file pointer for AI processing
    await file.seek(0)
    
    # Process resume with AI and store embeddings
    resume_data = await process_resume(file, username, user.namespace_id)
    
    # Update user with extracted data
    if resume_data.get("name"):
        user.name = resume_data["name"]
    if resume_data.get("title"):
        user.title = resume_data["title"]
    if resume_data.get("bio"):
        user.bio = resume_data["bio"]
    if resume_data.get("skills"):
        user.skills = resume_data["skills"]
    if resume_data.get("contact"):
        user.contact = resume_data["contact"]
    if resume_data.get("social_links"):
        user.social_links = resume_data["social_links"]
    
    # Store projects
    if resume_data.get("projects"):
        for proj_data in resume_data["projects"]:
            project = Project(
                user_id=user.id,
                title=proj_data.get("title", ""),
                description=proj_data.get("description", ""),
                tech_stack=proj_data.get("tech_stack", []),
                github_url=proj_data.get("github_url", ""),
                live_url=proj_data.get("live_url", "")
            )
            db.add(project)
    
    # Store experience
    if resume_data.get("experience"):
        for exp_data in resume_data["experience"]:
            experience = Experience(
                user_id=user.id,
                company=exp_data.get("company", ""),
                position=exp_data.get("position", ""),
                duration=exp_data.get("duration", ""),
                description=exp_data.get("description", "")
            )
            db.add(experience)
    
    # Store resume URL
    if not user.contact:
        user.contact = {}
    user.contact["resume_url"] = resume_url
    
    db.commit()
    db.refresh(user)
    await invalidate_user_cache(username)
    
    # Send resume processed email
    print(f"\n=== SENDING RESUME PROCESSED EMAIL ===")
    print(f"To: {user.email}")
    print(f"Name: {user.name}")
    print(f"Username: {user.username}")
    email_sent = send_resume_processed_email(user.email, user.name, user.username)
    print(f"Email sent status: {email_sent}")
    
    return {
        "message": "Resume processed successfully",
        "resume_url": resume_url,
        "extracted_data": resume_data
    }

@app.post("/api/update-resume/{username}")
async def update_resume(
    username: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    file_content = await file.read()
    
    # Upload to Cloudinary
    resume_url = await upload_to_cloudinary(file_content, f"{username}_{file.filename}")
    
    # Update resume URL in contact
    if not user.contact:
        user.contact = {}
    user.contact["resume_url"] = resume_url
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Resume updated successfully",
        "resume_url": resume_url
    }

@app.post("/api/chat/{username}")
@limiter.limit("10/minute")
async def chat_with_user(
    request: Request,
    username: str,
    chat_request: ChatRequest,
    db: Session = Depends(get_db)
):
    # Input validation
    if not username or len(username) > 50:
        raise HTTPException(status_code=400, detail="Invalid username")
    if not chat_request.message or len(chat_request.message) > 5000:
        raise HTTPException(status_code=400, detail="Message must be between 1 and 5000 characters")
    
    # Sanitize input
    message = chat_request.message.strip()
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = {
        "name": user.name,
        "title": user.title,
        "bio": user.bio,
        "skills": user.skills,
        "contact": user.contact,
        "social_links": user.social_links
    }
    
    async def generate():
        full_response = ""
        async for chunk in query_user_data_stream(
            namespace_id=user.namespace_id,
            username=username,
            question=message,
            user_data=user_data
        ):
            full_response += chunk
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        
        # Log after streaming completes
        chat_log = ChatLog(
            user_id=user.id,
            question=message,
            response=full_response
        )
        db.add(chat_log)
        analytics = Analytics(user_id=user.id, event_type="chat")
        db.add(analytics)
        db.commit()
        
        yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.get("/api/projects/{username}")
async def get_projects(username: str, db: Session = Depends(get_db)):
    cache_key = f"projects:{username}"
    cached = await get_cache(cache_key)
    if cached:
        return cached
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    await set_cache(cache_key, [p.__dict__ for p in projects])
    return projects

@app.post("/api/chat/projects/{username}", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat_about_projects(
    request: Request,
    username: str,
    chat_request: ChatRequest,
    db: Session = Depends(get_db)
):
    # Input validation
    if not username or len(username) > 50:
        raise HTTPException(status_code=400, detail="Invalid username")
    if not chat_request.message or len(chat_request.message) > 5000:
        raise HTTPException(status_code=400, detail="Message must be between 1 and 5000 characters")
    
    # Sanitize input
    message = chat_request.message.strip()
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    projects_data = [{
        "title": p.title,
        "description": p.description,
        "tech_stack": p.tech_stack,
        "github_url": p.github_url,
        "live_url": p.live_url
    } for p in projects]
    
    user_data = {
        "name": user.name,
        "projects": projects_data
    }
    
    response = await query_user_data(
        namespace_id=user.namespace_id,
        username=username,
        question=message,
        user_data=user_data
    )
    
    return ChatResponse(response=response)

@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
        
        file_content = await file.read()
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            files = {"file": ("audio.webm", file_content, "audio/webm")}
            data = {"model": "whisper-large-v3"}
            headers = {"Authorization": f"Bearer {groq_api_key}"}
            
            response = await client.post(
                "https://api.groq.com/openai/v1/audio/translations",
                files=files,
                data=data,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                return {"text": result.get("text", "")}
            else:
                raise HTTPException(status_code=response.status_code, detail="Transcription failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/{username}")
async def get_analytics(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get view count
    view_count = db.query(Analytics).filter(
        Analytics.user_id == user.id,
        Analytics.event_type == "view"
    ).count()
    
    # Get chat count
    chat_count = db.query(Analytics).filter(
        Analytics.user_id == user.id,
        Analytics.event_type == "chat"
    ).count()
    
    # Get popular questions (top 10)
    from sqlalchemy import func
    popular_questions = db.query(
        ChatLog.question,
        func.count(ChatLog.question).label('count')
    ).filter(
        ChatLog.user_id == user.id
    ).group_by(
        ChatLog.question
    ).order_by(
        func.count(ChatLog.question).desc()
    ).limit(10).all()
    
    # Get recent chat logs
    recent_chats = db.query(ChatLog).filter(
        ChatLog.user_id == user.id
    ).order_by(ChatLog.timestamp.desc()).limit(20).all()
    
    return {
        "view_count": view_count,
        "chat_count": chat_count,
        "popular_questions": [{"question": q[0], "count": q[1]} for q in popular_questions],
        "recent_chats": [{
            "question": chat.question,
            "response": chat.response,
            "timestamp": chat.timestamp.isoformat()
        } for chat in recent_chats]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)