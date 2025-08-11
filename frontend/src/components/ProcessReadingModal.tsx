import React, { useEffect, useReducer, useRef } from 'react';
import { fetchLatestReadings, submitProcessedReadings, ProcessReadingsPayload, LatestReading } from '../services/apiService';
import { modalReducer, initialState, NewReading } from './ProcessReading.state';
import Step1_ReadingInput from './Step1_ReadingInput';
import Step2_ResultsDisplay from './Step2_ResultsDisplay';
import LogPanel from './LogPanel';

// --- INTERFACE DE PROPS ---
interface ProcessReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- LÓGICA DE NEGÓCIO (FUNÇÃO PURA) ---
const calculateConsumptionStats = (readings: Map<number, NewReading>) => {
  const consumptionValues = Array.from(readings.values()).map(r => r.consumo).filter((c): c is number => c !== null && c >= 0);
  if (consumptionValues.length === 0) return { total_consumo_m3: 0, media_m3: 0, mediana_m3: 0 };
  const total_consumo_m3 = consumptionValues.reduce((sum, val) => sum + val, 0);
  const media_m3 = total_consumo_m3 / consumptionValues.length;
  const sortedValues = [...consumptionValues].sort((a, b) => a - b);
  const mid = Math.floor(sortedValues.length / 2);
  const mediana_m3 = sortedValues.length % 2 !== 0 ? sortedValues[mid] : (sortedValues[mid - 1] + sortedValues[mid]) / 2;
  return { total_consumo_m3: parseFloat(total_consumo_m3.toFixed(2)), media_m3: parseFloat(media_m3.toFixed(2)), mediana_m3: parseFloat(mediana_m3.toFixed(2)) };
};

