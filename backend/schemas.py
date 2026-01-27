from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProjectResponse(BaseModel):
    id: str
    title: str
    description: str
    tech_stack: List[str]
    github_url: str
    live_url: str
    image_url: str

    class Config:
        from_attributes = True

class ExperienceResponse(BaseModel):
    id: str
    company: str
    position: str
    duration: str
    description: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    background_preference: Optional[str] = None
    template_type: Optional[str] = None
    theme_color: Optional[str] = None
    font_family: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None
    skills: Optional[List[str]] = None
    contact: Optional[Dict[str, str]] = None
    custom_sections: Optional[List[Dict[str, Any]]] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    name: str
    title: str
    bio: str
    avatar_url: str
    namespace_id: str
    background_preference: str
    template_type: str
    social_links: Dict[str, Any]
    skills: List[str]
    contact: Dict[str, Any]
    custom_sections: List[Dict[str, Any]]
    projects: List[ProjectResponse]
    experiences: List[ExperienceResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    identifier: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    context: Optional[str] = None
