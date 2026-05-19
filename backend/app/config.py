import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env (fora do versionamento)
load_dotenv()

class Config:
    # URL de conexão com o banco de dados (MySQL via XAMPP)
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    
    # Desabilita o rastreamento de modificações (melhora performance, pois não precisa ficar monitorando objetos)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configurações do pool de conexões – evita que a conexão morra por inatividade
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,          # Número máximo de conexões simultâneas
        'max_overflow': 20,       # Conexões extras quando todas estão ocupadas
        'pool_pre_ping': True,    # Testa se a conexão ainda está viva antes de usar
    }
    
    # Chave secreta para assinar os tokens JWT (lê do .env, com fallback)
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback-dev-key')