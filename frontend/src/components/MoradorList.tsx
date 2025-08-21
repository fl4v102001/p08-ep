import React from 'react';
import { Morador } from '../models';

interface MoradorListProps {
  moradores: Morador[];
}

const MoradorList: React.FC<MoradorListProps> = ({ moradores }) => {
  return (
    <div>
      <h5>Moradores</h5>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Principal</th>
          </tr>
        </thead>
        <tbody>
          {moradores.map((morador) => (
            <tr key={morador.id}>
              <td>{morador.nome}</td>
              <td>{morador.email}</td>
              <td>{morador.fone1}</td>
              <td>{morador.contato_principal ? 'Sim' : 'Não'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MoradorList;
