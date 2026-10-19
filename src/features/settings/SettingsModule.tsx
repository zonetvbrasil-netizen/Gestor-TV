import { useState } from 'react';
import {
  Settings,
  Building,
  Key,
  Shield,
  Users,
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { UserProfile, AuditLog } from '../../types/index.ts';

interface SettingsModuleProps {
  currentProfile: UserProfile;
  profiles: UserProfile[];
  auditLogs: AuditLog[];
  pixProviderType: 'mock' | 'mercadopago' | 'asaas';
  onUpdatePixProvider: (type: 'mock' | 'mercadopago' | 'asaas') => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export function SettingsModule({
  currentProfile,
  profiles,
  auditLogs,
  pixProviderType,
  onUpdatePixProvider,
  onUpdateProfile,
}: SettingsModuleProps) {
  const [activeTab, setActiveTab] = useState<'company' | 'pix' | 'users' | 'audit'>('company');

  // Form states
  const [companyName, setCompanyName] = useState(currentProfile.companyName || 'GestorTV Central');
  const [phone, setPhone] = useState(currentProfile.phone || '5511999991111');
  const [pixKey, setPixKey] = useState(currentProfile.pixKey || 'gestortv.admin@pix.com.br');
  const [pixKeyType, setPixKeyType] = useState(currentProfile.pixKeyType || 'email');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      companyName,
      phone,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSavePix = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      pixKey,
      pixKeyType,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          <span>Configurações do Sistema & Auditoria</span>
        </h2>
        <p className="text-xs text-slate-400">
          Gerenciamento da empresa, chaves de recebimento Pix, gateways plugáveis e controle de acesso
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Configurações salvas e aplicadas com sucesso!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('company')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'company'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Dados da Empresa</span>
        </button>

        <button
          onClick={() => setActiveTab('pix')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'pix'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Chave Pix & Gateway</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'users'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários & Permissões ({profiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'audit'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Logs de Auditoria ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab: Dados da Empresa */}
      {activeTab === 'company' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 max-w-xl shadow-xl">
          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome da Operação / Empresa
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: GestorTV Central"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp Oficial de Atendimento (com DDD)
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 5511999991111"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Este número aparece nas assinaturas de mensagens e comprovantes de suporte.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Dados</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Chave Pix & Gateway Plugável */}
      {activeTab === 'pix' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 max-w-2xl shadow-xl space-y-6">
          {/* Seletor de Provedor Plugável */}
          <div>
            <h3 className="font-bold text-sm text-slate-100 mb-2">Provedor de Pagamento Plugável</h3>
            <p className="text-xs text-slate-400 mb-4">
              Escolha o adaptador utilizado para geração de QR Code e confirmação automática de recebimento:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => onUpdatePixProvider('mock')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  pixProviderType === 'mock'
                    ? 'border-emerald-500 bg-emerald-950/30'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-xs text-emerald-400 block mb-1">
                  1. Simulador Pix (Mock)
                </span>
                <span className="text-[11px] text-slate-400">
                  Ideal para demonstração rápida com baixa em 1 clique.
                </span>
              </div>

              <div
                onClick={() => onUpdatePixProvider('mercadopago')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  pixProviderType === 'mercadopago'
                    ? 'border-blue-500 bg-blue-950/30'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-xs text-blue-400 block mb-1">
                  2. Mercado Pago
                </span>
                <span className="text-[11px] text-slate-400">
                  API oficial com webhook de baixa em tempo real.
                </span>
              </div>

              <div
                onClick={() => onUpdatePixProvider('asaas')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  pixProviderType === 'asaas'
                    ? 'border-purple-500 bg-purple-950/30'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-xs text-purple-400 block mb-1">
                  3. Asaas
                </span>
                <span className="text-[11px] text-slate-400">
                  Gateway especializado em cobranças recorrentes no Brasil.
                </span>
              </div>
            </div>
          </div>

          {/* Dados da Chave Pix */}
          <form onSubmit={handleSavePix} className="space-y-4 pt-4 border-t border-slate-800 text-xs sm:text-sm">
            <h3 className="font-bold text-sm text-slate-100">Chave Pix para Depósito Direto</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo da Chave Pix
                </label>
                <select
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone / Celular</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chave Pix *
                </label>
                <input
                  type="text"
                  required
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="Ex: gestortv.admin@pix.com.br"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Chave Pix</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Gestão de Usuários e Permissões RLS */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-100">Perfis de Usuário & Políticas de RLS</h3>
            <p className="text-xs text-slate-400">
              Cada perfil possui permissões estritas no banco de dados Supabase via Row Level Security:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-100">{p.fullName}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {p.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{p.email}</p>
                  <p className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    {p.role === 'admin'
                      ? 'Acesso total: visualiza e edita todos os clientes, planos, cupons, cobranças e logs.'
                      : p.role === 'reseller'
                      ? 'RLS Ativo: enxerga exclusivamente os clientes vinculados ao seu próprio id (user_id).'
                      : 'Suporte: acesso somente leitura aos clientes e gerenciamento de tickets de atendimento.'}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                  ID: <span className="font-mono text-[10px]">{p.id.slice(0, 18)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Logs de Auditoria */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Registro de Auditoria de Ações do Sistema
            </h3>
            <span className="text-xs text-slate-500">{auditLogs.length} eventos registrados</span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[60vh] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 text-xs hover:bg-slate-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{log.action}</span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      {log.resourceType}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                </div>

                <div className="text-[11px] text-slate-500 sm:text-right shrink-0">
                  <span className="block text-slate-300 font-medium">{log.userName}</span>
                  <span className="font-mono text-[10px]">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
