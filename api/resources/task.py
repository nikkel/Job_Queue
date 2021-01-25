from flask_restful import Resource


class Task(Resource):
    def get(self, task_id):
        # Validate task_id

        # Get task details from task_id

        # Return task details or error
        return None

    def delete(self, task_id):
        # Validate task_id

        # If task_id exists delete task

        # Return task details or error
        return None


class TaskCreate(Resource):
    def post(self):
        # Get post args and validate input

        # Schedule task using Redis

        # Return success or failed for created task
        return None


class TaskList(Resource):
    def get(self):
        # Return a list of tasks and their details
        return None
