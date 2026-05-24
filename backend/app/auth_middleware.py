from functools import wraps
from flask import request, jsonify
from supabase import create_client, Client
from app.config import Config

# Cria o cliente do Supabase no Python
supabase_client: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

def require_supabase_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'msg': 'Token ausente ou formato inválido.'}), 401
            
        token = auth_header.split(' ')[1]
        
        try:
            # O próprio Supabase valida se o token (ES256, HS256, etc) é válido!
            response = supabase_client.auth.get_user(token)
            
            # Extrai o ID do usuário
            user_id = response.user.id
            
            # Passa o ID do usuário para a rota
            return f(user_id, *args, **kwargs)
            
        except Exception as e:
            return jsonify({'msg': 'Token inválido ou expirado.', 'erro': str(e)}), 401
            
    return decorated