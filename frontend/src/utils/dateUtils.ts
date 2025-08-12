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
  return formatted.toUpperCase();
};

/**
 * Converte uma string de data do CSV (DD/MM/YYYY, DD/MM/YY, ou com HH:mm) para o formato ISO 8601 (YYYY-MM-DDTHH:mm:ss).
 * Se a hora for omitida, assume-se 00:00:00.
 * @param csvDateTime A string de data e hora do CSV.
 * @returns A data no formato ISO 8601 ou null se o formato for inválido.
 */
export const parseCsvDateTimeToISO = (csvDateTime: string | null | undefined): string | null => {
  if (!csvDateTime) {
    return null;
  }
 
  const parts = csvDateTime.trim().split(' ');
  const datePart = parts[0];
  const timePart = parts.length > 1 ? parts[1] : null;
 
  // Valida se o formato tem mais partes que o esperado (data e hora)
  if (parts.length > 2) {
    console.warn("Formato de data e hora inválido (partes em excesso):", csvDateTime);
    return null;
  }
 
  // Valida e extrai a parte da data
  const [day, month, yearStr] = datePart.split('/');
  if (!day || !month || !yearStr) {
    console.warn("Formato de data incompleto (esperado DD/MM/YYYY ou DD/MM/YY):", datePart);
    return null;
  }
 
  let year: number;
  if (yearStr.length === 4) {
    year = parseInt(yearStr, 10);
  } else if (yearStr.length === 2) {
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    year = parseInt(yearStr, 10) + currentCentury;
    // Heurística para adivinhar o século: se o ano de 2 dígitos resultar em uma data
    // mais de 50 anos no futuro, assume-se que é do século passado.
    if (year > currentYear + 50) {
      year -= 100;
    }
  } else {
    console.warn("Formato de ano inválido (esperado YYYY ou YY):", yearStr);
    return null;
  }

  let hours = '00';
  let minutes = '00';
 
  // Valida e extrai a parte da hora, se existir
  if (timePart) {
    const timeComponents = timePart.split(':');
    if (timeComponents.length !== 2) {
      console.warn("Formato de hora inválido (esperado HH:mm):", timePart);
      return null;
    }
    [hours, minutes] = timeComponents;
  }
 
  return `${year.toString()}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
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
