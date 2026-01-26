"""
Migration script to fix subscription_end_date column type
Run this script once: python migrate_fix_subscription_end_date.py
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
            # Drop existing column
            print("Dropping existing subscription_end_date column...")
            conn.execute(text("ALTER TABLE users DROP COLUMN subscription_end_date"))
            conn.commit()
            print("✓ Dropped subscription_end_date column")
            
            # Add column with correct type (TIMESTAMP)
            print("Adding subscription_end_date column with TIMESTAMP type...")
            conn.execute(text("ALTER TABLE users ADD COLUMN subscription_end_date TIMESTAMP NULL"))
            conn.commit()
            print("✓ Successfully added subscription_end_date column as TIMESTAMP")
            
        except Exception as e:
            print(f"✗ Error: {e}")
            raise

if __name__ == "__main__":
    migrate()
