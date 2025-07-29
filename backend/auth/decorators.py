# backend/auth/decorators.py

import jwt
from functools import wraps
from flask import request, jsonify, current_app

def jwt_required(f):
    """
    Decorador para proteger rotas que exigem um token JWT válido.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # O token é esperado no header 'Authorization' no formato 'Bearer <token>'
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token de autenticação está faltando!'}), 401

        try:
            # Decodifica o token usando a chave secreta da configuração da aplicação
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            # Anexa os dados do usuário ao objeto 'request' para que a rota possa acessá-los
            request.user_id = data['user_id']
            request.user_profile = data.get('profile', 'user')
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token de autenticação expirado!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token de autenticação inválido!'}), 401
        except Exception as e:
            return jsonify({'message': f'Erro ao processar token: {str(e)}'}), 500

        # Se o token for válido, executa a rota original
        return f(*args, **kwargs)
    return decorated