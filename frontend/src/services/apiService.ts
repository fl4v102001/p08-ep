import { Unit, WaterBill, MonthlySummary } from '../../types';

// URL base do seu backend Python
const API_BASE_URL = 'http://127.0.0.1:5000';

// Variável para armazenar o token JWT (pode ser inicializada do localStorage)
let currentAuthToken: string | null = localStorage.getItem('authToken');

// Função para atualizar o token (chamada pelo useAuth)
export const setAuthToken = (token: string | null) => {
  currentAuthToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

/**
 * Função auxiliar para fazer requisições à API, adicionando o token de autenticação.
 */
async function authenticatedFetch(url: string, options?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Tenta ler a mensagem de erro do backend
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || errorJson.error || `Erro na requisição: ${response.statusText}`);
    } catch {
      throw new Error(`Erro na requisição: ${response.statusText} - ${errorText}`);
    }
  }
  return response;
}


/**
 * Registra um novo usuário no backend.
 */
export async function registerUser(nome_usuario: string, email_usuario: string, senha_usuario: string, perfil_usuario: string = 'user'): Promise<{ message: string }> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    body: JSON.stringify({ nome_usuario, email_usuario, senha_usuario, perfil_usuario }),
  });
  return response.json();
}

/**
 * Realiza o login do usuário no backend.
 */
export async function loginUser(email_usuario: string, senha_usuario: string): Promise<{ message: string; token: string; user: any }> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    body: JSON.stringify({ email_usuario, senha_usuario }),
  });
  const data = await response.json();
  setAuthToken(data.token); // Atualiza o token global e no localStorage
  return data;
}

/**
 * Envia uma requisição de logout para o backend.
 * Nota: Para JWTs, o "logout" é principalmente client-side (remover o token).
 * Este endpoint é mais para sinalização ou limpeza de sessão no backend, se aplicável.
 */
export async function logoutUserApi(): Promise<{ message: string }> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/logout`, {
    method: 'POST',
  });
  return response.json();
}


/**
 * Busca todas as unidades disponíveis no backend.
 */
export async function fetchUnits(): Promise<Unit[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/units`);
  return response.json();
}

/**
 * Busca as contas de água para uma unidade específica.
 */
export async function fetchBillsForUnit(unitId: number): Promise<WaterBill[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/units/${unitId}/bills`);
  return response.json();
}

/**
 * Busca o resumo mensal de consumo para um determinado mês e ano.
 * @param yearMonth Uma string no formato "YYYY-MM" (ex: "2025-07").
 * @param sortBy Campo para ordenar (ex: 'consumption_m3', 'cost_rs', 'display_name').
 * @param sortOrder Ordem da ordenação ('asc' ou 'desc').
 * @returns Uma Promise que resolve para um objeto MonthlySummary.
 */
export async function getMonthlySummary(yearMonth: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<MonthlySummary> {
  let url = `${API_BASE_URL}/api/monthly-summary/${yearMonth}`;
  
  // Mapear sortBy do frontend para o sort_by_param do backend (a, b, c)
  let backendSortParam = '';
  if (sortBy === 'cost_rs') {
    backendSortParam = 'b';
  } else if (sortBy === 'consumption_m3') {
    backendSortParam = 'c';
  } else if (sortBy === 'display_name') { // Para ordenar por nome/codinome
    backendSortParam = 'a';
  }
  
  // Se houver um parâmetro de ordenação válido, adicione à URL
  if (backendSortParam) {
    url += `/${backendSortParam}`;
  }

  // Adicionar sortOrder como um parâmetro de query
  if (sortOrder) {
    url += `?order=${sortOrder}`;
  }

  const response = await authenticatedFetch(url);
  return response.json();
}

/**
 * Gera e baixa um relatório PDF para uma unidade específica.
 */
export async function generateUnitReportPdf(codigoLote: number, dataRefMes: string): Promise<Blob> {
  try {
    const url = `${API_BASE_URL}/api/report/unit/${codigoLote}/${dataRefMes}`;
    const response = await authenticatedFetch(url, { method: 'GET' });
    return await response.blob();
  } catch (error) {
    console.error(`Erro ao gerar relatório para unidade ${codigoLote}:`, error);
    throw error;
  }
}


/**
 * Interface para os dados da última leitura.
 */
export interface LatestReading {
  codigo_lote: number;
  nome_lote: string;
  leitura_anterior: number;
  data_ref: string | null;
  media_movel_6_meses_anteriores: number;
  media_movel_12_meses_anteriores: number;
}

/**
 * Busca a última leitura de todas as unidades.
 */
export async function fetchLatestReadings(): Promise<LatestReading[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/latest-readings`);
  return response.json();
}

/**
 * Interface para o payload de processamento de leituras.
 */
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

/**
 * Envia os dados de leitura processados para o backend.
 */
export async function submitProcessedReadings(payload: ProcessReadingsPayload): Promise<{ message: string }> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/process-readings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
}
