// frontend/src/models/MonthlySummaryModel.ts
import { MonthlySummary } from '../../types';

/**
 * Funções de lógica de negócios para o modelo MonthlySummary.
 * Estes são exemplos e podem ser expandidos conforme necessário.
 */
export class MonthlySummaryModel {
  /**
   * Formata um valor monetário em Reais (R$).
   * @param value O valor numérico.
   * @returns O valor formatado como string.
   */
  static formatCurrency(value: number): string {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }

  /**
   * Formata o consumo em metros cúbicos (m³).
   * @param value O valor numérico.
   * @returns O consumo formatado como string.
   */
  static formatConsumption(value: number): string {
    return `${value} m³`;
  }

  // Você pode adicionar mais funções aqui, como cálculos de média, comparações, etc.
}
