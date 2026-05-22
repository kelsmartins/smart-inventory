from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import Config

# Inicializa extensões (sem o app ainda)
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Vincula extensões
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    # Importa modelos para o SQLAlchemy reconhecer as tabelas
    from app.models.product import Product
    from app.models.user import User
    from app.models.sale import Sale
    from app.models.movement import Movement
    from app.models.batch import Batch

    # ---------- ROTAS PÚBLICAS ----------
    @app.route('/health')
    def health():
        """Endpoint de verificação de saúde da API."""
        return jsonify({'status': 'ok', 'message': 'Smart Inventory API'})

    @app.route('/')
    def home():
        """Página inicial com links clicáveis para /users e /products."""
        return '''
        <h1>Smart Inventory API</h1>
        <p><a href="/users">📋 /users</a> - Lista de usuários (JSON)</p>
        <p><a href="/products">📦 /products</a> - Lista de produtos (JSON)</p>
        <p><a href="/health">❤️ /health</a> - Status da API</p>
        '''

    # ---------- ROTAS AUXILIARES PARA VISUALIZAÇÃO RÁPIDA ----------
    @app.route('/users')
    def list_users():
        """Retorna todos os usuários em formato JSON (público para testes)."""
        users = User.query.all()
        # Se o modelo User não tiver o método to_dict, usa um dicionário manual
        result = []
        for u in users:
            if hasattr(u, 'to_dict'):
                result.append(u.to_dict())
            else:
                # Fallback seguro (ajuste os campos conforme seu modelo)
                result.append({
                    'id': u.id,
                    'username': getattr(u, 'username', None),
                    'email': getattr(u, 'email', None),
                    'role': getattr(u, 'role', 'operator')
                })
        return jsonify(result)

    @app.route('/products')
    def list_products():
        """Retorna todos os produtos em formato JSON (público para testes)."""
        products = Product.query.all()
        result = []
        for p in products:
            if hasattr(p, 'to_dict'):
                result.append(p.to_dict())
            else:
                # Fallback para o modelo Product atual
                result.append({
                    'id': p.id,
                    'name': p.name,
                    'price': p.price,
                    'quantity': p.quantity,
                    'expiry_date': p.expiry_date.isoformat() if p.expiry_date else None
                })
        return jsonify(result)

    # ---------- REGISTRO DOS BLUEPRINTS (MÓDULOS DE ROTAS) ----------
    from app.routes.auth import auth_bp
    from app.routes.products import products_bp
    from app.routes.inventory import inventory_bp
    from app.routes.sales import sales_bp
    from app.routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(products_bp, url_prefix='/products')
    app.register_blueprint(inventory_bp, url_prefix='/inventory')
    app.register_blueprint(sales_bp, url_prefix='/sales')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

    return app