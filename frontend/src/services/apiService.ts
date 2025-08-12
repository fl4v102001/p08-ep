import { Unit, WaterBill, MonthlySummary } from '../../types';

// URL base do seu backend Python
const API_BASE_URL = 'http://127.0.0.1:5000';

// --- Funções de Autenticação e Fetch Auxiliar (sem alterações) ---
let currentAuthToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  currentAuthToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

async function authenticatedFetch(url: string, options?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };
  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: `Erro na requisição: ${response.statusText}` }));
    
    // CORREÇÃO: Criamos um erro padrão e anexamos os logs como uma propriedade personalizada.
    // Isto resolve o erro de compatibilidade e ainda permite que o código que captura o erro
    // aceda tanto à mensagem principal (err.message) como aos logs (err.logs).
    const error: any = new Error(errorBody.error || `Erro desconhecido`);
    error.logs = errorBody.logs; // Anexa os logs para serem usados no painel.
    throw error;
  }
  return response;
}

export async function registerUser(nome_usuario: string, email_usuario: string, senha_usuario: string, perfil_usuario: string = 'user'): Promise<{ message: string }> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    body: JSON.stringify({ nome_usuario, email_usuario, senha_usuario, perfil_usuario }),
  });
  return response.json();
}

export async function loginUser(email_usuario: string, senha_usuario: string): Promise<{ message: string; token: string; user: any }> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    body: JSON.stringify({ email_usuario, senha_usuario }),
  });
  const data = await response.json();
  setAuthToken(data.token);
  return data;
}

// --- Funções de API (sem alterações) ---
export async function fetchUnits(): Promise<Unit[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/units`);
  return response.json();
}

export async function fetchBillsForUnit(unitId: number): Promise<WaterBill[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/units/${unitId}/bills`);
  return response.json();
}

export async function getMonthlySummary(yearMonth: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<MonthlySummary> {
  let url = `${API_BASE_URL}/api/monthly-summary/${yearMonth}`;
  let backendSortParam = '';
  if (sortBy === 'cost_rs') backendSortParam = 'b';
  else if (sortBy === 'consumption_m3') backendSortParam = 'c';
  else if (sortBy === 'display_name') backendSortParam = 'a';
  if (backendSortParam) url += `/${backendSortParam}`;
  if (sortOrder) url += `?order=${sortOrder}`;
  const response = await authenticatedFetch(url);
  return response.json();
}

export async function generateUnitReportPdf(codigoLote: number, dataRefMes: string): Promise<Blob> {
  const url = `${API_BASE_URL}/api/report/unit/${codigoLote}/${dataRefMes}`;
  const response = await authenticatedFetch(url, { method: 'GET' });
  return response.blob();
}

export interface LatestReading {
  codigo_lote: number;
  nome_lote: string;
  leitura_anterior: number;
  data_ref: string | null;
  consumo_medido_m3: number; // NOVO: Esgoto em m³ = ultimo consumo
  media_movel_6_meses_anteriores: number;
  media_movel_12_meses_anteriores: number;
}

export async function fetchLatestReadings(): Promise<LatestReading[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/latest-readings`);
  return response.json();
}

export interface ProcessReadingsPayload {
  production_data: {
    data_ref: string | null;
    producao_m3: number | null;
    outros_rs: number | null;
    compra_rs: number | null;
  };
  unit_readings: {
    codigo_lote: number;
    data_leitura_atual: string | null;
    leitura_atual: number | null;
    consumo: number | null;
  }[];
}

// --- INTERFACES ATUALIZADAS PARA A RESPOSTA DO PIPELINE ---
export interface PipelineResult {
    codigo_lote: number;
    nome_lote: string;
    prod_rs: number | null;
    esgoto_rs: number | null;
    comp_rs: number | null;
    outros_rs: number | null;
    total_rs: number | null;
    faixa_agua: string | null;
    tarifa_agua: number | null;
    deduzir_agua: number | null;
    faixa_esgoto: string | null;
    tarifa_esgoto: number | null;
    deduzir_esgoto: number | null;
    mensagem: string | null;
}
 
export interface BackendLog {
    status: 'OK' | 'ERRO';
    message: string;
}

export interface SubmitReadingsResponse {
    message: string;
    logs: BackendLog[];
    data?: PipelineResult[]; // 'data' é opcional, pode não vir em caso de erro
    error?: string;
}

// --- FUNÇÃO ATUALIZADA ---
export async function submitProcessedReadings(payload: ProcessReadingsPayload): Promise<SubmitReadingsResponse> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/process-readings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
}
