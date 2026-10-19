import { useState } from 'react';
import {
  MessageSquare,
  Play,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  Edit,
  Save,
  Plus,
} from 'lucide-react';
import { MessageTemplate, QueuedMessage, Customer } from '../../types/index.ts';
import { createWhatsAppWebLink, sendQueuedMessage } from '../../services/whatsapp.ts';
import { formatPhoneBR } from '../../utils/rules.ts';

interface MessagesModuleProps {
  templates: MessageTemplate[];
  messageQueue: QueuedMessage[];
  customers: Customer[];
  onRunBillingRuler: () => number;
  onUpdateTemplate: (template: MessageTemplate) => void;
  onProcessQueueMessage: (messageId: string) => void;
}

export function MessagesModule({
  templates,
  messageQueue,
  customers,
  onRunBillingRuler,
  onUpdateTemplate,
}: MessagesModuleProps) {
  const [activeTab, setActiveTab] = useState<'ruler' | 'templates' | 'queue'>('ruler');
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [rulerFeedback, setRulerFeedback] = useState<string | null>(null);
  const [simulatingBatch, setSimulatingBatch] = useState(false);
  const [localQueue, setLocalQueue] = useState<QueuedMessage[]>(messageQueue);

  // Executar régua
  const handleTriggerRuler = () => {
    const count = onRunBillingRuler();
    setRulerFeedback(`Régua executada com sucesso! ${count} mensagens de lembrete e cobrança foram calculadas.`);
    setTimeout(() => setRulerFeedback(null), 5000);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    onUpdateTemplate(editingTemplate);
    setEditingTemplate(null);
  };

  // Simular processamento em lote da fila
  const handleSendAllPending = async () => {
    setSimulatingBatch(true);
    for (const msg of localQueue) {
      if (msg.status === 'pending') {
        await sendQueuedMessage(msg);
        setLocalQueue((prev) =>
          prev.map((m) =>
            m.id === msg.id
              ? { ...m, status: 'sent', sentAt: new Date().toISOString() }
              : m
          )
        );
      }
    }
    setSimulatingBatch(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>Automação de Mensagens & Régua WhatsApp</span>
          </h2>
          <p className="text-xs text-slate-400">
            Disparos automáticos D-3, D-0 e D+2 compatíveis com Meta WhatsApp Business Platform
          </p>
        </div>

        <button
          onClick={handleTriggerRuler}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Executar Régua de Cobrança Agora</span>
        </button>
      </div>

      {rulerFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{rulerFeedback}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ruler')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'ruler'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Configuração da Régua</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'templates'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Modelos com Variáveis ({templates.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'queue'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Fila de Disparo ({messageQueue.length})</span>
        </button>
      </div>

      {/* Tab: Régua Visual */}
      {activeTab === 'ruler' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="font-bold text-sm text-slate-100 mb-1">Linha do Tempo da Régua de Cobrança</h3>
            <p className="text-xs text-slate-400 mb-6">
              O robô analisa a data de vencimento de cada cliente diariamente e despacha as notificações programadas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              {/* Etapa 1: D-3 */}
              <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      1. Pré-Vencimento (D-3)
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                      3 dias antes
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-xs mb-1">Lembrete Amigável com Pix</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    "Olá &#123;nome&#125;, sua assinatura vence em 3 dias (&#123;vencimento&#125;). Garanta seu acesso sem interrupções! Valor: &#123;valor&#125;."
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-900/40 text-[10px] text-blue-300">
                  Gatilho automático: 09:00 da manhã
                </div>
              </div>

              {/* Etapa 2: D-0 */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      2. Dia do Vencimento (D-0)
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                      No dia D
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-xs mb-1">Aviso de Vencimento Hoje</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    "🚨 Olá &#123;nome&#125;! Sua assinatura vence HOJE. Para evitar o bloqueio automático de suas telas, renove em: &#123;link_pagamento&#125;."
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-900/40 text-[10px] text-amber-300">
                  Gatilho automático: 11:00 da manhã
                </div>
              </div>

              {/* Etapa 3: D+2 */}
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      3. Pós-Vencimento (D+2)
                    </span>
                    <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-semibold">
                      2 dias após
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-xs mb-1">Notificação de Suspensão</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    "⚠️ &#123;nome&#125;, identificamos fatura em aberto de &#123;valor&#125;. Seu sinal poderá ser interrompido a qualquer instante. Regularize agora."
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-red-900/40 text-[10px] text-red-300">
                  Gatilho automático: 14:00 da tarde
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Modelos de Mensagem com Variáveis */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs font-semibold text-slate-300 block mb-1">
              Variáveis Dinâmicas Disponíveis:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <code className="bg-slate-950 text-blue-400 px-2 py-1 rounded border border-slate-800 font-mono">
                &#123;nome&#125;
              </code>
              <code className="bg-slate-950 text-emerald-400 px-2 py-1 rounded border border-slate-800 font-mono">
                &#123;valor&#125;
              </code>
              <code className="bg-slate-950 text-amber-400 px-2 py-1 rounded border border-slate-800 font-mono">
                &#123;vencimento&#125;
              </code>
              <code className="bg-slate-950 text-purple-400 px-2 py-1 rounded border border-slate-800 font-mono">
                &#123;link_pagamento&#125;
              </code>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-slate-100">{tpl.name}</h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {tpl.triggerEvent}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 font-mono whitespace-pre-wrap leading-relaxed my-3">
                    {tpl.content}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setEditingTemplate(tpl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar Modelo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Fila de Disparo (Queue) */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-slate-400">
              Total de disparos na fila: <strong>{messageQueue.length}</strong>
            </span>

            {messageQueue.length > 0 && (
              <button
                onClick={handleSendAllPending}
                disabled={simulatingBatch}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{simulatingBatch ? 'Disparando Lote...' : 'Disparar Pendentes em Lote'}</span>
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            {messageQueue.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhuma mensagem na fila. Clique em "Executar Régua de Cobrança" para preencher automaticamente com base nos clientes vencendo!
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {messageQueue.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/20"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{msg.customerName}</span>
                        <span className="text-xs font-mono text-slate-400">({formatPhoneBR(msg.phone)})</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            msg.status === 'sent'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-300'
                          }`}
                        >
                          {msg.status === 'sent' ? 'ENVIADO' : 'PENDENTE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 font-mono text-[11px]">
                        {msg.body}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={createWhatsAppWebLink(msg.phone, msg.body)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir no WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Editar Modelo */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="font-bold text-base text-slate-100 border-b border-slate-800 pb-3">
              Editar Modelo de Mensagem
            </h3>

            <form onSubmit={handleSaveTemplate} className="space-y-4 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título do Modelo
                </label>
                <input
                  type="text"
                  required
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Texto da Mensagem (com variáveis)
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingTemplate.content}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, content: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Modelo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
