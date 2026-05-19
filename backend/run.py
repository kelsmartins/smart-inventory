from app import create_app

# Cria a instância do Flask usando a factory function
app = create_app()

# Se este arquivo for executado diretamente (python run.py), roda o servidor de desenvolvimento
if __name__ == '__main__':
    # host='0.0.0.0' permite acesso externo (útil para testes na rede local)
    # port=5000 é a porta padrão do Flask
    # debug=True recarrega automaticamente quando o código muda
    app.run(host='0.0.0.0', port=5000, debug=True)