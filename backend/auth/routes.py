# backend/auth/routes.py

from flask import Blueprint, request, jsonify, current_app
from ..database import get_db
from ..services import auth_service # Importar o serviço

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register_user():
    db = get_db()
    data = request.get_json()
    try:
        response, status_code = auth_service.register_user_service(db, data)
        return jsonify(response), status_code
    except Exception as e:
        db.rollback()
        # Idealmente, teríamos um logger aqui
        print(f"Erro inesperado em register_user: {e}")
        return jsonify({'error': 'Ocorreu um erro interno.'}), 500


@auth_bp.route('/login', methods=['POST'])
def login_user():
    db = get_db()
    data = request.get_json()
    secret_key = current_app.config['SECRET_KEY']
    
    response, status_code = auth_service.login_user_service(db, data, secret_key)
    return jsonify(response), status_code