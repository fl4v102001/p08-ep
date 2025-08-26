import React from 'react';
import { Relatorio24m } from '../components';

const PainelContainer: React.FC = () => {
  return (
    <div className="flex-grow p-4 lg:p-6 bg-slate-50">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Painel de Controle</h2>
        <p className="text-slate-600">Esta área está em desenvolvimento e será usada para futuros dashboards e configurações.</p>
      </div>
      <div className="mt-6">
        <Relatorio24m />
      </div>
    </div>
  );
};

export default PainelContainer;
