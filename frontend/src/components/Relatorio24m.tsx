import React, { useState, useEffect } from 'react';
import { getRelatorio24m } from '../services/apiService';
import { Relatorio24mModel } from '../models';

export const Relatorio24m: React.FC = () => {
  const [relatorios, setRelatorios] = useState<Relatorio24mModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatorios = async () => {
      try {
        const data = await getRelatorio24m();
        setRelatorios(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorios();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  const months = Array.from({ length: 24 }, (_, i) => `mes${String(i + 1).padStart(2, '0')}`).reverse();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Relatório 24 Meses</h1>
      <div className="w-full">
        <table className="w-full bg-white border border-gray-200 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-1 border-b">Lote</th>
              {months.map(monthKey => (
                <th key={monthKey} className="py-2 px-1 border-b">
                  {relatorios[0]?.[`${monthKey}_data_display` as keyof Relatorio24mModel] || monthKey}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {relatorios.map(relatorio => (
              <tr key={relatorio.codigo_lote} className="hover:bg-gray-50">
                <td className="py-2 px-1 border-b text-center">{relatorio.codigo_lote}</td>
                {months.map(monthKey => (
                  <td key={`${relatorio.codigo_lote}-${monthKey}`} className="py-2 px-1 border-b align-top">
                    <div className="text-center">
                      {relatorio[`${monthKey}_consumo` as keyof Relatorio24mModel]}
                    </div>
                    <div className="text-center text-gray-600">
                      {(() => {
                        const cost = relatorio[`${monthKey}_total_conta` as keyof Relatorio24mModel];
                        if (cost === null || typeof cost === 'undefined') {
                          return '';
                        }
                        return `R$ ${Math.round(Number(cost))}`;
                      })()}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
