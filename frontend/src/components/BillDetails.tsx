import React from 'react';
import { WaterBill } from '../../types';
import { WaterBillModel } from '../models';
import * as XLSX from 'xlsx';

interface BillDetailsProps {
  bills: WaterBill[];
  selectedBill: WaterBill | null;
  onSelectBill: (bill: WaterBill) => void;
}

const BillRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-[1fr,4fr] items-center py-2 border-b border-dotted border-slate-200">
    <span className="font-semibold text-slate-600">{label}</span>
    <div className="grid grid-cols-5 gap-2 text-sm text-slate-500 items-center">
      {children}
    </div>
  </div>
);

// NOVO: Componente para exibir a mensagem com estilo condicional
const MessagePanel: React.FC<{ message: string }> = ({ message }) => {
  if (!message) return null;

  let style = 'bg-blue-50 text-blue-800 border-blue-200'; // Padrão
  if (message.toLowerCase().includes('acima')) {
    style = 'bg-red-50 text-red-800 border-red-200';
  } else if (message.toLowerCase().includes('abaixo')) {
    style = 'bg-green-50 text-green-800 border-green-200';
  }

  return (
    <div className={`p-1 rounded-md border text-center my-4 font-medium ${style}`} style={{ marginTop: '0rem' }}>
      {message}
    </div>
  );
};


