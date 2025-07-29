// frontend/src/containers/AppContainer.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Unit, WaterBill } from '../../types';
import { fetchUnits, fetchBillsForUnit, generateUnitReportPdf } from '../services/apiService'; // Importar generateUnitReportPdf
import { UnitList, BillDetails, MonthlySummaryPanel, FutureUsePanel } from '../components'; // Importa componentes de apresentação
import MonthlySummaryContainer from './MonthlySummaryContainer'; // Importa o container do resumo mensal
import { getYearMonthFromDate } from '../utils/dateUtils'; // Importa utilitário de data

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
    setError(null); // Limpa erros anteriores ao selecionar nova unidade

    // Verifica cache primeiro
    if (allBills.has(unit.codigo_lote)) {
      const billsForUnit = allBills.get(unit.codigo_lote) || [];
      setSelectedBill(billsForUnit[0] || null);
      return;
    }

    // Se não estiver no cache, busca da API
    setIsDataLoading(true);
    try {
      const billsForUnit: WaterBill[] = await fetchBillsForUnit(unit.codigo_lote);
      setAllBills(prev => new Map(prev).set(unit.codigo_lote, billsForUnit));
      setSelectedBill(billsForUnit[0] || null);
    } catch (err) {
      console.error("Erro ao buscar contas:", err);
      setError("Não foi possível carregar as contas para esta unidade.");
      setSelectedBill(null); // Limpa a conta em caso de erro
    } finally {
      setIsDataLoading(false);
    }
  }, [allBills]);

  // useEffect para carregar dados iniciais APENAS UMA VEZ na montagem
  useEffect(() => {
    const loadInitialData = async () => {
      setIsDataLoading(true);
      setError(null);
      try {
        const fetchedUnits: Unit[] = await fetchUnits();
        setUnits(fetchedUnits);
        
        // Auto-seleciona a primeira unidade SOMENTE SE NENHUMA UNIDADE ESTIVER SELECIONADA
        if (fetchedUnits.length > 0 && selectedUnit === null) {
          const firstUnit = fetchedUnits[0];
          setSelectedUnit(firstUnit); // Define a unidade selecionada
          
          // Busca as contas para a primeira unidade diretamente aqui
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
    
    // Este efeito deve ser executado apenas uma vez na montagem do componente
    loadInitialData();
  }, []); // Dependência vazia para executar apenas uma vez

  const handleSelectBill = useCallback((bill: WaterBill) => {
    setSelectedBill(bill);
  }, []);

  // Nova função para gerar o relatório PDF
  const handleGenerateReport = useCallback(async (codigoLote: number) => {
    if (!selectedBill) {
      alert("Por favor, selecione uma conta para definir o mês de referência do relatório.");
      return;
    }

    // Usa o mês da conta selecionada como referência para o relatório
    const dataRefMes = getYearMonthFromDate(selectedBill.data_ref);
    if (!dataRefMes) {
      alert("Não foi possível determinar o mês de referência da conta selecionada.");
      return;
    }

    try {
      // Exemplo de feedback visual durante o carregamento
      // Você pode adicionar um estado de loading aqui para o botão ou uma mensagem global
      console.log(`Gerando relatório para unidade ${codigoLote} no mês ${dataRefMes}...`);
      
      const pdfBlob = await generateUnitReportPdf(codigoLote, dataRefMes);
      
      // Cria uma URL para o Blob e abre em uma nova aba
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url); // Libera o objeto URL

      console.log("Relatório gerado com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar relatório:", err);
      // Exibe um alerta ou mensagem de erro para o usuário
      alert(`Erro ao gerar relatório: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [selectedBill]); // Depende de selectedBill para obter a data de referência

  const billsForSelectedUnit = useMemo(() => {
    if (!selectedUnit) return [];
    return allBills.get(selectedUnit.codigo_lote) || [];
  }, [selectedUnit, allBills]);

  return (
    <main className="flex-grow p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-10 gap-6 overflow-hidden">
      {isDataLoading ? (
        <div className="lg:col-span-10 flex justify-center items-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600 font-medium">Carregando dados do servidor...</p>
          </div>
        </div>
      ) : error ? (
        <div className="lg:col-span-10 flex justify-center items-center p-4 text-red-600 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="lg:col-span-2 h-full overflow-hidden">
            <UnitList units={units} selectedUnit={selectedUnit} onSelectUnit={handleSelectUnit} onGenerateReport={handleGenerateReport} /> {/* Passa a nova prop */}
          </div>

          <div className="lg:col-span-4 h-full overflow-hidden">
            <BillDetails bills={billsForSelectedUnit} selectedBill={selectedBill} onSelectBill={handleSelectBill} />
          </div>

          <div className="lg:col-span-4 h-full overflow-hidden">
            {selectedBill ? (
              <MonthlySummaryContainer selectedBillDateRef={selectedBill.data_ref} />
            ) : (
              <FutureUsePanel />
            )}
          </div>
        </>
      )}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
};

export default AppContainer;
