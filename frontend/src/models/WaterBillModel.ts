// frontend/src/models/WaterBillModel.ts
import { WaterBill } from '../../types';

/**
 * Funções de lógica de negócios para o modelo WaterBill.
 * Estes são exemplos e podem ser expandidos conforme necessário.
 */
export class WaterBillModel {
  /**
   * Calcula o consumo total de água (produzida + comprada) em m³.
   * @param bill O objeto WaterBill.
   * @returns O consumo total de água em m³.
   */
  static getTotalWaterConsumptionM3(bill: WaterBill): number {
    return (bill.consumo_produzido_m3 || 0) + (bill.consumo_comprado_m3 || 0);
  }

  /**
   * Formata um valor monetário em Reais (R$).
   * @param value O valor numérico.
   * @returns O valor formatado como string.
   */
  static formatCurrency(value: number): string {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }

  // Você pode adicionar mais funções aqui, como cálculos de impostos, análises, etc.
}
