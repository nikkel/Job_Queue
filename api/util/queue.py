from os import getenv
from redis import Redis
from rq import Queue

redis = Redis(getenv('REDIS_URI'))
queue = Queue(connection=redis)
