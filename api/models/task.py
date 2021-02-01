from util.queue import queue
from util.db import db
from flask_jwt import current_identity


class TaskModel(db.Model):
    #  Define the tablename
    __tablename__ = 'task'

    # Define the fields/table
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String(80))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(db.String(20))
    result = db.Column(db.String(2000))
    created_at = db.Column(db.DateTime)
    started_at = db.Column(db.DateTime)
    ended_at = db.Column(db.DateTime)
    enqueued_at = db.Column(db.DateTime)
    origin = db.Column(db.String(25))

    def __init__(
            self,
            job_id,
            user_id,
            status=None,
            result=None,
            created_at=None,
            started_at=None,
            ended_at=None,
            enqueued_at=None,
            origin=None):
        self.job_id = job_id
        self.user_id = user_id
        self.status = status
        self.result = result
        self.created_at = created_at
        self.started_at = started_at
        self.ended_at = ended_at
        self.enqueued_at = enqueued_at
        self.origin = origin

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_from_queue(self):
        job = queue.fetch_job(self.job_id)
        # Update if it's not failed or finished
        if self.status in ['failed', 'finished']:
            return self.json()

        self.status = job.get_status()
        self.result = job.result
        self.created_at = job.created_at
        self.started_at = job.started_at
        self.ended_at = job.ended_at
        self.enqueued_at = job.enqueued_at
        self.origin = job.origin

        self.save_to_db()
        return self.json()

    def get_job_position(self):
        try:
            job = queue.fetch_job(self.job_id).get_position()
            return job
        except Exception:
            return None

    def json(self, update=False):
        # Fetch the most current data from the queue
        if update:
            self.update_from_queue()

        return {
            'id': self.id,
            'job_id': self.job_id,
            'user_id': self.user_id,
            'status': self.status,
            'result': self.result,
            'job_position': self.get_job_position(),
            'created_at': self.created_at.__str__(),
            'started_at': self.started_at.__str__(),
            'ended_at': self.ended_at.__str__(),
            'enqueued_at': self.enqueued_at.__str__(),
            'origin': self.origin
        }

    @classmethod
    def find_by_user_id(cls, user_id):
        result = cls.query.filter_by(user_id=user_id).first()
        if result.user_id == current_identity.id:
            return result
        else:
            return None

    @classmethod
    def find_by_job_id(cls, job_id):
        result = cls.query.filter_by(job_id=job_id).first()
        if result.user_id == current_identity.id:
            return result
        else:
            return None

    @classmethod
    def find_by_id(cls, id):
        result = cls.query.filter_by(id=id).first()
        if result:
            if result.user_id == current_identity.id:
                result.update_from_queue()
                return result
            else:
                return None
        return None

    @classmethod
    def create_task(cls, job_id, user_id, status=None, result=None, created_at=None, started_at=None, ended_at=None, enqueued_at=None, origin=None):
        return TaskModel(job_id, user_id, status, result, created_at, started_at, ended_at, enqueued_at, origin)
