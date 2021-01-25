from flask_restful import Resource
from flask import make_response

class Index(Resource):

    def get(self):
        return make_response('Route is working!', 200)