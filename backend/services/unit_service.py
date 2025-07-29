# backend/services/unit_service.py

from sqlalchemy.orm import Session
from ..models import Unit, WaterBill, UserLote

def get_units_for_user_service(db: Session, user_id: int):
    """
    Busca todas as unidades associadas a um determinado usuário.
    """
    units = (
        db.query(Unit)
        .join(UserLote, Unit.codigo_lote == UserLote.codigo_lote)
        .filter(UserLote.user_id == user_id)
        .order_by(Unit.codigo_lote)
        .all()
    )
    return [u.to_dict() for u in units], 200

def get_bills_for_unit_service(db: Session, user_id: int, unit_id: int):
    """
    Busca as contas de uma unidade, verificando se o usuário tem permissão.
    """
    user_has_access = db.query(UserLote).filter(
        UserLote.user_id == user_id,
        UserLote.codigo_lote == unit_id
    ).first()

    if not user_has_access:
        return {'error': 'Acesso negado a esta unidade.'}, 403

    bills = (
        db.query(WaterBill)
        .filter(WaterBill.codigo_lote == unit_id)
        .order_by(WaterBill.data_ref.desc(), WaterBill.codigo_lote)
        .all()
    )
    
    return [b.to_dict() for b in bills], 200