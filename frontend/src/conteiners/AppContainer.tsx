// frontend/src/containers/AppContainer.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Unit, WaterBill } from '../../types';
import { fetchUnits, fetchBillsForUnit, generateUnitReportPdf } from '../services/apiService';
import { UnitList, BillDetails, FutureUsePanel } from '../components';
import MonthlySummaryContainer from './MonthlySummaryContainer';
import { getYearMonthFromDate } from '../utils/dateUtils';

interface AppContainerProps {
  onLogout: () => void;
}

const AppContainer: React.FC<AppContainerProps> = ({ onLogout }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [allBills, setAllBills] = useState<Map<number, WaterBill[]>>(new Map());

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedBill, setSelectedBill] = useState<WaterBill | null>(null);

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectUnit = useCallback(async (unit: Unit) => {
    setSelectedUnit(unit);
    setError(null);

    if (allBills.has(unit.codigo_lote)) {
      const billsForUnit = allBills.get(unit.codigo_lote) || [];
      setSelectedBill(billsForUnit[0] || null);
      return;
    }

    setIsDataLoading(true);
    try {
      const billsForUnit: WaterBill[] = await fetchBillsForUnit(unit.codigo_lote);
      setAllBills(prev => new Map(prev).set(unit.codigo_lote, billsForUnit));
      setSelectedBill(billsForUnit[0] || null);
    } catch (err) {
      console.error("Erro ao buscar contas:", err);
      setError("Não foi possível carregar as contas para esta unidade.");
      setSelectedBill(null);
    } finally {
      setIsDataLoading(false);
    }
  }, [allBills]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsDataLoading(true);
      setError(null);
      try {
        const fetchedUnits: Unit[] = await fetchUnits();
        setUnits(fetchedUnits);
        
        if (fetchedUnits.length > 0 && selectedUnit === null) {
          const firstUnit = fetchedUnits[0];
          setSelectedUnit(firstUnit);
          
          const billsForFirstUnit: WaterBill[] = await fetchBillsForUnit(firstUnit.codigo_lote);
          setAllBills(prev => new Map(prev).set(firstUnit.codigo_lote, billsForFirstUnit));
          setSelectedBill(billsForFirstUnit[0] || null);
        }
      } catch (err) {
        console.error("Erro ao buscar dados iniciais:", err);
        setError("Não foi possível carregar as unidades. Verifique a conexão com o backend.");
      } finally {
        setIsDataLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const handleSelectBill = useCallback((bill: WaterBill) => {
    setSelectedBill(bill);
  }, []);

  const handleGenerateReport = useCallback(async (codigoLote: number) => {
    if (!selectedBill) {
      alert("Por favor, selecione uma conta para definir o mês de referência do relatório.");
      return;
    }

    const dataRefMes = getYearMonthFromDate(selectedBill.data_ref);
    if (!dataRefMes) {
      alert("Não foi possível determinar o mês de referência da conta selecionada.");
      return;
    }

    try {
      console.log(`Gerando relatório para unidade ${codigoLote} no mês ${dataRefMes}...`);
      
      const pdfBlob = await generateUnitReportPdf(codigoLote, dataRefMes);
      
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);

      console.log("Relatório gerado com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar relatório:", err);
      alert(`Erro ao gerar relatório: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [selectedBill]);

  const billsForSelectedUnit = useMemo(() => {
    if (!selectedUnit) return [];
    return allBills.get(selectedUnit.codigo_lote) || [];
  }, [selectedUnit, allBills]);

  return (
    // ETAPA 1: A grade principal agora tem 12 colunas
    <main className="flex-grow p-2 lg:p-3 grid grid-cols-1 lg:grid-cols-12 gap-2 overflow-hidden">
      {isDataLoading ? (
        <div className="lg:col-span-12 flex justify-center items-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600 font-medium">Carregando dados do servidor...</p>
          </div>
        </div>
      ) : error ? (
        <div className="lg:col-span-12 flex justify-center items-center p-4 text-red-600 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* ETAPA 2 e 3: Redistribuição do espaço e renderização lado a lado */}

          {/* Painel 1: UnitList (O mais estreito) */}
          <div className="lg:col-span-2 h-full overflow-hidden">
            <UnitList units={units} selectedUnit={selectedUnit} onSelectUnit={handleSelectUnit} onGenerateReport={handleGenerateReport} />
          </div>

          {/* Painel 2: BillDetails (O segundo mais estreito) */}
          <div className="lg:col-span-4 h-full overflow-hidden">
            <BillDetails bills={billsForSelectedUnit} selectedBill={selectedBill} onSelectBill={handleSelectBill} />
          </div>

          {/* Painel 3: MonthlySummaryPanel (Renderização condicional) */}
          <div className="lg:col-span-3 h-full overflow-hidden">
            {selectedBill ? (
              <MonthlySummaryContainer selectedBillDateRef={selectedBill.data_ref} />
            ) : (
              <div className="bg-white rounded-lg shadow-md h-full flex items-center justify-center p-4 text-slate-500 text-center">
                  <p>Selecione uma conta para ver o resumo mensal.</p>
              </div>
            )}
          </div>

          {/* Painel 4: FutureUsePanel (Sempre visível) */}
          <div className="lg:col-span-3 h-full overflow-hidden">
             <FutureUsePanel />
          </div>
        </>
      )}
    </main>
  );
};

export default AppContainer;