from app.extensions.db import db
from datetime import datetime
from bcrypt import hashpw, gensalt, checkpw

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=True)
    document = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(128), nullable=False)
    
    # Indica se o usuário tem privilégios de administrador
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    role = db.Column(db.String(20), default='collaborator', nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')

    def check_password(self, password):
        return checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'isAdmin': self.is_admin,
            'role': self.role
        }