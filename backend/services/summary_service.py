# backend/services/summary_service.py

from sqlalchemy.orm import Session
from sqlalchemy import func
from dateutil.parser import parse
from ..models import Unit, WaterBill, Production

def get_monthly_summary_service(db: Session, year_month: str, sort_by: str, order: str, user_profile: str):
    """
    Lógica de negócio para buscar e formatar o resumo mensal do condomínio.
    """
    try:
        date_obj = parse(year_month + '-01')
    except ValueError:
        try:
            date_obj = parse(year_month)
        except ValueError:
            return {'error': 'Formato de data inválido. Use YYYY-MM ou YYYY-MM-DD.'}, 400

    start_of_month = date_obj.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # 1. Busca os dados de produção e custos gerais do condomínio
    condo_production_summary = db.query(Production).filter(
        func.date_trunc('month', Production.data_ref) == func.date_trunc('month', start_of_month)
    ).first()

    total_condo_cost_rs = 0.0
    total_condo_consumption_m3 = 0

    if condo_production_summary:
        total_condo_cost_rs = (
            (float(condo_production_summary.mes_cobrado_agua_prod_rs) if condo_production_summary.mes_cobrado_agua_prod_rs is not None else 0) +
            (float(condo_production_summary.mes_cobrado_agua_comprada_rs) if condo_production_summary.mes_cobrado_agua_comprada_rs is not None else 0) +
            (float(condo_production_summary.mes_cobrado_esgoto_rs) if condo_production_summary.mes_cobrado_esgoto_rs is not None else 0) +
            (float(condo_production_summary.mes_area_comum_rs) if condo_production_summary.mes_area_comum_rs is not None else 0) +
            (float(condo_production_summary.mes_outros_gastos_rs) if condo_production_summary.mes_outros_gastos_rs is not None else 0)
        )
        total_condo_consumption_m3 = (
            (condo_production_summary.mes_producao_agua_m3 if condo_production_summary.mes_producao_agua_m3 is not None else 0) +
            (condo_production_summary.mes_compra_agua_m3 if condo_production_summary.mes_compra_agua_m3 is not None else 0)
        )

    # 2. Busca os dados de todas as unidades para aquele mês
    unit_bills = db.query(WaterBill, Unit.nome_lote, Unit.codinome01).join(Unit, WaterBill.codigo_lote == Unit.codigo_lote).filter(
        func.date_trunc('month', WaterBill.data_ref) == func.date_trunc('month', start_of_month)
    ).all()
    
    unit_details = []
    for bill, nome_lote, codinome01 in unit_bills:
        display_name = nome_lote if user_profile == 'admin' else codinome01
        unit_details.append({
            "codigo_lote": bill.codigo_lote,
            "display_name": display_name,
            "cost_rs": float(bill.total_conta_rs) if bill.total_conta_rs is not None else 0.0,
            "consumption_m3": bill.consumo_medido_m3 if bill.consumo_medido_m3 is not None else 0
        })
    
    # 3. Ordena os resultados
    reverse_order = (order == 'desc')
    if sort_by == 'a':
        if user_profile == 'admin':
            key_func = lambda x: x['codigo_lote']
        else:
            key_func = lambda x: x['display_name']
    elif sort_by == 'b':
        key_func = lambda x: x['cost_rs']
    elif sort_by == 'c':
        key_func = lambda x: x['consumption_m3']
    else:
        # Padrão é ordenar por código do lote
        key_func = lambda x: x['codigo_lote']
        reverse_order = (order == 'desc') # Só aplica desc se for explícito para o padrão

    unit_details.sort(key=key_func, reverse=reverse_order)

    # 4. Formata a resposta final
    month_name = date_obj.strftime("%B-%Y").replace("January", "Janeiro").replace("February", "Fevereiro").replace("March", "Março").replace("April", "Abril").replace("May", "Maio").replace("June", "Junho").replace("July", "Julho").replace("August", "Agosto").replace("September", "Setembro").replace("October", "Outubro").replace("November", "Novembro").replace("December", "Dezembro")
    
    response_data = {
        "month_year": month_name,
        "total_condo_cost_rs": total_condo_cost_rs,
        "total_condo_consumption_m3": total_condo_consumption_m3,
        "unit_details": unit_details
    }

    return response_data, 200