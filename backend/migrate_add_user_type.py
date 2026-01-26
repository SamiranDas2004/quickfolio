"""
Migration script to add type_of_user column to users table
Run this with: python3 migrate_add_user_type.py
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='type_of_user'
        """))
        
        if result.fetchone() is None:
            # Add the column
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN type_of_user VARCHAR(50) DEFAULT 'free'
            """))
            conn.commit()
            print("✓ Successfully added type_of_user column to users table")
        else:
            print("✓ Column type_of_user already exists")

if __name__ == "__main__":
    try:
        migrate()
        print("Migration completed successfully!")
    except Exception as e:
        print(f"Migration failed: {e}")
