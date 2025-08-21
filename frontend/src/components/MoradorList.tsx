import React, { useState } from 'react';
import { Morador } from '../models';

interface MoradorListProps {
  moradores: Morador[];
}

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="grid grid-cols-[100px,1fr] py-2 border-b border-dotted border-slate-200">
    <span className="font-semibold text-slate-600">{label}</span>
    <span className="text-slate-500">{value}</span>
  </div>
);

const MoradorList: React.FC<MoradorListProps> = ({ moradores }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelectMorador = (id: number) => {
    setSelectedId(selectedId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Moradores da Unidade</h2>
        <button className="flex items-center bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Morador
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {moradores.length === 0 ? (
          <div className="p-4 text-center text-slate-500">Nenhum morador encontrado para esta unidade.</div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {moradores.map((morador) => (
              <li key={morador.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleSelectMorador(morador.id)}>
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 mr-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-slate-700">{morador.nome}</span>
                  </div>
                  {morador.contato_principal && (
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Principal</span>
                  )}
                </div>
                {selectedId === morador.id && (
                  <div className="p-4 pt-0 text-sm text-slate-600 animate-fade-in">
                    <DetailRow label="Email" value={morador.email} />
                    <DetailRow label="Telefone 1" value={morador.fone1} />
                    <DetailRow label="Telefone 2" value={morador.fone2 || 'Não informado'} />
                    <DetailRow label="CPF" value={morador.cpf ? morador.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4") : 'Não informado'} />
                    <div className="flex justify-end mt-4">
                      <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">Editar</button>
                      <button className="text-sm font-semibold text-red-600 hover:text-red-800 ml-4">Excluir</button>
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

export default MoradorList;
