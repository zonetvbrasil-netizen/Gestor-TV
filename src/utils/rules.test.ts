import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDueDate,
  calculateCustomerStatus,
  applyCoupon,
  formatBRL,
  replaceTemplateVariables,
  generatePixPayload,
} from './rules.ts';

test('calculateDueDate prorroga a data em 1 mês', () => {
  const nextDate = calculateDueDate('2026-10-15', 1);
  assert.equal(nextDate, '2026-11-15');
});

test('calculateDueDate prorroga a data em 3 meses', () => {
  const nextDate = calculateDueDate('2026-05-10', 3);
  assert.equal(nextDate, '2026-08-10');
});

test('calculateCustomerStatus identifica vencido e vencendo', () => {
  // Passado distante -> expired
  const expiredStatus = calculateCustomerStatus('2020-01-01');
  assert.equal(expiredStatus, 'expired');

  // Suspenso mantém suspended
  const suspendedStatus = calculateCustomerStatus('2026-12-01', 'suspended');
  assert.equal(suspendedStatus, 'suspended');
});

test('applyCoupon com desconto percentual de 10%', () => {
  const result = applyCoupon(100, {
    id: 'c1',
    code: 'TESTE10',
    discountType: 'percent',
    discountValue: 10,
    maxUses: 10,
    usedCount: 0,
    validUntil: '',
    isActive: true,
  });

  assert.equal(result.discount, 10);
  assert.equal(result.finalAmount, 90);
});

test('applyCoupon com desconto fixo de R$ 15', () => {
  const result = applyCoupon(49.90, {
    id: 'c2',
    code: 'FIXO15',
    discountType: 'fixed',
    discountValue: 15,
    maxUses: 10,
    usedCount: 0,
    validUntil: '',
    isActive: true,
  });

  assert.equal(result.discount, 15);
  assert.equal(result.finalAmount, 34.90);
});

test('replaceTemplateVariables substitui variáveis corretamente', () => {
  const template = 'Olá {nome}, seu plano no valor de {valor} vence em {vencimento}. Pague aqui: {link_pagamento}';
  const output = replaceTemplateVariables(template, {
    name: 'Carlos',
    amount: 34.90,
    dueDate: '2026-10-25',
    paymentLink: 'https://pix.me/123',
  });

  assert.ok(output.includes('Carlos'));
  assert.ok(output.includes('25/10/2026'));
  assert.ok(output.includes('https://pix.me/123'));
});

test('generatePixPayload cria payload e qrUrl', () => {
  const { pixCode, qrUrl } = generatePixPayload('11999999999', 'GestorTV', 'SP', 39.90);
  assert.ok(pixCode.includes('11999999999'));
  assert.ok(qrUrl.startsWith('https://api.qrserver.com'));
});
