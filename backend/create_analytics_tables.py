from database import engine
from models import Base


"This script creates the necessary tables for analytics and chat logs in the database."

# Create all tables
Base.metadata.create_all(bind=engine)
print("Analytics and ChatLog tables created successfully!")
