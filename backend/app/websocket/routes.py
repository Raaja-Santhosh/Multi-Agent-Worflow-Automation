import asyncio
import redis.asyncio as redis
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.config import settings

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/task-runs/{run_id}")
async def websocket_endpoint(websocket: WebSocket, run_id: str):
    await websocket.accept()
    
    # Connect to Redis
    redis_client = redis.from_url(settings.REDIS_URL)
    pubsub = redis_client.pubsub()
    
    channel_name = f"run:{run_id}"
    await pubsub.subscribe(channel_name)
    
    try:
        while True:
            # H4 Fix: Reduced timeout from 1.0s to 0.1s for near-instant event delivery
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=0.1)
            if message:
                data = message['data']
                if isinstance(data, bytes):
                    data = data.decode('utf-8')
                await websocket.send_text(data)
                
            # Allow yielding control so websocket connection isn't blocked
            await asyncio.sleep(0.01)
            
    except WebSocketDisconnect:
        pass  # Client disconnected — normal behavior
    except Exception:
        pass  # Connection error — clean up silently
    finally:
        await pubsub.unsubscribe(channel_name)
        await redis_client.aclose()
