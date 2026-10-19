import { Shield, Lock, FileDown, CheckCircle, X } from 'lucide-react';
import { Customer } from '../types/index.ts';

interface LgpdModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onExportAll: () => void;
}

export function LgpdModal({ isOpen, onClose, customers, onExportAll }: LgpdModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Conformidade com a LGPD</h2>
              <p className="text-xs text-slate-400">Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-5 text-sm text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-200 text-xs sm:text-sm">Tratamento Seguro de Dados Pessoais</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Os dados cadastrais coletados (Nome, WhatsApp, E-mail e Cidade) são utilizados exclusivamente para execução de contrato, faturamento recorrente via Pix e suporte técnico às telas contratadas.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Direitos do Titular no GestorTV (Art. 18 LGPD)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <span className="font-semibold text-slate-200 block mb-1">1. Confirmação e Acesso</span>
                <span className="text-slate-400">Visualização completa do perfil e histórico na tela de Clientes.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <span className="font-semibold text-slate-200 block mb-1">2. Portabilidade dos Dados</span>
                <span className="text-slate-400">Exportação em formato JSON aberto a qualquer momento.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <span className="font-semibold text-slate-200 block mb-1">3. Direito ao Esquecimento</span>
                <span className="text-slate-400">Anonimização irreversível dos dados sensíveis do cliente.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <span className="font-semibold text-slate-200 block mb-1">4. Revogação de Consentimento</span>
                <span className="text-slate-400">Registro com carimbo de data e hora do aceite do titular.</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Consentimento Ativo de Todos os Clientes</span>
            </div>
            <p className="text-[11px] text-emerald-300/80">
              Todos os {customers.length} clientes na sua base possuem flag de consentimento ativa registrada na criação da conta com data e hora.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={onExportAll}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <FileDown className="w-4 h-4 text-blue-400" />
            <span>Exportar Base em JSON (Art. 18, V)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
