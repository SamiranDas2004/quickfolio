import redis
import json
import os
from dotenv import load_dotenv

load_dotenv()

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True
)

CACHE_TTL = 3600  # 1 hour

async def get_cache(key: str):
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except:
        return None

async def set_cache(key: str, value, ttl: int = CACHE_TTL):
    try:
        redis_client.setex(key, ttl, json.dumps(value, default=str))
    except:
        pass

async def delete_cache(key: str):
    try:
        redis_client.delete(key)
    except:
        pass

async def invalidate_user_cache(username: str):
    """Invalidate all cache for a user"""
    keys = [
        f"user:{username}",
        f"projects:{username}",
        f"skills:{username}",
        f"contact:{username}",
        f"resume:{username}",
        f"me:{username}"
    ]
    for key in keys:
        await delete_cache(key)
