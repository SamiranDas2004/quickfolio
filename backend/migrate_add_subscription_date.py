"""
Migration script to add subscription_date column to users table
Run this script once: python migrate_add_subscription_date.py
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        try:
            # Add subscription_date column
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN subscription_date DATETIME NULL
            """))
            conn.commit()
            print("✓ Successfully added subscription_date column to users table")
        except Exception as e:
            if "Duplicate column name" in str(e) or "duplicate column" in str(e):
                print("✓ Column subscription_date already exists")
            else:
                print(f"✗ Error: {e}")
                raise

if __name__ == "__main__":
    migrate()
