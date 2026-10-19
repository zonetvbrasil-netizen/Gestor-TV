import { Tv, Sun, Moon, Shield, UserCheck, RefreshCw, FileText } from 'lucide-react';
import { UserProfile } from '../types/index.ts';

interface NavbarProps {
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (id: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenNewCustomer: () => void;
  onOpenLgpd: () => void;
  onResetData: () => void;
}

export function Navbar({
  currentProfile,
  profiles,
  onSelectProfile,
  isDarkMode,
  onToggleTheme,
  onOpenNewCustomer,
  onOpenLgpd,
  onResetData,
}: NavbarProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-medium">Administrador</span>;
      case 'reseller':
        return <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">Revendedor (RLS Ativo)</span>;
      case 'attendant':
        return <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">Atendente Suporte</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
          <Tv className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-1.5">
              Gestor<span className="text-blue-500 font-extrabold">TV</span>
            </h1>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-semibold">
              CRM PWA
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-400 leading-none">
            Gestão de Assinaturas & Cobrança Recorrente
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Seletor de Perfil (Admin / Revendedor / Atendente) para testar RLS */}
        <div className="relative flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/80">
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline text-slate-400">Perfil:</span>
            <select
              aria-label="Alternar perfil de usuário"
              value={currentProfile.id}
              onChange={(e) => onSelectProfile(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer pr-1"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.fullName} ({p.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block ml-1">
            {getRoleBadge(currentProfile.role)}
          </div>
        </div>

        {/* Botão LGPD */}
        <button
          onClick={onOpenLgpd}
          title="Conformidade LGPD & Privacidade"
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors"
        >
          <Shield className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Reset Mock Seed Data */}
        <button
          onClick={onResetData}
          title="Restaurar dados iniciais (30 clientes fictícios)"
          className="hidden sm:flex items-center gap-1 text-xs px-2.5 py-2 text-slate-400 hover:text-slate-100 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden xl:inline">Restaurar Seed</span>
        </button>

        {/* Novo Cliente CTA */}
        <button
          onClick={onOpenNewCustomer}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <span className="text-base font-bold leading-none">+</span>
          <span className="hidden sm:inline">Novo Cliente</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>
    </header>
  );
}
