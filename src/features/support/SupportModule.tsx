import { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Tv,
  Smartphone,
  Flame,
  Box,
  Copy,
  Check,
  Send,
  MessageCircle,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Ticket, Customer, DeviceType, TicketPriority, TicketStatus } from '../../types/index.ts';

interface SupportModuleProps {
  tickets: Ticket[];
  customers: Customer[];
  onAddTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'createdBy'>) => void;
  onAddTicketReply: (ticketId: string, message: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
}

// Tutoriais e respostas rápidas por dispositivo
const DEVICE_TUTORIALS = [
  {
    id: 'tut-firestick',
    device: 'Fire Stick (Amazon)',
    icon: Flame,
    title: 'Limpeza de Cache e Mudança de Player',
    snippet: `🔥 *Tutorial Rápido - Fire Stick:*
1. No menu principal, vá em *Configurações* (ícone de engrenagem).
2. Selecione *Aplicativos* -> *Gerenciar Aplicativos Instalados*.
3. Encontre o aplicativo do GestorTV e clique em *Limpar Dados* e *Limpar Cache*.
4. Abra o app novamente e, nas configurações de reprodução, alterne o reprodutor para *ExoPlayer* ou *VLC*.
5. Reinicie o Fire Stick segurando o botão central e o Play por 5 segundos.`,
  },
  {
    id: 'tut-samsung',
    device: 'Smart TV Samsung (Tizen)',
    icon: Tv,
    title: 'Instalação e DNS no Tizen',
    snippet: `📺 *Tutorial Rápido - Smart TV Samsung:*
1. Pressione *Home* no controle e vá em *Apps*.
2. Na lupa de busca, procure pelo aplicativo recomendado ou player cadastrado.
3. Se houver lentidão na lista de canais:
   - Vá em *Configurações* -> *Geral* -> *Rede* -> *Status da Rede*.
   - Selecione *Configurações de IP* -> *Configurações de DNS* -> *Inserir Manualmente*.
   - Altere o servidor DNS para *1.1.1.1* ou *8.8.8.8*.
4. Reinicie a TV retirando-a da tomada por 30 segundos.`,
  },
  {
    id: 'tut-lg',
    device: 'Smart TV LG (WebOS)',
    icon: Tv,
    title: 'Configuração na LG WebOS',
    snippet: `📺 *Tutorial Rápido - LG WebOS:*
1. Abra a *LG Content Store* na sua TV.
2. Busque pelo aplicativo indicado pelo nosso suporte técnico.
3. Ao abrir o aplicativo, anote o MAC Address e a Chave Device Key que aparecem na tela e envie para nosso atendente.
4. Caso ocorra tela preta, verifique se o fuso horário da TV está configurado como *Automático*.`,
  },
  {
    id: 'tut-tvbox',
    device: 'TV Box Android / Xiaomi',
    icon: Box,
    title: 'Atualização e Otimização TV Box',
    snippet: `📦 *Tutorial Rápido - TV Box Android:*
1. Abra o navegador ou app *Downloader* no seu aparelho.
2. Insira o link direto fornecido pelo nosso suporte.
3. Permita a instalação de fontes desconhecidas nas configurações de segurança do Android.
4. Recomendamos conectar o TV Box via cabo de rede RJ45 para máxima estabilidade em transmissões 4K.`,
  },
  {
    id: 'tut-mobile',
    device: 'Smartphone (Android / iPhone)',
    icon: Smartphone,
    title: 'Acesso no Celular e Tablets',
    snippet: `📱 *Tutorial Rápido - Celular:*
1. Baixe o aplicativo diretamente na Google Play Store (Android) ou App Store (iOS).
2. Insira o usuário e senha cadastrados na sua assinatura do GestorTV.
3. Para melhor qualidade, utilize conexões Wi-Fi na frequência 5GHz.`,
  },
];

