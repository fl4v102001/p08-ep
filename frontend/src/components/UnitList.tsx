// frontend/src/components/UnitList.tsx
import React, { useEffect, useRef } from 'react';
import { Unit } from '../../types';

interface UnitListProps {
  units: Unit[];
  selectedUnit: Unit | null;
  onSelectUnit: (unit: Unit) => void;
  onGenerateReport: (codigoLote: number) => void; // ADICIONADO: Nova prop para gerar relatório
}

const UnitList: React.FC<UnitListProps> = ({ units, selectedUnit, onSelectUnit, onGenerateReport }) => { // Recebe a nova prop
  // Cria uma referência para o elemento <li> da unidade selecionada
  const selectedItemRef = useRef<HTMLLIElement>(null);
  // Cria uma referência para o contêiner da lista com rolagem
  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Quando a unidade selecionada muda, verifica se precisa rolar
    if (selectedItemRef.current && listContainerRef.current) {
      const selectedElement = selectedItemRef.current;
      const containerElement = listContainerRef.current;

      // Posição do item em relação ao topo do contêiner de rolagem
      const itemOffsetTop = selectedElement.offsetTop;
      const itemOffsetBottom = selectedElement.offsetTop + selectedElement.offsetHeight;

      // Área visível do contêiner de rolagem
      const containerScrollTop = containerElement.scrollTop;
      const containerClientHeight = containerElement.clientHeight;
      const containerScrollBottom = containerElement.scrollTop + containerClientHeight;

      // Verifica se o item está fora da visualização atual do contêiner
      const isAboveVisibleArea = itemOffsetTop < containerScrollTop;
      const isBelowVisibleArea = itemOffsetBottom > containerScrollBottom;

      // Rola apenas se o item não estiver visível dentro da área de rolagem
      if (isAboveVisibleArea || isBelowVisibleArea) {
        selectedElement.scrollIntoView({
          behavior: 'smooth', // Rola suavemente
          block: 'nearest'    // Garante que o item esteja visível na área mais próxima
        });
      }
    }
  }, [selectedUnit]); // Este efeito é executado sempre que selectedUnit muda

  return (
    <div ref={listContainerRef} className="bg-white rounded-lg shadow-md h-full overflow-y-auto">
      <h2 className="text-lg font-bold text-slate-800 p-4 border-b">Lista de Unidades</h2>
      <ul className="divide-y divide-slate-200">
        {units.map(unit => (
          <li
            key={unit.codigo_lote}
            // Atribui a referência ao <li> apenas se for a unidade selecionada
            ref={selectedUnit?.codigo_lote === unit.codigo_lote ? selectedItemRef : null}
            className="relative"
          >
            <button
              onClick={() => onSelectUnit(unit)}
              className={`w-full text-left p-4 hover:bg-blue-50 transition-colors ${selectedUnit?.codigo_lote === unit.codigo_lote ? 'bg-blue-100' : ''}`}
            >
              <p className={`font-semibold ${selectedUnit?.codigo_lote === unit.codigo_lote ? 'text-blue-700' : 'text-slate-700'}`}>{unit.nome_lote}</p>
              <p className="text-sm text-slate-500">Código: {unit.codigo_lote}</p>
            </button>

            {/* Botão "relatório" - Visível apenas se esta unidade estiver selecionada */}
            {selectedUnit?.codigo_lote === unit.codigo_lote && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-md shadow-sm transition-colors"
                onClick={() => onGenerateReport(unit.codigo_lote)} // CHAMA A NOVA PROP AQUI
              >
                relatório
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnitList;
