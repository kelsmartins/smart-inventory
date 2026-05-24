from app.extensions.db import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    # ID como String para suportar o UUID do Supabase
    id = db.Column(db.String(36), primary_key=True)
    
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=True)
    document = db.Column(db.String(20), nullable=True)
    
    # Padrão definido como admin
    role = db.Column(db.String(20), default='admin', nullable=False)
    
    # Adicionado para bater com o front-end
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """
        Converte o objeto User em um dicionário compatível com o type do React.
        """
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'document': self.document,
            'role': self.role,
            'isAdmin': self.role == 'admin',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }