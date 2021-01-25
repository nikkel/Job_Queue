from os import getenv
from redis import Redis
from rq import Worker, Queue, Connection

from util.db import db
from util.ImageProcessing import process_image

redis = Redis(getenv('REDIS_URI'))
listen = ['default']

# Docker commands for scalability
# docker-compose -up --scale [worker_name]=3
if __name__ == '__main__':
    with Connection(redis):
        worker = Worker(list(map(Queue, listen)))
        worker.work()
