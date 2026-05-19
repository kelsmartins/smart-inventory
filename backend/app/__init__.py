# Cria e configura a instância do Flask, registra extensões e blueprints
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import Config

# Inicializa as extensões (sem o app ainda – padrão factory)
db = SQLAlchemy()      # ORM – mapeia objetos Python para tabelas do banco
migrate = Migrate()    # Gerencia versões do esquema do banco
jwt = JWTManager()     # Gerenciador de tokens JWT

def create_app():
    """
    Cria e configura a aplicação Flask.
    Esse padrão permite múltiplas instâncias (útil para testes) e mantém o código organizado.
    """
    app = Flask(__name__)
    app.config.from_object(Config)   # Carrega as configurações da classe Config

    # Conecta as extensões ao app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)   # Habilita CORS – permite que o frontend (em outro domínio) chame a API

    # ---------- Rotas públicas básicas ----------
    @app.route('/health')
    def health():
        """Endpoint simples para verificar se a API está online."""
        return jsonify({'status': 'ok', 'message': 'Smart Inventory API'})

    @app.route('/')
    def home():
        """Página inicial informativa para humanos."""
        return '''
        <h1>Smart Inventory API</h1>
        <p>API funcionando. Endpoints disponíveis:</p>
        <ul>
            <li><a href="/health">GET /health</a></li>
            <li>POST /auth/register</li>
            <li>POST /auth/login</li>
            <li>GET /auth/me</li>
            <li>GET /products</li>
            <li>POST /products</li>
            <li>GET /inventory/fefo</li>
            <li>POST /inventory/in</li>
            <li>POST /inventory/out</li>
            <li>POST /sales</li>
            <li>GET /dashboard/risk</li>
            <li>GET /reports/expiring</li>
        </ul>
        '''

    # Cada blueprint agrupa rotas relacionadas (ex: todas as rotas de autenticação)
    from app.routes import auth_bp, products_bp, inventory_bp, sales_bp, dashboard_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(products_bp, url_prefix='/products')
    app.register_blueprint(inventory_bp, url_prefix='/inventory')
    app.register_blueprint(sales_bp, url_prefix='/sales')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

    return app