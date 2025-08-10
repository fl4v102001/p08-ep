# backend/services/reading_service.py

from sqlalchemy.orm import Session
from ..api.schemas import ProcessReadingsPayload
from ..models import TempWaterBill, Unit
import statistics
from datetime import date

def process_and_store_readings_service(db: Session, payload: ProcessReadingsPayload):
    """
    Processa os dados de leitura, calcula estatísticas e os insere na tabela temporária.
    """
    try:
        # Fase 1: Preparação e Cálculos Globais
        production_data = payload.production_data
        unit_readings = payload.unit_readings
        data_ref_date = production_data.data_ref

        # Limpar registros antigos para o mesmo data_ref
        db.query(TempWaterBill).filter(TempWaterBill.data_ref == data_ref_date).delete(synchronize_session=False)
        
        # Calcular estatísticas de consumo
        consumptions = [r.consumo for r in unit_readings if r.consumo is not None and r.consumo >= 0]
        
        total_consumption = sum(consumptions) if consumptions else 0
        average_consumption = statistics.mean(consumptions) if consumptions else 0
        median_consumption = statistics.median(consumptions) if consumptions else 0

        # Formatar data_display (ex: "Ago-2024")
        # Para garantir a localidade correta (Português), pode ser necessário instalar 'Babel'
        # Por simplicidade, usaremos um formato padrão.
        # Ex: locale.setlocale(locale.LC_TIME, 'pt_BR.UTF-8')
        data_display = data_ref_date.strftime("%b-%Y").capitalize()

        # Fase 2: Montar objetos para inserção em lote
        objects_to_add = []
        for reading in unit_readings:
            # Buscar nome do lote
            unit_info = db.query(Unit.nome_lote).filter(Unit.codigo_lote == reading.codigo_lote).first()
            nome_lote = unit_info.nome_lote if unit_info else f"Lote {reading.codigo_lote}"

            temp_bill_entry = TempWaterBill(
                # Dados do JSON
                data_ref=data_ref_date,
                codigo_lote=reading.codigo_lote,
                leitura=reading.leitura_atual,
                consumo_medido_m3=reading.consumo,
                data_leitura=reading.data_leitura_atual,
                mes_producao_agua_m3=production_data.producao_m3,
                mes_compra_agua_rs=production_data.compra_rs,
                mes_outros_gastos_rs=production_data.outros_rs,

                # Valores iniciais para rateio futuro
                consumo_esgoto_m3=reading.consumo,
                consumo_produzido_m3=reading.consumo,
                consumo_comprado_m3=0,
                
                # Dados buscados
                nome_lote=nome_lote,
                
                # Dados calculados
                data_display=data_display,
                mes_consumo_agua_m3=total_consumption,
                mes_consumo_media_m3=average_consumption,
                mes_consumo_mediana_m3=median_consumption,

                # Campos a serem calculados posteriormente ficam como NULL
            )
            objects_to_add.append(temp_bill_entry)

        # Fase 3: Inserção e Commit
        if objects_to_add:
            db.bulk_save_objects(objects_to_add)
        
        db.commit()

        return {"message": f"{len(objects_to_add)} registros de leitura foram preparados com sucesso para o mês {data_display}."}, 201

    except Exception as e:
        db.rollback()
        print(f"Erro no serviço process_and_store_readings_service: {e}")
        return {"error": "Ocorreu um erro interno ao processar os dados de leitura."}, 500