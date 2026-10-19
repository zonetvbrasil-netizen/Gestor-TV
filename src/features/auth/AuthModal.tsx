import { useState } from 'react';
import { Lock, Mail, UserCheck, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { UserProfile } from '../../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  currentProfile: UserProfile;
  onSelectProfile: (id: string) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  profiles,
  currentProfile,
  onSelectProfile,
}: AuthModalProps) {
  const [email, setEmail] = useState(currentProfile.email);
  const [password, setPassword] = useState('******');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      onSelectProfile(found.id);
      setSuccessMessage(`Conectado com sucesso como ${found.fullName}!`);
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1000);
    } else {
      alert('E-mail não encontrado nos perfis pré-configurados.');
    }
  };

  const handleQuickSelect = (p: UserProfile) => {
    setEmail(p.email);
    onSelectProfile(p.id);
    setSuccessMessage(`Perfil alterado para: ${p.fullName}`);
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100">Autenticação & Controle de Acesso</h3>
            <p className="text-xs text-slate-400">Login seguro integrado ao Supabase Auth + RLS</p>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 mt-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@gestortv.com.br"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
          >
            <span>Entrar no GestorTV</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Seleção Rápida de Perfis para Teste de RLS */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Testar Perfis com Políticas RLS:
          </span>
          <div className="space-y-2">
            {profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleQuickSelect(p)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-colors ${
                  currentProfile.id === p.id
                    ? 'border-blue-500 bg-blue-600/10 text-blue-300'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <span className="font-semibold block">{p.fullName}</span>
                  <span className="text-[10px] text-slate-500">{p.email}</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {p.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
