import { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar, TabKey } from './components/Sidebar.tsx';
import { PixModal } from './components/PixModal.tsx';
import { LgpdModal } from './components/LgpdModal.tsx';
import { AuthModal } from './features/auth/AuthModal.tsx';

// Modules
import { DashboardModule } from './features/dashboard/DashboardModule.tsx';
import { CustomerList } from './features/customers/CustomerList.tsx';
import { CustomerDetail } from './features/customers/CustomerDetail.tsx';
import { CustomerModal } from './features/customers/CustomerModal.tsx';
import { PlansModule } from './features/plans/PlansModule.tsx';
import { BillingModule } from './features/billing/BillingModule.tsx';
import { MessagesModule } from './features/messages/MessagesModule.tsx';
import { SupportModule } from './features/support/SupportModule.tsx';
import { SettingsModule } from './features/settings/SettingsModule.tsx';

import { useCrmStore } from './store/crmStore.ts';
import { Customer, Invoice } from './types/index.ts';

export default function App() {
  const store = useCrmStore();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Modais
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [pixInvoice, setPixInvoice] = useState<Invoice | null>(null);
  const [isLgpdModalOpen, setIsLgpdModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Contadores para o Sidebar
  const counts = useMemo(() => {
    const expiringOrExpired = store.customers.filter(
      (c) => c.status === 'expiring' || c.status === 'expired'
    ).length;

    const pendingInvoices = store.invoices.filter((i) => i.status === 'pending').length;
    const openTickets = store.tickets.filter((t) => t.status === 'open').length;

    return {
      expiringOrExpiredCustomers: expiringOrExpired,
      pendingInvoices,
      openTickets,
    };
  }, [store.customers, store.invoices, store.tickets]);

  // Ações de Cliente
  const handleOpenNewCustomer = () => {
    setCustomerToEdit(null);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (customerToEdit) {
      store.updateCustomer(customerToEdit.id, data);
      if (selectedCustomer?.id === customerToEdit.id) {
        setSelectedCustomer({ ...selectedCustomer, ...data, updatedAt: new Date().toISOString() });
      }
    } else {
      store.addCustomer(data);
    }
  };

  // Abrir modal Pix a partir do cliente
  const handleOpenPixForCustomer = (customerId: string) => {
    let inv = store.invoices.find((i) => i.customerId === customerId && i.status !== 'paid');
    if (!inv) {
      const cust = store.customers.find((c) => c.id === customerId);
      if (cust) {
        inv = store.createInvoice(cust.id, cust.planId);
      }
    }
    if (inv) {
      setPixInvoice(inv);
    }
  };

  // Exportar toda a base em JSON (LGPD)
  const handleExportAllLgpd = () => {
    const dump = {
      gestorTvLgpdBackup: true,
      dataExport: new Date().toISOString(),
      empresa: store.currentProfile.companyName,
      clientes: store.customers,
      faturas: store.invoices,
    };

    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gestortv_lgpd_dump_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${isDarkMode ? 'dark' : ''}`}>
      {/* Navbar Superior com Seletor de Perfil RLS */}
      <Navbar
        currentProfile={store.currentProfile}
        profiles={store.profiles}
        onSelectProfile={store.setCurrentProfileId}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenNewCustomer={handleOpenNewCustomer}
        onOpenLgpd={() => setIsLgpdModalOpen(true)}
        onResetData={store.resetToDefaultData}
      />

      {/* Layout Principal com Sidebar + Área de Conteúdo */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSelectedCustomer(null); // reseta visualização detalhada ao mudar de aba
          }}
          counts={counts}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {/* Aba: Dashboard */}
          {activeTab === 'dashboard' && (
            <DashboardModule
              customers={store.customers}
              invoices={store.invoices}
              plans={store.plans}
              onSelectCustomer={(cust) => {
                setSelectedCustomer(cust);
                setActiveTab('customers');
              }}
              onRenewCustomer={store.renewCustomer}
              onOpenPixForCustomer={handleOpenPixForCustomer}
            />
          )}

          {/* Aba: Clientes (Lista ou Detalhes) */}
          {activeTab === 'customers' && (
            selectedCustomer ? (
              <CustomerDetail
                customer={selectedCustomer}
                plan={store.plans.find((p) => p.id === selectedCustomer.planId)}
                invoices={store.invoices.filter((i) => i.customerId === selectedCustomer.id)}
                tickets={store.tickets.filter((t) => t.customerId === selectedCustomer.id)}
                onBack={() => setSelectedCustomer(null)}
                onEdit={handleEditCustomer}
                onRenew={(id) => {
                  const res = store.renewCustomer(id);
                  setSelectedCustomer((prev) =>
                    prev ? { ...prev, dueDate: res.nextDueDate, status: 'active' } : null
                  );
                }}
                onOpenPix={(inv) => setPixInvoice(inv)}
                onCreateInvoice={(cId, pId) => {
                  const inv = store.createInvoice(cId, pId);
                  setPixInvoice(inv);
                }}
                onAnonymize={(id) => {
                  store.anonymizeCustomer(id);
                  setSelectedCustomer(null);
                }}
                onDelete={(id) => {
                  store.deleteCustomer(id);
                  setSelectedCustomer(null);
                }}
              />
            ) : (
              <CustomerList
                customers={store.customers}
                plans={store.plans}
                invoices={store.invoices}
                onSelectCustomer={(cust) => setSelectedCustomer(cust)}
                onNewCustomer={handleOpenNewCustomer}
                onEditCustomer={handleEditCustomer}
                onDeleteCustomer={store.deleteCustomer}
                onRenewCustomer={store.renewCustomer}
                onOpenPixForCustomer={handleOpenPixForCustomer}
              />
            )
          )}

          {/* Aba: Planos & Cupons */}
          {activeTab === 'plans' && (
            <PlansModule
              plans={store.plans}
              coupons={store.coupons}
              onAddPlan={store.addPlan}
              onUpdatePlan={store.updatePlan}
              onDeletePlan={store.deletePlan}
              onAddCoupon={store.addCoupon}
              onDeleteCoupon={store.deleteCoupon}
            />
          )}

          {/* Aba: Cobranças & Pix */}
          {activeTab === 'billing' && (
            <BillingModule
              invoices={store.invoices}
              customers={store.customers}
              plans={store.plans}
              pixProviderType={store.pixProviderType}
              onOpenPixModal={(inv) => setPixInvoice(inv)}
              onCreateInvoice={store.createInvoice}
              onPayInvoice={store.payInvoice}
            />
          )}

          {/* Aba: Automação de Mensagens */}
          {activeTab === 'messages' && (
            <MessagesModule
              templates={store.templates}
              messageQueue={store.messageQueue}
              customers={store.customers}
              onRunBillingRuler={store.runBillingRuler}
              onUpdateTemplate={() => {}}
              onProcessQueueMessage={() => {}}
            />
          )}

          {/* Aba: Suporte & Tutoriais */}
          {activeTab === 'support' && (
            <SupportModule
              tickets={store.tickets}
              customers={store.customers}
              onAddTicket={store.addTicket}
              onAddTicketReply={store.addTicketReply}
              onUpdateTicketStatus={store.updateTicketStatus}
            />
          )}

          {/* Aba: Configurações & Logs */}
          {activeTab === 'settings' && (
            <SettingsModule
              currentProfile={store.currentProfile}
              profiles={store.profiles}
              auditLogs={store.auditLogs}
              pixProviderType={store.pixProviderType}
              onUpdatePixProvider={store.setPixProviderType}
              onUpdateProfile={(updated) => {
                store.addAuditLog('CONFIG_ATUALIZADA', 'settings', 'profile', 'Dados da empresa e chave Pix alterados');
              }}
            />
          )}
        </main>
      </div>

      {/* Modais Globais */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        initialData={customerToEdit}
        plans={store.plans}
      />

      <PixModal
        invoice={pixInvoice}
        onClose={() => setPixInvoice(null)}
        onConfirmPayment={(invId, method, isWebhook) => {
          store.payInvoice(invId, method, isWebhook);
        }}
      />

      <LgpdModal
        isOpen={isLgpdModalOpen}
        onClose={() => setIsLgpdModalOpen(false)}
        customers={store.customers}
        onExportAll={handleExportAllLgpd}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        profiles={store.profiles}
        currentProfile={store.currentProfile}
        onSelectProfile={store.setCurrentProfileId}
      />
    </div>
  );
}
