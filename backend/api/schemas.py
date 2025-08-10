# backend/api/schemas.py

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

class ProductionDataPayload(BaseModel):
    """Schema para os dados de produção do mês."""
    data_ref: date
    producao_m3: Optional[float] = Field(None, alias='producao_m3')
    outros_rs: Optional[float] = Field(None, alias='outros_rs')
    compra_rs: Optional[float] = Field(None, alias='compra_rs')

class UnitReadingPayload(BaseModel):
    """Schema para a leitura de uma única unidade."""
    codigo_lote: int
    data_leitura_atual: Optional[datetime]
    leitura_atual: Optional[float]
    consumo: Optional[float]

class ProcessReadingsPayload(BaseModel):
    """Schema para o payload completo da rota /process-readings."""
    production_data: ProductionDataPayload
    unit_readings: List[UnitReadingPayload]

    class Config:
        # Permite o uso de 'alias' para mapear nomes de campos do JSON
        allow_population_by_field_name = True