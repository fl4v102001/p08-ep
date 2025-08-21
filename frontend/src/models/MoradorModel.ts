// frontend/src/models/MoradorModel.ts
export interface Morador {
  id: number;
  created_at: string;
  codigo_lote: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  fone1: string;
  fone2: string;
  contato_principal: boolean;
  email: string;
  nome_lote: string;
  fone3: string;
}
