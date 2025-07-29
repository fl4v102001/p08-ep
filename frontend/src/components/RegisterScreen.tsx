// frontend/src/components/RegisterScreen.tsx
import React, { useState } from 'react';

// Icone da gota de água, reutilizado
const WaterDropIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 5a1 1 0 011-1h4a1 1 0 110 2H9.5a.5.5 0 00-.4.8L12 10.5V13a1 1 0 11-2 0v-2.12l-2.29-2.29A.5.5 0 007.5 8H7a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;

interface RegisterScreenProps {
  onRegister: (nome: string, email: string, password: string, perfil: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  onGoToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onGoToLogin }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState('user'); // Valor padrão para perfil
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    const result = await onRegister(nome, email, password, perfil);

    if (result.success) {
      setMessage(result.message || "Usuário registrado com sucesso!");
      setIsError(false);
      // Opcional: Limpar formulário ou redirecionar para login
      setNome('');
      setEmail('');
      setPassword('');
      // onGoToLogin(); // Pode redirecionar automaticamente para o login
    } else {
      setMessage(result.error || "Falha no registro. Tente novamente.");
      setIsError(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <WaterDropIcon />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Criar Nova Conta</h2>
          <p className="mt-2 text-sm text-slate-600">Junte-se ao portal Condo Water</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input id="nome-usuario" name="nome_usuario" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Nome Completo" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <input id="email-address" name="email" type="email" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <input id="password" name="password" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {/* Opcional: Campo para Perfil, se não for padrão */}
            {/* <div>
              <select id="perfil" name="perfil" className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" value={perfil} onChange={(e) => setPerfil(e.target.value)}>
                <option value="user">Usuário Comum</option>
                <option value="admin">Administrador</option>
              </select>
            </div> */}
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <div>
            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              {isLoading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-slate-600">
          Já tem uma conta?{' '}
          <button onClick={onGoToLogin} className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors">
            Faça Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
