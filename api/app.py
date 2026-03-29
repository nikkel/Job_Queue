from os import getenv
import time
from typing import Type
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api
from flask_jwt_extended import JWTManager, create_access_token
from sqlalchemy.exc import OperationalError

from util.db import db
from util.security import authenticate

from resources.index import Index
from resources.task import Task, TaskList, TaskCreate


def create_app():

    # Flask setup
    app = Flask(__name__)
    app.secret_key = getenv('FLASK_SECRET_KEY', 'default')
    cors = CORS(app, resources={r"*": {"origins": "*"}})
    api = Api(app)

    # Database setup
    app.config['SQLALCHEMY_DATABASE_URI'] = getenv(
        'MYSQL_URI', 'mysql+pymysql://queue_user:queue_password@localhost/queue_db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = getenv('FLASK_SECRET_KEY', 'default')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    db.init_app(app)

    # Authentication JWT
    JWTManager(app)

    @app.route('/auth', methods=['POST'])
    def login():
        data = request.get_json()
        user = authenticate(data.get('username', ''), data.get('password', ''))
        if user:
            return jsonify(access_token=create_access_token(identity=str(user.id)))
        return jsonify(message='Invalid credentials'), 401

    # Create Routes
    api.add_resource(Index, '/')
    api.add_resource(TaskCreate, '/user/task')
    api.add_resource(Task, '/user/task/<int:task_id>')
    api.add_resource(TaskList, '/user/tasks')

    # Create database tables (retry until MySQL is ready)
    with app.app_context():
        for attempt in range(10):
            try:
                db.create_all()
                break
            except OperationalError:
                if attempt == 9:
                    raise
                time.sleep(3)

    return app


if __name__ == '__main__':
    create_app().run()
