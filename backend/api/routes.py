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