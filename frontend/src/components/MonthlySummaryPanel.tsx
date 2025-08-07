// frontend/src/components/MonthlySummaryPanel.tsx
import React from 'react';
import { MonthlySummary } from '../../types';
import { MonthlySummaryModel } from '../models';

// Icone para o painel de resumo
const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 0 0120.488 9z" />
  </svg>
);

// Ícones de ordenação
const SortAscIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>;
const SortDescIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" transform="rotate(180 12 12)" /></svg>; // Rotacionado para descendente

interface MonthlySummaryPanelProps {
  summaryData: MonthlySummary | null;
  isLoading: boolean;
  error: string | null;
  onSortChange: (columnKey: string) => void; // Nova prop para callback de ordenação
  sortBy: string; // Coluna atual de ordenação
  sortOrder: 'asc' | 'desc'; // Ordem atual de ordenação
}

const MonthlySummaryPanel: React.FC<MonthlySummaryPanelProps> = ({ summaryData, isLoading, error, onSortChange, sortBy, sortOrder }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Carregando resumo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md h-full flex items-center justify-center p-4 text-red-600 text-center">
        <p>{error}</p>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="bg-white rounded-lg shadow-md h-full flex items-center justify-center p-4 text-slate-500 text-center">
        <p>Selecione uma conta para ver o resumo mensal.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-lg shadow-md h-full flex flex-col border border-blue-200">
      <div className="p-2 border-b border-blue-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-blue-800 flex items-center">
          <ChartBarIcon />
          <span className="ml-2">{summaryData.month_year}</span>
        </h2>
        <button className="flex items-center bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed">
          Exportar
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
      <div className="flex-grow p-2 overflow-y-auto">
        <div className="bg-blue-100 p-4 rounded-md mb-4 text-center">
          <p className="text-blue-800 text-lg font-semibold">Total Condomínio:</p>
          <p className="text-blue-900 text-2xl font-extrabold mt-1">
            {MonthlySummaryModel.formatCurrency(summaryData.total_condo_cost_rs)} | {MonthlySummaryModel.formatConsumption(summaryData.total_condo_consumption_m3)}
          </p>
        </div>

        <h3 className="text-md font-semibold text-blue-700 mb-3 border-b pb-2 border-blue-200">Consumos por Unidade:</h3>
        {summaryData.unit_details.length === 0 ? (
          <p className="text-slate-500 text-center">Nenhum dado de unidade disponível para este mês.</p>
        ) : (
          <ul className="space-y-2">
            {/* Cabeçalhos da tabela clicáveis para ordenação */}
            <li className="grid grid-cols-3 gap-1 items-center font-bold text-blue-700 mb-1">
              <button
                className="flex items-center bg-blue-100 p-2  shadow-sm hover:bg-blue-200 transition-colors cursor-pointer w-full text-left"
                onClick={() => onSortChange('display_name')}
              >
                Unidade
                {sortBy === 'display_name' && (sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}
              </button>
              <button
                className="flex items-center justify-end bg-blue-100 p-2  shadow-sm hover:bg-blue-200 transition-colors cursor-pointer w-full text-right"
                onClick={() => onSortChange('cost_rs')}
              >
                Custo
                {sortBy === 'cost_rs' && (sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}
              </button>
              <button
                className="flex items-center justify-end bg-blue-100 p-2  shadow-sm hover:bg-blue-200 transition-colors cursor-pointer w-full text-right"
                onClick={() => onSortChange('consumption_m3')}
              >
                Consumo
                {sortBy === 'consumption_m3' && (sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}
              </button>
            </li>

            {/* Itens da lista de unidades */}
            {summaryData.unit_details.map(unit => (
              <li key={unit.codigo_lote} className="grid grid-cols-3 gap-1 items-center">
                <span className="text-slate-700 bg-white p-1  shadow-sm">{unit.display_name}</span> {/* USANDO display_name */}
                <span className="text-slate-600 bg-white p-1  shadow-sm text-right">{MonthlySummaryModel.formatCurrency(unit.cost_rs)}</span>
                <span className="text-slate-600 bg-white p-1  shadow-sm text-right">{MonthlySummaryModel.formatConsumption(unit.consumption_m3)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MonthlySummaryPanel;
