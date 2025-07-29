// frontend/src/hooks/useAuth.ts
import { useState, useCallback, useEffect } from 'react';
import { loginUser, registerUser } from '../services/apiService'; // Importa funções de API

interface UserProfile {
  id: number;
  nome_usuario: string;
  email_usuario: string;
  perfil_usuario: string;
}

/**
 * Hook customizado para gerenciar o estado de autenticação e dados do usuário.
 */
export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Efeito para carregar token e usuário do localStorage na inicialização
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setAuthToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Erro ao parsear dados do usuário do localStorage:", e);
        logout(); // Limpa dados inválidos
      }
    }
    setIsLoadingAuth(false); // Autenticação inicial concluída
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const response = await loginUser(email, password);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setAuthToken(response.token);
      setUser(response.user);
      setIsLoggedIn(true);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido no login.";
      setAuthError(errorMessage);
      console.error("Erro no login:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const register = useCallback(async (nome: string, email: string, password: string, perfil: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const response = await registerUser(nome, email, password, perfil);
      // Após o registro, pode-se logar automaticamente ou redirecionar para a tela de login
      // Para este plano, vamos apenas retornar o sucesso
      return { success: true, message: response.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido no registro.";
      setAuthError(errorMessage);
      console.error("Erro no registro:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setAuthError(null);
  }, []);

  return { isLoggedIn, authToken, user, authError, isLoadingAuth, login, register, logout };
};
