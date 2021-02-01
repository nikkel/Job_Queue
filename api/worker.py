from os import getenv
from redis import from_url
from rq import Worker, Queue, Connection

listen = ['default']
conn = from_url(getenv('REDIS_URI'))

# Docker commands for scalability
# docker-compose -up --scale [worker_name]=3
if __name__ == '__main__':
    with Connection(conn):
        worker = Worker(list(map(Queue, listen)))
        worker.work()
