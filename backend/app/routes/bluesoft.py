
import requests
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)

# ele libera o CORS para o sistema inteiro!
CORS(app)

@app.route('/produtos/<codigo_de_barras>', methods=['GET'])
def buscar_produto(codigo_de_barras):

    token = "TU53TWjrY8r9fxxXkWcT3g" 
    
    url = f"https://api.cosmos.bluesoft.com.br/gtins/{codigo_de_barras}.json"
    
    headers = {
        "X-Cosmos-Token": token,
        "Content-Type": "application/json",
        "User-Agent": "SmartInventory/1.0 (kelsoglauber11@gmail.com)"
    }
    
    try:
        # Faz a requisição para a Bluesoft
        resposta = requests.get(url, headers=headers)
        
        # Verifica se o produto não existe (Erro 404)
        if resposta.status_code == 404:
            return jsonify({"erro": "Produto não encontrado na base"}), 404
            
        # Verifica se deu algum outro erro na Bluesoft (ex: estourou o limite de 25 consultas)
        elif resposta.status_code != 200:
            return jsonify({"erro": f"Erro na API externa. Código: {resposta.status_code}"}), resposta.status_code
            
        # Se deu tudo certo, converte o texto da Bluesoft para JSON e devolve pro Next.js
        return jsonify(resposta.json()), 200

    except Exception as e:
        # Captura erros caso o servidor da Bluesoft caia ou a internet falhe
        return jsonify({"erro": f"Falha na comunicação: {str(e)}"}), 500

if __name__ == '__main__':
    # Roda o Flask na porta 8000
    app.run(port=8000, debug=True)