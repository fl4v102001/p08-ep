# backend/services/report_service.py

from sqlalchemy.orm import Session
from sqlalchemy import text
from ..models import UserLote, Unit
from ..reports.report_generator import generate_consumption_chart, create_unit_report_pdf

def generate_report_for_unit_service(db: Session, user_id: int, codigo_lote: int):
    """
    Lógica de negócio para gerar um relatório em PDF para uma unidade.
    Verifica permissão, busca dados, e chama os geradores de gráfico e PDF.
    """
    # 1. Verifica se o usuário tem acesso à unidade
    user_has_access = db.query(UserLote).filter(
        UserLote.user_id == user_id,
        UserLote.codigo_lote == codigo_lote
    ).first()

    if not user_has_access:
        return {'error': 'Acesso negado a esta unidade para geração de relatório.'}, 403

    # 2. Busca os dados da view
    query_result = db.execute(
        text("SELECT * FROM vw_relatorio_24m WHERE codigo_lote = :codigo_lote"),
        {"codigo_lote": codigo_lote}
    ).fetchone()

    if not query_result:
        return {'error': f'Dados de relatório não encontrados para a unidade {codigo_lote}.'}, 404
    
    unit_report_data = dict(query_result._mapping)

    unit_obj = db.query(Unit).filter(Unit.codigo_lote == codigo_lote).first()
    unit_name = unit_obj.nome_lote if unit_obj else f"Unidade {codigo_lote}"

    # 3. Processa os dados para o gráfico
    consumption_data, median_data, months_labels = [], [], []
    for i in range(1, 25):
        if unit_report_data.get(f'mes{i:02d}_data_display'):
            consumption_data.append(unit_report_data.get(f'mes{i:02d}_consumo', 0))
            median_data.append(unit_report_data.get(f'mes{i:02d}_mediana', 0))
            months_labels.append(unit_report_data.get(f'mes{i:02d}_data_display'))
    
    # Inverte para ter do mais antigo para o mais recente
    consumption_data.reverse()
    median_data.reverse()
    months_labels.reverse()

    # 4. Gera o gráfico e o PDF
    chart_buffer = generate_consumption_chart(consumption_data, median_data, months_labels, unit_name)
    pdf_buffer = create_unit_report_pdf(unit_report_data, chart_buffer)

    return pdf_buffer, 200 # Retorna o buffer do PDF em caso de sucesso

def get_24m_report_data(db: Session):
    """
    Busca todos os dados da tabela report_24m.
    """
    try:
        query_result = db.execute(text("SELECT * FROM public.report_24m")).fetchall()
        
        if not query_result:
            return [], 200

        # Converte o resultado para uma lista de dicionários
        report_data = [dict(row._mapping) for row in query_result]
        
        return report_data, 200

    except Exception as e:
        print(f"Erro ao buscar dados do relatório 24m: {e}")
        return {'error': 'Ocorreu um erro interno ao buscar os dados do relatório.'}, 500
