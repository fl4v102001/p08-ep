// frontend/src/components/BillDetails.tsx
import React from 'react';
import { WaterBill } from '../../types';
import { WaterBillModel } from '../models'; // Importa o modelo

interface BillDetailsProps {
  bills: WaterBill[];
  selectedBill: WaterBill | null;
  onSelectBill: (bill: WaterBill) => void;
}

const BillDetails: React.FC<BillDetailsProps> = ({ bills, selectedBill, onSelectBill }) => (
  <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
    <h2 className="text-lg font-bold text-slate-800 p-4 border-b">Detalhe da Conta de Água</h2>
    <div className="flex-grow overflow-y-auto">
      {bills.length === 0 ? (
        <div className="p-6 text-center text-slate-500">Selecione uma unidade para ver as contas.</div>
      ) : (
        <ul className="divide-y divide-slate-200">
          {bills.map(bill => (
            <li key={bill.id} className={`p-4 cursor-pointer hover:bg-slate-50 ${selectedBill?.id === bill.id ? 'bg-slate-100 border-l-4 border-blue-500' : ''}`} onClick={() => onSelectBill(bill)}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">{bill.data_display}</span>
                <span className={`font-bold text-lg ${selectedBill?.id === bill.id ? 'text-blue-600' : 'text-slate-800'}`}>
                  {WaterBillModel.formatCurrency(bill.total_conta_rs)} {/* Usando o modelo */}
                </span>
              </div>
              {selectedBill?.id === bill.id && (
                <div className="mt-4 space-y-2 text-sm text-slate-600 animate-fade-in">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <p>Consumo Água:</p><p className="font-medium text-right">{WaterBillModel.getTotalWaterConsumptionM3(bill)} m³</p> {/* Usando o modelo */}
                    <p>Custo Água:</p><p className="font-medium text-right">{WaterBillModel.formatCurrency(bill.cobrado_total_agua_rs)}</p> {/* Usando o modelo */}
                    <p>Consumo Esgoto:</p><p className="font-medium text-right">{bill.consumo_esgoto_m3} m³</p>
                    <p>Custo Esgoto:</p><p className="font-medium text-right">{WaterBillModel.formatCurrency(bill.total_esgoto_rs)}</p> {/* Usando o modelo */}
                    <p>Taxa Área Comum:</p><p className="font-medium text-right">{WaterBillModel.formatCurrency(bill.cobrado_area_comum_rs)}</p> {/* Usando o modelo */}
                    <p>Outros Gastos:</p><p className="font-medium text-right">{WaterBillModel.formatCurrency(bill.cobrado_outros_gastos_rs)}</p> {/* Usando o modelo */}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default BillDetails;
