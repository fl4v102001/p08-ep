import React, { useState, useEffect, useRef } from 'react';
import { fetchLatestReadings, LatestReading, submitProcessedReadings, ProcessReadingsPayload } from '../services/apiService';
import Papa from 'papaparse';

interface ProcessReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewReading {
  data_leitura_atual: string | null;
  leitura_atual: number | null;
  consumo: number | null;
  mes_mensagem: string;
  media_movel_6_meses_anteriores: number;
  media_movel_12_meses_anteriores: number;
}

interface LogMessage {
  text: string;
  type: 'info' | 'success' | 'error';
  timestamp: string;
}

interface ProductionData {
  data_ref: string | null;
  producao_m3: number | null;
  outros_rs: number | null;
  compra_rs: number | null;
  total_consumo_m3: number | null;
  media_m3: number | null;
  mediana_m3: number | null;
}

const ProcessReadingModal: React.FC<ProcessReadingModalProps> = ({ isOpen, onClose }) => {
  const [latestReadings, setLatestReadings] = useState<LatestReading[]>([]);
  const [newReadings, setNewReadings] = useState<Map<number, NewReading>>(new Map());
  const [productionData, setProductionData] = useState<ProductionData>({
    data_ref: null,
    producao_m3: null,
    outros_rs: null,
    compra_rs: null,
    total_consumo_m3: null,
    media_m3: null,
    mediana_m3: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<LogMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (text: string, type: 'info' | 'success' | 'error') => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogMessages(prev => [{ text, type, timestamp }, ...prev]);
  };

  const calculateConsumptionStats = (readings: Map<number, NewReading>) => {
    const consumptionValues = Array.from(readings.values())
      .map(r => r.consumo)
      .filter((c): c is number => c !== null && c >= 0);

    if (consumptionValues.length === 0) {
      return { total_consumo_m3: 0, media_m3: 0, mediana_m3: 0 };
    }

    const total_consumo_m3 = consumptionValues.reduce((sum, val) => sum + val, 0);
    const media_m3 = total_consumo_m3 / consumptionValues.length;

    const sortedValues = [...consumptionValues].sort((a, b) => a - b);
    const mid = Math.floor(sortedValues.length / 2);
    const mediana_m3 =
      sortedValues.length % 2 !== 0
        ? sortedValues[mid]
        : (sortedValues[mid - 1] + sortedValues[mid]) / 2;

    return { 
      total_consumo_m3: parseFloat(total_consumo_m3.toFixed(2)), 
      media_m3: parseFloat(media_m3.toFixed(2)), 
      mediana_m3: parseFloat(mediana_m3.toFixed(2)) 
    };
  };

  // ATUALIZADO: A função agora também gera as mensagens com base na mediana
  const runConsistencyCheck = (readingsToCheck: Map<number, NewReading>): number => {
    addLog("Executando verificação de consistência...", 'info');
    let errorCount = 0;

    const stats = calculateConsumptionStats(readingsToCheck);
    setProductionData(prev => ({ ...prev, ...stats }));

    // NOVO: Lógica para gerar mensagens com base nas estatísticas
    readingsToCheck.forEach((reading, key) => {
      let message = '';
      const { consumo, leitura_atual, media_movel_6_meses_anteriores, media_movel_12_meses_anteriores } = reading;
      const { mediana_m3 } = stats;

      if (consumo !== null && leitura_atual !== null) {
        if (consumo < 0 || leitura_atual === 0) {
          message = 'Leitura inválida ou consumo negativo.';
        } else if (mediana_m3 > 0 && consumo >= 2.5 * mediana_m3) {
          message = 'Atenção: Checar URGENTE';
          addLog(`Checar URGENTE `+key, 'info');
        } else if (mediana_m3 > 0 && consumo > 2 * mediana_m3) {
          message = 'Atenção: Consumo muito alto';
          addLog(`Muito ALTO `+key, 'info');
        } else if (consumo === 0) {
          message = 'Consumo zerado neste mês.';
        } else if (consumo > 1.5 * media_movel_6_meses_anteriores && consumo >= 1.5 * mediana_m3) {
          message = 'Consumo ANORMAL '+media_movel_6_meses_anteriores+' '+media_movel_12_meses_anteriores+'';
          addLog(`Consumo ANORMAL `+key, 'info');

        } else {
          message = 'Consumo normal.';
        }
      } else {
        message = 'Leitura pendente.';
      }
      reading.mes_mensagem = message;
    });
    // Força a atualização do estado para refletir as novas mensagens
    setNewReadings(new Map(readingsToCheck));

    const productionLabels: { [key in keyof Omit<ProductionData, 'total_consumo_m3' | 'media_m3' | 'mediana_m3'>]: string } = {
      data_ref: 'Data Referência',
      producao_m3: 'Produção m³',
      outros_rs: 'Outros R$',
      compra_rs: 'Compra R$',
    };

    for (const key in productionLabels) {
      if (productionData[key as keyof typeof productionLabels] === null) {
        addLog(`ERRO: Falta informar o campo "${productionLabels[key as keyof typeof productionLabels]}".`, 'error');
        errorCount++;
      }
    }

    latestReadings.forEach(unit => {
      const readingData = readingsToCheck.get(unit.codigo_lote);
      if (!readingData || readingData.data_leitura_atual === null) {
        addLog(`ERRO: O campo "Data Leitura Atual" da unidade ${unit.codigo_lote} está pendente.`, 'error');
        errorCount++;
      }
      if (!readingData || readingData.leitura_atual === null) {
        addLog(`ERRO: O campo "Leitura Atual" da unidade ${unit.codigo_lote} está pendente.`, 'error');
        errorCount++;
      }
      if (!readingData || readingData.consumo === null) {
        addLog(`ERRO: O campo "Consumo" da unidade ${unit.codigo_lote} está pendente.`, 'error');
        errorCount++;
      }
    });

    if (errorCount === 0) {
      addLog("Verificação de consistência concluída. Nenhum erro encontrado.", 'success');
    } else {
      addLog(`Verificação de consistência concluída. ${errorCount} erro(s) encontrado(s).`, 'error');
    }
    return errorCount;
  };

  const handleSubmit = async () => {
    addLog("Iniciando processo de submissão...", 'info');
    const errorCount = runConsistencyCheck(newReadings);

    if (errorCount > 0) {
      addLog(`Submissão cancelada. Foram encontrados ${errorCount} erros de consistência.`, 'error');
      return;
    }

    setIsSubmitting(true);

    // 1. Preparar o Payload
    const readingsArray = Array.from(newReadings.entries()).map(([codigo_lote, data]) => ({
      codigo_lote,
      data_leitura_atual: data.data_leitura_atual,
      leitura_atual: data.leitura_atual,
      consumo: data.consumo,
    }));

    const payload: ProcessReadingsPayload = {
      production_data: {
        data_ref: productionData.data_ref,
        producao_m3: productionData.producao_m3,
        outros_rs: productionData.outros_rs,
        compra_rs: productionData.compra_rs,
      },
      unit_readings: readingsArray,
    };

    try {
      const result = await submitProcessedReadings(payload);
      addLog(result.message, 'success');
      setTimeout(() => { onClose(); }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      addLog(`Falha na submissão: ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setLogMessages([]);
      setProductionData({ data_ref: null, producao_m3: null, outros_rs: null, compra_rs: null, total_consumo_m3: null, media_m3: null, mediana_m3: null });
      fetchLatestReadings()
        .then(data => {
          setLatestReadings(data);
          const initialNewReadings = new Map<number, NewReading>();
          data.forEach(unit => {
            initialNewReadings.set(unit.codigo_lote, { 
              data_leitura_atual: null, 
              leitura_atual: null, 
              consumo: null, 
              mes_mensagem: '', 
              media_movel_12_meses_anteriores: unit.media_movel_12_meses_anteriores, 
              media_movel_6_meses_anteriores: unit.media_movel_6_meses_anteriores 
            });
          });
          setNewReadings(initialNewReadings);

          if (data && data.length > 0 && data[0].data_ref) {
            const refDate = new Date(`${data[0].data_ref}T00:00:00`);
            refDate.setMonth(refDate.getMonth() + 1);
            const year = refDate.getFullYear();
            const month = (refDate.getMonth() + 1).toString().padStart(2, '0');
            const nextDataRef = `${year}-${month}-01`;
            setProductionData(prev => ({ ...prev, data_ref: nextDataRef }));
          }
        })
        .catch(err => {
          const errorMsg = "Não foi possível carregar os dados das unidades.";
          console.error("Erro ao buscar últimas leituras:", err);
          setError(errorMsg);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      addLog(`Carregando arquivo "${file.name}"...`, 'info');
      Papa.parse<[string, string, string]>(file, {
        delimiter: ";",
        complete: (results) => {
          const updatedReadings = new Map(newReadings);
          const processedUnitCodes = new Set<number>();
          let processedCount = 0;

          results.data.forEach(([codigoLoteStr, leituraAtualStr, dataLeituraStr]) => {
            const codigo_lote = parseInt(codigoLoteStr, 10);
            const leitura_atual = parseFloat(leituraAtualStr);
            const latestReading = latestReadings.find(lr => lr.codigo_lote === codigo_lote);

            if (!isNaN(codigo_lote) && !isNaN(leitura_atual) && latestReading) {
              processedUnitCodes.add(codigo_lote);
              const consumo = leitura_atual - (latestReading.leitura_anterior || 0);

              // Converte a data do formato DD/MM/YY para YYYY-MM-DDTHH:MM:SS
              let formattedDate: string | null = null;
              if (dataLeituraStr) {
                try {
                  const parts = dataLeituraStr.split('/');
                  if (parts.length === 3) {
                    const [day, month, year] = parts;
                    const fullYear = `20${year}`; // Assume anos 20xx
                    // Formato ISO 8601 que o backend Pydantic espera
                    formattedDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`;
                  }
                } catch (e) {
                  addLog(`Formato de data inválido para a unidade ${codigo_lote}: "${dataLeituraStr}". A data não foi carregada.`, 'error');
                }
              }

              updatedReadings.set(codigo_lote, {
                data_leitura_atual: formattedDate,
                leitura_atual, 
                consumo, 
                mes_mensagem: '' ,
                media_movel_6_meses_anteriores: latestReading.media_movel_6_meses_anteriores,
                media_movel_12_meses_anteriores: latestReading.media_movel_12_meses_anteriores,
              });
              processedCount++;
            }
          });
          
          addLog(`${processedCount} leituras do arquivo CSV foram processadas.`, 'success');
          // A verificação agora também irá calcular e setar as mensagens
          runConsistencyCheck(updatedReadings);
        },
        error: (err) => {
          const errorMsg = `Erro ao processar o arquivo CSV: ${err.message}`;
          setError(errorMsg);
          addLog(errorMsg, 'error');
        }
      });
    }
  };
  
  const handleReadingChange = (codigo_lote: number, field: 'leitura_atual' | 'consumo', value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    
    const updatedReadings = new Map(newReadings);
    const currentNewReading = updatedReadings.get(codigo_lote);
    if (!currentNewReading) return;

    if (field === 'leitura_atual') {
        currentNewReading.leitura_atual = numericValue;
    } else {
        currentNewReading.consumo = numericValue;
    }
    
    updatedReadings.set(codigo_lote, { ...currentNewReading });
    setNewReadings(updatedReadings);
  };

  const handleProductionDataChange = (field: keyof Omit<ProductionData, 'total_consumo_m3' | 'media_m3' | 'mediana_m3'>, value: string) => {
    if (field === 'data_ref') {
      setProductionData(prev => ({ ...prev, data_ref: value || null }));
    } else {
      const numericValue = value === '' ? null : parseFloat(value.replace(',', '.'));
      setProductionData(prev => ({ ...prev, [field]: numericValue }));
    }
  };

  const getInputStyles = (consumo: number | null, leitura_atual: number | null): string => {
    const baseClasses = "w-full p-1.5 border rounded-md focus:ring-2";
    
    if (consumo === null || leitura_atual === null || consumo < 0 || leitura_atual === 0) {
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

        <main className="flex-grow p-2 grid grid-cols-4 gap-2 overflow-hidden">
          <div className="col-span-3 flex flex-col overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-full"><p>Carregando...</p></div>
            ) : error && latestReadings.length === 0 ? (
              <div className="flex justify-center items-center h-full text-red-600"><p>{error}</p></div>
            ) : (
              <>
                <div className="mb-4 p-2 border rounded-lg bg-slate-50" style={{ marginBottom: '8px', marginLeft: '8px' }}>
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                    <div>
                      <label htmlFor="data_ref" className="block text-sm font-medium text-slate-700 mb-1">Data Referência</label>
                      <input type="text" id="data_ref" value={productionData.data_ref ?? ''} onChange={(e) => handleProductionDataChange('data_ref', e.target.value)} className="w-full p-2 border rounded-md" disabled/>
                    </div>
                    <div>
                      <label htmlFor="producao_m3" className="block text-sm font-medium text-slate-700 mb-1">Produção m³</label>
                      <input type="number" id="producao_m3" value={productionData.producao_m3 ?? ''} onChange={(e) => handleProductionDataChange('producao_m3', e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label htmlFor="compra_rs" className="block text-sm font-medium text-slate-700 mb-1">Compra Água R$</label>
                      <input type="number" id="compra_rs" value={productionData.compra_rs ?? ''} onChange={(e) => handleProductionDataChange('compra_rs', e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label htmlFor="outros_rs" className="block text-sm font-medium text-slate-700 mb-1">Outros Gastos R$</label>
                      <input type="number" id="outros_rs" value={productionData.outros_rs ?? ''} onChange={(e) => handleProductionDataChange('outros_rs', e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label htmlFor="total_consumo_m3" className="block text-sm font-medium text-slate-700 mb-1">Total m³</label>
                      <input type="number" id="total_consumo_m3" value={productionData.total_consumo_m3 ?? ''} className="w-full p-2 border rounded-md bg-slate-200" disabled />
                    </div>
                    <div>
                      <label htmlFor="media_m3" className="block text-sm font-medium text-slate-700 mb-1">Média m³</label>
                      <input type="number" id="media_m3" value={productionData.media_m3 ?? ''} className="w-full p-2 border rounded-md bg-slate-200" disabled />
                    </div>
                    <div>
                      <label htmlFor="mediana_m3" className="block text-sm font-medium text-slate-700 mb-1">Mediana m³</label>
                      <input type="number" id="mediana_m3" value={productionData.mediana_m3 ?? ''} className="w-full p-2 border rounded-md bg-slate-200" disabled />
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="grid grid-cols-[2fr,1fr,2fr,1fr,1fr,2fr] gap-x-4 sticky top-0 bg-slate-100 p-1 rounded-t-md border-b z-10">
                    <span className="font-bold text-slate-600">Unidade</span>
                    <span className="font-bold text-slate-600">Leitura Anterior</span>
                    <span className="font-bold text-slate-600">Data Leitura Atual</span>
                    <span className="font-bold text-slate-600">Leitura Atual</span>
                    <span className="font-bold text-slate-600">Consumo</span>
                    <span className="font-bold text-slate-600">Mensagem</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {latestReadings.map(unit => {
                      const currentReading = newReadings.get(unit.codigo_lote);
                      const cellStyles = getInputStyles(currentReading?.consumo ?? null, currentReading?.leitura_atual ?? null);

                      return (
                        <div key={unit.codigo_lote} className="grid grid-cols-[2fr,1fr,2fr,1fr,1fr,2fr] py-2 items-center">
                          <div className="text-slate-700 px-3">{unit.nome_lote} ({unit.codigo_lote})</div>
                          <div className="text-slate-500 px-3">{unit.leitura_anterior}</div>
                          <div className="px-2">
                            <input type="text" value={currentReading?.data_leitura_atual || ''} className="w-full p-1.5 border rounded-md bg-slate-100 text-slate-500" disabled />
                          </div>
                          <div className="px-2">
                            <input type="number" value={currentReading?.leitura_atual ?? ''} onChange={(e) => handleReadingChange(unit.codigo_lote, 'leitura_atual', e.target.value)} className={cellStyles} placeholder="0" />
                          </div>
                          <div className="px-2">
                            <input type="number" value={currentReading?.consumo ?? ''} onChange={(e) => handleReadingChange(unit.codigo_lote, 'consumo', e.target.value)} className={cellStyles} placeholder="0" />
                          </div>
                          <div className="px-2">
                            <input type="text" value={currentReading?.mes_mensagem || ''} className="w-full p-1.5 border rounded-md bg-slate-100 text-slate-500 text-xs" disabled />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="col-span-1 bg-white rounded-lg p-4 flex flex-col border overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-700 mb-4">Ações e Instruções</h3>
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileLoad} className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-base mb-6 shadow-sm"
            >
              Carregar Arquivo CSV...
            </button>
            
            <h4 className="font-semibold text-slate-600 border-b pb-2 mb-3">Log de Eventos</h4>
            <div className="flex-grow bg-slate-50 rounded-md p-3 overflow-y-auto text-xs space-y-2 border" style={{ padding: 0 }}>
              {logMessages.length === 0 && <p className="text-slate-400 italic">Aguardando ações...</p>}
              {logMessages.map((msg, index) => (
                <div key={index} className="flex items-start">
                  <span className="font-mono text-slate-400 mr-2">[{msg.timestamp}]</span>
                  <span className={`flex-1 ${msg.type === 'error' ? 'text-red-600' : msg.type === 'success' ? 'text-green-600' : 'text-slate-700'}`}>
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="p-4 border-t flex justify-between bg-slate-50 rounded-b-lg">
          <button onClick={onClose} disabled={isSubmitting} className="bg-white border border-slate-300 text-slate-800 px-6 py-2 rounded-md hover:bg-slate-100 transition disabled:bg-slate-200 disabled:cursor-not-allowed">
            Voltar
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed">
            {isSubmitting ? 'Enviando...' : 'Avançar'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ProcessReadingModal;
