// frontend/src/models/UnitModel.ts
import { Unit } from '../../types';

/**
 * Funções de lógica de negócios para o modelo Unit.
 * Estes são exemplos e podem ser expandidos conforme necessário.
 */
export class UnitModel {
  /**
   * Retorna o nome formatado da unidade.
   * @param unit O objeto Unit.
   * @returns O nome formatado da unidade.
   */
  static getFormattedName(unit: Unit): string {
    return `Unidade: ${unit.nome_lote} (Código: ${unit.codigo_lote})`;
  }

  // Você pode adicionar mais funções aqui, como validações, transformações, etc.
}
