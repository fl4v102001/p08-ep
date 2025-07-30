# backend/services/unit_service.py

from sqlalchemy.orm import Session
from sqlalchemy import select, func

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


def get_latest_readings_service(db: Session):
    """
    Busca a leitura mais recente de cada unidade (lote).
    """
    # Subquery para encontrar a data_ref mais recente para cada codigo_lote
    subquery = (
        select(
            WaterBill.codigo_lote,
            func.max(WaterBill.data_ref).label("max_data_ref")
        )
        .group_by(WaterBill.codigo_lote)
        .subquery('latest_bill_dates')
    )

    # Query principal que junta Unit com WaterBill usando a subquery para filtrar
    # apenas as contas que correspondem à data mais recente de cada lote.
    latest_readings_query = (
        select(
            Unit.codigo_lote,
            Unit.nome_lote,
            WaterBill.leitura
        )
        .join(subquery, Unit.codigo_lote == subquery.c.codigo_lote)
        .join(WaterBill, (Unit.codigo_lote == WaterBill.codigo_lote) & (WaterBill.data_ref == subquery.c.max_data_ref))
        .order_by(Unit.codigo_lote)
    )
    
    results = db.execute(latest_readings_query).all()
    
    # Formata os resultados para o frontend
    latest_readings = [
        {
            "codigo_lote": row.codigo_lote,
            "nome_lote": row.nome_lote,
            "leitura_anterior": row.leitura
        } for row in results
    ]
    
    return latest_readings, 200
