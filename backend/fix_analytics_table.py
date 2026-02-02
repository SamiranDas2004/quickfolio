from database import engine
from sqlalchemy import text

# Add event_data column to analytics table
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE analytics ADD COLUMN event_data JSON"))
        conn.commit()
        print("event_data column added successfully!")
    except Exception as e:
        print(f"Column might already exist or error: {e}")



