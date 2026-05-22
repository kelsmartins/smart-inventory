from app.extensions.db import db
from bcrypt import hashpw, gensalt, checkpw

class User(db.Model):
    __tablename__ = 'users'
    
    # Chave primária auto-incremento
    id = db.Column(db.Integer, primary_key=True)
    
    # Nome de usuário único para login (deve ser único no banco)
    username = db.Column(db.String(80), unique=True, nullable=False)
    
    # Indica se o usuário tem privilégios de administrador
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    
    # Armazena a senha criptografada (nunca em texto puro)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        """
        Criptografa a senha utilizando Bcrypt e salva no hash.
        O gensalt() adiciona um valor aleatório para evitar ataques de Rainbow Tables.
        """
        # Converte a string da senha para bytes e aplica o hash
        self.password_hash = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')

    def check_password(self, password):
        """
        Verifica se a senha fornecida corresponde ao hash armazenado.
        Retorna True se a senha estiver correta, False caso contrário.
        """
        return checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """
        Converte o objeto User em um dicionário para retorno em JSON.
        Exclui o campo password_hash por segurança.
        """
        return {
            'id': self.id,
            'username': self.username,
            'isAdmin': self.is_admin,
        }