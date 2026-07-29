import React, { useState } from 'react';
import { Lock, LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (token: string) => void;
  apiBase: string;
}

export function Login({ onLogin, apiBase }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        onLogin(data.token);
      } else {
        setError(data.error || 'Mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-[#EBE9E1]">
        {/* Header Section */}
        <div className="bg-[#344E41] px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="w-16 h-16 bg-[#A3B18A]/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-[#A3B18A]/30">
            <Lock className="w-8 h-8 text-[#E9EDC9]" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#E9EDC9] mb-2 tracking-tight">
            Accès Sécurisé
          </h1>
          <p className="text-[#A3B18A] text-sm font-medium">
            Agri-Report Administration
          </p>
        </div>

        {/* Form Section */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#5A6352] uppercase tracking-wider mb-2">
                Mot de passe Administrateur
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full pl-4 pr-10 py-3 bg-[#F7F6F2] border-2 border-[#EBE9E1] rounded-xl text-lg font-medium text-[#344E41] focus:outline-none focus:border-[#A3B18A] transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-[#5A6352] hover:bg-[#344E41] text-[#E9EDC9] font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Se connecter</span>
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
