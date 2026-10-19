import { useState, useMemo } from 'react';
import {
  CreditCard,
  QrCode,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Zap,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Invoice, Customer, Plan } from '../../types/index.ts';
import { formatBRL } from '../../utils/rules.ts';

interface BillingModuleProps {
  invoices: Invoice[];
  customers: Customer[];
  plans: Plan[];
  pixProviderType: 'mock' | 'mercadopago' | 'asaas';
  onOpenPixModal: (invoice: Invoice) => void;
  onCreateInvoice: (customerId: string, planId: string, couponCode?: string) => void;
  onPayInvoice: (invoiceId: string, method: 'pix' | 'manual_cash' | 'manual_transfer', isWebhook: boolean) => void;
}

export function BillingModule({
  invoices,
  customers,
  plans,
  pixProviderType,
  onOpenPixModal,
  onCreateInvoice,
  onPayInvoice,
}: BillingModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [couponCode, setCouponCode] = useState('');

  // Totais
  const stats = useMemo(() => {
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    invoices.forEach((inv) => {
      if (inv.status === 'paid') totalPaid += inv.finalAmount;
      if (inv.status === 'pending') totalPending += inv.finalAmount;
      if (inv.status === 'overdue') totalOverdue += inv.finalAmount;
    });

    return { totalPaid, totalPending, totalOverdue };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const customer = customers.find((c) => c.id === inv.customerId);
      const name = customer ? customer.name : inv.customerName || '';
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, customers, searchTerm, statusFilter]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedPlanId) return;

    onCreateInvoice(selectedCustomerId, selectedPlanId, couponCode);
    setIsNewInvoiceOpen(false);
    setCouponCode('');
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> PAGO
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> PENDENTE
          </span>
        );
      case 'overdue':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> VENCIDO
          </span>
        );
      case 'canceled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400">
            CANCELADO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>Cobranças & Pagamentos Pix</span>
          </h2>
          <p className="text-xs text-slate-400">
            Provedor Ativo: <span className="font-semibold text-blue-400 uppercase">{pixProviderType}</span> (Webhook de baixa e renovação automática)
          </p>
        </div>

        <button
          onClick={() => {
            if (customers.length > 0) {
              setSelectedCustomerId(customers[0].id);
              setSelectedPlanId(customers[0].planId || plans[0]?.id || 'p1');
            }
            setIsNewInvoiceOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Gerar Nova Cobrança</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Receita Confirmada</span>
          <span className="text-2xl font-extrabold text-emerald-400">
            {formatBRL(stats.totalPaid)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Faturas baixadas no período</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">A Receber (Pendentes)</span>
          <span className="text-2xl font-extrabold text-amber-300">
            {formatBRL(stats.totalPending)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Aguardando compensação Pix</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Inadimplência (Vencidas)</span>
          <span className="text-2xl font-extrabold text-red-400">
            {formatBRL(stats.totalOverdue)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Cobrança pendente D+</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar fatura por cliente ou ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">Todas as Cobranças</option>
          <option value="pending">Apenas Pendentes</option>
          <option value="paid">Apenas Pagas</option>
          <option value="overdue">Apenas Vencidas</option>
        </select>
      </div>

      {/* Invoices List / Cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="divide-y divide-slate-800/80">
          {filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhuma fatura encontrada.
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const customer = customers.find((c) => c.id === inv.customerId);
              const customerName = customer ? customer.name : inv.customerName || 'Cliente';
              return (
                <div
                  key={inv.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-100">{customerName}</span>
                        {getStatusBadge(inv.status)}
                      </div>

                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>Plano: {inv.planName || 'TV Mensal'}</span>
                        <span>•</span>
                        <span>Vencimento: {inv.dueDate.split('-').reverse().join('/')}</span>
                        {inv.discountAmount > 0 && (
                          <span className="text-emerald-400">
                            (Desconto: {formatBRL(inv.discountAmount)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block sm:hidden">Valor:</span>
                      <span className="text-base font-extrabold text-slate-100 font-mono">
                        {formatBRL(inv.finalAmount)}
                      </span>
                    </div>

                    {inv.status !== 'paid' ? (
                      <button
                        onClick={() => onOpenPixModal(inv)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all active:scale-95"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Abrir Pix</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Baixada
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Nova Cobrança */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="font-bold text-base text-slate-100 border-b border-slate-800 pb-3">
              Gerar Nova Cobrança Pix
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Selecione o Cliente *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    const cust = customers.find((c) => c.id === e.target.value);
                    if (cust?.planId) setSelectedPlanId(cust.planId);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Plano / Valor *
                </label>
                <select
                  required
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatBRL(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cupom de Desconto (opcional)
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Ex: BEMVINDO10 ou PIX15"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs uppercase focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                >
                  Emitir Cobrança Pix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
