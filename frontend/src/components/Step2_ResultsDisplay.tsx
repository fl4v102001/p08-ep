import React from 'react';
import { ProcessedResult } from './ProcessReading.state';

interface Step2Props {
  results: ProcessedResult[];
}

const Step2_ResultsDisplay: React.FC<Step2Props> = ({ results }) => {
  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
  
  return (
    <div className="col-span-3 flex flex-col overflow-y-auto">
      <div className="w-full flex-grow overflow-y-auto">
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,2fr] gap-x-4 sticky top-0 bg-slate-100 p-1 rounded-t-md border-b z-10 text-xs font-bold text-slate-600">
          <span>Unidade</span>
          <span className="text-right">Prod R$</span>
          <span className="text-right">Esgoto R$</span>
          <span className="text-right">Comp. R$</span>
          <span className="text-right">Outros R$</span>
          <span className="text-right">Total R$</span>
          <span>Mensagem</span>
        </div>
        <div className="divide-y divide-slate-200">
          {results.map(res => (
            <div key={res.codigo_lote} className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,2fr] py-1.5 items-center text-sm">
              <div className="text-slate-700 px-2">{res.nome_lote} ({res.codigo_lote})</div>
              <div className="text-slate-600 px-2 text-right">{formatCurrency(res.prod_rs)}</div>
              <div className="text-slate-600 px-2 text-right">{formatCurrency(res.esgoto_rs)}</div>
              <div className="text-slate-600 px-2 text-right">{formatCurrency(res.comp_rs)}</div>
              <div className="text-slate-600 px-2 text-right">{formatCurrency(res.outros_rs)}</div>
              <div className="text-slate-800 px-2 text-right font-bold">{formatCurrency(res.total_rs)}</div>
              <div className="text-slate-500 px-2 text-xs">{res.mensagem}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step2_ResultsDisplay;
