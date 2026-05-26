from flask import Blueprint, jsonify, request
from app import db
from app.models.user import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Cria um novo usuário no sistema.
    Requisito: JSON com 'email' e 'password'.
    """
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"}), 400
    
    # Verifica se o e-mail já existe
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already exists"}), 400
    
    user = User(
        email=data['email'],
        name=data.get('name', 'Usuário'),
        document=data.get('document'),
        is_admin=data.get('isAdmin', False)
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully", "user": user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Autentica o usuário e gera um Token JWT de acesso.
    Requisito: JSON com 'email' e 'password'.
    """
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"message": "Invalid email or password"}), 401
    
    # Gera o token assinado com o ID do usuário
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
    Retorna os dados do usuário autenticado.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "Successfully logged out"}), 200
