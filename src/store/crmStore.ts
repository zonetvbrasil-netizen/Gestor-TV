import { useState, useEffect } from 'react';
import {
  UserProfile,
  Customer,
  Plan,
  Coupon,
  Invoice,
  Payment,
  MessageTemplate,
  QueuedMessage,
  Ticket,
  AuditLog,
  CustomerStatus,
} from '../types/index.ts';
import {
  calculateDueDate,
  calculateCustomerStatus,
  applyCoupon,
  generatePixPayload,
  replaceTemplateVariables,
} from '../utils/rules.ts';

// 1. Usuários e Perfis Padrão
export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@gestortv.com.br',
    fullName: 'Carlos Eduardo (Admin)',
    role: 'admin',
    phone: '5511999991111',
    companyName: 'GestorTV Central',
    pixKey: 'gestortv.admin@pix.com.br',
    pixKeyType: 'email',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'revendedor.marcos@gestortv.com.br',
    fullName: 'Marcos Vinicius (Revendedor)',
    role: 'reseller',
    phone: '5521988882222',
    companyName: 'MV Play TV',
    pixKey: '11988882222',
    pixKeyType: 'phone',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'atendente.ana@gestortv.com.br',
    fullName: 'Ana Clara (Atendente Suporte)',
    role: 'attendant',
    phone: '5531977773333',
    companyName: 'GestorTV Suporte',
    pixKey: 'suporte@gestortv.com.br',
    pixKeyType: 'email',
  },
];

// 2. Planos Padrão
export const INITIAL_PLANS: Plan[] = [
  {
    id: 'p1',
    name: 'Start Básico (1 Tela)',
    durationMonths: 1,
    durationType: 'mensal',
    price: 34.90,
    screens: 1,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'p2',
    name: 'Família Plus (2 Telas)',
    durationMonths: 1,
    durationType: 'mensal',
    price: 49.90,
    screens: 2,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'p3',
    name: 'Trimestral Econômico (2 Telas)',
    durationMonths: 3,
    durationType: 'trimestral',
    price: 134.90,
    screens: 2,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'p4',
    name: 'Semestral Turbo (3 Telas)',
    durationMonths: 6,
    durationType: 'semestral',
    price: 249.90,
    screens: 3,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'p5',
    name: 'Anual VIP Master (4 Telas)',
    durationMonths: 12,
    durationType: 'anual',
    price: 429.90,
    screens: 4,
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// 3. Cupons de Desconto
export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c1',
    code: 'BEMVINDO10',
    discountType: 'percent',
    discountValue: 10,
    maxUses: 100,
    usedCount: 14,
    validUntil: '2027-01-01',
    isActive: true,
  },
  {
    id: 'c2',
    code: 'PIX15',
    discountType: 'fixed',
    discountValue: 15,
    maxUses: 50,
    usedCount: 8,
    validUntil: '2026-12-31',
    isActive: true,
  },
  {
    id: 'c3',
    code: 'VIP20',
    discountType: 'percent',
    discountValue: 20,
    maxUses: 200,
    usedCount: 42,
    validUntil: '2027-06-30',
    isActive: true,
  },
];

// 4. Modelos de Mensagem
export const INITIAL_TEMPLATES: MessageTemplate[] = [
  {
    id: 't1',
    name: 'Lembrete Amigável (3 dias antes)',
    triggerEvent: 'before_3_days',
    content: 'Olá {nome}, tudo bem? 👋 Sua assinatura do GestorTV vence em 3 dias ({vencimento}). Garanta seu acesso sem interrupções! Valor: {valor}. Pague rápido via Pix: {link_pagamento}',
    isActive: true,
  },
  {
    id: 't2',
    name: 'Vencimento Hoje (Dia D)',
    triggerEvent: 'on_due_date',
    content: '🚨 Olá {nome}! Sua assinatura vence HOJE ({vencimento}). Para evitar o bloqueio automático de suas telas, efetue a renovação no valor de {valor} acessando: {link_pagamento}',
    isActive: true,
  },
  {
    id: 't3',
    name: 'Aviso de Suspensão (+2 dias)',
    triggerEvent: 'after_2_days',
    content: '⚠️ {nome}, identificamos que sua fatura de {valor} com vencimento em {vencimento} está em aberto. Seu sinal poderá ser interrompido a qualquer instante. Regularize agora: {link_pagamento}',
    isActive: true,
  },
  {
    id: 't4',
    name: 'Confirmação de Pagamento',
    triggerEvent: 'payment_confirmed',
    content: '✅ Obrigado, {nome}! Seu pagamento de {valor} foi confirmado com sucesso. Seu acesso foi renovado até {vencimento}. Bom divertimento! 🍿📺',
    isActive: true,
  },
];

