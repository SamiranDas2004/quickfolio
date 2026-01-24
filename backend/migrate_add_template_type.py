"""
Database migration script to add template_type column to users table
Run this script to update existing database schema
"""

from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in .env file")
    exit(1)

engine = create_engine(DATABASE_URL)

def migrate():
    print("Starting migration: Adding template_type column to users table...")
    
    try:
        with engine.connect() as conn:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='template_type'
            """))
            
            if result.fetchone():
                print("✓ Column 'template_type' already exists. Skipping migration.")
                return
            
            # Add the new column
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN template_type VARCHAR(50) DEFAULT 'conversational'
            """))
            
            # Update existing rows to have default value
            conn.execute(text("""
                UPDATE users 
                SET template_type = 'conversational' 
                WHERE template_type IS NULL
            """))
            
            conn.commit()
            print("✓ Migration completed successfully!")
            print("  - Added 'template_type' column to users table")
            print("  - Set default value 'conversational' for all existing users")
            
    except Exception as e:
        print(f"✗ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    migrate()
