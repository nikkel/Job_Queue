from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource, reqparse
from werkzeug import datastructures
from werkzeug.datastructures import FileStorage
from PIL import Image, UnidentifiedImageError
import io

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
        try:
            parse = reqparse.RequestParser()
            parse.add_argument(
                'file',
                type=FileStorage,
                location='files',
                required=True,
            )
            file: FileStorage = parse.parse_args()['file']
            image_name = file.filename
            image = Image.open(file)
            print(file.filename)
            # image.save(image. )
        except UnidentifiedImageError:
            return {'message', 'not an image file'}, 404

        # Schedule task using Redis
        try:
            image_bytes = io.BytesIO()
            image.save(image_bytes, format=image.format or 'PNG')
            queue_job = queue.enqueue(process_image, image_bytes.getvalue())

            task = TaskModel(
                queue_job.id,
                int(get_jwt_identity()),
                queue_job.get_status().value,
                None,
                queue_job.created_at,
                queue_job.started_at,
                queue_job.ended_at,
                queue_job.enqueued_at,
                queue_job.origin
            )
            task.save_to_db()
        except Exception as err:
            return {'message': err.args}, 500

        # Return success or failed for created task
        return task.json(), 201


class TaskList(Resource):

    @jwt_required()
    def get(self):

        # Return a list of tasks and their details
        data = [task.json(update=True) for task in TaskModel.query.filter_by(
            user_id=int(get_jwt_identity()))]
        return {'tasks': data}
