// --- INTERFACES E TIPOS ---

// Tipos de dados da aplicação
export interface NewReading {
  data_leitura_atual: string | null;
  leitura_atual: number | null;
  consumo: number | null;
  mes_mensagem: string;
  media_movel_6_meses_anteriores: number;
  media_movel_12_meses_anteriores: number;
}

export interface ProductionData {
  data_ref: string | null;
  producao_m3: number | null;
  outros_rs: number | null;
  compra_rs: number | null;
  total_consumo_m3: number | null;
  media_m3: number | null;
  mediana_m3: number | null;
}

export interface ProcessedResult {
  codigo_lote: number;
  nome_lote: string;
  prod_rs: number;
  esgoto_rs: number;
  comp_rs: number;
  outros_rs: number;
  total_rs: number;
  mensagem: string;
}

export interface LogMessage {
  text: string;
  type: 'info' | 'success' | 'error';
  timestamp: string;
}

// --- GESTÃO DE ESTADO COM useReducer ---

// 1. Estrutura do estado centralizado
export interface ModalState {
  currentStep: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  latestReadings: any[]; // Substituir 'any' por 'LatestReading' se a tiver definida noutro local
  newReadings: Map<number, NewReading>;
  productionData: ProductionData;
  processedResults: ProcessedResult[];
  logMessages: LogMessage[];
}

// 2. Estado inicial
export const initialState: ModalState = {
  currentStep: 1,
  isLoading: true,
  isSubmitting: false,
  error: null,
  latestReadings: [],
  newReadings: new Map(),
  productionData: {
    data_ref: null, producao_m3: null, outros_rs: null, compra_rs: null,
    total_consumo_m3: null, media_m3: null, mediana_m3: null,
  },
  processedResults: [],
  logMessages: [],
};

// 3. Tipos de ações
export type ModalAction =
  | { type: 'RESET_STATE' }
  | { type: 'START_LOADING' }
  | { type: 'SET_INITIAL_DATA'; payload: { latestReadings: any[]; initialNewReadings: Map<number, NewReading>; nextDataRef: string | null } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'UPDATE_PRODUCTION_DATA'; payload: Partial<ProductionData> }
  | { type: 'UPDATE_NEW_READINGS'; payload: Map<number, NewReading> }
  | { type: 'ADD_LOG'; payload: LogMessage }
  | { type: 'START_SUBMIT' }
  | { type: 'SUBMIT_SUCCESS'; payload: { message: string; mockResults: ProcessedResult[] } }
  | { type: 'SUBMIT_FAILURE'; payload: string }
  | { type: 'GO_TO_STEP'; payload: number };

// 4. Função Reducer
export const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case 'RESET_STATE':
      return { ...initialState, isLoading: true };
    case 'START_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'SET_INITIAL_DATA':
      return {
        ...state,
        isLoading: false,
        latestReadings: action.payload.latestReadings,
        newReadings: action.payload.initialNewReadings,
        productionData: { ...state.productionData, data_ref: action.payload.nextDataRef },
      };
    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'UPDATE_PRODUCTION_DATA':
      return { ...state, productionData: { ...state.productionData, ...action.payload } };
    case 'UPDATE_NEW_READINGS':
      return { ...state, newReadings: action.payload };
    case 'ADD_LOG':
      return { ...state, logMessages: [action.payload, ...state.logMessages] };
    case 'START_SUBMIT':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
        processedResults: action.payload.mockResults,
        currentStep: 2,
        logMessages: [{ text: action.payload.message, type: 'success', timestamp: new Date().toLocaleTimeString('pt-BR') }, ...state.logMessages]
      };
    case 'SUBMIT_FAILURE':
      return {
        ...state,
        isSubmitting: false,
        logMessages: [{ text: `Falha na submissão: ${action.payload}`, type: 'error', timestamp: new Date().toLocaleTimeString('pt-BR') }, ...state.logMessages]
      };
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
    default:
      return state;
  }
};