export function SupportModule({
  tickets,
  customers,
  onAddTicket,
  onAddTicketReply,
  onUpdateTicketStatus,
}: SupportModuleProps) {
  const [activeTab, setActiveTab] = useState<'tickets' | 'tutorials'>('tickets');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form novo chamado
  const [newCustId, setNewCustId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TicketPriority>('medium');
  const [newDevice, setNewDevice] = useState<DeviceType>('smart_tv');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleCopyTutorial = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    onAddTicketReply(selectedTicket.id, replyText.trim());
    setReplyText('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCustId) return;

    const customer = customers.find((c) => c.id === newCustId);

    onAddTicket({
      customerId: newCustId,
      customerName: customer ? customer.name : 'Cliente',
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      status: 'open',
      deviceType: newDevice,
    });

    setIsNewTicketOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded">URGENTE</span>;
      case 'high':
        return <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">ALTA</span>;
      case 'medium':
        return <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded">MÉDIA</span>;
      case 'low':
        return <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded">BAIXA</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-blue-500" />
            <span>Central de Suporte & Tutoriais por Dispositivo</span>
          </h2>
          <p className="text-xs text-slate-400">
            Atendimento aos clientes, histórico de ocorrências e guias rápidos para Smart TVs e TV Box
          </p>
        </div>

        <button
          onClick={() => {
            if (customers.length > 0) setNewCustId(customers[0].id);
            setIsNewTicketOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Novo Chamado</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'tickets'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Chamados em Andamento ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tutorials')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'tutorials'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Tutoriais Rápidos por Dispositivo ({DEVICE_TUTORIALS.length})</span>
        </button>
      </div>

      {/* Tab: Chamados */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Coluna 1: Lista de Chamados */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden divide-y divide-slate-800/80 shadow-lg max-h-[75vh] overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhum chamado aberto no momento.
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    selectedTicket?.id === t.id
                      ? 'bg-blue-600/15 border-l-4 border-blue-500'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-xs text-slate-100 line-clamp-1">{t.title}</h4>
                    {getPriorityBadge(t.priority)}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{t.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="text-slate-400 font-medium">{t.customerName}</span>
                    <span className="uppercase font-semibold text-blue-400">{t.deviceType.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Coluna 2: Detalhes e Chat do Chamado Selecionado */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between shadow-xl min-h-[500px]">
            {selectedTicket ? (
              <>
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-slate-100">{selectedTicket.title}</h3>
                        {getPriorityBadge(selectedTicket.priority)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Cliente: <strong className="text-slate-200">{selectedTicket.customerName}</strong> • Dispositivo:{' '}
                        <span className="text-blue-400 font-semibold">{selectedTicket.deviceType}</span>
                      </p>
                    </div>

                    {/* Status Changer */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Status:</span>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) =>
                          onUpdateTicketStatus(selectedTicket.id, e.target.value as TicketStatus)
                        }
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none"
                      >
                        <option value="open">Aberto</option>
                        <option value="in_progress">Em Andamento</option>
                        <option value="resolved">Resolvido</option>
                        <option value="closed">Fechado</option>
                      </select>
                    </div>
                  </div>

                  {/* Histórico de Mensagens */}
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {selectedTicket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          m.senderType === 'agent'
                            ? 'bg-slate-800/80 border border-slate-700/80 ml-4'
                            : 'bg-blue-950/40 border border-blue-900/40 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-blue-400">{m.senderName}</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{m.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formulário de Resposta */}
                <form onSubmit={handleSendReply} className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escreva uma resposta para o cliente ou nota interna..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Responder</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="m-auto text-center text-xs text-slate-500">
                Selecione um chamado na lista para ver o histórico.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Tutoriais por Dispositivo */}
      {activeTab === 'tutorials' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-300">
              Copie estes roteiros de resolução rápida e envie diretamente aos clientes pelo WhatsApp para resolver 90% das dúvidas de configuração de TVs, Fire Sticks e TV Box.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEVICE_TUTORIALS.map((tut) => {
              const Icon = tut.icon;
              return (
                <div
                  key={tut.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                      <Icon className="w-5 h-5" />
                      <span className="font-bold text-xs uppercase tracking-wide">{tut.device}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100 mb-2">{tut.title}</h4>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto mb-4 text-[11px]">
                      {tut.snippet}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyTutorial(tut.snippet, tut.id)}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
                      copiedId === tut.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {copiedId === tut.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado para Área de Transferência!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-blue-400" />
                        <span>Copiar Tutorial para WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Novo Chamado */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="font-bold text-base text-slate-100 border-b border-slate-800 pb-3">
              Abrir Novo Chamado de Suporte
            </h3>

            <form onSubmit={handleCreateTicket} className="space-y-4 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cliente Solicitante *
                </label>
                <select
                  required
                  value={newCustId}
                  onChange={(e) => setNewCustId(e.target.value)}
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
                  Título do Problema *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Buffering nos canais esportivos"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dispositivo
                  </label>
                  <select
                    value={newDevice}
                    onChange={(e) => setNewDevice(e.target.value as DeviceType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="smart_tv">Smart TV</option>
                    <option value="fire_stick">Fire Stick</option>
                    <option value="tv_box">TV Box</option>
                    <option value="smartphone">Celular</option>
                    <option value="pc">Computador</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição Detalhada do Chamado
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Relato do cliente, testes já feitos, código de erro exibido..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
                >
                  Criar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
