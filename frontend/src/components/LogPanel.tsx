import React from 'react';
import Papa from 'papaparse';
import { ModalState, ModalAction } from './ProcessReading.state';

interface LogPanelProps {
  state: ModalState;
  dispatch: React.Dispatch<ModalAction>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const LogPanel: React.FC<LogPanelProps> = ({ state, dispatch, fileInputRef }) => {
  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      dispatch({ type: 'ADD_LOG', payload: { text: `A carregar ficheiro "${file.name}"...`, type: 'info', timestamp: new Date().toLocaleTimeString('pt-BR') } });
      Papa.parse<[string, string, string]>(file, {
        delimiter: ";",
        complete: (results) => {
          const updatedReadings = new Map(state.newReadings);
          results.data.forEach(([lote, leitura, data]) => {
            const codigo_lote = parseInt(lote, 10);
            const leitura_atual = parseFloat(leitura);
            const latest = state.latestReadings.find(lr => lr.codigo_lote === codigo_lote);
            if (!isNaN(codigo_lote) && !isNaN(leitura_atual) && latest) {
              const consumo = leitura_atual - (latest.leitura_anterior || 0);
              const [day, month, year] = data.split('/');
              const formattedDate = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`;
              updatedReadings.set(codigo_lote, { ...updatedReadings.get(codigo_lote)!, data_leitura_atual: formattedDate, leitura_atual, consumo });
            }
          });
          dispatch({ type: 'UPDATE_NEW_READINGS', payload: updatedReadings });
          dispatch({ type: 'ADD_LOG', payload: { text: `${results.data.length} leituras do CSV foram processadas.`, type: 'success', timestamp: new Date().toLocaleTimeString('pt-BR') } });
        },
        error: (err) => dispatch({ type: 'ADD_LOG', payload: { text: `Erro ao processar CSV: ${err.message}`, type: 'error', timestamp: new Date().toLocaleTimeString('pt-BR') } })
      });
    }
  };

  return (
    <div className="col-span-1 bg-white rounded-lg p-4 flex flex-col border overflow-y-auto">
      <h3 className="text-lg font-bold text-slate-700 mb-4">Ações e Log</h3>
      {state.currentStep === 1 && (
        <>
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileLoad} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-base mb-6 shadow-sm">Carregar Ficheiro CSV...</button>
        </>
      )}
      <h4 className="font-semibold text-slate-600 border-b pb-2 mb-3">Log de Eventos</h4>
      <div className="flex-grow bg-slate-50 rounded-md p-3 overflow-y-auto text-xs space-y-2 border">
        {state.logMessages.length === 0 && <p className="text-slate-400 italic">A aguardar ações...</p>}
        {state.logMessages.map((msg, index) => (
          <div key={index} className="flex items-start">
            <span className="font-mono text-slate-400 mr-2">[{msg.timestamp}]</span>
            <span className={`flex-1 ${msg.type === 'error' ? 'text-red-600' : msg.type === 'success' ? 'text-green-600' : 'text-slate-700'}`}>{msg.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogPanel;
