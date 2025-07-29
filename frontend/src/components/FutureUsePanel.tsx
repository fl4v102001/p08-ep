// frontend/src/components/FutureUsePanel.tsx
import React from 'react';

const FutureUsePanel: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-lg font-bold text-slate-800 p-4 border-b">Espaço Futuro</h2>
      <div className="flex-grow p-4 overflow-y-auto flex items-center justify-center">
          <div className="text-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" />
              </svg>
              <p className="font-medium">Este espaço está reservado para funcionalidades futuras.</p>
          </div>
      </div>
    </div>
  );

export default FutureUsePanel;
