import { useState } from 'react';
import { X, Check, Copy, QrCode, Zap, DollarSign, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Invoice } from '../types/index.ts';
import { formatBRL } from '../utils/rules.ts';

interface PixModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onConfirmPayment: (invoiceId: string, method: 'pix' | 'manual_cash' | 'manual_transfer', isWebhook: boolean) => void;
}

export function PixModal({ invoice, onClose, onConfirmPayment }: PixModalProps) {
  const [copied, setCopied] = useState(false);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);

  if (!invoice) return null;

  const handleCopy = () => {
    if (invoice.pixCode) {
      navigator.clipboard.writeText(invoice.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSimulateWebhook = async () => {
    setSimulatingWebhook(true);
    // Simula tempo de resposta do webhook do gateway
    setTimeout(() => {
      setSimulatingWebhook(false);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignora se indisponível em iframe restrito
      }
      onConfirmPayment(invoice.id, 'pix', true);
      onClose();
    }, 1200);
  };

  const handleManualPayment = (method: 'manual_cash' | 'manual_transfer') => {
    onConfirmPayment(invoice.id, method, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Cobrança Pix & Baixa</h2>
              <p className="text-xs text-slate-400">QR Code dinâmico com baixa automática via Webhook</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Invoice Summary */}
        <div className="my-5 rounded-xl bg-slate-800/60 p-4 border border-slate-700/60">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-slate-400">Cliente:</span>
            <span className="font-semibold text-slate-100">{invoice.customerName || 'Cliente'}</span>
          </div>
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-slate-400">Plano:</span>
            <span className="text-slate-200">{invoice.planName || 'Assinatura TV'}</span>
          </div>
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-slate-400">Vencimento:</span>
            <span className="text-slate-200">{invoice.dueDate.split('-').reverse().join('/')}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-700 mt-2">
            <span className="font-medium text-slate-300">Valor Total:</span>
            <span className="text-xl font-bold text-emerald-400">{formatBRL(invoice.finalAmount)}</span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-slate-800 mb-4">
          {invoice.pixQrUrl ? (
            <img
              src={invoice.pixQrUrl}
              alt="QR Code Pix"
              className="w-44 h-44 rounded-lg bg-white p-2 shadow-inner"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center rounded-lg bg-slate-800 text-slate-500 text-xs">
              QR Code Indisponível
            </div>
          )}
          <span className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Aguardando pagamento no banco...
          </span>
        </div>

        {/* Copia e Cola */}
        <div className="mb-5">
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">
            Código Pix (Copia e Cola):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={invoice.pixCode || '00020126580014br.gov.bcb.pix...'}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 font-mono truncate focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Ações: Webhook Simulation & Baixa Manual */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <button
            onClick={handleSimulateWebhook}
            disabled={simulatingWebhook}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-98 disabled:opacity-50"
          >
            {simulatingWebhook ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando Webhook do Banco...
              </span>
            ) : (
              <>
                <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
                <span>Simular Webhook Pix (Baixa Automática + Renovação)</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleManualPayment('manual_cash')}
              className="flex-1 py-2 px-3 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700/60 transition-colors"
            >
              Baixa em Dinheiro
            </button>
            <button
              onClick={() => handleManualPayment('manual_transfer')}
              className="flex-1 py-2 px-3 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700/60 transition-colors"
            >
              Baixa em TED / DOC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
