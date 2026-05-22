from flask import Flask

from dotenv import load_dotenv
import os

from app.extensions.db import db

load_dotenv()

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

from app.models import *

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return "API funcionando"

if __name__ == '__main__':
    # Flask roda nativamente na porta 5000 
    app.run(debug=True)