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

/**
 * Converte uma string de data e hora do CSV (DD/MM/YYYY HH:mm) para o formato ISO 8601 (YYYY-MM-DDTHH:mm:ss).
 * @param csvDateTime A string de data e hora do CSV.
 * @returns A data no formato ISO 8601 ou null se o formato for inválido.
 */
export const parseCsvDateTimeToISO = (csvDateTime: string | null | undefined): string | null => {
  if (!csvDateTime) {
    return null;
  }

  // Ex: "18/07/2025 08:08"
  const parts = csvDateTime.trim().split(' ');
  if (parts.length !== 2) {
    console.warn("Formato de data e hora inválido (esperado 'DD/MM/YYYY HH:mm'):", csvDateTime);
    return null;
  }

  const [datePart, timePart] = parts;
  const [day, month, year] = datePart.split('/');
  const [hours, minutes] = timePart.split(':');

  // Validação da estrutura
  if (!day || !month || !year || year.length !== 4 || !hours || !minutes) {
    console.warn("Componentes de data/hora inválidos ou ausentes:", csvDateTime);
    return null;
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
};

/**
 * Formata uma string de data ISO 8601 para um formato amigável (DD/MM/YYYY HH:mm).
 * @param isoString A string de data no formato ISO.
 * @returns A data formatada ou uma string vazia se a entrada for inválida.
 */
export const formatIsoToFriendlyDateTime = (isoString: string | null | undefined): string => {
  if (!isoString) {
    return '';
  }

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é base 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Erro ao formatar data ISO:", isoString, error);
    return '';
  }
};
