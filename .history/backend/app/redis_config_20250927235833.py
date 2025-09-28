# backend/app/redis_simple.py - In-memory Redis replacement
class SimpleRedis:
    def __init__(self):
        self.data = {}
        self.pubsub = SimplePubSub()
    
    def get(self, key):
        return self.data.get(key)
    
    def set(self, key, value):
        self.data[key] = value
        return True
    
    def publish(self, channel, message):
        self.pubsub.publish(channel, message)
    
    def ping(self):
        return True

class SimplePubSub:
    def __init__(self):
        self.subscribers = {}
    
    def publish(self, channel, message):
        if channel in self.subscribers:
            for callback in self.subscribers[channel]:
                callback(message)
    
    def subscribe(self, channel, callback):
        if channel not in self.subscribers:
            self.subscribers[channel] = []
        self.subscribers[channel].append(callback)

# Use this instead of real Redis
redis_client = SimpleRedis()