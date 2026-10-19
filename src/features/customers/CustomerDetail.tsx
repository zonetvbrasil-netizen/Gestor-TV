import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MessageCircle,
  Tv,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  QrCode,
  FileDown,
  Trash2,
  ShieldCheck,
  Edit,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Customer, Plan, Invoice, Ticket } from '../../types/index.ts';
import { formatBRL, formatPhoneBR } from '../../utils/rules.ts';
import { createWhatsAppWebLink } from '../../services/whatsapp.ts';

interface CustomerDetailProps {
  customer: Customer;
  plan?: Plan;
  invoices: Invoice[];
  tickets: Ticket[];
  onBack: () => void;
  onEdit: (customer: Customer) => void;
  onRenew: (customerId: string) => void;
  onOpenPix: (invoice: Invoice) => void;
  onCreateInvoice: (customerId: string, planId: string) => void;
  onAnonymize: (customerId: string) => void;
  onDelete: (customerId: string) => void;
}

export function CustomerDetail({
  customer,
  plan,
  invoices,
  tickets,
  onBack,
  onEdit,
  onRenew,
  onOpenPix,
  onCreateInvoice,
  onAnonymize,
  onDelete,
}: CustomerDetailProps) {
  const [activeTab, setActiveTab] = useState<'billing' | 'tickets' | 'devices' | 'lgpd'>('billing');
  const [renewing, setRenewing] = useState(false);

  const getStatusBadge = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">Ativo</span>;
      case 'expiring':
        return <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">Vencendo</span>;
      case 'expired':
        return <span className="px-2.5 py-1 text-xs rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">Vencido</span>;
      case 'suspended':
        return <span className="px-2.5 py-1 text-xs rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">Suspenso</span>;
      case 'trial':
        return <span className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">Em Teste</span>;
    }
  };

  const handleRenewClick = () => {
    setRenewing(true);
    setTimeout(() => {
      onRenew(customer.id);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}
      setRenewing(false);
    }, 400);
  };

  // Exportar dados cadastrais do titular (Art. 18 LGPD)
  const handleExportJson = () => {
    const titularData = {
      gestorTvLgpdExport: true,
      exportTimestamp: new Date().toISOString(),
      cliente: customer,
      plano: plan,
      historicoFaturas: invoices,
      historicoAtendimentos: tickets,
    };

    const blob = new Blob([JSON.stringify(titularData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titular_lgpd_${customer.id}_${customer.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const latestPendingInvoice = invoices.find((i) => i.status === 'pending' || i.status === 'overdue');

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de Clientes</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onEdit(customer)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>

          <a
            href={createWhatsAppWebLink(
              customer.whatsapp,
              `Olá ${customer.name}! Aqui é do suporte do GestorTV. Como posso lhe ajudar hoje?`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Conversar no WhatsApp</span>
          </a>

          {/* BOTÃO RENOVAR COM 1 CLIQUE */}
          <button
            onClick={handleRenewClick}
            disabled={renewing}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${renewing ? 'animate-spin' : ''}`} />
            <span>{renewing ? 'Renovando...' : 'Renovar com 1 Clique'}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 md:p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold text-slate-100">{customer.name}</h2>
              {getStatusBadge(customer.status)}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>{customer.city}</span>
              <span>•</span>
              <span>WhatsApp: {formatPhoneBR(customer.whatsapp)}</span>
              {customer.email && (
                <>
                  <span>•</span>
                  <span>{customer.email}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div>
              <span className="text-[11px] text-slate-400 block">Vencimento Atual</span>
              <span className="text-base font-bold text-slate-100 font-mono">
                {customer.dueDate.split('-').reverse().join('/')}
              </span>
            </div>
            <div className="border-l border-slate-700 pl-4">
              <span className="text-[11px] text-slate-400 block">Plano & Telas</span>
              <span className="text-xs font-semibold text-blue-400">
                {plan?.name || 'Start'} ({customer.screens} {customer.screens > 1 ? 'Telas' : 'Tela'})
              </span>
            </div>
          </div>
        </div>

        {/* Quick details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div>
            <span className="text-slate-400 block">Data de Início:</span>
            <span className="font-semibold text-slate-200 font-mono">
              {customer.startDate.split('-').reverse().join('/')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Mensalidade:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              {plan ? formatBRL(plan.price) : 'R$ 34,90'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Dispositivos:</span>
            <span className="font-semibold text-slate-200">
              {customer.devices?.length || 0} cadastrados
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Consentimento LGPD:</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Ativo
            </span>
          </div>
        </div>

        {customer.notes && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-slate-400 block mb-0.5">Observações Internas:</span>
            {customer.notes}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'billing'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Faturas & Cobranças ({invoices.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'tickets'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Atendimentos & Suporte ({tickets.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'devices'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Telas & Dispositivos ({customer.devices?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('lgpd')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'lgpd'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>LGPD & Titular</span>
        </button>
      </div>

      {/* Tab: Faturas & Cobranças */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Histórico Financeiro</h3>
            <button
              onClick={() => onCreateInvoice(customer.id, customer.planId)}
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
            >
              + Gerar Nova Fatura
            </button>
          </div>

          {invoices.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-500">
              Nenhuma fatura registrada para este cliente.
            </div>
          ) : (
            <div className="space-y-2.5">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/60 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {inv.status === 'paid' ? <CheckCircle className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{formatBRL(inv.finalAmount)}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            inv.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {inv.status === 'paid' ? 'PAGO' : inv.status === 'overdue' ? 'VENCIDO' : 'PENDENTE'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Vencimento: {inv.dueDate.split('-').reverse().join('/')} • Método: {inv.paymentMethod.toUpperCase()}
                        {inv.paidAt && ` • Pago em: ${new Date(inv.paidAt).toLocaleDateString('pt-BR')}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {inv.status !== 'paid' ? (
                      <button
                        onClick={() => onOpenPix(inv)}
                        className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Ver Pix / Baixa</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Baixa Concluída
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Atendimentos & Suporte */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Chamados e Ocorrências</h3>
          {tickets.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-500">
              Nenhum chamado aberto para este cliente. Tudo funcionando perfeitamente!
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm text-slate-100">{ticket.title}</h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{ticket.description}</p>
                  <div className="border-t border-slate-800/80 pt-2 space-y-1.5">
                    {ticket.messages.map((m) => (
                      <div key={m.id} className="text-[11px] text-slate-300 bg-slate-950/40 p-2 rounded-lg">
                        <span className="font-semibold text-blue-400">{m.senderName}: </span>
                        <span>{m.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Telas & Dispositivos */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">
              Dispositivos Cadastrados para Reprodução:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {customer.devices && customer.devices.length > 0 ? (
                customer.devices.map((device, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 text-xs text-slate-200"
                  >
                    <Tv className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{device}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Nenhum dispositivo informado.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: LGPD & Direitos do Titular */}
      {activeTab === 'lgpd' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Gestão de Privacidade & Titularidade (LGPD)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Atenda às solicitações do titular conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Portabilidade */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <h5 className="font-semibold text-xs text-slate-200 mb-1">Portabilidade de Dados (Art. 18, V)</h5>
                <p className="text-[11px] text-slate-400 mb-3">
                  Exporte o prontuário completo do cliente em formato legível JSON.
                </p>
                <button
                  onClick={handleExportJson}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-blue-400" />
                  <span>Baixar Arquivo JSON do Titular</span>
                </button>
              </div>

              {/* Direito ao Esquecimento / Anonimização */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40">
                <h5 className="font-semibold text-xs text-red-300 mb-1">Direito ao Esquecimento (Art. 18, VI)</h5>
                <p className="text-[11px] text-slate-400 mb-3">
                  Anonimiza permanentemente nome, telefone e e-mail mantendo histórico fiscal anônimo.
                </p>
                <button
                  onClick={() => {
                    if (confirm(`Confirma a anonimização irreversível dos dados de ${customer.name}?`)) {
                      onAnonymize(customer.id);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg border border-red-500/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Anonimizar Dados Pessoais</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
