import type { Coupon, CustomerStatus } from '../types/index.ts';

/**
 * Adiciona meses a uma data (YYYY-MM-DD) preservando dia e ano
 */
export function calculateDueDate(baseDateStr: string, durationMonths: number = 1): string {
  const [year, month, day] = baseDateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1 + durationMonths, day);
  
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calcula o status do cliente baseado na data de vencimento e flags
 * - trial: se marcado como em teste
 * - suspended: se suspenso manualmente
 * - expiring: se faltam entre 0 e 3 dias para o vencimento
 * - expired: se já passou da data de vencimento
 * - active: mais de 3 dias até o vencimento
 */
export function calculateCustomerStatus(
  dueDateStr: string,
  currentStatus?: CustomerStatus
): CustomerStatus {
  if (currentStatus === 'suspended') {
    return 'suspended';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dueDateStr.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (currentStatus === 'trial' && diffDays >= 0) {
    return 'trial';
  }

  if (diffDays < 0) {
    return 'expired';
  }

  if (diffDays <= 3) {
    return 'expiring';
  }

  return 'active';
}

/**
 * Aplica cupom de desconto com validação
 */
export function applyCoupon(amount: number, coupon?: Coupon | null): { discount: number; finalAmount: number } {
  if (!coupon || !coupon.isActive) {
    return { discount: 0, finalAmount: amount };
  }

  if (coupon.validUntil && new Date(coupon.validUntil).getTime() < Date.now()) {
    return { discount: 0, finalAmount: amount };
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return { discount: 0, finalAmount: amount };
  }

  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = (amount * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(amount, Math.max(0, discount));
  const finalAmount = Math.max(0, amount - discount);

  return {
    discount: Number(discount.toFixed(2)),
    finalAmount: Number(finalAmount.toFixed(2)),
  };
}

/**
 * Formata valores numéricos em Reais (BRL)
 */
export function formatBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

/**
 * Formata telefones para padrão brasileiro: (99) 99999-9999
 */
export function formatPhoneBR(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4);
    const num = digits.slice(4);
    return `+55 (${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return rawPhone;
}

/**
 * Substitui as variáveis de modelo de mensagens
 */
export function replaceTemplateVariables(
  template: string,
  vars: {
    name: string;
    amount: number;
    dueDate: string;
    paymentLink?: string;
  }
): string {
  const formattedDate = vars.dueDate.split('-').reverse().join('/');
  const formattedVal = formatBRL(vars.amount);
  const link = vars.paymentLink || 'https://gestortv.app/pay';

  return template
    .replace(/\{nome\}/gi, vars.name)
    .replace(/\{valor\}/gi, formattedVal)
    .replace(/\{vencimento\}/gi, formattedDate)
    .replace(/\{link_pagamento\}/gi, link);
}

/**
 * Gera código Pix Copia e Cola padrão EMV simplificado e URL QR Code
 */
export function generatePixPayload(
  pixKey: string,
  receiverName: string,
  city: string,
  amount: number,
  txid: string = 'GESTOR'
): { pixCode: string; qrUrl: string } {
  const cleanKey = pixKey.trim() || 'gestortv.pix@gestor.tv';
  const cleanName = receiverName.slice(0, 25).toUpperCase();
  const cleanCity = city.slice(0, 15).toUpperCase() || 'SAO PAULO';
  const formattedAmount = amount.toFixed(2);

  // Formato EMV padrão BR Code do Banco Central
  const payload = `00020126580014br.gov.bcb.pix0136${cleanKey}520400005303986540${formattedAmount.length}${formattedAmount}5802BR59${String(cleanName.length).padStart(2, '0')}${cleanName}60${String(cleanCity.length).padStart(2, '0')}${cleanCity}62070503${txid}6304`;
  
  // URL para imagem de QR Code compatível
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payload)}`;

  return {
    pixCode: payload,
    qrUrl,
  };
}
