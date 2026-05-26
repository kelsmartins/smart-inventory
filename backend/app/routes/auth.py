from flask import Blueprint, jsonify, request
from app import db
from app.models.user import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

# Blueprint para organizar todas as rotas de Autenticação (Login, Cadastro, etc)
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Cria um novo usuário no sistema.
    No fluxo público, o novo usuário é definido como ADMIN por padrão.
    """
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"}), 400
    
    # Verifica se o e-mail já existe para evitar duplicatas
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already exists"}), 400
    
    user = User(
        email=data['email'],
        name=data.get('name', 'Usuário'),
        document=data.get('document'),
        is_admin=data.get('isAdmin', True)
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully", "user": user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Autentica o usuário e gera um Token JWT de acesso.
    O token é enviado ao frontend e deve ser usado em todas as rotas protegidas.
    """
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"message": "Invalid email or password"}), 401
    
    # Gera o token JWT assinado com o ID do usuário (Identity)
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful", 
        "access_token": access_token, 
        "user": user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """
    Recupera os dados do usuário dono do Token atual.
    Usado pelo frontend para manter a sessão ativa após recarregar a página.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # O logout no JWT é feito primariamente no frontend (removendo o token do localStorage)
    return jsonify({"message": "Successfully logged out"}), 200

@auth_bp.route('/collaborator', methods=['POST'])
@jwt_required()
def create_collaborator():
    """
    Cria um colaborador no sistema. 
    Apenas administradores podem acessar esta rota.
    """
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    
    if not admin or not admin.is_admin:
        return jsonify({"message": "Admin privileges required"}), 403
    
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already exists"}), 400
    
    # Colaboradores são sempre is_admin = False
    user = User(
        email=data['email'],
        name=data.get('name', 'Colaborador'),
        document=data.get('document'),
        is_admin=False
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "Collaborator created successfully", "user": user.to_dict()}), 201

@auth_bp.route('/collaborator', methods=['GET'])
@jwt_required()
def list_collaborators():
    """
    Lista todos os usuários que não são administradores.
    Apenas administradores podem acessar esta rota.
    """
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    
    if not admin or not admin.is_admin:
        return jsonify({"message": "Admin privileges required"}), 403
    
    users = User.query.filter_by(is_admin=False).all()
    return jsonify([u.to_dict() for u in users]), 200

