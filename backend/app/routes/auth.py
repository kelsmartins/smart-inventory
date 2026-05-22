from flask import Blueprint, jsonify, request
from app import db, jwt
from app.models.user import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Cria um novo usuário no sistema.
    Requisito: JSON com 'username' e 'password'.
    """
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"message": "Username and password are required"}), 400
    
    # Verifica se o usuário já existe para evitar duplicidade
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"message": "Username already exists"}), 400
    
    user = User(username=data['username'])
    user.set_password(data['password']) # Criptografa a senha via Bcrypt
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Autentica o usuário e gera um Token JWT de acesso.
    Requisito: JSON com 'username' e 'password'.
    """
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"message": "Username and password are required"}), 400
    
    # Busca o usuário e verifica a senha criptografada
    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"message": "Invalid username or password"}), 401
    
    # Gera o token assinado com a identity sendo o ID do usuário
    access_token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Login successful", "access_token": access_token}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """
    Retorna os dados do usuário autenticado.
    Requisito: Token JWT válido no Header da requisição.
    """
    user_id = get_jwt_identity() # Extrai o ID do token JWT
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    return jsonify({
        "id": user.id,
        "username": user.username
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Informa ao sistema que o usuário deseja sair.
    Nota: No JWT, o logout é primariamente feito no Frontend deletando o token.
    """
    return jsonify({"message": "Successfully logged out"}), 200