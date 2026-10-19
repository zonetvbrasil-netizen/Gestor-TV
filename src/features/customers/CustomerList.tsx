import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Tv,
  Calendar,
  MessageCircle,
  RotateCw,
  QrCode,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Customer, Plan, CustomerStatus, Invoice } from '../../types/index.ts';
import { formatBRL, formatPhoneBR } from '../../utils/rules.ts';
import { createWhatsAppWebLink } from '../../services/whatsapp.ts';

interface CustomerListProps {
  customers: Customer[];
  plans: Plan[];
  invoices: Invoice[];
  onSelectCustomer: (customer: Customer) => void;
  onNewCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onRenewCustomer: (customerId: string) => void;
  onOpenPixForCustomer: (customerId: string) => void;
}

const ITEMS_PER_PAGE = 8;

export function CustomerList({
  customers,
  plans,
  invoices,
  onSelectCustomer,
  onNewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onRenewCustomer,
  onOpenPixForCustomer,
}: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Lista única de cidades para o filtro
  const cities = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set).sort();
  }, [customers]);

  // Filtros aplicados
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Busca por nome, whatsapp, email ou notas
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.whatsapp.includes(searchTerm) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.city.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por status
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      // Filtro por plano
      const matchesPlan = planFilter === 'all' || c.planId === planFilter;

      // Filtro por cidade
      const matchesCity = cityFilter === 'all' || c.city === cityFilter;

      return matchesSearch && matchesStatus && matchesPlan && matchesCity;
    });
  }, [customers, searchTerm, statusFilter, planFilter, cityFilter]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  const handleRenew = (customerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRenewCustomer(customerId);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {}
  };

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Ativo
          </span>
        );
      case 'expiring':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Vencendo
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Vencido
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Suspenso
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Em Teste
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Gestão de Clientes</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono border border-slate-700">
              {filteredCustomers.length} de {customers.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Controle de vencimentos, telas ativas e renovação em 1 clique
          </p>
        </div>

        <button
          onClick={onNewCustomer}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-98"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Campo Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nome, WhatsApp, cidade ou e-mail..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filtros em Linha */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status */}
            <select
              aria-label="Filtrar por status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="expiring">Vencendo (até 3 dias)</option>
              <option value="expired">Vencido</option>
              <option value="trial">Em Teste</option>
              <option value="suspended">Suspenso</option>
            </select>

            {/* Plano */}
            <select
              aria-label="Filtrar por plano"
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todos os Planos</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Cidade */}
            <select
              aria-label="Filtrar por cidade"
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="hidden lg:block bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todas as Cidades</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela Responsiva Desktop & Cards Mobile */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        {/* Visualização em Tabela para Desktop (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Plano / Telas</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Nenhum cliente encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => {
                  const plan = plans.find((p) => p.id === c.planId);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCustomer(c)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {c.city}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {getStatusBadge(c.status)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-slate-200 font-medium">{plan?.name || 'Start'}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Tv className="w-3 h-3 text-blue-400" />
                          <span>{c.screens} {c.screens > 1 ? 'telas' : 'tela'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-mono font-medium text-slate-200">
                          {c.dueDate.split('-').reverse().join('/')}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <a
                          href={createWhatsAppWebLink(c.whatsapp, `Olá ${c.name}, mensagem da GestorTV.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 font-mono transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{formatPhoneBR(c.whatsapp)}</span>
                        </a>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Botão de Renovar com 1 Clique */}
                          <button
                            title="Renovar assinatura com 1 clique"
                            onClick={(e) => handleRenew(c.id, e)}
                            className="p-1.5 text-blue-400 hover:text-white bg-blue-600/10 hover:bg-blue-600 rounded-lg transition-colors border border-blue-500/20"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão de Cobrança Pix */}
                          <button
                            title="Gerar Cobrança Pix"
                            onClick={() => onOpenPixForCustomer(c.id)}
                            className="p-1.5 text-emerald-400 hover:text-white bg-emerald-600/10 hover:bg-emerald-600 rounded-lg transition-colors border border-emerald-500/20"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          {/* Ver Detalhes */}
                          <button
                            title="Ver detalhes e histórico"
                            onClick={() => onSelectCustomer(c)}
                            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Editar */}
                          <button
                            title="Editar cadastro"
                            onClick={() => onEditCustomer(c)}
                            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Visualização em CARDS para Mobile (Mobile-First < md) */}
        <div className="md:hidden divide-y divide-slate-800/80">
          {paginatedCustomers.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Nenhum cliente encontrado.
            </div>
          ) : (
            paginatedCustomers.map((c) => {
              const plan = plans.find((p) => p.id === c.planId);
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCustomer(c)}
                  className="p-4 space-y-3 active:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">{c.name}</h3>
                      <p className="text-[11px] text-slate-400">{c.city}</p>
                    </div>
                    {getStatusBadge(c.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Plano & Telas</span>
                      <span className="font-semibold text-slate-200">
                        {plan?.name || 'Start'} ({c.screens} telas)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Vencimento</span>
                      <span className="font-semibold text-slate-200 font-mono">
                        {c.dueDate.split('-').reverse().join('/')}
                      </span>
                    </div>
                  </div>

                  {/* Ações Mobile */}
                  <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={createWhatsAppWebLink(c.whatsapp, `Olá ${c.name}, mensagem da GestorTV.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleRenew(c.id, e)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg active:scale-95 transition-transform"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Renovar 1-Clique</span>
                      </button>

                      <button
                        onClick={() => onOpenPixForCustomer(c.id)}
                        className="p-1.5 text-emerald-400 bg-emerald-600/10 border border-emerald-500/20 rounded-lg"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé de Paginação */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Mostrando página <strong className="text-slate-200">{currentPage}</strong> de{' '}
            <strong className="text-slate-200">{totalPages}</strong> ({filteredCustomers.length} registros)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
