# backend/api/routes.py

from flask import Blueprint, request, jsonify
from ..database import get_db
from ..auth.decorators import jwt_required
from ..services import unit_service, summary_service # Adiciona summary_service

api_bp = Blueprint('api_bp', __name__)

# ... (rotas get_all_units e get_bills_for_unit permanecem as mesmas) ...
@api_bp.route('/units', methods=['GET'])
@jwt_required
def get_all_units():
    db = get_db()
    user_id = request.user_id
    
    response, status_code = unit_service.get_units_for_user_service(db, user_id)
    return jsonify(response), status_code

@api_bp.route('/units/<int:unit_id>/bills', methods=['GET'])
@jwt_required
def get_bills_for_unit(unit_id):
    db = get_db()
    user_id = request.user_id

    response, status_code = unit_service.get_bills_for_unit_service(db, user_id, unit_id)
    return jsonify(response), status_code


# ROTA REFATORADA
@api_bp.route('/monthly-summary/<string:year_month>/<string:sort_by_param>', methods=['GET'])
@api_bp.route('/monthly-summary/<string:year_month>', methods=['GET'])
@jwt_required
def get_monthly_summary(year_month, sort_by_param=None):
    db = get_db()
    user_profile = request.user_profile
    order_param = request.args.get('order', 'asc')
    
    try:
        response, status_code = summary_service.get_monthly_summary_service(
            db=db,
            year_month=year_month,
            sort_by=sort_by_param,
            order=order_param,
            user_profile=user_profile
        )
        return jsonify(response), status_code
    except Exception as e:
        print(f"Erro inesperado em get_monthly_summary: {e}")
        return jsonify({'error': 'Ocorreu um erro interno ao processar o resumo.'}), 500
    

@api_bp.route('/latest-readings', methods=['GET'])
@jwt_required
def get_latest_readings():
    """
    Endpoint para retornar a lista de unidades com a última leitura registrada.
    """
    db = get_db()
    try:
        response, status_code = unit_service.get_latest_readings_service(db)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Erro inesperado em get_latest_readings: {e}")
        return jsonify({'error': 'Ocorreu um erro interno ao buscar as leituras.'}), 500

@api_bp.route('/process-readings', methods=['POST'])
@jwt_required
def process_readings():
    """
    Endpoint para receber os dados de leitura processados do frontend.
    Por enquanto, apenas recebe, imprime no console e retorna sucesso.
    """
    try:
        # Etapa 2: Recebimento e Validação do Payload
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "Payload JSON não encontrado ou inválido."}), 400

        # Etapa 3: Processamento (Ação Principal) - Salvar payload em arquivo
        # Usamos o módulo json para uma impressão mais legível (pretty-print)
        import json
        with open("t.txt", "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        print("Payload recebido e salvo com sucesso no arquivo t.txt")

        # Etapa 4: Envio da Resposta de Sucesso ao Frontend
        return jsonify({"message": "Dados recebidos e salvos com sucesso!"}), 200

    except Exception as e:
        # Etapa 5: Tratamento de Erros Genéricos
        print(f"Erro inesperado em process_readings: {e}")
        return jsonify({'error': 'Ocorreu um erro interno no servidor ao processar as leituras.'}), 500
