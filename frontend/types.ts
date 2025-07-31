export interface Unit {
  codigo_lote: number;
  nome_lote: string;
  codinome01?: string;
}

// ATUALIZADO: A interface agora contém todos os campos da fatura detalhada.
export interface WaterBill {
  id: string;
  codigo_lote: number;
  data_ref: string;
  data_display: string;
  leitura: number;
  consumo_medido_m3: number;
  consumo_esgoto_m3: number;
  total_esgoto_rs: number;
  consumo_produzido_m3: number;
  consumo_comprado_m3: number;
  cobrado_total_agua_rs: number;
  cobrado_area_comum_rs: number;
  cobrado_outros_gastos_rs: number;
  total_conta_rs: number;
  faixa_esgoto: string;
  tarifa_esgoto: number;
  deduzir_esgoto: number;
  faixa_agua: string;
  tarifa_agua: number;
  deduzir_agua: number;
  cobrado_agua_prod_rs: number;
  preco_m3_comprado_rs: number;
  cobrado_agua_comp_rs: number;

  // NOVOS CAMPOS ADICIONADOS
  data_leitura: string;
  mes_mensagem: string;
  mes_consumo_media_m3: number;
  mes_consumo_mediana_m3: number;
}

export interface MonthlySummary {
  month_year: string;
  total_condo_cost_rs: number;
  total_condo_consumption_m3: number;
  unit_details: {
    codigo_lote: number;
    display_name: string;
    cost_rs: number;
    consumption_m3: number;
  }[];
}
