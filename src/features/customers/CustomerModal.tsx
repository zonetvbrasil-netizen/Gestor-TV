import { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { Customer, Plan, CustomerStatus } from '../../types/index.ts';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  initialData?: Customer | null;
  plans: Plan[];
}

const COMMON_DEVICES = [
  'Smart TV Samsung (Tizen)',
  'Smart TV LG (WebOS)',
  'Fire Stick 4K / Lite',
  'TV Box Xiaomi / Android',
  'Chromecast com Google TV',
  'Celular Android',
  'iPhone / iPad (iOS)',
  'Computador (Windows / Mac)',
];

export function CustomerModal({ isOpen, onClose, onSave, initialData, plans }: CustomerModalProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [planId, setPlanId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [screens, setScreens] = useState(1);
  const [devices, setDevices] = useState<string[]>([]);
  const [deviceInput, setDeviceInput] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('active');
  const [consentLgpd, setConsentLgpd] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setWhatsapp(initialData.whatsapp);
      setEmail(initialData.email || '');
      setCity(initialData.city);
      setPlanId(initialData.planId);
      setStartDate(initialData.startDate);
      setDueDate(initialData.dueDate);
      setScreens(initialData.screens);
      setDevices(initialData.devices || []);
      setNotes(initialData.notes || '');
      setStatus(initialData.status);
      setConsentLgpd(initialData.consentLgpd ?? true);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];

      setName('');
      setWhatsapp('55');
      setEmail('');
      setCity('São Paulo - SP');
      setPlanId(plans[0]?.id || 'p1');
      setStartDate(today);
      setDueDate(nextMonthStr);
      setScreens(plans[0]?.screens || 1);
      setDevices(['Smart TV Samsung (Tizen)']);
      setNotes('');
      setStatus('active');
      setConsentLgpd(true);
    }
    setError('');
  }, [initialData, isOpen, plans]);

  if (!isOpen) return null;

  const handlePlanChange = (selectedPlanId: string) => {
    setPlanId(selectedPlanId);
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (plan) {
      setScreens(plan.screens);
      // calcula vencimento a partir do startDate
      const base = new Date(startDate || new Date());
      base.setMonth(base.getMonth() + plan.durationMonths);
      setDueDate(base.toISOString().split('T')[0]);
    }
  };

  const handleAddDevice = () => {
    if (deviceInput.trim() && !devices.includes(deviceInput.trim())) {
      setDevices([...devices, deviceInput.trim()]);
      setDeviceInput('');
    }
  };

  const handleRemoveDevice = (d: string) => {
    setDevices(devices.filter((item) => item !== d));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome do cliente.');
      return;
    }
    if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 10) {
      setError('Informe um WhatsApp válido com DDD (ex: 5511999998888).');
      return;
    }
    if (!city.trim()) {
      setError('Informe a cidade do cliente.');
      return;
    }
    if (!dueDate) {
      setError('Informe a data de vencimento.');
      return;
    }
    if (!consentLgpd) {
      setError('O consentimento com a política de tratamento de dados (LGPD) é obrigatório.');
      return;
    }

    onSave({
      name: name.trim(),
      whatsapp: whatsapp.replace(/\D/g, ''),
      email: email.trim(),
      city: city.trim(),
      planId,
      startDate,
      dueDate,
      screens: Number(screens),
      devices,
      notes: notes.trim(),
      status,
      consentLgpd: true,
      consentDate: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {initialData ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <p className="text-xs text-slate-400">
                Cadastro de assinatura de TV, telas e vencimento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs sm:text-sm">
          {/* Dados Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp (com DDD) *
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 5511999998888"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                E-mail (opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cidade - UF *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Curitiba - PR"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Plano, Datas e Telas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plano Escolhido *
              </label>
              <select
                value={planId}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - R$ {p.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data de Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data de Vencimento *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número de Telas Simultâneas
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={screens}
                onChange={(e) => setScreens(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="active">Ativo</option>
                <option value="trial">Em Teste</option>
                <option value="expiring">Vencendo</option>
                <option value="expired">Vencido</option>
                <option value="suspended">Suspenso</option>
              </select>
            </div>
          </div>

          {/* Dispositivos Conectados */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dispositivos do Cliente
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={deviceInput}
                onChange={(e) => setDeviceInput(e.target.value)}
                placeholder="Ex: Fire Stick Quarto, Smart TV Sala"
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddDevice}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium transition-colors"
              >
                + Adicionar
              </button>
            </div>

            {/* Sugestões rápidas */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_DEVICES.slice(0, 4).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => {
                    if (!devices.includes(d)) setDevices([...devices, d]);
                  }}
                  className="text-[11px] bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded-lg border border-slate-700/50"
                >
                  + {d}
                </button>
              ))}
            </div>

            {/* Lista selecionada */}
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800 min-h-9">
              {devices.length === 0 ? (
                <span className="text-slate-500 text-xs">Nenhum dispositivo adicionado</span>
              ) : (
                devices.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30"
                  >
                    <span>{d}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDevice(d)}
                      className="hover:text-red-400"
                    >
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações Internas
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferências de horário, forma de pagamento, etc."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* LGPD Consent */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="consent"
              checked={consentLgpd}
              onChange={(e) => setConsentLgpd(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0"
            />
            <label htmlFor="consent" className="text-[11px] text-slate-300 cursor-pointer">
              <span className="font-semibold text-slate-100">Consentimento LGPD: </span>
              O cliente autorizou o armazenamento de seus dados de contato exclusivamente para faturamento e gestão das telas contratadas.
            </label>
          </div>

          {/* Footer CTA */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
