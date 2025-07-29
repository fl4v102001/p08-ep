# backend/database.py

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from flask import g # Importar o 'g' do Flask

load_dotenv()

# ... (código de conexão com o banco de dados) ...
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT")
DB_NAME = os.environ.get("DB_NAME")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Função de dependência para obter a sessão do banco
def get_db() -> Session:
    """
    Cria uma sessão de banco de dados por requisição, a armazena no
    contexto 'g' do Flask e a reutiliza se já existir para a mesma requisição.
    """
    if 'db' not in g:
        g.db = SessionLocal()
    return g.db