from flask_jwt import jwt_required, current_identity
from flask_restful import Resource, reqparse
from werkzeug import datastructures
from PIL import Image

from util.queue import queue
from util.ImageProcessing import process_image
from models.task import TaskModel


class Task(Resource):
    @jwt_required()
    def get(self, task_id):
        # Validate task_id
        task = TaskModel.find_by_id(task_id)

        # Get task details from task_id

        # Return task details or error
        if task:
            return task.json()
        return {'message': 'Task not found'}, 404

    @jwt_required()
    def delete(self, task_id):
        # Validate task_id

        # If task_id exists delete task

        # Return task details or error
        return None


class TaskCreate(Resource):
    @jwt_required()
    def post(self):
        # Get post args and validate input
        parse = reqparse.RequestParser()
        parse.add_argument(
            'file',
            type=datastructures.FileStorage,
            location='files'
        )
        file = parse.parse_args()['file']
        image = Image.open(file)

        # Schedule task using Redis
        try:
            queue_job = queue.enqueue(process_image, image)

            task = TaskModel(
                queue_job.id,
                current_identity.id,
                queue_job.get_status(),
                queue_job.result,
                queue_job.created_at,
                queue_job.started_at,
                queue_job.ended_at,
                queue_job.enqueued_at,
                queue_job.origin
            )
            task.save_to_db()
        except Exception as err:
            return {'message': 'Unable to schedule task'}, 500

        # Return success or failed for created task
        return task.json(), 404


class TaskList(Resource):
    jwt_required()

    def get(self):

        # Return a list of tasks and their details
        data = [task.json() for task in TaskModel.query.all()
                if task.json()['user_id'] == current_identity.id]
        return {'tasks': data}
