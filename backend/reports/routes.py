# backend/reports/routes.py

from flask import Blueprint, request, jsonify, send_file
from ..database import get_db
from ..auth.decorators import jwt_required
from ..services import report_service # Importa o serviço de relatório

reports_bp = Blueprint('reports_bp', __name__)

# ROTA REFATORADA
@reports_bp.route('/report/unit/<int:codigo_lote>/<string:data_ref_mes>', methods=['GET'])
@jwt_required
def get_unit_report_pdf(codigo_lote, data_ref_mes):
    db = get_db()
    user_id = request.user_id
    
    try:
        # O serviço agora retorna o buffer do PDF ou um dicionário de erro
        result, status_code = report_service.generate_report_for_unit_service(
            db=db,
            user_id=user_id,
            codigo_lote=codigo_lote
        )

        if status_code != 200:
            # Se não for sucesso, 'result' é um dicionário de erro
            return jsonify(result), status_code
        
        # Se for sucesso, 'result' é o buffer do PDF
        pdf_buffer = result
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'relatorio_unidade_{codigo_lote}_{data_ref_mes}.pdf'
        )

    except Exception as e:
        print(f"Erro inesperado em get_unit_report_pdf: {e}")
        return jsonify({'error': 'Ocorreu um erro interno ao gerar o relatório.'}), 500