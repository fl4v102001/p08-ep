// frontend/src/components/UnitList.tsx
import React, { useEffect, useRef } from 'react';
import { Unit } from '../../types';

interface UnitListProps {
  units: Unit[];
  selectedUnit: Unit | null;
  onSelectUnit: (unit: Unit) => void;
  onGenerateReport: (codigoLote: number) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const UnitList: React.FC<UnitListProps> = ({ 
  units, 
  selectedUnit, 
  onSelectUnit, 
  onGenerateReport, 
  searchTerm,
  onSearchTermChange
}) => {
  const selectedItemRef = useRef<HTMLLIElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedItemRef.current && listContainerRef.current) {
      const selectedElement = selectedItemRef.current;
      const containerElement = listContainerRef.current;

      const itemOffsetTop = selectedElement.offsetTop;
      const itemOffsetBottom = selectedElement.offsetTop + selectedElement.offsetHeight;

      const containerScrollTop = containerElement.scrollTop;
      const containerClientHeight = containerElement.clientHeight;
      const containerScrollBottom = containerElement.scrollTop + containerClientHeight;

      const isAboveVisibleArea = itemOffsetTop < containerScrollTop;
      const isBelowVisibleArea = itemOffsetBottom > containerScrollBottom;

      if (isAboveVisibleArea || isBelowVisibleArea) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedUnit]);

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
        <div className="p-2 border-b">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Lista de Unidades</h2>
            <input
            type="text"
            placeholder="Procurar por nome ou código..."
            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            />
        </div>
        <div ref={listContainerRef} className="flex-grow overflow-y-auto">
            <ul className="divide-y divide-slate-200">
                {units.map(unit => (
                <li
                    key={unit.codigo_lote}
                    ref={selectedUnit?.codigo_lote === unit.codigo_lote ? selectedItemRef : null}
                    className="relative"
                >
                    <button
                    onClick={() => onSelectUnit(unit)}
                    className={`w-full text-left p-2 hover:bg-blue-50 transition-colors ${selectedUnit?.codigo_lote === unit.codigo_lote ? 'bg-blue-100' : ''}`}
                    >
                    <p className={`font-semibold ${selectedUnit?.codigo_lote === unit.codigo_lote ? 'text-blue-700' : 'text-slate-700'}`}>{unit.nome_lote}</p>
                    <p className="text-sm text-slate-500">Código: {unit.codigo_lote}</p>
                    </button>

                    {selectedUnit?.codigo_lote === unit.codigo_lote && (
                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-md shadow-sm transition-colors"
                        onClick={() => onGenerateReport(unit.codigo_lote)}
                    >
                        relatório
                    </button>
                    )}
                </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default UnitList;