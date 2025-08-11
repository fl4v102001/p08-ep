/**
 * Lida com a formatação de valores monetários para a aplicação.
 */

/**
 * Formata um valor numérico em Reais (R$).
 * Lida com valores nulos ou indefinidos, retornando um placeholder.
 * @param value O valor numérico a ser formatado.
 * @returns O valor formatado como string (ex: "R$ 10,50") ou "R$ -".
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return 'R$ -';
  }
  // Garante que o valor é tratado como número antes de chamar toFixed
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
};
