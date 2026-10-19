import { useState } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Tag,
  Tv,
  CheckCircle,
  X,
  AlertCircle,
  Clock,
  Percent,
  Calendar,
} from 'lucide-react';
import { Plan, Coupon, PlanDuration } from '../../types/index.ts';
import { formatBRL } from '../../utils/rules.ts';

interface PlansModuleProps {
  plans: Plan[];
  coupons: Coupon[];
  onAddPlan: (plan: Omit<Plan, 'id' | 'createdAt'>) => void;
  onUpdatePlan: (id: string, plan: Partial<Plan>) => void;
  onDeletePlan: (id: string) => void;
  onAddCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => void;
  onDeleteCoupon: (id: string) => void;
}

export function PlansModule({
  plans,
  coupons,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
  onAddCoupon,
  onDeleteCoupon,
}: PlansModuleProps) {
  const [activeTab, setActiveTab] = useState<'plans' | 'coupons'>('plans');

  // Modal de Plano
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planName, setPlanName] = useState('');
  const [durationType, setDurationType] = useState<PlanDuration>('mensal');
  const [durationMonths, setDurationMonths] = useState(1);
  const [price, setPrice] = useState(34.90);
  const [screens, setScreens] = useState(1);

  // Modal de Cupom
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState(10);
  const [maxUses, setMaxUses] = useState(50);
  const [validUntil, setValidUntil] = useState('2027-01-01');

  const handleOpenNewPlan = () => {
    setEditingPlan(null);
    setPlanName('');
    setDurationType('mensal');
    setDurationMonths(1);
    setPrice(34.90);
    setScreens(1);
    setIsPlanModalOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setDurationType(plan.durationType);
    setDurationMonths(plan.durationMonths);
    setPrice(plan.price);
    setScreens(plan.screens);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    if (editingPlan) {
      onUpdatePlan(editingPlan.id, {
        name: planName.trim(),
        durationType,
        durationMonths,
        price: Number(price),
        screens: Number(screens),
      });
    } else {
      onAddPlan({
        name: planName.trim(),
        durationType,
        durationMonths,
        price: Number(price),
        screens: Number(screens),
        isActive: true,
      });
    }
    setIsPlanModalOpen(false);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    onAddCoupon({
      code: couponCode.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      maxUses: Number(maxUses),
      validUntil,
      isActive: true,
    });

    setCouponCode('');
    setIsCouponModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <span>Planos de Assinatura & Cupons</span>
          </h2>
          <p className="text-xs text-slate-400">
            Configure pacotes de TV, períodos de fidelidade e campanhas promocionais
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'plans' ? (
            <button
              onClick={handleOpenNewPlan}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Plano</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Cupom</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'plans'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Planos Ativos ({plans.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'coupons'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Cupons de Desconto ({coupons.length})</span>
        </button>
      </div>

      {/* Tab: Planos */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base text-slate-100">{plan.name}</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {plan.durationType}
                  </span>
                </div>

                <div className="my-4">
                  <span className="text-3xl font-extrabold text-slate-100">
                    {formatBRL(plan.price)}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">
                    / {plan.durationMonths === 1 ? 'mês' : `${plan.durationMonths} meses`}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 py-3 border-y border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-blue-400" />
                    <span>
                      <strong>{plan.screens}</strong> {plan.screens > 1 ? 'Telas Simultâneas' : 'Tela'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Duração: {plan.durationMonths} {plan.durationMonths > 1 ? 'meses' : 'mês'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>Compatível com Smart TV, TV Box e Celular</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-2">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  title="Editar Plano"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deseja remover o plano ${plan.name}?`)) {
                      onDeletePlan(plan.id);
                    }
                  }}
                  className="p-2 text-red-400 hover:text-white hover:bg-red-600/40 bg-slate-800 rounded-xl transition-colors"
                  title="Excluir Plano"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Cupons */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-base font-extrabold text-emerald-400 tracking-wider bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-800/40">
                    {coupon.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {coupon.usedCount} / {coupon.maxUses} usos
                  </span>
                </div>

                <div className="my-3">
                  <span className="text-2xl font-bold text-slate-100">
                    {coupon.discountType === 'percent'
                      ? `${coupon.discountValue}% OFF`
                      : `${formatBRL(coupon.discountValue)} OFF`}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Desconto {coupon.discountType === 'percent' ? 'percentual' : 'fixo em reais'} na assinatura
                  </p>
                </div>

                {coupon.validUntil && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Válido até: {coupon.validUntil.split('T')[0].split('-').reverse().join('/')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end pt-4 mt-2">
                <button
                  onClick={() => {
                    if (confirm(`Remover cupom ${coupon.code}?`)) {
                      onDeleteCoupon(coupon.id);
                    }
                  }}
                  className="p-2 text-red-400 hover:text-white hover:bg-red-600/40 bg-slate-800 rounded-xl transition-colors"
                  title="Excluir Cupom"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Plano */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">
                {editingPlan ? 'Editar Plano' : 'Novo Plano de Assinatura'}
              </h3>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Plano *
                </label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Ex: Família 3 Telas VIP"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duração
                  </label>
                  <select
                    value={durationType}
                    onChange={(e) => {
                      const dt = e.target.value as PlanDuration;
                      setDurationType(dt);
                      if (dt === 'mensal') setDurationMonths(1);
                      if (dt === 'trimestral') setDurationMonths(3);
                      if (dt === 'semestral') setDurationMonths(6);
                      if (dt === 'anual') setDurationMonths(12);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="mensal">Mensal (1 mês)</option>
                    <option value="trimestral">Trimestral (3 meses)</option>
                    <option value="semestral">Semestral (6 meses)</option>
                    <option value="anual">Anual (12 meses)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número de Telas Simultâneas
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={screens}
                  onChange={(e) => setScreens(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
                >
                  Salvar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cupom */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">Novo Cupom Promocional</h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Código do Cupom *
                </label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Ex: PROMO20"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Desconto
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="percent">Percentual (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor do Desconto *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Limite Máximo de Usos
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Validade
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                >
                  Salvar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
