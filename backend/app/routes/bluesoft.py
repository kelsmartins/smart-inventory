from app.routes.products import products_bp
import requests
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

app = Flask(__name__)

# ele libera o CORS para o sistema inteiro!
CORS(app)

@products_bp.route('/products/barcode/<barcode>', methods=['GET'])
def buscar_produto(barcode):

    token = os.getenv("BLUESOFT_TOKEN") 
    user_agent  = os.getenv("USER_AGENT")
    
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
            return jsonify({"erro": "Produto não encontrado na base"}), 404
            
        # Verifica se deu algum outro erro na Bluesoft (ex: estourou o limite de 25 consultas)
        elif resp.status_code != 200:
            return jsonify({"erro": f"Erro na API externa. Código: {resp.status_code}"}), resp.status_code
            
        # Se deu tudo certo, converte o texto da Bluesoft para JSON e devolve pro Next.js
        return jsonify(resp.json()), 200

    except Exception as e:
        # Captura erros caso o servidor da Bluesoft caia ou a internet falhe
        return jsonify({"erro": f"Falha na comunicação: {str(e)}"}), 500

if __name__ == '__main__':
    # Roda o Flask na porta 8000
    app.run(port=8000, debug=True)