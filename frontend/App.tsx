// frontend/App.tsx
import React, { useState } from 'react';
import { LoginScreen, Header, RegisterScreen, ProcessReadingModal } from './src/components';
import AppContainer from './src/conteiners/AppContainer';
import PainelContainer from './src/conteiners/PainelContainer'; // Importa o novo container
import { useAuth } from './src/hooks/useAuth';

// Define os tipos para as visões possíveis
type ActiveView = 'home' | 'painel';

function App() {
  const { isLoggedIn, login, register, logout, isLoadingAuth, user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [isReadingModalOpen, setReadingModalOpen] = useState(false);
  
  // Estado para controlar a visão ativa na navegação principal
  const [activeView, setActiveView] = useState<ActiveView>('home');

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <p className="ml-4 text-slate-600 font-medium">Verificando autenticação...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (showRegister) {
      return <RegisterScreen onRegister={register} onGoToLogin={() => setShowRegister(false)} />;
    }
    return <LoginScreen onLogin={login} onGoToRegister={() => setShowRegister(true)} />;
  }

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header
        onLogout={logout}
        userName={user?.nome_usuario || 'Utilizador'}
        userProfile={user?.perfil_usuario || 'Padrão'}
        onOpenReadings={() => setReadingModalOpen(true)}
        activeView={activeView} // Passa a visão ativa
        onNavigate={setActiveView} // Passa a função para mudar a visão
      />
      
      {/* Renderização condicional baseada na visão ativa */}
      {activeView === 'home' && <AppContainer onLogout={logout} />}
      {activeView === 'painel' && <PainelContainer />}

      <ProcessReadingModal 
        isOpen={isReadingModalOpen}
        onClose={() => setReadingModalOpen(false)}
      />
    </div>
  );
}

export default App;