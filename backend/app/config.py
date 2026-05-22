import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env para o sistema
load_dotenv()

class Config:
    """
    Classe de Configuração: Define as constantes que o Flask utilizará.
    Usa osgetenv() para buscar valores do ambiente, permitindo mudar a 
    configuração entre Desenvolvimento e Produção sem alterar o código.
    """
    
    # URL de conexão com o banco de dados. 
    # Prioriza a variável de ambiente DATABASE_URL (ex: MySQL no Render/Clever Cloud).
    # Se não existir, utiliza um banco SQLite local para facilitar o desenvolvimento.
    _db_url = os.getenv('DATABASE_URL')
    SQLALCHEMY_DATABASE_URI = _db_url if _db_url else 'sqlite:///instance/validation.db'
    
    # Desabilita o rastreamento de modificações do SQLAlchemy para economizar memória
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configurações de Pool de Conexões (Apenas aplicáveis para bancos como MySQL/Postgres)
    # O pool mantém conexões abertas para evitar o custo de abrir uma nova a cada requisição.
    SQLALCHEMY_ENGINE_OPTIONS = {}
    if _db_url and 'mysql' in _db_url:
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_size': 10,          # Máximo de conexões simultâneas mantidas
            'max_overflow': 20,       # Conexões extras permitidas em picos de acesso
            'pool_pre_ping': True,    # Testa a conexão antes de usá-la (evita 'Connection Lost')
        }
    
    # Chave secreta utilizada pelo Flask-JWT-Extended para assinar os tokens de acesso.
    # Em produção, deve ser uma string longa e aleatória definida no .env.
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback-dev-key')