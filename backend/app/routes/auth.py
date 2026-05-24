import os
from flask import Blueprint, jsonify, request
from app import db
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

# Necessário para a rota de criar colaborador
from supabase import create_client, Client

auth_bp = Blueprint('auth', __name__)

# ====================//  GET ME (Perfil do Usuário)  //========================
@auth_bp.route('/me', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_me():
    """
    Retorna os dados públicos do banco (nome, documento, role) do usuário logado.
    O React manda o Token do Supabase, o Flask lê o ID que está dentro dele.
    """
    # No JWT do Supabase, o ID (UUID) fica armazenado automaticamente na identidade
    user_id = get_jwt_identity() 
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "Usuário não encontrado no banco"}), 404
    
    return jsonify(user.to_dict()), 200


# ====================//  CRIAR COLABORADOR (Apenas Admin)  //========================
@auth_bp.route('/collaborator', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_collaborator():
    """
    Rota protegida onde o Admin cria um novo funcionário para o sistema.
    """
    # 1. Verifica se quem está tentando criar é realmente um Admin
    admin_id = get_jwt_identity()
    admin_user = User.query.get(admin_id)
    
    if not admin_user or admin_user.role != 'admin':
        return jsonify({"message": "Acesso negado. Apenas administradores podem criar contas."}), 403

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    document = data.get('document')

    if not email or not password:
        return jsonify({"message": "Email e senha são obrigatórios"}), 400

    try:
        # 2. Inicializa o Supabase com poderes de Super Usuário (Service Role)
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        supabase_admin = create_client(url, key)

        # 3. Cria o usuário no Supabase sem deslogar o Admin
        new_user = supabase_admin.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True, 
            "user_metadata": {
                "name": name,
                "document": document,
                "role": "collaborator" # <-- A mágica pro Banco de Dados saber o cargo!
            }
        })
        
        return jsonify({"message": "Colaborador criado com sucesso!"}), 201

    except Exception as e:
        return jsonify({"message": f"Falha na criação: {str(e)}"}), 400