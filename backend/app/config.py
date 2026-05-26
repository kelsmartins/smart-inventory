# backend/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///instance/validation.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # === CONFIGURAÇÕES DO JWT E COOKIES ===
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'chave-super-secreta-fallback')
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_COOKIE_SECURE = True # Se for testar no localhost apenas, mude para False. Em produção (Vercel/HTTPS) deve ser True.
    JWT_COOKIE_CSRF_PROTECT = False # Simplifica a comunicação do cookie entre domínios diferentes
    JWT_COOKIE_SAMESITE = "None" # Obrigatório para frontend no Vercel e backend em outro lugar
    
    # Supabase (Apenas Banco de Dados agora)
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')