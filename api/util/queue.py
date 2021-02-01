import redis
from os import getenv
from rq import Queue

conn = redis.from_url(getenv('REDIS_URI', 'redis://localhost:6379'))
queue = Queue(connection=conn)
