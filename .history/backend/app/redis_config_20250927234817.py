# backend/app/redis_config.py
import os
import redis
from dotenv import load_dotenv

load_dotenv()

def get_redis_connection():
    try:
        # Try connecting to Redis
        redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=os.getenv('REDIS_PORT', 6379),
            db=0,
            decode_responses=True
        )
        redis_client.ping()  # Test connection
        return redis_client
    except:
        # Fallback to in-memory storage
        print("Redis not available, using in-memory storage")
        return None

# Create global Redis instance
redis_client = get_redis_connection()