// 5. 30 Clientes Fictícios Brasileiros Realistas
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Rodrigo Mendonça Alencar',
    whatsapp: '5511981234567',
    email: 'rodrigo.mendonca@gmail.com',
    city: 'São Paulo - SP',
    planId: 'p2',
    startDate: '2026-08-15',
    dueDate: '2026-10-20', // vencendo em breve
    screens: 2,
    devices: ['Smart TV Samsung 4K', 'Fire Stick HD'],
    notes: 'Prefere receber lembretes no período da manhã.',
    status: 'expiring',
    consentLgpd: true,
    consentDate: '2026-08-15T10:00:00Z',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'cust-2',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Juliana Paes de Oliveira',
    whatsapp: '5521998765432',
    email: 'juliana.paes@outlook.com',
    city: 'Rio de Janeiro - RJ',
    planId: 'p1',
    startDate: '2026-07-01',
    dueDate: '2026-11-01',
    screens: 1,
    devices: ['Smart TV LG WebOS'],
    notes: 'Cliente super pontual, paga no primeiro lembrete.',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-07-01T14:20:00Z',
    createdAt: '2026-07-01T14:20:00Z',
    updatedAt: '2026-10-01T09:15:00Z',
  },
  {
    id: 'cust-3',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Lucas Gabriel Silveira',
    whatsapp: '5531976543210',
    email: 'lucas.gabriel@hotmail.com',
    city: 'Belo Horizonte - MG',
    planId: 'p3',
    startDate: '2026-07-14',
    dueDate: '2026-10-14', // Vencido faz 4 dias
    screens: 2,
    devices: ['TV Box Xiaomi Mi Box S', 'Celular Android'],
    notes: 'Atrasou 4 dias, avisou que paga até sexta.',
    status: 'expired',
    consentLgpd: true,
    consentDate: '2026-07-14T11:00:00Z',
    createdAt: '2026-07-14T11:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'cust-4',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Beatriz Lima Guimarães',
    whatsapp: '5541991239876',
    email: 'beatriz.guimaraes@yahoo.com.br',
    city: 'Curitiba - PR',
    planId: 'p5',
    startDate: '2026-04-10',
    dueDate: '2027-04-10',
    screens: 4,
    devices: ['Smart TV Samsung', 'Smart TV TCL', 'Fire Stick 4K Max', 'iPad Pro'],
    notes: 'Assinatura Anual VIP contratada com desconto.',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-04-10T16:00:00Z',
    createdAt: '2026-04-10T16:00:00Z',
    updatedAt: '2026-04-10T16:00:00Z',
  },
  {
    id: 'cust-5',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Matheus Costa Farias',
    whatsapp: '5551982345678',
    email: 'matheus.cfarias@gmail.com',
    city: 'Porto Alegre - RS',
    planId: 'p1',
    startDate: '2026-10-17',
    dueDate: '2026-10-20',
    screens: 1,
    devices: ['Smart TV Roku TCL'],
    notes: 'Teste grátis de 3 dias solicitado via WhatsApp.',
    status: 'trial',
    consentLgpd: true,
    consentDate: '2026-10-17T18:00:00Z',
    createdAt: '2026-10-17T18:00:00Z',
    updatedAt: '2026-10-17T18:00:00Z',
  },
  {
    id: 'cust-6',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Camila Antunes Siqueira',
    whatsapp: '5571993456789',
    email: 'camila.antunes@globo.com',
    city: 'Salvador - BA',
    planId: 'p2',
    startDate: '2026-06-19',
    dueDate: '2026-10-19', // Vence amanhã
    screens: 2,
    devices: ['Smart TV Philco', 'Chromecast 4 Google TV'],
    notes: 'Vence amanhã, mensagem automática já na fila.',
    status: 'expiring',
    consentLgpd: true,
    consentDate: '2026-06-19T09:30:00Z',
    createdAt: '2026-06-19T09:30:00Z',
    updatedAt: '2026-10-18T08:00:00Z',
  },
  {
    id: 'cust-7',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Fernando Henrique Rocha',
    whatsapp: '5561984567890',
    email: 'fh.rocha@uol.com.br',
    city: 'Brasília - DF',
    planId: 'p4',
    startDate: '2026-03-25',
    dueDate: '2026-10-05',
    screens: 3,
    devices: ['Smart TV Sony Bravia', 'Fire Stick Lite', 'iPhone 15'],
    notes: 'Suspenso a pedido do cliente por motivo de viagem.',
    status: 'suspended',
    consentLgpd: true,
    consentDate: '2026-03-25T13:00:00Z',
    createdAt: '2026-03-25T13:00:00Z',
    updatedAt: '2026-10-06T11:00:00Z',
  },
  {
    id: 'cust-8',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Larissa Duarte Rezende',
    whatsapp: '5581995678901',
    email: 'larissa.rezende@gmail.com',
    city: 'Recife - PE',
    planId: 'p1',
    startDate: '2026-09-18',
    dueDate: '2026-10-18', // Vence HOJE
    screens: 1,
    devices: ['Smart TV LG WebOS'],
    notes: 'Vence hoje, enviar QR code de pagamento.',
    status: 'expiring',
    consentLgpd: true,
    consentDate: '2026-09-18T10:00:00Z',
    createdAt: '2026-09-18T10:00:00Z',
    updatedAt: '2026-10-18T07:00:00Z',
  },
  {
    id: 'cust-9',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Thiago Meireles Prado',
    whatsapp: '5585986789012',
    email: 'thiago.prado@gmail.com',
    city: 'Fortaleza - CE',
    planId: 'p2',
    startDate: '2026-10-01',
    dueDate: '2026-11-01',
    screens: 2,
    devices: ['Fire Stick 4K', 'Smart TV Samsung'],
    notes: 'Cliente novo ativo e satisfeito.',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-10-01T15:00:00Z',
    createdAt: '2026-10-01T15:00:00Z',
    updatedAt: '2026-10-01T15:00:00Z',
  },
  {
    id: 'cust-10',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Renata Vasconcelos Brito',
    whatsapp: '5548997890123',
    email: 'renata.vbrito@terra.com.br',
    city: 'Florianópolis - SC',
    planId: 'p3',
    startDate: '2026-08-01',
    dueDate: '2026-11-01',
    screens: 2,
    devices: ['Apple TV 4K', 'Smart TV Panasonic'],
    notes: 'Plano trimestral.',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-08-01T12:00:00Z',
    createdAt: '2026-08-01T12:00:00Z',
    updatedAt: '2026-08-01T12:00:00Z',
  },
  {
    id: 'cust-11',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Danilo Bezerra Cavalcanti',
    whatsapp: '5519998901234',
    email: 'danilo.bezerra@gmail.com',
    city: 'Campinas - SP',
    planId: 'p1',
    startDate: '2026-09-25',
    dueDate: '2026-10-25',
    screens: 1,
    devices: ['Smart TV Samsung Tizen'],
    notes: '',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-09-25T11:00:00Z',
    createdAt: '2026-09-25T11:00:00Z',
    updatedAt: '2026-09-25T11:00:00Z',
  },
  {
    id: 'cust-12',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Patricia Nogueira Fontes',
    whatsapp: '5562981012345',
    email: 'patricia.fontes@gmail.com',
    city: 'Goiânia - GO',
    planId: 'p2',
    startDate: '2026-08-16',
    dueDate: '2026-10-16', // Venceu faz 2 dias
    screens: 2,
    devices: ['Fire Stick HD', 'Smart TV Philips Android'],
    notes: 'Venceu faz 2 dias, régua D+2 disparada.',
    status: 'expired',
    consentLgpd: true,
    consentDate: '2026-08-16T17:00:00Z',
    createdAt: '2026-08-16T17:00:00Z',
    updatedAt: '2026-10-17T09:00:00Z',
  },
  {
    id: 'cust-13',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Guilherme Macedo Barros',
    whatsapp: '5527992123456',
    email: 'guilherme.macedo@outlook.com',
    city: 'Vitória - ES',
    planId: 'p4',
    startDate: '2026-05-10',
    dueDate: '2026-11-10',
    screens: 3,
    devices: ['Smart TV LG', 'Smart TV Samsung', 'Celular Samsung'],
    notes: 'Plano semestral, renovação automática.',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-05-10T08:00:00Z',
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-05-10T08:00:00Z',
  },
  {
    id: 'cust-14',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Vanessa Cristina Toledo',
    whatsapp: '5512983234567',
    email: 'vanessa.toledo@gmail.com',
    city: 'São José dos Campos - SP',
    planId: 'p1',
    startDate: '2026-08-12',
    dueDate: '2026-10-12', // Vencido faz 6 dias
    screens: 1,
    devices: ['Chromecast com Google TV'],
    notes: 'Inadimplente 6 dias, aguardando retorno no WhatsApp.',
    status: 'expired',
    consentLgpd: true,
    consentDate: '2026-08-12T14:00:00Z',
    createdAt: '2026-08-12T14:00:00Z',
    updatedAt: '2026-10-14T10:00:00Z',
  },
  {
    id: 'cust-15',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Vinicius Tavares Pinho',
    whatsapp: '5591994345678',
    email: 'vinicius.pinho@hotmail.com',
    city: 'Belém - PA',
    planId: 'p1',
    startDate: '2026-10-16',
    dueDate: '2026-10-19',
    screens: 1,
    devices: ['Smart TV AOC Roku'],
    notes: 'Teste grátis.',
    status: 'trial',
    consentLgpd: true,
    consentDate: '2026-10-16T19:00:00Z',
    createdAt: '2026-10-16T19:00:00Z',
    updatedAt: '2026-10-16T19:00:00Z',
  },
  {
    id: 'cust-16',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Mariana Albuquerque Ramos',
    whatsapp: '5592985456789',
    email: 'mariana.ramos@gmail.com',
    city: 'Manaus - AM',
    planId: 'p2',
    startDate: '2026-07-28',
    dueDate: '2026-10-28',
    screens: 2,
    devices: ['Smart TV Samsung 55', 'Celular Motorola'],
    notes: 'Cliente antiga fiel.',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-07-28T16:00:00Z',
    createdAt: '2026-07-28T16:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
  },
  {
    id: 'cust-17',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Alexandre Borges Silveira',
    whatsapp: '5567996567890',
    email: 'alexandre.borges@gmail.com',
    city: 'Campo Grande - MS',
    planId: 'p2',
    startDate: '2026-09-19',
    dueDate: '2026-10-19', // Vence amanhã
    screens: 2,
    devices: ['TV Box TX9', 'Smart TV Philco'],
    notes: 'Vence amanhã.',
    status: 'expiring',
    consentLgpd: true,
    consentDate: '2026-09-19T11:00:00Z',
    createdAt: '2026-09-19T11:00:00Z',
    updatedAt: '2026-10-18T08:00:00Z',
  },
  {
    id: 'cust-18',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Tatiane Martins Cordeiro',
    whatsapp: '5584997678901',
    email: 'tatiane.cordeiro@gmail.com',
    city: 'Natal - RN',
    planId: 'p3',
    startDate: '2026-08-05',
    dueDate: '2026-11-05',
    screens: 2,
    devices: ['Smart TV LG OLED', 'Fire Stick 4K'],
    notes: 'Adora filmes e séries.',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-08-05T13:30:00Z',
    createdAt: '2026-08-05T13:30:00Z',
    updatedAt: '2026-08-05T13:30:00Z',
  },
  {
    id: 'cust-19',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Eduardo Fagundes Peixoto',
    whatsapp: '5583998789012',
    email: 'eduardo.peixoto@yahoo.com',
    city: 'João Pessoa - PB',
    planId: 'p1',
    startDate: '2026-07-10',
    dueDate: '2026-10-08',
    screens: 1,
    devices: ['Smart TV TCL Android'],
    notes: 'Suspenso após 10 dias sem pagamento.',
    status: 'suspended',
    consentLgpd: true,
    consentDate: '2026-07-10T15:00:00Z',
    createdAt: '2026-07-10T15:00:00Z',
    updatedAt: '2026-10-10T09:00:00Z',
  },
  {
    id: 'cust-20',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Priscila Dornelles Rios',
    whatsapp: '5586999890123',
    email: 'priscila.rios@gmail.com',
    city: 'Teresina - PI',
    planId: 'p2',
    startDate: '2026-10-04',
    dueDate: '2026-11-04',
    screens: 2,
    devices: ['Smart TV Samsung 43'],
    notes: 'Pagou via Pix adiantado.',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-10-04T12:00:00Z',
    createdAt: '2026-10-04T12:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z',
  },
  {
    id: 'cust-21',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Bruno Cesar Valente',
    whatsapp: '5598990901234',
    email: 'bruno.valente@gmail.com',
    city: 'São Luís - MA',
    planId: 'p1',
    startDate: '2026-09-20',
    dueDate: '2026-10-20', // Vencendo em 2 dias
    screens: 1,
    devices: ['Fire Stick HD'],
    notes: '',
    status: 'expiring',
    consentLgpd: true,
    consentDate: '2026-09-20T10:00:00Z',
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-10-18T08:00:00Z',
  },
  {
    id: 'cust-22',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Sabrina Meireles Leite',
    whatsapp: '5579991012345',
    email: 'sabrina.leite@gmail.com',
    city: 'Aracaju - SE',
    planId: 'p5',
    startDate: '2026-03-01',
    dueDate: '2027-03-01',
    screens: 4,
    devices: ['Smart TV Samsung', 'Smart TV LG', 'Fire Stick 4K', 'TV Box Xiaomi'],
    notes: 'Cliente Anual Master.',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-03-01T11:00:00Z',
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-03-01T11:00:00Z',
  },
  {
    id: 'cust-23',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Leandro Assis Camargo',
    whatsapp: '5582992123456',
    email: 'leandro.camargo@gmail.com',
    city: 'Maceió - AL',
    planId: 'p1',
    startDate: '2026-09-18',
    dueDate: '2026-10-18', // Vence HOJE
    screens: 1,
    devices: ['Smart TV LG WebOS'],
    notes: 'Vence hoje!',
    status: 'expiring',
    consentLgpd: true,
    consentDate: '2026-09-18T14:00:00Z',
    createdAt: '2026-09-18T14:00:00Z',
    updatedAt: '2026-10-18T06:00:00Z',
  },
  {
    id: 'cust-24',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Debora Esteves Pimentel',
    whatsapp: '5568993234567',
    email: 'debora.pimentel@gmail.com',
    city: 'Rio Branco - AC',
    planId: 'p2',
    startDate: '2026-08-01',
    dueDate: '2026-10-01',
    screens: 2,
    devices: ['Smart TV Samsung', 'Celular iPhone'],
    notes: 'Inadimplente 17 dias, suspenso.',
    status: 'suspended',
    consentLgpd: true,
    consentDate: '2026-08-01T15:00:00Z',
    createdAt: '2026-08-01T15:00:00Z',
    updatedAt: '2026-10-05T09:00:00Z',
  },
  {
    id: 'cust-25',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Marcio Andre Queiroz',
    whatsapp: '5569994345678',
    email: 'marcio.queiroz@gmail.com',
    city: 'Porto Velho - RO',
    planId: 'p1',
    startDate: '2026-10-15',
    dueDate: '2026-10-18', // Vence hoje teste
    screens: 1,
    devices: ['TV Box Aquário'],
    notes: 'Último dia de teste grátis.',
    status: 'trial',
    consentLgpd: true,
    consentDate: '2026-10-15T16:00:00Z',
    createdAt: '2026-10-15T16:00:00Z',
    updatedAt: '2026-10-15T16:00:00Z',
  },
  {
    id: 'cust-26',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Aline Soares Nogueira',
    whatsapp: '5595995456789',
    email: 'aline.soares@gmail.com',
    city: 'Boa Vista - RR',
    planId: 'p2',
    startDate: '2026-09-23',
    dueDate: '2026-10-23',
    screens: 2,
    devices: ['Smart TV Philco Roku'],
    notes: '',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-09-23T11:00:00Z',
    createdAt: '2026-09-23T11:00:00Z',
    updatedAt: '2026-09-23T11:00:00Z',
  },
  {
    id: 'cust-27',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Otavio Augusto Gouveia',
    whatsapp: '5596996567890',
    email: 'otavio.gouveia@gmail.com',
    city: 'Macapá - AP',
    planId: 'p3',
    startDate: '2026-08-18',
    dueDate: '2026-11-18',
    screens: 2,
    devices: ['Fire Stick 4K', 'Smart TV Samsung'],
    notes: 'Plano trimestral.',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-08-18T10:00:00Z',
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-08-18T10:00:00Z',
  },
  {
    id: 'cust-28',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Flavia Helena Cardoso',
    whatsapp: '5563997678901',
    email: 'flavia.cardoso@gmail.com',
    city: 'Palmas - TO',
    planId: 'p1',
    startDate: '2026-09-13',
    dueDate: '2026-10-13', // Vencido faz 5 dias
    screens: 1,
    devices: ['Smart TV LG'],
    notes: 'Cobrança manual enviada.',
    status: 'expired',
    consentLgpd: true,
    consentDate: '2026-09-13T14:00:00Z',
    createdAt: '2026-09-13T14:00:00Z',
    updatedAt: '2026-10-14T09:00:00Z',
  },
  {
    id: 'cust-29',
    userId: '00000000-0000-0000-0000-000000000002', // Reseller Marcos
    name: 'Rogerio Diniz Vilela',
    whatsapp: '5516998789012',
    email: 'rogerio.vilela@gmail.com',
    city: 'Ribeirão Preto - SP',
    planId: 'p4',
    startDate: '2026-05-18',
    dueDate: '2026-11-18',
    screens: 3,
    devices: ['Smart TV Samsung 65', 'Fire Stick 4K', 'iPad Mini'],
    notes: 'Semestral.',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-05-18T17:00:00Z',
    createdAt: '2026-05-18T17:00:00Z',
    updatedAt: '2026-05-18T17:00:00Z',
  },
  {
    id: 'cust-30',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Gisele Cristine Moura',
    whatsapp: '5513999890123',
    email: 'gisele.moura@gmail.com',
    city: 'Santos - SP',
    planId: 'p2',
    startDate: '2026-09-28',
    dueDate: '2026-10-28',
    screens: 2,
    devices: ['Smart TV Samsung', 'Chromecast'],
    notes: '',
    status: 'active',
    consentLgpd: true,
    consentDate: '2026-09-28T12:00:00Z',
    createdAt: '2026-09-28T12:00:00Z',
    updatedAt: '2026-09-28T12:00:00Z',
  },
];

