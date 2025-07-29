// frontend/App.tsx
import React, { useState } from 'react';
import { LoginScreen, Header, RegisterScreen } from './src/components';
import AppContainer from './src/conteiners/AppContainer';
import { useAuth } from './src/hooks/useAuth';

function App() {
  const { isLoggedIn, login, register, logout, isLoadingAuth, user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

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
      />
      <AppContainer onLogout={logout} />
    </div>
  );
}

export default App;
