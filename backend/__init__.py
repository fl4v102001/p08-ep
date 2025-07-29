# backend/__init__.py

import os
from flask import Flask, g
from flask_cors import CORS


def create_app():
    """
    Cria e configura uma instância da aplicação Flask (Application Factory).
    """
    app = Flask(__name__)
    CORS(app)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'sua_chave_secreta_muito_segura_para_desenvolvimento')


    # Adiciona um hook para fechar a sessão do banco de dados
    # ao final de cada requisição.
    @app.teardown_appcontext
    def close_db(exception=None):
        db = g.pop('db', None)
        if db is not None:
            db.close()

    # Importa e registra os Blueprints
    from .auth import routes as auth_routes
    from .api import routes as api_routes
    from .reports import routes as reports_routes
    
    app.register_blueprint(auth_routes.auth_bp, url_prefix='/api')
    app.register_blueprint(api_routes.api_bp, url_prefix='/api')
    app.register_blueprint(reports_routes.reports_bp, url_prefix='/api')

    return app