// 6. Chamados de Suporte Iniciais com histórico de mensagens e respostas
export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 't-1',
    customerId: 'cust-1',
    customerName: 'Rodrigo Mendonça Alencar',
    createdBy: '00000000-0000-0000-0000-000000000001',
    assignedTo: '00000000-0000-0000-0000-000000000003',
    title: 'Canais de esporte em 4K travando no Fire Stick',
    description: 'Cliente relata travamentos frequentes após 10 minutos de transmissão ao vivo no Fire Stick.',
    priority: 'high',
    status: 'in_progress',
    deviceType: 'fire_stick',
    createdAt: '2026-10-17T14:30:00Z',
    updatedAt: '2026-10-18T09:00:00Z',
    messages: [
      {
        id: 'tm-1',
        ticketId: 't-1',
        senderId: '00000000-0000-0000-0000-000000000001',
        senderName: 'Carlos Eduardo (Admin)',
        senderType: 'agent',
        message: 'Chamado aberto. Encaminhado para a atendente Ana verificar a rota CDN.',
        createdAt: '2026-10-17T14:30:00Z',
      },
      {
        id: 'tm-2',
        ticketId: 't-1',
        senderId: '00000000-0000-0000-0000-000000000003',
        senderName: 'Ana Clara (Atendente Suporte)',
        senderType: 'agent',
        message: 'Orientado cliente a limpar o cache do aplicativo nas configurações do Fire Stick e trocar o player interno para ExoPlayer.',
        createdAt: '2026-10-18T09:00:00Z',
      },
    ],
  },
  {
    id: 't-2',
    customerId: 'cust-2',
    customerName: 'Juliana Paes de Oliveira',
    createdBy: '00000000-0000-0000-0000-000000000001',
    assignedTo: '00000000-0000-0000-0000-000000000003',
    title: 'Como ativar legendas na Smart TV LG WebOS',
    description: 'Dúvida de configuração do app na TV da sala.',
    priority: 'low',
    status: 'resolved',
    deviceType: 'smart_tv',
    createdAt: '2026-10-16T11:00:00Z',
    updatedAt: '2026-10-16T11:30:00Z',
    messages: [
      {
        id: 'tm-3',
        ticketId: 't-2',
        senderId: '00000000-0000-0000-0000-000000000003',
        senderName: 'Ana Clara (Atendente Suporte)',
        senderType: 'agent',
        message: 'Enviado tutorial rápido com captura de tela da TV LG. Cliente conseguiu ativar e confirmou resolução!',
        createdAt: '2026-10-16T11:30:00Z',
      },
    ],
  },
  {
    id: 't-3',
    customerId: 'cust-3',
    customerName: 'Lucas Gabriel Silveira',
    createdBy: '00000000-0000-0000-0000-000000000002',
    title: 'Erro de reprodução no TV Box Xiaomi',
    description: 'Após reiniciar a internet, aplicativo apresenta erro de conexão no canal Premiere.',
    priority: 'urgent',
    status: 'open',
    deviceType: 'tv_box',
    createdAt: '2026-10-18T08:15:00Z',
    updatedAt: '2026-10-18T08:15:00Z',
    messages: [
      {
        id: 'tm-4',
        ticketId: 't-3',
        senderId: '00000000-0000-0000-0000-000000000002',
        senderName: 'Marcos Vinicius (Revendedor)',
        senderType: 'agent',
        message: 'Aberto chamado prioritário para testar DNS 1.1.1.1 ou 8.8.8.8.',
        createdAt: '2026-10-18T08:15:00Z',
      },
    ],
  },
];

