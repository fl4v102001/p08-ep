// frontend/src/containers/MonthlySummaryContainer.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { MonthlySummary } from '../../types';
import { getMonthlySummary } from '../services/apiService';
import { MonthlySummaryPanel } from '../components';
import { getYearMonthFromDate } from '../utils/dateUtils';

interface MonthlySummaryContainerProps {
  selectedBillDateRef: string;
}

const MonthlySummaryContainer: React.FC<MonthlySummaryContainerProps> = ({ selectedBillDateRef }) => {
  const [summaryData, setSummaryData] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('consumption_m3'); // Estado para a coluna de ordenação (padrão)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Estado para a ordem de ordenação (padrão)

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const yearMonth = getYearMonthFromDate(selectedBillDateRef);
      if (yearMonth) {
        // Passa os parâmetros de ordenação para a API
        const data = await getMonthlySummary(yearMonth, sortBy, sortOrder);
        setSummaryData(data);
      } else {
        setSummaryData(null);
      }
    } catch (err) {
      console.error("Erro ao buscar resumo mensal:", err);
      setError("Não foi possível carregar o resumo mensal. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedBillDateRef, sortBy, sortOrder]); // Dependências: re-executa ao mudar data, sortBy ou sortOrder

  useEffect(() => {
    if (selectedBillDateRef) {
      fetchSummary();
    } else {
      setSummaryData(null);
      setIsLoading(false);
    }
  }, [selectedBillDateRef, fetchSummary]); // fetchSummary agora é uma dependência

  // Função para lidar com a mudança de ordenação
  const handleSortChange = useCallback((columnKey: string) => {
    if (columnKey === sortBy) {
      // Se a mesma coluna for clicada, inverte a ordem
      setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      // Se uma nova coluna for clicada, define como ascendente
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  }, [sortBy]);

  return (
    <MonthlySummaryPanel
      summaryData={summaryData}
      isLoading={isLoading}
      error={error}
      onSortChange={handleSortChange} // Passa a função de callback
      sortBy={sortBy} // Passa a coluna atual de ordenação
      sortOrder={sortOrder} // Passa a ordem atual de ordenação
    />
  );
};

export default MonthlySummaryContainer;
