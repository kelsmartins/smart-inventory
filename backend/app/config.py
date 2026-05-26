import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

class Config:
    """
    Configurações globais da aplicação.
    Lê variáveis de ambiente para garantir segurança e flexibilidade (Local vs Produção).
    """
    # URL de conexão com o Banco de Dados (PostgreSQL no Supabase ou SQLite local)
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///instance/validation.db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configurações de Integração com Supabase
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    # Chave secreta para assinar os Tokens JWT (Sessão do Usuário)
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'smart_invetory')