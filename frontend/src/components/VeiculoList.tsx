
import React from 'react';
import { Veiculo } from '../models/VeiculoModel';

interface VeiculoListProps {
    veiculos: Veiculo[];
    onEdit: (veiculo: Veiculo) => void;
    onDelete: (id: number) => void;
}

const VeiculoList: React.FC<VeiculoListProps> = ({ veiculos, onEdit, onDelete }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Placa</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                {veiculos.map(veiculo => (
                    <tr key={veiculo.id}>
                        <td>{veiculo.placa}</td>
                        <td>{veiculo.marca}</td>
                        <td>{veiculo.modelo}</td>
                        <td>
                            <button onClick={() => onEdit(veiculo)}>Editar</button>
                            <button onClick={() => onDelete(veiculo.id)}>Deletar</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default VeiculoList;
