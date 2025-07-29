# backend/services/auth_service.py

import datetime
import jwt
from sqlalchemy.orm import Session
from werkzeug.security import generate_password_hash, check_password_hash
from ..models import User

def register_user_service(db: Session, data: dict):
    """
    Lógica de negócio para registrar um novo usuário.
    """
    nome_usuario = data.get('nome_usuario')
    email_usuario = data.get('email_usuario')
    senha_usuario = data.get('senha_usuario')

    if not all([nome_usuario, email_usuario, senha_usuario]):
        return {'error': 'Todos os campos são obrigatórios!'}, 400

    if db.query(User).filter_by(email_usuario=email_usuario).first():
        return {'error': 'Email já cadastrado!'}, 409

    hashed_password = generate_password_hash(senha_usuario, method='pbkdf2:sha256')
    new_user = User(
        nome_usuario=nome_usuario,
        email_usuario=email_usuario,
        senha_usuario=hashed_password,
        perfil_usuario=data.get('perfil_usuario', 'user')
    )
    db.add(new_user)
    db.commit()
    
    return {'message': 'Usuário registrado com sucesso!'}, 201

def login_user_service(db: Session, data: dict, secret_key: str):
    """
    Lógica de negócio para realizar o login de um usuário.
    """
    email_usuario = data.get('email_usuario')
    senha_usuario = data.get('senha_usuario')

    if not all([email_usuario, senha_usuario]):
        return {'error': 'Email e senha são obrigatórios!'}, 400

    user = db.query(User).filter_by(email_usuario=email_usuario).first()

    if not user or not check_password_hash(user.senha_usuario, senha_usuario):
        return {'error': 'Credenciais inválidas!'}, 401

    token = jwt.encode({
        'user_id': user.id,
        'email': user.email_usuario,
        'profile': user.perfil_usuario,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, secret_key, algorithm="HS256")

    return {
        'message': 'Login bem-sucedido!',
        'token': token,
        'user': user.to_dict()
    }, 200