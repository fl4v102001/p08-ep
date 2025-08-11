// frontend/src/models/MonthlySummaryModel.ts
import { MonthlySummary } from '../../types';

/**
 * Funções de lógica de negócios para o modelo MonthlySummary.
 * Estes são exemplos e podem ser expandidos conforme necessário.
 */
export class MonthlySummaryModel {
  /**
   * Formata o consumo em metros cúbicos (m³).
   * @param value O valor numérico.
   * @returns O consumo formatado como string.
   */
  static formatConsumption(value: number): string {
    return `${value} m³`;
  }

  // A função formatCurrency foi removida daqui e centralizada em monetaryUtils.ts
}
