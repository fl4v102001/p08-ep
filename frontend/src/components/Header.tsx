// frontend/src/components/Header.tsx
import React from 'react';

// --- SVG ICONS ---
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const WaterDropIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 5a1 1 0 011-1h4a1 1 0 110 2H9.5a.5.5 0 00-.4.8L12 10.5V13a1 1 0 11-2 0v-2.12l-2.29-2.29A.5.5 0 007.5 8H7a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;

// A interface que define quais 'props' o componente espera.
// O nome da prop deve ser escrito exatamente como aqui.
interface HeaderProps {
  onLogout: () => void;
  userName: string;
  userProfile: string;
  onOpenReadings: () => void;
}

// Ao desestruturar as props, o nome 'onOpenReadings' deve ser idêntico
// ao definido na interface acima (com 'R' maiúsculo).
const Header: React.FC<HeaderProps> = ({ onLogout, userName, userProfile, onOpenReadings }) => (
  <header className="bg-white shadow-md p-4 flex justify-between items-center">
    <div className="flex items-center space-x-3">
      <WaterDropIcon />
      <h1 className="text-2xl font-bold text-slate-800">Condo Water</h1>
    </div>
    <nav className="flex items-center space-x-6">
      <a href="#" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Home</a>
      
      {/* O nome da prop no onClick deve ser o mesmo recebido pelo componente. */}
      <button onClick={onOpenReadings} className="text-slate-600 hover:text-blue-600 font-medium">
        Leituras
      </button>

      <a href="#" className="text-slate-600 hover:text-blue-600 font-medium">Configuração</a>
    </nav>
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="font-semibold text-slate-700">Bem-vindo, {userName}</p>
        <p className="text-sm text-slate-500">Perfil de {userProfile}</p>
      </div>
      <div className="relative group">
        <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
          <UserCircleIcon />
        </button>
        <div className="absolute right-0 top-full w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
          <button
            onClick={onLogout}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
