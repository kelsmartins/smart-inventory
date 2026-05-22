import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env (fora do versionamento)
load_dotenv()

class Config:
    # URL de conexão com o banco de dados (MySQL via XAMPP)
    # Fallback para SQLite se DATABASE_URL não estiver definida ou estiver vazia
    _db_url = os.getenv('DATABASE_URL')
    SQLALCHEMY_DATABASE_URI = _db_url if _db_url else 'sqlite:///instance/validation.db'
    
    # Desabilita o rastreamento de modificações
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configurações do pool de conexões – Apenas para MySQL
    SQLALCHEMY_ENGINE_OPTIONS = {}
    if _db_url and 'mysql' in _db_url:
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_size': 10,
            'max_overflow': 20,
            'pool_pre_ping': True,
        }
    
    # Chave secreta para assinar os tokens JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback-dev-key')