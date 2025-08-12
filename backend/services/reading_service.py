# backend/services/reading_service.py

from sqlalchemy.orm import Session
from sqlalchemy import text # Importar 'text' para executar SQL
from ..api.schemas import ProcessReadingsPayload
from ..models import TempWaterBill, Unit
import statistics
from datetime import date

# --- FASE 1: Lógica de preparação e inserção ---
def _step1_prepare_and_store_data(db: Session, payload: ProcessReadingsPayload):
    """
    Prepara os dados brutos e insere na tabela temporária.
    Levanta uma exceção em caso de erro.
    """
    production_data = payload.production_data
    unit_readings = payload.unit_readings
    data_ref_date = production_data.data_ref

    # Limpar registos antigos para a mesma data_ref
    db.query(TempWaterBill).filter(TempWaterBill.data_ref == data_ref_date).delete(synchronize_session=False)
    
    consumptions = [r.consumo for r in unit_readings if r.consumo is not None and r.consumo >= 0]
    total_consumption = sum(consumptions) if consumptions else 0
    average_consumption = statistics.mean(consumptions) if consumptions else 0
    median_consumption = statistics.median(consumptions) if consumptions else 0
    data_display = data_ref_date.strftime("%b-%Y").capitalize()

    objects_to_add = []
    for reading in unit_readings:
        unit_info = db.query(Unit.nome_lote).filter(Unit.codigo_lote == reading.codigo_lote).first()
        nome_lote = unit_info.nome_lote if unit_info else f"Lote {reading.codigo_lote}"

        temp_bill_entry = TempWaterBill(
            data_ref=data_ref_date,
            codigo_lote=reading.codigo_lote,
            leitura=reading.leitura_atual,
            consumo_medido_m3=reading.consumo,
            data_leitura=reading.data_leitura_atual,
            mes_producao_agua_m3=production_data.producao_m3,
            mes_compra_agua_rs=production_data.compra_rs,
            mes_outros_gastos_rs=production_data.outros_rs,
            consumo_esgoto_m3=reading.consumo,
            consumo_produzido_m3=reading.consumo,
            consumo_comprado_m3=0,
            nome_lote=nome_lote,
            data_display=data_display,
            mes_consumo_agua_m3=total_consumption,
            mes_consumo_media_m3=average_consumption,
            mes_consumo_mediana_m3=median_consumption,
        )
        objects_to_add.append(temp_bill_entry)

    if objects_to_add:
        db.bulk_save_objects(objects_to_add)
    
    # O commit é feito pelo orquestrador
    print("Fase 1: Dados preparados e inseridos na tabela temporária com sucesso.")


# --- FASE 2: Execução do cálculo de custos ---
def _step2_run_calculation_rules(db: Session, data_ref: date):
    """
    Executa o statement SQL 'Update_20_calculoRS' no PostgreSQL.
    Levanta uma exceção em caso de erro.
    """
    db.execute(text("CALL procedure_update_20(:data_ref)"), {'data_ref': data_ref})
    print("Fase 2: 'Update_20_calculoRS' executado com sucesso.")


# --- FASE 3: Execução do cálculo de totais ---
def _step3_run_total_rules(db: Session, data_ref: date):
    """
    Executa o statement SQL 'Update_30_totaisRS' no PostgreSQL.
    Levanta uma exceção em caso de erro.
    """
    db.execute(text("CALL procedure_update_30(:data_ref)"), {'data_ref': data_ref})
    print("Fase 3: 'Update_30_totaisRS' executado com sucesso.")

# --- FASE 4: Execução de mensagens ---
def _step4_run_mensagens(db: Session, data_ref: date):
    """
    Executa o statement SQL 'Update_90_Mensagem' no PostgreSQL.
    Levanta uma exceção em caso de erro.
    """
    db.execute(text("CALL procedure_update_90(:data_ref)"), {'data_ref': data_ref})
    print("Fase 3: 'Update_90_Mensagem' executado com sucesso.")


# --- FUNÇÃO ORQUESTRADORA PRINCIPAL ---
def run_billing_pipeline_service(db: Session, payload: ProcessReadingsPayload):
    """
    Orquestra a execução sequencial do pipeline de faturação.
    Gere a transação: ou tudo é bem-sucedido, ou tudo é revertido.
    """
    data_ref_date = payload.production_data.data_ref
    logs = []

    try:
        # Fase 1: Inserir dados na tabela temporária
        _step1_prepare_and_store_data(db, payload)
        logs.append({"status": "OK", "message": "Fase 1: Dados preparados e inseridos na tabela temporária."})

        # Fase 2: Executar o primeiro cálculo
        _step2_run_calculation_rules(db, data_ref_date)
        logs.append({"status": "OK", "message": "Fase 2: Procedimento de cálculo de custos executado."})

        # Fase 3: Executar o segundo cálculo
        _step3_run_total_rules(db, data_ref_date)
        logs.append({"status": "OK", "message": "Fase 3: Procedimento de cálculo de totais executado."})

        # Fase 4: Executar as mensagens
        _step4_run_mensagens(db, data_ref_date)
        logs.append({"status": "OK", "message": "Fase 4: Procedimento de mensagens."})


        # Se todas as etapas foram bem-sucedidas, faz o commit
        db.commit()

        # Após o commit, busca os resultados calculados para retornar ao frontend
        results = db.query(TempWaterBill).filter(TempWaterBill.data_ref == data_ref_date).order_by(TempWaterBill.codigo_lote).all()
        logs.append({"status": "OK", "message": f"{len(results)} registos processados e retornados com sucesso."})
        
        # Converte os resultados para um formato serializável (dicionário)
        processed_data = [{
            "codigo_lote": r.codigo_lote,
            "nome_lote": r.nome_lote,
            "prod_rs": r.cobrado_agua_prod_rs,
            "esgoto_rs": r.total_esgoto_rs,
            "comp_rs": r.cobrado_agua_comp_rs,
            "outros_rs": r.cobrado_outros_gastos_rs,
            "total_rs": r.total_conta_rs,
            "faixa_agua": r.faixa_agua,
            "tarifa_agua": r.tarifa_agua,
            "deduzir_agua": r.deduzir_agua,
            "faixa_esgoto": r.faixa_esgoto,
            "tarifa_esgoto": r.tarifa_esgoto,
            "deduzir_esgoto": r.deduzir_esgoto,
            "mensagem": r.mes_mensagem
        } for r in results]

        return {
            "message": "Pipeline de faturação executado com sucesso.",
            "logs": logs,
            "data": processed_data,
        }, 200

    except Exception as e:
        # Se qualquer etapa falhar, reverte todas as alterações
        db.rollback()
        error_message = f"Ocorreu um erro no pipeline de faturação: {str(e)}"
        print(f"ERRO no pipeline de faturação: {error_message}")
        logs.append({"status": "ERRO", "message": error_message})
        # Retorna uma mensagem de erro específica para o frontend
        return {"error": error_message, "logs": logs}, 500
