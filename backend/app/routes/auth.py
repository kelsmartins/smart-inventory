from flask import Blueprint, jsonify, request
from app import db
from app.models.user import User

# Importações do JWT (com suporte a Cookies)
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity, 
    set_access_cookies, 
    unset_jwt_cookies
)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"}), 400
    
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
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"message": "Invalid email or password"}), 401
    
    # Gera o token
    access_token = create_access_token(identity=str(user.id))
    
    response = jsonify({
        "message": "Login successful", 
        "user": user.to_dict()
    })
    
    # Injeta o token diretamente no Cookie do navegador
    set_access_cookies(response, access_token)
    
    return response, 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"message": "Successfully logged out"})
    # Remove o cookie do navegador
    unset_jwt_cookies(response)
    return response, 200

@auth_bp.route('/collaborator', methods=['POST'])
@jwt_required()
def create_collaborator():
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    
    if not admin or not admin.is_admin:
        return jsonify({"message": "Admin privileges required"}), 403
    
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already exists"}), 400
    
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
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    
    if not admin or not admin.is_admin:
        return jsonify({"message": "Admin privileges required"}), 403
    
    users = User.query.filter_by(is_admin=False).all()
    return jsonify([u.to_dict() for u in users]), 200