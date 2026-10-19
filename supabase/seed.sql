-- ==============================================================================
-- GESTORTV - SEED DATA (30 Clientes Fictícios, Planos, Cupons e Cobranças)
-- ==============================================================================

-- 1. Profiles de Exemplo
INSERT INTO public.profiles (id, email, full_name, role, phone, company_name, pix_key, pix_key_type)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@gestortv.com.br', 'Carlos Eduardo Silva', 'admin', '5511999991111', 'GestorTV Matriz', 'gestortv.admin@pix.com.br', 'email'),
  ('00000000-0000-0000-0000-000000000002', 'revendedor.marcos@gestortv.com.br', 'Marcos Vinicius Santos', 'reseller', '5521988882222', 'MV Telecom TV', '11988882222', 'phone'),
  ('00000000-0000-0000-0000-000000000003', 'atendente.ana@gestortv.com.br', 'Ana Clara Ferreira', 'attendant', '5531977773333', 'GestorTV Suporte', 'suporte@gestortv.com.br', 'email')
ON CONFLICT (id) DO NOTHING;

-- 2. Planos
INSERT INTO public.plans (id, name, duration_months, duration_type, price, screens, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Plano Start (1 Tela)', 1, 'mensal', 34.90, 1, true),
  ('11111111-1111-1111-1111-111111111102', 'Plano Família (2 Telas)', 1, 'mensal', 49.90, 2, true),
  ('11111111-1111-1111-1111-111111111103', 'Trimestral Econômico (2 Telas)', 3, 'trimestral', 134.90, 2, true),
  ('11111111-1111-1111-1111-111111111104', 'Semestral Turbo (3 Telas)', 6, 'semestral', 249.90, 3, true),
  ('11111111-1111-1111-1111-111111111105', 'Anual VIP Master (4 Telas)', 12, 'anual', 429.90, 4, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Cupons de Desconto
INSERT INTO public.coupons (id, code, discount_type, discount_value, max_uses, used_count, valid_until, is_active)
VALUES
  ('22222222-2222-2222-2222-222222222201', 'BEMVINDO10', 'percent', 10.00, 100, 14, now() + interval '90 days', true),
  ('22222222-2222-2222-2222-222222222202', 'PIX15', 'fixed', 15.00, 50, 8, now() + interval '30 days', true),
  ('22222222-2222-2222-2222-222222222203', 'FIDELIDADE20', 'percent', 20.00, 200, 45, now() + interval '180 days', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Modelos de Mensagem WhatsApp
INSERT INTO public.message_templates (id, name, trigger_event, content, is_active)
VALUES
  ('33333333-3333-3333-3333-333333333301', 'Lembrete Amigável (3 dias antes)', 'before_3_days', 'Olá {nome}, tudo bem? 👋 Sua assinatura do GestorTV vence em 3 dias ({vencimento}). Garanta seu acesso sem interrupções! Valor: R$ {valor}. Pague rápido via Pix: {link_pagamento}', true),
  ('33333333-3333-3333-3333-333333333302', 'Vencimento Hoje (Dia D)', 'on_due_date', '🚨 Olá {nome}! Sua assinatura vence HOJE ({vencimento}). Para evitar o bloqueio automático de suas telas, efetue a renovação no valor de R$ {valor} acessando: {link_pagamento}', true),
  ('33333333-3333-3333-3333-333333333303', 'Aviso de Suspensão (+2 dias)', 'after_2_days', '⚠️ {nome}, identificamos que sua fatura de R$ {valor} com vencimento em {vencimento} está em aberto. Seu sinal poderá ser interrompido a qualquer instante. Regularize agora: {link_pagamento}', true),
  ('33333333-3333-3333-3333-333333333304', 'Confirmação de Pagamento', 'payment_confirmed', '✅ Obrigado, {nome}! Seu pagamento de R$ {valor} foi confirmado com sucesso. Seu acesso foi renovado até {vencimento}. Bom divertimento! 🍿📺', true)
ON CONFLICT (id) DO NOTHING;

-- 5. 30 Clientes Fictícios (Com cidades brasileiras, diferentes status e datas relativas)
INSERT INTO public.customers (id, user_id, name, whatsapp, email, city, plan_id, start_date, due_date, screens, devices, notes, status, consent_lgpd)
VALUES
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Rodrigo Mendonça Alencar', '5511981234567', 'rodrigo.mendonca@gmail.com', 'São Paulo - SP', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 60, CURRENT_DATE + 2, 2, '["Smart TV Samsung 4K", "Fire Stick HD"]'::jsonb, 'Prefere receber lembretes de manhã', 'expiring', true),
  ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Juliana Paes de Oliveira', '5521998765432', 'juliana.paes@outlook.com', 'Rio de Janeiro - RJ', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 90, CURRENT_DATE + 15, 1, '["Smart TV LG WebOS"]'::jsonb, 'Cliente pontual, paga sempre no primeiro aviso', 'active', true),
  ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Lucas Gabriel Silveira', '5531976543210', 'lucas.gabriel@hotmail.com', 'Belo Horizonte - MG', '11111111-1111-1111-1111-111111111103', CURRENT_DATE - 45, CURRENT_DATE - 4, 2, '["TV Box Xiaomi Mi Box S", "Celular Android"]'::jsonb, 'Atrasou 4 dias, enviar cobrança de cobrança', 'expired', true),
  ('c0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Beatriz Lima Guimarães', '5541991239876', 'beatriz.guimaraes@yahoo.com.br', 'Curitiba - PR', '11111111-1111-1111-1111-111111111105', CURRENT_DATE - 180, CURRENT_DATE + 185, 4, '["Smart TV Samsung", "Smart TV TCL", "Fire Stick 4K Max", "Tablet iPad"]'::jsonb, 'Plano Anual VIP VIP', 'active', true),
  ('c0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Matheus Costa Farias', '5551982345678', 'matheus.cfarias@gmail.com', 'Porto Alegre - RS', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 2, CURRENT_DATE + 1, 1, '["Smart TV Roku TCL"]'::jsonb, 'Em teste de 3 dias', 'trial', true),
  ('c0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Camila Antunes Siqueira', '5571993456789', 'camila.antunes@globo.com', 'Salvador - BA', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 120, CURRENT_DATE + 1, 2, '["Smart TV Philco", "Chromecast 4 com Google TV"]'::jsonb, 'Vencendo amanhã', 'expiring', true),
  ('c0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'Fernando Henrique Rocha', '5561984567890', 'fh.rocha@uol.com.br', 'Brasília - DF', '11111111-1111-1111-1111-111111111104', CURRENT_DATE - 190, CURRENT_DATE - 10, 3, '["Smart TV Sony Bravia", "Fire Stick Lite", "iPhone 15"]'::jsonb, 'Atraso longo, solicitou suspensão temporária', 'suspended', true),
  ('c0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Larissa Duarte Rezende', '5581995678901', 'larissa.rezende@gmail.com', 'Recife - PE', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 30, CURRENT_DATE + 0, 1, '["Smart TV LG WebOS"]'::jsonb, 'Vence HOJE', 'expiring', true),
  ('c0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Thiago Meireles Prado', '5585986789012', 'thiago.prado@gmail.com', 'Fortaleza - CE', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 15, CURRENT_DATE + 15, 2, '["Fire Stick 4K", "Smart TV Samsung"]'::jsonb, 'Ativo recente', 'active', true),
  ('c0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', 'Renata Vasconcelos Brito', '5548997890123', 'renata.vbrito@terra.com.br', 'Florianópolis - SC', '11111111-1111-1111-1111-111111111103', CURRENT_DATE - 80, CURRENT_DATE + 10, 2, '["Apple TV 4K", "Smart TV Panasonic"]'::jsonb, 'Ativo', 'active', true),
  ('c0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Danilo Bezerra Cavalcanti', '5519998901234', 'danilo.bezerra@gmail.com', 'Campinas - SP', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 20, CURRENT_DATE + 10, 1, '["Smart TV Samsung Tizen"]'::jsonb, 'Ativo normal', 'active', true),
  ('c0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002', 'Patricia Nogueira Fontes', '5562981012345', 'patricia.fontes@gmail.com', 'Goiânia - GO', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 50, CURRENT_DATE - 2, 2, '["Fire Stick HD", "Smart TV Philips Android"]'::jsonb, 'Venceu faz 2 dias', 'expired', true),
  ('c0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Guilherme Macedo Barros', '5527992123456', 'guilherme.macedo@outlook.com', 'Vitória - ES', '11111111-1111-1111-1111-111111111104', CURRENT_DATE - 160, CURRENT_DATE + 20, 3, '["Smart TV LG", "Smart TV Samsung", "Celular Samsung Galaxy"]'::jsonb, 'Ativo semestral', 'active', true),
  ('c0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Vanessa Cristina Toledo', '5512983234567', 'vanessa.toledo@gmail.com', 'São José dos Campos - SP', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 35, CURRENT_DATE - 5, 1, '["Chromecast com Google TV"]'::jsonb, 'Inadimplente 5 dias', 'expired', true),
  ('c0000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000002', 'Vinicius Tavares Pinho', '5591994345678', 'vinicius.pinho@hotmail.com', 'Belém - PA', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 1, CURRENT_DATE + 2, 1, '["Smart TV AOC Roku"]'::jsonb, 'Novo teste solicitado ontem', 'trial', true),
  ('c0000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'Mariana Albuquerque Ramos', '5592985456789', 'mariana.ramos@gmail.com', 'Manaus - AM', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 100, CURRENT_DATE + 20, 2, '["Smart TV Samsung 55", "Celular Motorola"]'::jsonb, 'Ativo', 'active', true),
  ('c0000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000002', 'Alexandre Borges Silveira', '5567996567890', 'alexandre.borges@gmail.com', 'Campo Grande - MS', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 29, CURRENT_DATE + 1, 2, '["TV Box TX9", "Smart TV Philco"]'::jsonb, 'Vencendo amanhã', 'expiring', true),
  ('c0000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', 'Tatiane Martins Cordeiro', '5584997678901', 'tatiane.cordeiro@gmail.com', 'Natal - RN', '11111111-1111-1111-1111-111111111103', CURRENT_DATE - 75, CURRENT_DATE + 15, 2, '["Smart TV LG OLED", "Fire Stick 4K"]'::jsonb, 'Ativo plano trimestral', 'active', true),
  ('c0000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000002', 'Eduardo Fagundes Peixoto', '5583998789012', 'eduardo.peixoto@yahoo.com', 'João Pessoa - PB', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 40, CURRENT_DATE - 10, 1, '["Smart TV TCL Android"]'::jsonb, 'Suspenso após 10 dias sem resposta', 'suspended', true),
  ('c0000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', 'Priscila Dornelles Rios', '5586999890123', 'priscila.rios@gmail.com', 'Teresina - PI', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 15, CURRENT_DATE + 15, 2, '["Smart TV Samsung 43"]'::jsonb, 'Ativo', 'active', true),
  ('c0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000002', 'Bruno Cesar Valente', '5598990901234', 'bruno.valente@gmail.com', 'São Luís - MA', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 28, CURRENT_DATE + 2, 1, '["Fire Stick HD"]'::jsonb, 'Vencendo em 2 dias', 'expiring', true),
  ('c0000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Sabrina Meireles Leite', '5579991012345', 'sabrina.leite@gmail.com', 'Aracaju - SE', '11111111-1111-1111-1111-111111111105', CURRENT_DATE - 200, CURRENT_DATE + 165, 4, '["Smart TV Samsung", "Smart TV LG", "Fire Stick 4K", "TV Box Xiaomi"]'::jsonb, 'Cliente VIP Anual', 'active', true),
  ('c0000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002', 'Leandro Assis Camargo', '5582992123456', 'leandro.camargo@gmail.com', 'Maceió - AL', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 60, CURRENT_DATE + 0, 1, '["Smart TV LG WebOS"]'::jsonb, 'Vence hoje, enviar QR code', 'expiring', true),
  ('c0000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Debora Esteves Pimentel', '5568993234567', 'debora.pimentel@gmail.com', 'Rio Branco - AC', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 45, CURRENT_DATE - 15, 2, '["Smart TV Samsung", "Celular iPhone"]'::jsonb, 'Suspenso', 'suspended', true),
  ('c0000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000002', 'Marcio Andre Queiroz', '5569994345678', 'marcio.queiroz@gmail.com', 'Porto Velho - RO', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 3, CURRENT_DATE + 0, 1, '["TV Box Aquário"]'::jsonb, 'Último dia do teste grátis', 'trial', true),
  ('c0000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000001', 'Aline Soares Nogueira', '5595995456789', 'aline.soares@gmail.com', 'Boa Vista - RR', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 25, CURRENT_DATE + 5, 2, '["Smart TV Philco Roku"]'::jsonb, 'Ativo', 'active', true),
  ('c0000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000002', 'Otavio Augusto Gouveia', '5596996567890', 'otavio.gouveia@gmail.com', 'Macapá - AP', '11111111-1111-1111-1111-111111111103', CURRENT_DATE - 60, CURRENT_DATE + 30, 2, '["Fire Stick 4K", "Smart TV Samsung"]'::jsonb, 'Ativo trimestral', 'active', true),
  ('c0000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000001', 'Flavia Helena Cardoso', '5563997678901', 'flavia.cardoso@gmail.com', 'Palmas - TO', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 35, CURRENT_DATE - 5, 1, '["Smart TV LG"]'::jsonb, 'Vencido 5 dias', 'expired', true),
  ('c0000000-0000-0000-0000-000000000028', '00000000-0000-0000-0000-000000000002', 'Rogerio Diniz Vilela', '5516998789012', 'rogerio.vilela@gmail.com', 'Ribeirão Preto - SP', '11111111-1111-1111-1111-111111111104', CURRENT_DATE - 150, CURRENT_DATE + 30, 3, '["Smart TV Samsung 65", "Fire Stick 4K", "iPad"]'::jsonb, 'Ativo semestral', 'active', true),
  ('c0000000-0000-0000-0000-000000000029', '00000000-0000-0000-0000-000000000001', 'Gisele Cristine Moura', '5513999890123', 'gisele.moura@gmail.com', 'Santos - SP', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 20, CURRENT_DATE + 10, 2, '["Smart TV Samsung", "Chromecast"]'::jsonb, 'Ativo', 'active', true),
  ('c0000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000002', 'Henrique Furtado Lima', '5517990901234', 'henrique.furtado@gmail.com', 'São José do Rio Preto - SP', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 32, CURRENT_DATE - 2, 1, '["TV Box Xiaomi"]'::jsonb, 'Vencido 2 dias', 'expired', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Chamados de Suporte Iniciais
INSERT INTO public.tickets (id, customer_id, created_by, title, description, priority, status, device_type)
VALUES
  ('t0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Canais de esporte travando no Fire Stick', 'Cliente relata buffering apenas nos canais 4K ao usar aplicativo no Fire Stick HD.', 'high', 'in_progress', 'fire_stick'),
  ('t0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Como instalar na TV LG WebOS', 'Dúvida de cliente idoso solicitando passo a passo com fotos ou tutorial direto.', 'low', 'resolved', 'smart_tv'),
  ('t0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Tela preta após atualização do aplicativo', 'Depois de atualizar o app no Xiaomi Mi Box, não abre a lista de reprodução.', 'urgent', 'open', 'tv_box')
ON CONFLICT (id) DO NOTHING;
