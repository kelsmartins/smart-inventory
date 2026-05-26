from app.extensions.db import db
from datetime import datetime
from bcrypt import hashpw, gensalt, checkpw

class User(db.Model):
    """
    Modelo de Usuário. Armazena credenciais e níveis de acesso.
    """
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=True)
    document = db.Column(db.String(20), nullable=True)
    # Armazena a senha criptografada (hash), nunca a senha em texto puro
    password_hash = db.Column(db.String(128), nullable=False)
    
    # is_admin: Define se o usuário pode criar colaboradores e acessar relatórios admin
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    role = db.Column(db.String(20), default='collaborator', nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        """Criptografa a senha usando bcrypt antes de salvar no banco."""
        self.password_hash = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')

    def check_password(self, password):
        """Compara a senha digitada com o hash salvo no banco."""
        return checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        """Converte o usuário para JSON para enviar ao Frontend."""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'isAdmin': self.is_admin,
            'role': self.role
        }