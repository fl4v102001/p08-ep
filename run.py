# /run.py

from backend import create_app
from backend.database import test_db_connection

# Cria a instância da aplicação chamando a factory
app = create_app()

if __name__ == '__main__':
    # Testa a conexão com o banco de dados ao iniciar
    test_db_connection()
    
    # O host='0.0.0.0' permite que a aplicação seja acessível de fora do container/máquina
    app.run(host='0.0.0.0', port=5000, debug=True)
    # app.run(host='127.0.0.1', port=5000, debug=True)