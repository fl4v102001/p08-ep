export interface Unit {
  codigo_lote: number;
  nome_lote: string;
  codinome01?: string; // Adicionado para o backend poder retornar
}

export interface WaterBill {
  id: string;
  codigo_lote: number;
  data_ref: string;
  data_display: string;
  consumo_esgoto_m3: number;
  total_esgoto_RS: number;
  consumo_produzido_m3: number;
  consumo_comprado_m3: number;
  cobrado_total_agua_rs: number;
  cobrado_area_comum_rs: number;
  cobrado_outros_gastos_rs: number;
  total_conta_RS: number;
}

export interface MonthlySummary {
  month_year: string;
  total_condo_cost_rs: number;
  total_condo_consumption_m3: number;
  unit_details: {
    codigo_lote: number;
    display_name: string; // ALTERADO: Agora será o nome a ser exibido (nome_lote ou codinome01)
    cost_rs: number;
    consumption_m3: number;
  }[];
}
