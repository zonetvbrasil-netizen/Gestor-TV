import {
  LayoutDashboard,
  Users,
  Layers,
  CreditCard,
  MessageSquare,
  LifeBuoy,
  Settings,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

export type TabKey = 'dashboard' | 'customers' | 'plans' | 'billing' | 'messages' | 'support' | 'settings';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  counts: {
    expiringOrExpiredCustomers: number;
    pendingInvoices: number;
    openTickets: number;
  };
}

export function Sidebar({ activeTab, onSelectTab, counts }: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard' as TabKey,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'customers' as TabKey,
      label: 'Clientes',
      icon: Users,
      badge: counts.expiringOrExpiredCustomers > 0 ? counts.expiringOrExpiredCustomers : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'plans' as TabKey,
      label: 'Planos & Cupons',
      icon: Layers,
    },
    {
      id: 'billing' as TabKey,
      label: 'Cobranças & Pix',
      icon: CreditCard,
      badge: counts.pendingInvoices > 0 ? counts.pendingInvoices : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    },
    {
      id: 'messages' as TabKey,
      label: 'Automação WhatsApp',
      icon: MessageSquare,
    },
    {
      id: 'support' as TabKey,
      label: 'Suporte & Tutoriais',
      icon: LifeBuoy,
      badge: counts.openTickets > 0 ? counts.openTickets : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
    },
    {
      id: 'settings' as TabKey,
      label: 'Configurações',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900/60 p-4">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Navegação Principal
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Disclaimer Legal & Info Card */}
        <div className="mt-auto pt-4 border-t border-slate-800/80">
          <div className="rounded-xl bg-slate-800/40 p-3 border border-slate-700/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Aviso de Conformidade</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              O GestorTV opera exclusivamente como ferramenta de gestão, CRM e emissão de cobranças financeiras.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav aria-label="Navegação móvel" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md px-2 py-1 flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors relative ${
                isActive ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
              {item.badge !== undefined && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>
          );
        })}
        <button
          onClick={() => onSelectTab('support')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'support' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <LifeBuoy className="w-5 h-5 mb-0.5" />
          <span>Suporte</span>
        </button>
      </nav>
    </>
  );
}
