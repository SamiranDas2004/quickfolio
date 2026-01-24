from sqlalchemy import Column, String, DateTime, JSON, Text, ForeignKey, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    title = Column(String(100), default="")
    bio = Column(Text, default="")
    avatar_url = Column(String(255), default="")
    namespace_id = Column(String(36), default=lambda: str(uuid.uuid4()))
    background_preference = Column(String(50), default="ripple")
    template_type = Column(String(50), default="conversational")
    social_links = Column(JSON, default=dict)
    skills = Column(JSON, default=list)
    contact = Column(JSON, default=dict)
    custom_sections = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="user", cascade="all, delete-orphan")
    analytics = relationship("Analytics", back_populates="user", cascade="all, delete-orphan")
    chat_logs = relationship("ChatLog", back_populates="user", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, default="")
    tech_stack = Column(JSON, default=list)
    github_url = Column(String(255), default="")
    live_url = Column(String(255), default="")
    image_url = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="projects")

class Experience(Base):
    __tablename__ = "experiences"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    company = Column(String(150), nullable=False)
    position = Column(String(150), nullable=False)
    duration = Column(String(50), nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="experiences")

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # 'view', 'chat'
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_data = Column(JSON, default=dict)
    
    user = relationship("User", back_populates="analytics")

class ChatLog(Base):
    __tablename__ = "chat_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="chat_logs")