from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        try:
            # Update NULL values to empty JSON array
            result = conn.execute(text("""
                UPDATE users 
                SET custom_sections = '[]' 
                WHERE custom_sections IS NULL
            """))
            conn.commit()
            print(f"✅ Updated {result.rowcount} users with empty custom_sections array")
        except Exception as e:
            print(f"❌ Error: {e}")
            raise

if __name__ == "__main__":
    migrate()
