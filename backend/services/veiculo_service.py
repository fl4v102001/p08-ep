
from sqlalchemy.orm import Session
from backend.models import Veiculo
from backend.api import schemas

def create_veiculo(db: Session, veiculo: schemas.VeiculoCreate):
    db_veiculo = Veiculo(**veiculo.dict())
    db.add(db_veiculo)
    db.commit()
    db.refresh(db_veiculo)
    return db_veiculo

def get_veiculo(db: Session, veiculo_id: int):
    return db.query(Veiculo).filter(Veiculo.id == veiculo_id).first()

def get_veiculos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Veiculo).offset(skip).limit(limit).all()

def get_veiculos_by_lote(db: Session, codigo_lote: int):
    return db.query(Veiculo).filter(Veiculo.codigo_lote == codigo_lote).all()

def update_veiculo(db: Session, veiculo_id: int, veiculo: schemas.VeiculoUpdate):
    db_veiculo = get_veiculo(db, veiculo_id)
    if db_veiculo:
        update_data = veiculo.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_veiculo, key, value)
        db.commit()
        db.refresh(db_veiculo)
    return db_veiculo

def delete_veiculo(db: Session, veiculo_id: int):
    db_veiculo = get_veiculo(db, veiculo_id)
    if db_veiculo:
        db.delete(db_veiculo)
        db.commit()
    return db_veiculo
