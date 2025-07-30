// frontend/App.tsx
import React, { useState } from 'react';
// Certifique-se de que ProcessReadingModal está sendo exportado de 'src/components/index.ts'
// e importado aqui.
import { LoginScreen, Header, RegisterScreen, ProcessReadingModal } from './src/components';
import AppContainer from './src/conteiners/AppContainer';
import { useAuth } from './src/hooks/useAuth';

function App() {
  const { isLoggedIn, login, register, logout, isLoadingAuth, user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  
  // 1. ADICIONADO: Estado para controlar a visibilidade do modal
  const [isReadingModalOpen, setReadingModalOpen] = useState(false);

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
      {/* 2. ALTERADO: O componente Header agora recebe a prop 'onOpenReadings' */}
      <Header
        onLogout={logout}
        userName={user?.nome_usuario || 'Utilizador'}
        userProfile={user?.perfil_usuario || 'Padrão'}
        onOpenReadings={() => setReadingModalOpen(true)}
      />
      <AppContainer onLogout={logout} />

      {/* 3. ADICIONADO: O modal é renderizado aqui, controlado pelo estado */}
      <ProcessReadingModal 
        isOpen={isReadingModalOpen}
        onClose={() => setReadingModalOpen(false)}
      />
    </div>
  );
}

export default App;
