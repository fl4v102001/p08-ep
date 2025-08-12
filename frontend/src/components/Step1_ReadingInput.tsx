import React from 'react';
import { ModalState, ModalAction, ProductionData } from './ProcessReading.state';

interface Step1Props {
  state: ModalState;
  dispatch: React.Dispatch<ModalAction>;
}

const Step1_ReadingInput: React.FC<Step1Props> = ({ state, dispatch }) => {
  const handleProductionDataChange = (field: keyof Omit<ProductionData, 'total_consumo_m3' | 'media_m3' | 'mediana_m3'>, value: string) => {
    const payload = (field === 'data_ref') ? { [field]: value || null } : { [field]: value === '' ? null : parseFloat(value.replace(',', '.')) };
    dispatch({ type: 'UPDATE_PRODUCTION_DATA', payload });
  };

  const handleReadingChange = (codigo_lote: number, field: 'leitura_atual' | 'consumo', value: string) => {
    const updatedReadings = new Map(state.newReadings);
    const currentReading = updatedReadings.get(codigo_lote);
    if (!currentReading) return;
    const numericValue = value === '' ? null : parseFloat(value);
    if (field === 'leitura_atual') currentReading.leitura_atual = numericValue;
    else currentReading.consumo = numericValue;
    updatedReadings.set(codigo_lote, { ...currentReading });
    dispatch({ type: 'UPDATE_NEW_READINGS', payload: updatedReadings });
  };

  const getInputStyles = (consumo: number | null, leitura_atual: number | null): string => {
    const base = "w-full p-1 border rounded-md focus:ring-2 text-sm";
    if (consumo === null || leitura_atual === null || consumo < 0 || leitura_atual === 0) return `${base} bg-red-50 border-red-400 text-red-800 focus:ring-red-500`;
    if (consumo === 0) return `${base} bg-yellow-50 border-yellow-400 text-yellow-800 focus:ring-yellow-500`;
    return `${base} bg-violet-50 border-gray-300 focus:ring-violet-400`;
  };

  if (state.isLoading) {
    return <div className="col-span-3 flex justify-center items-center h-full"><p>A carregar...</p></div>;
  }

  if (state.error && state.latestReadings.length === 0) {
    return <div className="col-span-3 flex justify-center items-center h-full text-red-600"><p>{state.error}</p></div>;
  }

  return (
    <div className="col-span-3 flex flex-col overflow-y-auto">
      <div className="mb-2 p-1 border rounded-lg bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
          <div><label className="block text-xs font-medium text-slate-700 mb-1">Data Referência</label><input type="text" value={state.productionData.data_ref ?? ''} className="w-full p-1 border rounded-md text-sm bg-slate-200" disabled /></div>
          <div><label className="block text-xs font-medium text-slate-700 mb-1">Produção m³</label><input type="number" value={state.productionData.producao_m3 ?? ''} onChange={(e) => handleProductionDataChange('producao_m3', e.target.value)} className="w-full p-1 border rounded-md text-sm" /></div>
          <div><label className="block text-xs font-medium text-slate-700 mb-1">Compra Água R$</label><input type="number" value={state.productionData.compra_rs ?? ''} onChange={(e) => handleProductionDataChange('compra_rs', e.target.value)} className="w-full p-1 border rounded-md text-sm" /></div>
          <div><label className="block text-xs font-medium text-slate-700 mb-1">Outros Gastos R$</label><input type="number" value={state.productionData.outros_rs ?? ''} onChange={(e) => handleProductionDataChange('outros_rs', e.target.value)} className="w-full p-1 border rounded-md text-sm" /></div>
          <div><label className="block text-xs font-medium text-slate-700 mb-1">Total m³</label><input type="number" value={state.productionData.total_consumo_m3 ?? ''} className="w-full p-1 border rounded-md bg-slate-200 text-sm" disabled /></div>
          <div><label className="block text-xs font-medium text-slate-700 mb-1">Média m³</label><input type="number" value={state.productionData.media_m3 ?? ''} className="w-full p-1 border rounded-md bg-slate-200 text-sm" disabled /></div>
          <div><label className="block text-xs font-medium text-slate-700 mb-1">Mediana m³</label><input type="number" value={state.productionData.mediana_m3 ?? ''} className="w-full p-1 border rounded-md bg-slate-200 text-sm" disabled /></div>
        </div>
      </div>
      <div className="w-full flex-grow overflow-y-auto">
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,3fr] gap-x-2 sticky top-0 bg-slate-100 p-1 rounded-t-md border-b z-10 text-xs font-bold text-slate-600">
          <span>Unidade</span><span>Leitura Anterior</span><span>Data Leitura Atual</span><span>Leitura Atual</span><span>Consumo</span><span>Mensagem</span>
        </div>
        <div className="divide-y divide-slate-200">
          {state.latestReadings.map(unit => {
            const currentReading = state.newReadings.get(unit.codigo_lote);
            return (
              <div key={unit.codigo_lote} className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,3fr] py-0.5 items-center text-sm">
                <div className="text-slate-700 px-2">{unit.nome_lote} ({unit.codigo_lote})</div>
                <div className="text-slate-500 px-2">{unit.leitura_anterior}</div>
                <div className="px-1"><input type="text" value={currentReading?.data_leitura_atual || ''} className="w-full p-1 border rounded-md bg-slate-100 text-slate-500 text-sm" disabled /></div>
                <div className="px-1"><input type="number" value={currentReading?.leitura_atual ?? ''} onChange={(e) => handleReadingChange(unit.codigo_lote, 'leitura_atual', e.target.value)} className={getInputStyles(currentReading?.consumo ?? null, currentReading?.leitura_atual ?? null)} placeholder="0" /></div>
                <div className="px-1"><input type="number" value={currentReading?.consumo ?? ''} onChange={(e) => handleReadingChange(unit.codigo_lote, 'consumo', e.target.value)} className={getInputStyles(currentReading?.consumo ?? null, currentReading?.leitura_atual ?? null)} placeholder="0" /></div>
                <div className="px-1"><input type="text" value={currentReading?.mes_mensagem || ''} className="w-full p-1.5 border rounded-md bg-slate-100 text-slate-500 text-xs" disabled /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Step1_ReadingInput;
