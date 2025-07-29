// frontend/src/utils/dateUtils.ts

/**
 * Extrai o ano e o mês de uma string de data no formato YYYY-MM-DD.
 * @param dateString A string de data (ex: "2025-07-01").
 * @returns Uma string no formato "YYYY-MM" (ex: "2025-07").
 */
export const getYearMonthFromDate = (dateString: string): string => {
  if (!dateString || dateString.length < 7) {
    console.warn("Formato de data inválido para getYearMonthFromDate:", dateString);
    return ""; // Retorna string vazia ou lança erro, dependendo da sua estratégia
  }
  return dateString.substring(0, 7);
};

/**
 * Formata um objeto Date para uma string no formato "Mês-Ano" em português.
 * @param date O objeto Date.
 * @returns A data formatada (ex: "Julho-2025").
 */
export const formatMonthYear = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
  const formatted = new Intl.DateTimeFormat('pt-BR', options).format(date);
  // Capitaliza a primeira letra do mês
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};
