from os import getenv
from flask import Flask
from flask_restful import Api
from flask_jwt import JWT

from util.db import db
from util.security import authenticate, identify

from resources.index import Index
from resources.task import Task, TaskList, TaskCreate


def create_app():

    # Flask setup
    app = Flask(__name__)
    app.secret_key = getenv('FLASK_SECRET_KEY', 'default')
    api = Api(app)

    # Database setup
    app.config['SQLALCHEMY_DATABASE_URI'] = getenv('MYSQL_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    # Authentication JWT
    JWT(
        app=app,
        authentication_handler=authenticate,
        identity_handler=identify
    )

    # Create Routes
    api.add_resource(Index, '/')
    api.add_resource(TaskCreate, '/user/task')
    api.add_resource(Task, '/user/task/<int:id>')
    api.add_resource(TaskList, '/user/tasks')

    # Create database tables
    with app.app_context():
        db.create_all()

    return app
