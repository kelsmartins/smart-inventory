from flask import Blueprint, jsonify, request

# Cria o Blueprint. O nome 'auth' é interno, e a variável auth_bp é a que importamos lá no __init__.py
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    # Aqui viria a lógica para criar um usuário no banco
    dados = request.get_json()
    return jsonify({"message": "Rota de registro funcionando!", "dados": dados}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    # Lógica para autenticar o usuário
    return jsonify({"message": "Usuário autenticado com sucesso"}), 200

@auth_bp.route('/me', methods=['GET'])
def get_me():
    # Aqui retornaria os dados do usuário logado
    return jsonify({"message": "Rota de perfil funcionando!"}), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Lógica para desconectar o usuário
    return jsonify({"message": "Usuário desconectado com sucesso"}), 200