from os import getenv
from flask import Flask
from flask_restful import Api

from resources.index import Index


def create_app():

    app = Flask(__name__)
    app.secret_key = getenv('FLASK_SECRET_KEY', 'default')
    api = Api(app)

    api.add_resource(Index, '/')

    return app
