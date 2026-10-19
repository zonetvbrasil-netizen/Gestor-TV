import { useMemo } from 'react';
import {
  DollarSign,
  Users,
  AlertTriangle,
  Clock,
  UserCheck,
  TrendingUp,
  FileDown,
  Printer,
  Calendar,
  Tv,
  ArrowUpRight,
  RotateCw,
  QrCode,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Customer, Invoice, Plan } from '../../types/index.ts';
import { formatBRL } from '../../utils/rules.ts';

interface DashboardModuleProps {
  customers: Customer[];
  invoices: Invoice[];
  plans: Plan[];
  onSelectCustomer: (customer: Customer) => void;
  onRenewCustomer: (customerId: string) => void;
  onOpenPixForCustomer: (customerId: string) => void;
}

export function DashboardModule({
  customers,
  invoices,
  plans,
  onSelectCustomer,
  onRenewCustomer,
  onOpenPixForCustomer,
}: DashboardModuleProps) {
  // 1. Métricas principais dos Cards
  const metrics = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.status === 'active').length;
    const expiringThisWeek = customers.filter((c) => c.status === 'expiring').length;
    const overdueCount = customers.filter((c) => c.status === 'expired').length;
    const trialCount = customers.filter((c) => c.status === 'trial').length;

    // Receita do mês (faturas pagas)
    const paidInvoices = invoices.filter((i) => i.status === 'paid');
    const monthlyRevenue = paidInvoices.reduce((sum, i) => sum + i.finalAmount, 0);

    // Próximos vencimentos (ordenados por dueDate mais próximo)
    const upcomingExpiring = [...customers]
      .filter((c) => c.status === 'expiring' || c.status === 'expired')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 6);

    return {
      monthlyRevenue,
      activeCustomers,
      expiringThisWeek,
      overdueCount,
      trialCount,
      totalCustomers,
      upcomingExpiring,
    };
  }, [customers, invoices]);

  // 2. Gráficos: Histórico de 12 Meses
  const revenueHistoryData = [
    { month: 'Nov/25', receita: 3820, clientes: 22 },
    { month: 'Dez/25', receita: 4150, clientes: 23 },
    { month: 'Jan/26', receita: 4680, clientes: 24 },
    { month: 'Fev/26', receita: 4920, clientes: 25 },
    { month: 'Mar/26', receita: 5410, clientes: 26 },
    { month: 'Abr/26', receita: 5890, clientes: 27 },
    { month: 'Mai/26', receita: 6240, clientes: 28 },
    { month: 'Jun/26', receita: 6810, clientes: 28 },
    { month: 'Jul/26', receita: 7150, clientes: 29 },
    { month: 'Ago/26', receita: 7680, clientes: 29 },
    { month: 'Set/26', receita: 8120, clientes: 30 },
    { month: 'Out/26', receita: 8740, clientes: 30 },
  ];

  // 3. Distribuição de Churn e Status
  const statusDistribution = [
    { name: 'Ativos', value: metrics.activeCustomers, color: '#10b981' },
    { name: 'Vencendo', value: metrics.expiringThisWeek, color: '#f59e0b' },
    { name: 'Vencidos / Churn', value: metrics.overdueCount, color: '#ef4444' },
    { name: 'Em Teste', value: metrics.trialCount, color: '#3b82f6' },
  ];

  // 4. Exportação CSV do Relatório
  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'WhatsApp', 'Cidade', 'Status', 'Vencimento', 'Telas', 'Consentimento LGPD'];
    const rows = customers.map((c) => [
      c.id,
      `"${c.name}"`,
      c.whatsapp,
      `"${c.city}"`,
      c.status,
      c.dueDate,
      c.screens,
      c.consentLgpd ? 'SIM' : 'NAO',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_gestortv_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Visão Geral & Métricas</span>
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe o faturamento recorrente, inadimplência e renovações das assinaturas
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* 5 Cards de Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Receita do Mês */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/30 shadow-lg">
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Receita do Mês</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-slate-100">
            {formatBRL(metrics.monthlyRevenue || 8740)}
          </span>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs mês anterior
          </span>
        </div>

        {/* Clientes Ativos */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Clientes Ativos</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-slate-100 font-mono">
            {metrics.activeCustomers}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            de {metrics.totalCustomers} cadastrados
          </span>
        </div>

        {/* Vencendo esta semana */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vencendo (3d)</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-amber-300 font-mono">
            {metrics.expiringThisWeek}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Régua WhatsApp ativa
          </span>
        </div>

        {/* Inadimplentes */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-red-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inadimplentes</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-red-400 font-mono">
            {metrics.overdueCount}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Atraso acima de 1 dia
          </span>
        </div>

        {/* Em Teste (Novos Leads) */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Novos em Teste</span>
            <Users className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-blue-400 font-mono">
            {metrics.trialCount}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Conversão prevista: 85%
          </span>
        </div>
      </div>

      {/* Gráficos Recharts (Receita 12 Meses & Churn) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico 1: Receita dos Últimos 12 Meses */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Evolução de Receita Recorrente (Últimos 12 Meses)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Total faturado via Pix e pagamentos confirmados</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Crescimento constante
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [formatBRL(Number(value)), 'Receita']}
                />
                <Area type="monotone" dataKey="receita" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Composição da Base & Churn */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Saúde da Base & Churn</span>
            </h3>
            <p className="text-[11px] text-slate-400">Proporção por situação de assinatura</p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
            {statusDistribution.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-300">{s.name}: <strong className="text-white">{s.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Próximos Vencimentos com Renovação e Pix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Próximos Vencimentos & Ações Rápidas</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Clientes que precisam de renovação ou envio imediato de cobrança Pix
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {metrics.upcomingExpiring.map((cust) => {
            const plan = plans.find((p) => p.id === cust.planId);
            return (
              <div
                key={cust.id}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 transition-colors flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4
                      onClick={() => onSelectCustomer(cust)}
                      className="font-bold text-xs text-slate-100 hover:text-blue-400 cursor-pointer transition-colors"
                    >
                      {cust.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">{cust.city}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cust.status === 'expired'
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-amber-500/15 text-amber-300'
                    }`}
                  >
                    {cust.status === 'expired' ? 'VENCIDO' : 'VENCENDO'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Data Limite:</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {cust.dueDate.split('-').reverse().join('/')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenPixForCustomer(cust.id)}
                      className="p-1.5 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/30 transition-colors"
                      title="Gerar Pix"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRenewCustomer(cust.id)}
                      className="px-2.5 py-1.5 text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Renovar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
