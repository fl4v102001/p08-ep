import React, { useState } from 'react';
import { Veiculo } from '../models/VeiculoModel';

interface VeiculoListProps {
    veiculos: Veiculo[];
    onEdit: (veiculo: Veiculo) => void;
    onDelete: (id: number) => void;
    onAdd: () => void; // Assuming an add function will be provided
}

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="grid grid-cols-[100px,1fr] py-2 border-b border-dotted border-slate-200">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="text-slate-500">{value}</span>
    </div>
);

const VeiculoList: React.FC<VeiculoListProps> = ({ veiculos, onEdit, onDelete, onAdd }) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleSelectVeiculo = (id: number) => {
        setSelectedId(selectedId === id ? null : id);
    };

    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Veículos da Unidade</h2>
                <button 
                    onClick={onAdd}
                    className="flex items-center bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar Veículo
                </button>
            </div>
            <div className="flex-grow overflow-y-auto">
                {veiculos.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">Nenhum veículo encontrado para esta unidade.</div>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {veiculos.map((veiculo) => (
                            <li key={veiculo.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleSelectVeiculo(veiculo.id)}>
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 mr-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M15.99 5H4.01C2.9 5 2 5.9 2 7v6c0 1.1.9 2 2.01 2H16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM4 7h12v6H4V7zm2 2a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-bold text-slate-700">{veiculo.placa}</span>
                                    </div>
                                </div>
                                {selectedId === veiculo.id && (
                                    <div className="p-4 pt-0 text-sm text-slate-600 animate-fade-in">
                                        <DetailRow label="Marca" value={veiculo.marca || 'N/A'}/>
                                        <DetailRow label="Modelo" value={veiculo.modelo || 'N/A'} />
                                        <DetailRow label="Cor" value={veiculo.cor || 'N/A'} />
                                        <DetailRow label="Tipo" value={veiculo.tipo || 'N/A'} />
                                        <div className="flex justify-end mt-4">
                                            <button onClick={(e) => { e.stopPropagation(); onEdit(veiculo); }} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Editar</button>
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(veiculo.id); }} className="text-sm font-semibold text-red-600 hover:text-red-800 ml-4">Excluir</button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default VeiculoList;