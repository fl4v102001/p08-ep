
import React, { useState, useEffect } from 'react';
import { Morador, Unit, Veiculo } from '../models';
import { fetchMoradoresForUnit, fetchVeiculosForUnit } from '../services/apiService';
import MoradorList from './MoradorList';
import VeiculoList from './VeiculoList';

interface FutureUsePanelProps {
  selectedUnit: Unit | null;
}

const FutureUsePanel: React.FC<FutureUsePanelProps> = ({ selectedUnit }) => {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  
  const [loadingMoradores, setLoadingMoradores] = useState(false);
  const [loadingVeiculos, setLoadingVeiculos] = useState(false);

  const [errorMoradores, setErrorMoradores] = useState<string | null>(null);
  const [errorVeiculos, setErrorVeiculos] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUnit) {
      const loadMoradores = async () => {
        setLoadingMoradores(true);
        setErrorMoradores(null);
        try {
          const data = await fetchMoradoresForUnit(selectedUnit.codigo_lote);
          setMoradores(data);
        } catch (err) {
          setErrorMoradores('Erro ao buscar moradores.');
          console.error(err);
        }
        setLoadingMoradores(false);
      };

      const loadVeiculos = async () => {
        setLoadingVeiculos(true);
        setErrorVeiculos(null);
        try {
          const data = await fetchVeiculosForUnit(selectedUnit.codigo_lote);
          setVeiculos(data);
        } catch (err) {
          setErrorVeiculos('Erro ao buscar veículos.');
          console.error(err);
        }
        setLoadingVeiculos(false);
      };

      loadMoradores();
      loadVeiculos();

    } else {
      setMoradores([]);
      setVeiculos([]);
    }
  }, [selectedUnit]);

  const handleEditVeiculo = (veiculo: Veiculo) => {
    console.log('Edit veiculo', veiculo);
  };

  const handleDeleteVeiculo = (id: number) => {
    console.log('Delete veiculo', id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      {/* O container principal agora é um flex-col que distribui o espaço */}
      <div className="flex flex-col flex-grow p-4 overflow-hidden space-y-4">

        {/* Seção de Moradores - com altura e scroll próprios */}
        <div className="flex flex-col h-1/2">
          <h2 className="text-lg font-bold text-slate-800 mb-2 flex-shrink-0">Moradores</h2>
          <div className="flex-grow overflow-y-auto border rounded-md p-2">
            {loadingMoradores && <p>Carregando...</p>}
            {errorMoradores && <p className="text-red-500">{errorMoradores}</p>}
            {!loadingMoradores && !errorMoradores && moradores.length > 0 && <MoradorList moradores={moradores} />}
            {!loadingMoradores && !errorMoradores && moradores.length === 0 && <p className="text-sm text-slate-500">Nenhum morador encontrado.</p>}
          </div>
        </div>
        
        {/* Seção de Veículos - com altura e scroll próprios */}
        <div className="flex flex-col h-1/2">
          <h2 className="text-lg font-bold text-slate-800 mb-2 flex-shrink-0">Veículos</h2>
          <div className="flex-grow overflow-y-auto border rounded-md p-2">
            {loadingVeiculos && <p>Carregando...</p>}
            {errorVeiculos && <p className="text-red-500">{errorVeiculos}</p>}
            {!loadingVeiculos && !errorVeiculos && veiculos.length > 0 && (
              <VeiculoList 
                veiculos={veiculos} 
                onEdit={handleEditVeiculo} 
                onDelete={handleDeleteVeiculo} 
              />
            )}
            {!loadingVeiculos && !errorVeiculos && veiculos.length === 0 && <p className="text-sm text-slate-500">Nenhum veículo encontrado.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FutureUsePanel;
