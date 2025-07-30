import React, { useState, useEffect, useRef } from 'react';
import { fetchLatestReadings, LatestReading } from '../services/apiService';
import Papa from 'papaparse';

interface ProcessReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define a estrutura para as novas leituras que virão do CSV
interface NewReading {
  leitura_atual: number;
  consumo: number;
}

const ProcessReadingModal: React.FC<ProcessReadingModalProps> = ({ isOpen, onClose }) => {
  const [latestReadings, setLatestReadings] = useState<LatestReading[]>([]);
  const [newReadings, setNewReadings] = useState<Map<number, NewReading>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      fetchLatestReadings()
        .then(data => {
          setLatestReadings(data);
          const initialNewReadings = new Map<number, NewReading>();
          data.forEach(unit => {
            initialNewReadings.set(unit.codigo_lote, { leitura_atual: 0, consumo: 0 });
          });
          setNewReadings(initialNewReadings);
        })
        .catch(err => {
          console.error("Erro ao buscar últimas leituras:", err);
          setError("Não foi possível carregar os dados das unidades.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse<[string, string]>(file, {
        complete: (results) => {
          const updatedReadings = new Map(newReadings);
          results.data.forEach(([codigoLoteStr, leituraAtualStr]) => {
            const codigo_lote = parseInt(codigoLoteStr, 10);
            const leitura_atual = parseFloat(leituraAtualStr);
            const latestReading = latestReadings.find(lr => lr.codigo_lote === codigo_lote);

            if (!isNaN(codigo_lote) && !isNaN(leitura_atual) && latestReading) {
              const consumo = leitura_atual - (latestReading.leitura_anterior || 0);
              updatedReadings.set(codigo_lote, { leitura_atual, consumo });
            }
          });
          setNewReadings(updatedReadings);
        },
        error: (err) => {
          setError(`Erro ao processar o arquivo CSV: ${err.message}`);
        }
      });
    }
  };
  
  const handleReadingChange = (codigo_lote: number, field: keyof NewReading, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const currentLatestReading = latestReadings.find(lr => lr.codigo_lote === codigo_lote);
    if (!currentLatestReading) return;

    const updatedReadings = new Map(newReadings);
    const currentNewReading = updatedReadings.get(codigo_lote) || { leitura_atual: 0, consumo: 0 };
    
    if (field === 'leitura_atual') {
        currentNewReading.leitura_atual = numericValue;
        currentNewReading.consumo = numericValue - currentLatestReading.leitura_anterior;
    } else { // field === 'consumo'
        currentNewReading.consumo = numericValue;
        currentNewReading.leitura_atual = currentLatestReading.leitura_anterior + numericValue;
    }

    updatedReadings.set(codigo_lote, { ...currentNewReading });
    setNewReadings(updatedReadings);
  };

  // NOVO: Função auxiliar para determinar o estilo dos inputs
  const getInputStyles = (consumo: number): string => {
    const baseClasses = "w-full p-1.5 border rounded-md focus:ring-2";
    if (consumo < 0) {
      // Estilo de erro (vermelho)
      return `${baseClasses} bg-red-50 border-red-400 text-red-800 focus:ring-red-500`;
    }
    if (consumo === 0) {
      // Estilo de aviso (amarelo)
      return `${baseClasses} bg-yellow-50 border-yellow-400 text-yellow-800 focus:ring-yellow-500`;
    }
    // Estilo padrão
    return `${baseClasses} bg-violet-50 border-gray-300 focus:ring-violet-400`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-5/6 flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Processar Arquivo de Leitura</h2>
          <div>
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileLoad} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Carregar...</button>
          </div>
        </header>

        <main className="flex-grow p-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full"><p>Carregando...</p></div>
          ) : error ? (
            <div className="flex justify-center items-center h-full text-red-600"><p>{error}</p></div>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-x-4 sticky top-0 bg-slate-100 p-3 rounded-t-md border-b z-10">
                <span className="font-bold text-slate-600">Unidade</span>
                <span className="font-bold text-slate-600">Leitura Anterior</span>
                <span className="font-bold text-slate-600">Leitura Atual</span>
                <span className="font-bold text-slate-600">Consumo</span>
              </div>

              <div className="divide-y divide-slate-200">
                {latestReadings.map(unit => {
                  // Pega o consumo atual para determinar o estilo
                  const consumoAtual = newReadings.get(unit.codigo_lote)?.consumo ?? 0;
                  const cellStyles = getInputStyles(consumoAtual);

                  return (
                    <div key={unit.codigo_lote} className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-x-4 py-2 items-center">
                      <div className="text-slate-700 px-3">
                        {unit.nome_lote} ({unit.codigo_lote})
                      </div>
                      
                      <div className="text-slate-500 px-3">
                        {unit.leitura_anterior}
                      </div>
                      
                      <div className="px-2">
                        <input 
                          type="number"
                          value={newReadings.get(unit.codigo_lote)?.leitura_atual || ''}
                          onChange={(e) => handleReadingChange(unit.codigo_lote, 'leitura_atual', e.target.value)}
                          className={cellStyles} // Aplica o estilo dinâmico
                          placeholder="0"
                        />
                      </div>

                      <div className="px-2">
                        <input 
                          type="number"
                          value={newReadings.get(unit.codigo_lote)?.consumo || ''}
                          onChange={(e) => handleReadingChange(unit.codigo_lote, 'consumo', e.target.value)}
                          className={cellStyles} // Aplica o estilo dinâmico
                          placeholder="0"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
