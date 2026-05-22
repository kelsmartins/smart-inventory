
from app import create_app

# Aqui ele vai lá no app/__init__.py, liga o banco, liga o CORS e registra as rotas (Blueprints)
app = create_app()

if __name__ == '__main__':
    # Roda a API completa liberada para o React na porta 5000
    app.run(host='0.0.0.0', port=5000, debug=True)