// 7. Faturas Iniciais geradas para demonstração
export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    customerId: 'cust-1',
    customerName: 'Rodrigo Mendonça Alencar',
    planId: 'p2',
    planName: 'Família Plus (2 Telas)',
    amount: 49.90,
    discountAmount: 0,
    finalAmount: 49.90,
    dueDate: '2026-10-20',
    status: 'pending',
    pixCode: generatePixPayload('gestortv.admin@pix.com.br', 'Rodrigo Mendonca', 'SAO PAULO', 49.90, 'INV001').pixCode,
    pixQrUrl: generatePixPayload('gestortv.admin@pix.com.br', 'Rodrigo Mendonca', 'SAO PAULO', 49.90, 'INV001').qrUrl,
    paymentMethod: 'pix',
    createdAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'inv-2',
    customerId: 'cust-2',
    customerName: 'Juliana Paes de Oliveira',
    planId: 'p1',
    planName: 'Start Básico (1 Tela)',
    amount: 34.90,
    discountAmount: 0,
    finalAmount: 34.90,
    dueDate: '2026-10-01',
    status: 'paid',
    pixCode: generatePixPayload('gestortv.admin@pix.com.br', 'Juliana Paes', 'RIO DE JANEIRO', 34.90, 'INV002').pixCode,
    pixQrUrl: generatePixPayload('gestortv.admin@pix.com.br', 'Juliana Paes', 'RIO DE JANEIRO', 34.90, 'INV002').qrUrl,
    paymentMethod: 'pix',
    paidAt: '2026-10-01T10:14:00Z',
    createdAt: '2026-09-25T09:00:00Z',
  },
  {
    id: 'inv-3',
    customerId: 'cust-3',
    customerName: 'Lucas Gabriel Silveira',
    planId: 'p3',
    planName: 'Trimestral Econômico (2 Telas)',
    amount: 134.90,
    discountAmount: 0,
    finalAmount: 134.90,
    dueDate: '2026-10-14',
    status: 'overdue',
    pixCode: generatePixPayload('11988882222', 'Lucas Gabriel', 'BELO HORIZONTE', 134.90, 'INV003').pixCode,
    pixQrUrl: generatePixPayload('11988882222', 'Lucas Gabriel', 'BELO HORIZONTE', 134.90, 'INV003').qrUrl,
    paymentMethod: 'pix',
    createdAt: '2026-10-07T08:00:00Z',
  },
  {
    id: 'inv-4',
    customerId: 'cust-8',
    customerName: 'Larissa Duarte Rezende',
    planId: 'p1',
    planName: 'Start Básico (1 Tela)',
    amount: 34.90,
    discountAmount: 0,
    finalAmount: 34.90,
    dueDate: '2026-10-18', // Vence HOJE
    status: 'pending',
    pixCode: generatePixPayload('gestortv.admin@pix.com.br', 'Larissa Duarte', 'RECIFE', 34.90, 'INV004').pixCode,
    pixQrUrl: generatePixPayload('gestortv.admin@pix.com.br', 'Larissa Duarte', 'RECIFE', 34.90, 'INV004').qrUrl,
    paymentMethod: 'pix',
    createdAt: '2026-10-15T08:00:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: '00000000-0000-0000-0000-000000000001',
    userName: 'Carlos Eduardo (Admin)',
    action: 'SISTEMA_INICIALIZADO',
    resourceType: 'system',
    resourceId: 'root',
    details: 'Base do GestorTV carregada com 30 clientes e faturamento configurado.',
    createdAt: '2026-10-18T08:00:00Z',
  },
  {
    id: 'log-2',
    userId: '00000000-0000-0000-0000-000000000001',
    userName: 'Carlos Eduardo (Admin)',
    action: 'FATURA_GERADA',
    resourceType: 'invoices',
    resourceId: 'inv-1',
    details: 'Fatura de R$ 49,90 gerada automaticamente para Rodrigo Mendonça.',
    createdAt: '2026-10-15T09:00:00Z',
  },
];