const BillDetails: React.FC<BillDetailsProps> = ({ bills, selectedBill, onSelectBill }) => {

  const handleExportXLSX = () => {
    if (bills.length === 0) {
      alert("Selecione uma unidade com contas disponíveis para exportar.");
      return;
    }

    const dataForSheet: (string | number | undefined)[][] = [];
    const tableHeader = ['Descrição', 'Consumo', 'Faixa', 'Tarifa / m³', 'Deduzir', 'Sub-Total'];

    bills.forEach(bill => {
      dataForSheet.push([`Detalhe da Conta de ${bill.codigo_lote} ${bill.data_display}`]);
      // ATUALIZADO: Adiciona a mensagem e comparações à exportação
      dataForSheet.push([`Consumo: ${bill.consumo_medido_m3} m³`, `Média: ${bill.mes_consumo_media_m3} m³`, `Mediana: ${bill.mes_consumo_mediana_m3} m³`]);
      dataForSheet.push([`Mensagem: ${bill.mes_mensagem}`]);
      dataForSheet.push([]); // Linha em branco
      dataForSheet.push(tableHeader);
      
      dataForSheet.push(['Esgoto', `${bill.consumo_esgoto_m3} m³`, bill.faixa_esgoto, bill.tarifa_esgoto, bill.deduzir_esgoto, bill.total_esgoto_rs]);
      dataForSheet.push(['Água Produzida', `${bill.consumo_produzido_m3} m³`, bill.faixa_agua, bill.tarifa_agua, bill.deduzir_agua, bill.cobrado_agua_prod_rs]);
      dataForSheet.push(['Água Comprada', `${bill.consumo_comprado_m3} m³`, '', bill.preco_m3_comprado_rs, '', bill.cobrado_agua_comp_rs]);
      dataForSheet.push(['Area Comum', '', '', '', '', bill.cobrado_area_comum_rs]);
      dataForSheet.push(['Outros Gastos', '', '', '', '', bill.cobrado_outros_gastos_rs]);
      dataForSheet.push(['Total Geral', '', '', '', '', bill.total_conta_rs]);
      dataForSheet.push([]);
      dataForSheet.push([]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(dataForSheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico de Contas');

    worksheet['!cols'] = [ { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
    const fileName = `historico-unidade-${bills[0].codigo_lote}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      <div className="p-2 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Detalhe da Conta de Água</h2>
        <button onClick={handleExportXLSX} disabled={bills.length === 0} className="flex items-center bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed">
          Exportar
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto">
        {bills.length === 0 ? (
          <div className="p-2 text-center text-slate-500">Selecione uma unidade para ver as contas.</div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {bills.map(bill => (
              <li key={bill.id} className={`cursor-pointer hover:bg-slate-50 ${selectedBill?.id === bill.id ? 'bg-slate-100' : ''}`} onClick={() => onSelectBill(bill)}>
                <div className="p-2 flex justify-between items-center">
                  <span className="font-bold text-slate-700">{bill.data_display}</span>
                  <span className={`font-bold text-lg ${selectedBill?.id === bill.id ? 'text-blue-600' : 'text-slate-800'}`}>
                    {WaterBillModel.formatCurrency(bill.total_conta_rs)}
                  </span>
                </div>
                {selectedBill?.id === bill.id && (
                  <div className="p-4 pt-0 text-sm text-slate-600 animate-fade-in">
                    {/* NOVO: Seção para Média e Mediana */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs p-1 bg-slate-50 rounded-md mb-4" style={{ marginBottom: '0rem' }}>
                        <div>Consumo do Mês: <span className="font-bold text-base text-slate-800">{selectedBill.consumo_medido_m3} m³</span></div>
                        <div>Média Mês: <span className="font-bold text-base text-slate-800">{selectedBill.mes_consumo_media_m3} m³</span></div>
                        <div>Mediana Mês: <span className="font-bold text-base text-slate-800">{selectedBill.mes_consumo_mediana_m3} m³</span></div>
                    </div>
                    
                    {/* NOVO: Painel de Mensagem */}
                    <MessagePanel message={selectedBill.mes_mensagem} />

                    <div>
                      <div className="grid grid-cols-[1fr,4fr] items-center mb-1">
                        <div></div>
                        <div className="grid grid-cols-5 gap-2 text-xs font-bold text-slate-400 text-right">
                          <span>Consumo</span>
                          <span>Faixa</span>
                          <span>Tarifa / m³</span>
                          <span>Deduzir</span>
                          <span>Sub-Total</span>
                        </div>
                      </div>
                      {/* ... (Restante do BillDetails sem alterações) */}
                      <BillRow label="Esgoto">
                        <span className="text-right">{selectedBill.consumo_esgoto_m3} m³</span>
                        <span className="text-right">{selectedBill.faixa_esgoto}</span>
                        <span className="text-right">{WaterBillModel.formatCurrency(selectedBill.tarifa_esgoto)}</span>
                        <span className="text-right">{WaterBillModel.formatCurrency(selectedBill.deduzir_esgoto)}</span>
                        <span className="text-right font-bold text-slate-800">{WaterBillModel.formatCurrency(selectedBill.total_esgoto_rs)}</span>
                      </BillRow>
                      <BillRow label="Água Produzida">
                        <span className="text-right">{selectedBill.consumo_produzido_m3} m³</span>
                        <span className="text-right">{selectedBill.faixa_agua}</span>
                        <span className="text-right">{WaterBillModel.formatCurrency(selectedBill.tarifa_agua)}</span>
                        <span className="text-right">{WaterBillModel.formatCurrency(selectedBill.deduzir_agua)}</span>
                        <span className="text-right font-bold text-slate-800">{WaterBillModel.formatCurrency(selectedBill.cobrado_agua_prod_rs)}</span>
                      </BillRow>
                      <BillRow label="Água Comprada">
                        <span className="text-right">{selectedBill.consumo_comprado_m3} m³</span>
                        <span className="text-right"></span>
                        <span className="text-right">{WaterBillModel.formatCurrency(selectedBill.preco_m3_comprado_rs)}</span>
                        <span className="text-right"></span>
                        <span className="text-right font-bold text-slate-800">{WaterBillModel.formatCurrency(selectedBill.cobrado_agua_comp_rs)}</span>
                      </BillRow>
                      <BillRow label="Area Comum">
                        <span className="col-span-5 text-right font-bold text-slate-800">{WaterBillModel.formatCurrency(selectedBill.cobrado_area_comum_rs)}</span>
                      </BillRow>
                      <BillRow label="Outros Gastos">
                        <span className="col-span-5 text-right font-bold text-slate-800">{WaterBillModel.formatCurrency(selectedBill.cobrado_outros_gastos_rs)}</span>
                      </BillRow>
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
};

export default BillDetails;
