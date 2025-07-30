import React, { useState, useEffect, useRef } from 'react';
import { fetchLatestReadings, LatestReading } from '../services/apiService';
import Papa from 'papaparse';

interface ProcessReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewReading {
  leitura_atual: number | null;
  consumo: number | null;
}

interface LogMessage {
  text: string;
  type: 'info' | 'success' | 'error';
  timestamp: string;
}

// NOVO: Interface para os dados de produção do mês
interface ProductionData {
  producao_m3: number | null;
  outros_rs: number | null;
  compra_m3: number | null;
  compra_rs: number | null;
}

const ProcessReadingModal: React.FC<ProcessReadingModalProps> = ({ isOpen, onClose }) => {
  const [latestReadings, setLatestReadings] = useState<LatestReading[]>([]);
  const [newReadings, setNewReadings] = useState<Map<number, NewReading>>(new Map());
  // NOVO: Estado para os dados de produção
  const [productionData, setProductionData] = useState<ProductionData>({
    producao_m3: null,
    outros_rs: null,
    compra_m3: null,
    compra_rs: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<LogMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (text: string, type: 'info' | 'success' | 'error') => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogMessages(prev => [{ text, type, timestamp }, ...prev]);
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setLogMessages([]);
      // Reseta os dados de produção ao abrir o modal
      setProductionData({ producao_m3: null, outros_rs: null, compra_m3: null, compra_rs: null });
      addLog("Iniciando processo de leitura...", 'info');
      fetchLatestReadings()
        .then(data => {
          setLatestReadings(data);
          const initialNewReadings = new Map<number, NewReading>();
          data.forEach(unit => {
            initialNewReadings.set(unit.codigo_lote, { leitura_atual: null, consumo: null });
          });
          setNewReadings(initialNewReadings);
          addLog(`${data.length} unidades carregadas com sucesso.`, 'success');
        })
        .catch(err => {
          const errorMsg = "Não foi possível carregar os dados das unidades.";
          console.error("Erro ao buscar últimas leituras:", err);
          setError(errorMsg);
          addLog(errorMsg, 'error');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      addLog(`Carregando arquivo "${file.name}"...`, 'info');
      Papa.parse<[string, string]>(file, {
        complete: (results) => {
          const updatedReadings = new Map(newReadings);
          let processedCount = 0;
          results.data.forEach(([codigoLoteStr, leituraAtualStr]) => {
            const codigo_lote = parseInt(codigoLoteStr, 10);
            const leitura_atual = parseFloat(leituraAtualStr);
            const latestReading = latestReadings.find(lr => lr.codigo_lote === codigo_lote);

            if (!isNaN(codigo_lote) && !isNaN(leitura_atual) && latestReading) {
              const consumo = leitura_atual - (latestReading.leitura_anterior || 0);
              updatedReadings.set(codigo_lote, { leitura_atual, consumo });
              processedCount++;
            }
          });
          setNewReadings(updatedReadings);
          addLog(`${processedCount} leituras do arquivo CSV foram processadas.`, 'success');
        },
        error: (err) => {
          const errorMsg = `Erro ao processar o arquivo CSV: ${err.message}`;
          setError(errorMsg);
          addLog(errorMsg, 'error');
        }
      });
    }
  };
  
  const handleReadingChange = (codigo_lote: number, field: keyof NewReading, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    const currentLatestReading = latestReadings.find(lr => lr.codigo_lote === codigo_lote);
    if (!currentLatestReading) return;

    const updatedReadings = new Map(newReadings);
    const currentNewReading = updatedReadings.get(codigo_lote) || { leitura_atual: null, consumo: null };
    
    if (field === 'leitura_atual') {
        currentNewReading.leitura_atual = numericValue;
        currentNewReading.consumo = numericValue !== null ? numericValue - currentLatestReading.leitura_anterior : null;
    } else {
        currentNewReading.consumo = numericValue;
        currentNewReading.leitura_atual = numericValue !== null ? currentLatestReading.leitura_anterior + numericValue : null;
    }

    updatedReadings.set(codigo_lote, { ...currentNewReading });
    setNewReadings(updatedReadings);
  };

  // NOVO: Handler para os campos de produção
  const handleProductionDataChange = (field: keyof ProductionData, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value.replace(',', '.'));
    setProductionData(prev => ({ ...prev, [field]: numericValue }));
  };

  const getInputStyles = (consumo: number | null, leitura_atual: number | null): string => {
    const baseClasses = "w-full p-1.5 border rounded-md focus:ring-2";
    
    if (consumo === null || leitura_atual === null) {
      return `${baseClasses} bg-violet-50 border-gray-300 focus:ring-violet-400`;
    }
    if (consumo < 0 || leitura_atual === 0) {
      return `${baseClasses} bg-red-50 border-red-400 text-red-800 focus:ring-red-500`;
    }
    if (consumo === 0) {
      return `${baseClasses} bg-yellow-50 border-yellow-400 text-yellow-800 focus:ring-yellow-500`;
    }
    return `${baseClasses} bg-violet-50 border-gray-300 focus:ring-violet-400`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-5/6 flex flex-col">
        <header className="p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800">Processar Arquivo de Leitura</h2>
        </header>

        <main className="flex-grow p-4 grid grid-cols-3 gap-6 overflow-hidden">
          <div className="col-span-2 flex flex-col overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-full"><p>Carregando...</p></div>
            ) : error && latestReadings.length === 0 ? (
              <div className="flex justify-center items-center h-full text-red-600"><p>{error}</p></div>
            ) : (
              <>
                {/* NOVO: Seção para os dados de produção */}
                <div className="mb-4 p-4 border rounded-lg bg-slate-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="producao_m3" className="block text-sm font-medium text-slate-700 mb-1">Produção m³</label>
                      <input type="number" id="producao_m3" value={productionData.producao_m3 ?? ''} onChange={(e) => handleProductionDataChange('producao_m3', e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label htmlFor="outros_rs" className="block text-sm font-medium text-slate-700 mb-1">Outros R$</label>
                      <input type="number" id="outros_rs" value={productionData.outros_rs ?? ''} onChange={(e) => handleProductionDataChange('outros_rs', e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label htmlFor="compra_m3" className="block text-sm font-medium text-slate-700 mb-1">Compra m³</label>
                      <input type="number" id="compra_m3" value={productionData.compra_m3 ?? ''} onChange={(e) => handleProductionDataChange('compra_m3', e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label htmlFor="compra_rs" className="block text-sm font-medium text-slate-700 mb-1">Compra R$</label>
                      <input type="number" id="compra_rs" value={productionData.compra_rs ?? ''} onChange={(e) => handleProductionDataChange('compra_rs', e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                  </div>
                </div>

                {/* Tabela de leituras existente */}
                <div className="w-full">
                  <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-x-4 sticky top-0 bg-slate-100 p-3 rounded-t-md border-b z-10">
                    <span className="font-bold text-slate-600">Unidade</span>
                    <span className="font-bold text-slate-600">Leitura Anterior</span>
                    <span className="font-bold text-slate-600">Leitura Atual</span>
                    <span className="font-bold text-slate-600">Consumo</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {latestReadings.map(unit => {
                      const leituraAtual = newReadings.get(unit.codigo_lote)?.leitura_atual;
                      const consumoAtual = newReadings.get(unit.codigo_lote)?.consumo;
                      const cellStyles = getInputStyles(consumoAtual ?? null, leituraAtual ?? null);

                      return (
                        <div key={unit.codigo_lote} className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-x-4 py-2 items-center">
                          <div className="text-slate-700 px-3">{unit.nome_lote} ({unit.codigo_lote})</div>
                          <div className="text-slate-500 px-3">{unit.leitura_anterior}</div>
                          <div className="px-2">
                            <input type="number" value={leituraAtual ?? ''} onChange={(e) => handleReadingChange(unit.codigo_lote, 'leitura_atual', e.target.value)} className={cellStyles} placeholder="0" />
                          </div>
                          <div className="px-2">
                            <input type="number" value={consumoAtual ?? ''} onChange={(e) => handleReadingChange(unit.codigo_lote, 'consumo', e.target.value)} className={cellStyles} placeholder="0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="col-span-1 bg-slate-50 rounded-lg p-4 flex flex-col border">
            <h3 className="text-lg font-bold text-slate-700 mb-4">Ações e Instruções</h3>
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileLoad} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition font-semibold text-lg mb-6">
              Carregar Arquivo CSV...
            </button>
            
            <h4 className="font-semibold text-slate-600 border-b pb-2 mb-3">Log de Eventos</h4>
            <div className="flex-grow bg-white rounded-md p-3 overflow-y-auto text-sm space-y-2 border">
              {logMessages.length === 0 && <p className="text-slate-400 italic">Aguardando ações...</p>}
              {logMessages.map((msg, index) => (
                <div key={index} className={`flex items-start ${msg.type === 'error' ? 'text-red-600' : msg.type === 'success' ? 'text-green-600' : 'text-slate-500'}`}>
                  <span className="font-mono mr-2">[{msg.timestamp}]</span>
                  <span className="flex-1">{msg.text}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="p-4 border-t flex justify-between">
          <button onClick={onClose} className="bg-slate-200 text-slate-800 px-6 py-2 rounded-md hover:bg-slate-300 transition">Voltar</button>
          <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">Avançar</button>
        </footer>
      </div>
    </div>
  );
};

export default ProcessReadingModal;
