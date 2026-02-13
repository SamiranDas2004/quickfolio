import asyncio
import sys
from cache import invalidate_user_cache

async def clear_user_cache(username: str):
    await invalidate_user_cache(username)
    print(f"Cache cleared for user: {username}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python clear_cache.py <username>")
        sys.exit(1)
    
    username = sys.argv[1]
    asyncio.run(clear_user_cache(username))