// --- COMPONENTE PRINCIPAL (ORQUESTRADOR) ---
const ProcessReadingModal: React.FC<ProcessReadingModalProps> = ({ isOpen, onClose }) => {
  const [state, dispatch] = useReducer(modalReducer, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (text: string, type: 'info' | 'success' | 'error') => {
    dispatch({ type: 'ADD_LOG', payload: { text, type, timestamp: new Date().toLocaleTimeString('pt-BR') } });
  };

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: 'RESET_STATE' });
      fetchLatestReadings()
        .then(data => {
          const initialNewReadings = new Map<number, NewReading>();
          data.forEach(unit => {
            initialNewReadings.set(unit.codigo_lote, {
              data_leitura_atual: null, leitura_atual: null, consumo: null, mes_mensagem: '',
              media_movel_12_meses_anteriores: unit.media_movel_12_meses_anteriores,
              media_movel_6_meses_anteriores: unit.media_movel_6_meses_anteriores
            });
          });
          const nextDataRef = (data && data.length > 0 && data[0].data_ref)
            ? (() => { const d = new Date(`${data[0].data_ref}T00:00:00`); d.setMonth(d.getMonth() + 1); return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-01`; })()
            : null;
          dispatch({ type: 'SET_INITIAL_DATA', payload: { latestReadings: data, initialNewReadings, nextDataRef } });
        })
        .catch(err => {
          dispatch({ type: 'SET_ERROR', payload: "Não foi possível carregar os dados das unidades." });
          console.error("Erro ao buscar últimas leituras:", err);
        });
    }
  }, [isOpen]);

  const runConsistencyCheck = (): number => {
    addLog("A executar verificação de consistência...", 'info');
    let errorCount = 0;
    const stats = calculateConsumptionStats(state.newReadings);
    dispatch({ type: 'UPDATE_PRODUCTION_DATA', payload: stats });

    const updatedReadings = new Map(state.newReadings);
    updatedReadings.forEach((reading, key) => {
        let message = '';
        const { consumo, leitura_atual, media_movel_6_meses_anteriores } = reading;
        const { mediana_m3 } = stats;
        if (consumo !== null && leitura_atual !== null) {
            if (consumo < 0 || leitura_atual === 0) message = 'Leitura inválida ou consumo negativo.';
            else if (mediana_m3 > 0 && consumo >= 2.5 * mediana_m3) { message = 'Atenção: Verificar URGENTE'; addLog(`Verificar URGENTE ${key}`, 'info'); }
            else if (mediana_m3 > 0 && consumo > 2 * mediana_m3) { message = 'Atenção: Consumo muito alto'; addLog(`Muito ALTO ${key}`, 'info'); }
            else if (consumo === 0) message = 'Consumo zerado neste mês.';
            else if (consumo > 1.5 * media_movel_6_meses_anteriores && consumo >= 1.5 * mediana_m3) { message = 'Consumo ANORMAL'; addLog(`Consumo ANORMAL ${key}`, 'info'); }
            else message = 'Consumo normal.';
        } else {
            message = 'Leitura pendente.';
        }
        reading.mes_mensagem = message;
    });
    dispatch({ type: 'UPDATE_NEW_READINGS', payload: updatedReadings });

    const { data_ref, producao_m3, outros_rs, compra_rs } = state.productionData;
    if (!data_ref) { addLog('ERRO: Falta informar o campo "Data Referência".', 'error'); errorCount++; }
    if (producao_m3 === null) { addLog('ERRO: Falta informar o campo "Produção m³".', 'error'); errorCount++; }
    if (outros_rs === null) { addLog('ERRO: Falta informar o campo "Outros Gastos R$".', 'error'); errorCount++; }
    if (compra_rs === null) { addLog('ERRO: Falta informar o campo "Compra Água R$".', 'error'); errorCount++; }

    state.latestReadings.forEach(unit => {
        const readingData = updatedReadings.get(unit.codigo_lote);
        if (!readingData || readingData.data_leitura_atual === null) { addLog(`ERRO: O campo "Data Leitura Atual" da unidade ${unit.codigo_lote} está pendente.`, 'error'); errorCount++; }
        if (!readingData || readingData.leitura_atual === null) { addLog(`ERRO: O campo "Leitura Atual" da unidade ${unit.codigo_lote} está pendente.`, 'error'); errorCount++; }
        if (!readingData || readingData.consumo === null) { addLog(`ERRO: O campo "Consumo" da unidade ${unit.codigo_lote} está pendente.`, 'error'); errorCount++; }
    });

    if (errorCount === 0) addLog("Verificação de consistência concluída. Nenhum erro encontrado.", 'success');
    else addLog(`Verificação de consistência concluída. ${errorCount} erro(s) encontrado(s).`, 'error');

    return errorCount;
  };

  const handleStep1Submit = async () => {
    addLog("A iniciar processo de submissão...", 'info');
    if (runConsistencyCheck() > 0) {
      addLog("Submissão cancelada devido a erros de consistência.", 'error');
      return;
    }
    dispatch({ type: 'START_SUBMIT' });

    const payload: ProcessReadingsPayload = {
      production_data: {
        data_ref: state.productionData.data_ref, producao_m3: state.productionData.producao_m3,
        outros_rs: state.productionData.outros_rs, compra_rs: state.productionData.compra_rs,
      },
      unit_readings: Array.from(state.newReadings.entries()).map(([codigo_lote, data]) => ({
        codigo_lote, data_leitura_atual: data.data_leitura_atual, leitura_atual: data.leitura_atual, consumo: data.consumo,
      })),
    };

    try {
      // --- ALTERAÇÃO PRINCIPAL ---
      // Agora consome a resposta real do backend
      const result = await submitProcessedReadings(payload);
      
      // Adiciona os logs retornados pelo backend ao painel
      if (result.logs) {
        dispatch({ type: 'ADD_BACKEND_LOGS', payload: result.logs });
      }

      // Se a operação foi bem-sucedida e retornou dados, avança para a próxima etapa
      if (result.data) {
        dispatch({ type: 'SUBMIT_SUCCESS', payload: { results: result.data } });
      } else {
        // Se não houver dados, significa que houve um erro no pipeline
        dispatch({ type: 'SUBMIT_FAILURE' });
      }
    } catch (err: any) {
      // Captura erros de rede ou erros retornados pelo backend
      const errorMessage = err.message || "Erro desconhecido.";
      addLog(`Falha na submissão: ${errorMessage}`, 'error');
      // Se o erro contiver logs do backend, adiciona-os
      if (err.cause) {
        dispatch({ type: 'ADD_BACKEND_LOGS', payload: err.cause });
      }
      dispatch({ type: 'SUBMIT_FAILURE' });
    }
  };

  const handleFinalSave = () => {
    addLog("A salvar dados finais...", 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-5/6 flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Processar Leituras - Etapa {state.currentStep}/2</h2>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${state.currentStep >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${state.currentStep >= 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-400'}`}>1</div>
              <span className="ml-2 font-semibold">Entrada</span>
            </div>
            <div className={`h-px w-12 ${state.currentStep > 1 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
            <div className={`flex items-center ${state.currentStep >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${state.currentStep >= 2 ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-400'}`}>2</div>
              <span className="ml-2 font-semibold">Conferência</span>
            </div>
          </div>
        </header>

        <main className="flex-grow p-2 grid grid-cols-4 gap-2 overflow-hidden">
          {state.currentStep === 1 && <Step1_ReadingInput state={state} dispatch={dispatch} />}
          {state.currentStep === 2 && <Step2_ResultsDisplay results={state.processedResults} />}
          <LogPanel state={state} dispatch={dispatch} fileInputRef={fileInputRef} />
        </main>

        <footer className="p-4 border-t flex justify-between bg-slate-50 rounded-b-lg">
          {state.currentStep === 1 ? (
            <>
              <button onClick={onClose} disabled={state.isSubmitting} className="bg-white border border-slate-300 text-slate-800 px-6 py-2 rounded-md hover:bg-slate-100 transition disabled:opacity-50">Cancelar</button>
              <button onClick={handleStep1Submit} disabled={state.isSubmitting} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50">{state.isSubmitting ? 'A processar...' : 'Avançar'}</button>
            </>
          ) : (
            <>
              <button onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 1 })} disabled={state.isSubmitting} className="bg-white border border-slate-300 text-slate-800 px-6 py-2 rounded-md hover:bg-slate-100 transition disabled:opacity-50">Voltar</button>
              <button onClick={handleFinalSave} disabled={state.isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50">Salvar e Finalizar</button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};

export default ProcessReadingModal;
