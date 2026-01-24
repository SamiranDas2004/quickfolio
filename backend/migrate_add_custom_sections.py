from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        try:
            # Add custom_sections column
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN custom_sections JSON
            """))
            conn.commit()
            print("✅ Successfully added custom_sections column to users table")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("⚠️  Column custom_sections already exists")
            else:
                print(f"❌ Error: {e}")
                raise

if __name__ == "__main__":
    migrate()
