import os
import requests
from flask import Blueprint, jsonify, request
from app import db
from datetime import datetime

from app.models.product import Product
from app.models.batch import Batch

products_bp = Blueprint('products', __name__)

# ====================//  GET PRODUCTS  //========================
@products_bp.route('', methods=['GET'])
def get_products():
    
    products = Product.query.all()

    result = [p.to_dict() for p in products]
    return jsonify(result), 200



# ====================//  POST PRODUCT  //========================
@products_bp.route('', methods=['POST'])
def create_product():
    """
    Cria um novo produto e automaticamente gera o primeiro lote associado.
    Requisito: JSON com 'name' e 'expiry_date' (ou 'expiryDate').
    """
    data = request.get_json()
    
    # Aceita tanto camelCase (React) quanto snake_case
    received_expiry = data.get('expiryDate') or data.get('expiry_date')
    
    if not data or 'name' not in data or not received_expiry:
        return jsonify({"message": "Name and expiryDate are required"}), 400
    
    try:
        # Pega apenas a parte da data caso o frontend envie um timestamp completo
        date_str = received_expiry.split('T')[0]
        expiry_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    # 1. Cria a entidade Produto
    product = Product(
        name=data.get('name'),
        barcode=data.get('barcode'),
        category=data.get('category'),
        expiry_date=expiry_date,
        price=data.get('price', 0.0),
        quantity=data.get('quantity', 1.0),
        batch_code=data.get('batch_code')
    )
    
    db.session.add(product)
    db.session.flush() # Garante a criação do ID do produto para usar no lote
    
    # 2. Cria automaticamente o Lote inicial (Essencial para FEFO)
    batch = Batch(
        code=data.get('batch_code') or f"BATCH-{product.id}",
        manufacturing_date=datetime.utcnow().date(),
        expiry_date=expiry_date,
        quantity=product.quantity,
        initial_quantity=product.quantity,
        product_id=product.id
    )
    db.session.add(batch)
    
    db.session.commit()
    
    # 3. Retorna os dados completos que o frontend React espera
    return jsonify({
        "id": product.id,
        "name": product.name,
        "barcode": product.barcode,
        "category": product.category,
        "price": product.price,
        "expiryDate": product.expiry_date.isoformat(),
        "quantity": product.quantity,
        "batch": product.batch_code or batch.code
    }), 201


# ====================//  BUSCAR CÓDIGO DE BARRAS (BLUESOFT)  //========================
@products_bp.route('/barcode/<barcode>', methods=['GET'])
def buscar_produto(barcode):
    """cxc
    Consulta a API da Bluesoft para preenchimento automático via código de barras.
    """
    token = os.getenv("BLUESOFT_TOKEN") 
    user_agent = os.getenv("USER_AGENT")
    
    url = f"https://api.cosmos.bluesoft.com.br/gtins/{barcode}.json"
    
    headers = {
        "X-Cosmos-Token": token,
        "Content-Type": "application/json",
        "User-Agent": user_agent
    }
    
    try:
        # Faz a requisição para a Bluesoft
        resp = requests.get(url, headers=headers)
        
        # Verifica se o produto não existe (Erro 404)
        if resp.status_code == 404:
            return jsonify({"message": "Produto não encontrado na base da Bluesoft"}), 404
            
        # Verifica se deu algum outro erro na Bluesoft (ex: estourou o limite de consultas)
        elif resp.status_code != 200:
            return jsonify({"message": f"Erro na API externa. Código: {resp.status_code}"}), resp.status_code
            
        # Se deu tudo certo, devolve pro React
        return jsonify(resp.json()), 200

    except Exception as e:
        # Captura erros caso o servidor da Bluesoft caia ou a internet falhe
        return jsonify({"message": f"Falha na comunicação: {str(e)}"}), 500