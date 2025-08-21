import React, { useState, useEffect } from 'react';
import { Morador, Unit } from '../models';
import { fetchMoradoresForUnit } from '../services/apiService';
import MoradorList from './MoradorList';

interface FutureUsePanelProps {
  selectedUnit: Unit | null;
}

const FutureUsePanel: React.FC<FutureUsePanelProps> = ({ selectedUnit }) => {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUnit) {
      const loadMoradores = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchMoradoresForUnit(selectedUnit.codigo_lote);
          setMoradores(data);
        } catch (err) {
          setError('Erro ao buscar moradores.');
        }
        setLoading(false);
      };
      loadMoradores();
    } else {
      setMoradores([]);
    }
  }, [selectedUnit]);

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-lg font-bold text-slate-800 p-4 border-b">Moradores</h2>
      <div className="flex-grow p-4 overflow-y-auto">
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && moradores.length > 0 && <MoradorList moradores={moradores} />}
        {!loading && !error && moradores.length === 0 && <p>Nenhum morador encontrado para esta unidade.</p>}
      </div>
    </div>
  );
};

export default FutureUsePanel;