// Helper para sincronização com LocalStorage
const STORAGE_PREFIX = 'gestortv_';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Erro ao carregar chave ${key} do localStorage`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Erro ao salvar chave ${key} no localStorage`, e);
  }
}

/**
 * Hook central do estado de Gestão
 */
export function useCrmStore() {
  const [currentProfileId, setCurrentProfileId] = useState<string>(() =>
    loadFromStorage('profile_id', INITIAL_PROFILES[0].id)
  );
  const [profiles, setProfiles] = useState<UserProfile[]>(() =>
    loadFromStorage('profiles', INITIAL_PROFILES)
  );
  const [plans, setPlans] = useState<Plan[]>(() =>
    loadFromStorage('plans', INITIAL_PLANS)
  );
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    loadFromStorage('coupons', INITIAL_COUPONS)
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadFromStorage('customers', INITIAL_CUSTOMERS)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadFromStorage('invoices', INITIAL_INVOICES)
  );
  const [templates, setTemplates] = useState<MessageTemplate[]>(() =>
    loadFromStorage('templates', INITIAL_TEMPLATES)
  );
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>(() =>
    loadFromStorage('queue', [])
  );
  const [tickets, setTickets] = useState<Ticket[]>(() =>
    loadFromStorage('tickets', INITIAL_TICKETS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadFromStorage('audit_logs', INITIAL_AUDIT_LOGS)
  );
  const [pixProviderType, setPixProviderType] = useState<'mock' | 'mercadopago' | 'asaas'>(() =>
    loadFromStorage('pix_provider_type', 'mock')
  );

  // Perfil ativo no momento
  const currentProfile = profiles.find((p) => p.id === currentProfileId) || profiles[0];

  // Regra de RLS: Se for 'reseller', enxerga somente os clientes que possuem seu userId!
  // Se for 'admin' ou 'attendant', enxerga todos.
  const visibleCustomers = customers.filter((cust) => {
    if (currentProfile.role === 'admin' || currentProfile.role === 'attendant') {
      return true;
    }
    return cust.userId === currentProfile.id;
  });

  const visibleInvoices = invoices.filter((inv) => {
    if (currentProfile.role === 'admin' || currentProfile.role === 'attendant') {
      return true;
    }
    const customer = customers.find((c) => c.id === inv.customerId);
    return customer && customer.userId === currentProfile.id;
  });

  // Salvar alterações
  useEffect(() => {
    saveToStorage('profile_id', currentProfileId);
  }, [currentProfileId]);

  useEffect(() => {
    saveToStorage('customers', customers);
  }, [customers]);

  useEffect(() => {
    saveToStorage('invoices', invoices);
  }, [invoices]);

  useEffect(() => {
    saveToStorage('plans', plans);
  }, [plans]);

  useEffect(() => {
    saveToStorage('coupons', coupons);
  }, [coupons]);

  useEffect(() => {
    saveToStorage('templates', templates);
  }, [templates]);

  useEffect(() => {
    saveToStorage('queue', messageQueue);
  }, [messageQueue]);

  useEffect(() => {
    saveToStorage('tickets', tickets);
  }, [tickets]);

  useEffect(() => {
    saveToStorage('audit_logs', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    saveToStorage('pix_provider_type', pixProviderType);
  }, [pixProviderType]);

  // Auditoria
  const addAuditLog = (action: string, resourceType: string, resourceId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentProfile.id,
      userName: currentProfile.fullName,
      action,
      resourceType,
      resourceId,
      details,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Clientes
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      userId: currentProfile.id,
      status: calculateCustomerStatus(customerData.dueDate, customerData.status),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    addAuditLog('CLIENTE_CRIADO', 'customers', newCustomer.id, `Novo cliente cadastrado: ${newCustomer.name}`);

    // Gerar fatura inicial se não for teste
    if (newCustomer.status !== 'trial') {
      const plan = plans.find((p) => p.id === newCustomer.planId);
      if (plan) {
        createInvoice(newCustomer.id, plan.id);
      }
    }
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates, updatedAt: new Date().toISOString() };
          if (updates.dueDate) {
            updated.status = calculateCustomerStatus(updates.dueDate, updated.status);
          }
          return updated;
        }
        return c;
      })
    );
    addAuditLog('CLIENTE_ATUALIZADO', 'customers', id, `Dados do cliente atualizados`);
  };

  const deleteCustomer = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setInvoices((prev) => prev.filter((i) => i.customerId !== id));
    setTickets((prev) => prev.filter((t) => t.customerId !== id));
    addAuditLog('CLIENTE_EXCLUIDO', 'customers', id, `Cliente removido do sistema: ${customer?.name || id}`);
  };

  // LGPD: Anonimização de dados pessoais
  const anonymizeCustomer = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            name: `Titular Anonimizado #${c.id.slice(-4)}`,
            whatsapp: '00000000000',
            email: 'anonimizado@lgpd.gestortv',
            notes: '[DADOS PESSOAIS ANONIMIZADOS A PEDIDO DO TITULAR CONFORME ART. 18 LGPD]',
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
    addAuditLog('LGPD_ANONIMIZACAO', 'customers', id, `Direito ao esquecimento executado conforme LGPD.`);
  };

  // RENOVAÇÃO COM 1 CLIQUE
  const renewCustomer = (customerId: string, durationMonths?: number): { nextDueDate: string; customerName: string } => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) throw new Error('Cliente não encontrado');

    const plan = plans.find((p) => p.id === customer.planId);
    const months = durationMonths || (plan ? plan.durationMonths : 1);
    const nextDueDate = calculateDueDate(customer.dueDate, months);

    // Atualiza cliente
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            dueDate: nextDueDate,
            status: 'active',
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    // Dá baixa na fatura pendente mais recente deste cliente se houver, ou cria uma fatura paga
    const pendingInv = invoices.find((inv) => inv.customerId === customerId && inv.status !== 'paid');
    if (pendingInv) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === pendingInv.id
            ? { ...inv, status: 'paid', paidAt: new Date().toISOString() }
            : inv
        )
      );
    } else if (plan) {
      const newPaidInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        customerId: customer.id,
        customerName: customer.name,
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        discountAmount: 0,
        finalAmount: plan.price,
        dueDate: customer.dueDate,
        status: 'paid',
        paymentMethod: 'pix',
        pixCode: generatePixPayload(currentProfile.pixKey, customer.name, customer.city, plan.price).pixCode,
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setInvoices((prev) => [newPaidInvoice, ...prev]);
    }

    addAuditLog(
      'CLIENTE_RENOVADO_1_CLIQUE',
      'customers',
      customerId,
      `Renovação realizada com 1 clique. Novo vencimento: ${nextDueDate}`
    );

    return { nextDueDate, customerName: customer.name };
  };

  // Planos
  const addPlan = (plan: Omit<Plan, 'id' | 'createdAt'>) => {
    const newPlan: Plan = {
      ...plan,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPlans((prev) => [...prev, newPlan]);
    addAuditLog('PLANO_CRIADO', 'plans', newPlan.id, `Novo plano: ${newPlan.name}`);
  };

  const updatePlan = (id: string, updates: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    addAuditLog('PLANO_ATUALIZADO', 'plans', id, `Plano modificado`);
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('PLANO_EXCLUIDO', 'plans', id, `Plano desativado/removido`);
  };

  // Cupons
  const addCoupon = (coupon: Omit<Coupon, 'id' | 'usedCount'>) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: `c-${Date.now()}`,
      usedCount: 0,
    };
    setCoupons((prev) => [...prev, newCoupon]);
    addAuditLog('CUPOM_CRIADO', 'coupons', newCoupon.id, `Cupom: ${newCoupon.code}`);
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  // Faturas e Cobranças
  const createInvoice = (customerId: string, planId: string, couponCode?: string): Invoice => {
    const customer = customers.find((c) => c.id === customerId);
    const plan = plans.find((p) => p.id === planId);
    if (!customer || !plan) throw new Error('Dados inválidos para geração de fatura');

    let couponObj = null;
    if (couponCode) {
      couponObj = coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    }

    const { discount, finalAmount } = applyCoupon(plan.price, couponObj);
    const pixData = generatePixPayload(
      currentProfile.pixKey || 'pix@gestortv.com.br',
      customer.name,
      customer.city,
      finalAmount
    );

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      discountAmount: discount,
      finalAmount,
      dueDate: customer.dueDate,
      status: 'pending',
      pixCode: pixData.pixCode,
      pixQrUrl: pixData.qrUrl,
      paymentMethod: 'pix',
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    addAuditLog('FATURA_GERADA', 'invoices', newInvoice.id, `Fatura de R$ ${finalAmount.toFixed(2)} criada.`);
    return newInvoice;
  };

  // Dar baixa em fatura (Manual ou Webhook) e renovar cliente automaticamente
  const payInvoice = (
    invoiceId: string,
    method: 'pix' | 'manual_cash' | 'manual_transfer' | 'credit_card' = 'pix',
    isWebhook: boolean = false
  ) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return;

    const paidAt = new Date().toISOString();

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'paid',
              paymentMethod: method,
              paidAt,
            }
          : inv
      )
    );

    // Renova o cliente automaticamente
    const customer = customers.find((c) => c.id === invoice.customerId);
    if (customer) {
      const plan = plans.find((p) => p.id === invoice.planId);
      const months = plan ? plan.durationMonths : 1;
      const nextDueDate = calculateDueDate(customer.dueDate, months);

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id
            ? {
                ...c,
                dueDate: nextDueDate,
                status: 'active',
                updatedAt: paidAt,
              }
            : c
        )
      );

      // Adiciona mensagem automática de confirmação na fila
      const confirmTpl = templates.find((t) => t.triggerEvent === 'payment_confirmed');
      if (confirmTpl && confirmTpl.isActive) {
        const body = replaceTemplateVariables(confirmTpl.content, {
          name: customer.name,
          amount: invoice.finalAmount,
          dueDate: nextDueDate,
        });

        const newMsg: QueuedMessage = {
          id: `msg-${Date.now()}`,
          customerId: customer.id,
          customerName: customer.name,
          phone: customer.whatsapp,
          templateId: confirmTpl.id,
          body,
          status: 'sent', // marcada como enviada após confirmação de pagamento
          scheduledFor: paidAt,
          sentAt: paidAt,
        };
        setMessageQueue((prev) => [newMsg, ...prev]);
      }
    }

    addAuditLog(
      isWebhook ? 'WEBHOOK_PAGAMENTO_CONFIRMADO' : 'PAGAMENTO_REGISTRADO',
      'invoices',
      invoiceId,
      `Pagamento de R$ ${invoice.finalAmount.toFixed(2)} confirmado via ${method.toUpperCase()}. Cliente renovado automaticamente.`
    );
  };

  // Executar Régua de Cobrança Automática (D-3, D-0, D+2)
  const runBillingRuler = (): number => {
    let queuedCount = 0;
    const now = new Date();
    todayString(now);

    const activeTemplates = templates.filter((t) => t.isActive);

    customers.forEach((cust) => {
      const [year, month, day] = cust.dueDate.split('-').map(Number);
      const due = new Date(year, month - 1, day);
      due.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const plan = plans.find((p) => p.id === cust.planId);
      const amount = plan ? plan.price : 34.90;

      let chosenTemplate: MessageTemplate | undefined;

      if (diffDays === 3) {
        chosenTemplate = activeTemplates.find((t) => t.triggerEvent === 'before_3_days');
      } else if (diffDays === 0) {
        chosenTemplate = activeTemplates.find((t) => t.triggerEvent === 'on_due_date');
      } else if (diffDays === -2) {
        chosenTemplate = activeTemplates.find((t) => t.triggerEvent === 'after_2_days');
      }

      if (chosenTemplate) {
        const body = replaceTemplateVariables(chosenTemplate.content, {
          name: cust.name,
          amount,
          dueDate: cust.dueDate,
          paymentLink: `https://gestortv.app/pay/${cust.id}`,
        });

        const newMsg: QueuedMessage = {
          id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          customerId: cust.id,
          customerName: cust.name,
          phone: cust.whatsapp,
          templateId: chosenTemplate.id,
          body,
          status: 'pending',
          scheduledFor: new Date().toISOString(),
        };

        setMessageQueue((prev) => [newMsg, ...prev]);
        queuedCount++;
      }
    });

    addAuditLog('REGUA_COBRANCA_EXECUTADA', 'messages', 'ruler', `Régua executada. ${queuedCount} mensagens adicionadas à fila.`);
    return queuedCount;
  };

  // Suporte / Chamados
  const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'createdBy'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: `t-${Date.now()}`,
      createdBy: currentProfile.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `tm-${Date.now()}`,
          ticketId: `t-${Date.now()}`,
          senderId: currentProfile.id,
          senderName: currentProfile.fullName,
          senderType: 'agent',
          message: ticketData.description,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    addAuditLog('TICKET_CRIADO', 'tickets', newTicket.id, `Novo chamado: "${newTicket.title}"`);
  };

  const addTicketReply = (ticketId: string, messageText: string) => {
    const newReply = {
      id: `tm-${Date.now()}`,
      ticketId,
      senderId: currentProfile.id,
      senderName: currentProfile.fullName,
      senderType: 'agent' as const,
      message: messageText,
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              updatedAt: new Date().toISOString(),
              messages: [...t.messages, newReply],
            }
          : t
      )
    );
  };

  const updateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
    addAuditLog('TICKET_STATUS_ATUALIZADO', 'tickets', ticketId, `Status alterado para: ${status.toUpperCase()}`);
  };

  // Restaurar dados padrão de teste
  const resetToDefaultData = () => {
    setProfiles(INITIAL_PROFILES);
    setPlans(INITIAL_PLANS);
    setCoupons(INITIAL_COUPONS);
    setCustomers(INITIAL_CUSTOMERS);
    setInvoices(INITIAL_INVOICES);
    setTemplates(INITIAL_TEMPLATES);
    setMessageQueue([]);
    setTickets(INITIAL_TICKETS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentProfileId(INITIAL_PROFILES[0].id);
  };

  return {
    currentProfile,
    currentProfileId,
    setCurrentProfileId,
    profiles,
    plans,
    coupons,
    customers: visibleCustomers,
    allCustomers: customers, // para contagens globais de admin se necessário
    invoices: visibleInvoices,
    allInvoices: invoices,
    templates,
    messageQueue,
    tickets,
    auditLogs,
    pixProviderType,
    setPixProviderType,
    // Ações
    addCustomer,
    updateCustomer,
    deleteCustomer,
    anonymizeCustomer,
    renewCustomer,
    addPlan,
    updatePlan,
    deletePlan,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    createInvoice,
    payInvoice,
    runBillingRuler,
    addTicket,
    addTicketReply,
    updateTicketStatus,
    addAuditLog,
    resetToDefaultData,
  };
}

function todayString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
