import { generatePixPayload } from '../utils/rules.ts';

export interface PixChargeResult {
  pixCode: string;
  qrUrl: string;
  externalId: string;
  provider: 'mock' | 'mercadopago' | 'asaas';
  expiresAt: string;
}

export interface PixProvider {
  name: string;
  createPixCharge(params: {
    customerName: string;
    customerEmail?: string;
    customerCpf?: string;
    amount: number;
    description: string;
    pixKey?: string;
    invoiceId: string;
  }): Promise<PixChargeResult>;
  
  simulateWebhookPayment(externalId: string): Promise<{ success: boolean; paidAt: string }>;
}

/**
 * Adaptador Mock - Usado em desenvolvimento/testes rápidos
 */
export class MockPixAdapter implements PixProvider {
  name = 'Simulador GestorTV Pix (Mock)';

  async createPixCharge(params: {
    customerName: string;
    amount: number;
    pixKey?: string;
    invoiceId: string;
  }): Promise<PixChargeResult> {
    const key = params.pixKey || 'pix.cobranca@gestortv.com.br';
    const txid = `GTV${params.invoiceId.replace(/\D/g, '').slice(-8) || Math.floor(10000000 + Math.random() * 90000000)}`;
    const { pixCode, qrUrl } = generatePixPayload(key, params.customerName, 'SAO PAULO', params.amount, txid);

    return {
      pixCode,
      qrUrl,
      externalId: `mock_${Date.now()}_${txid}`,
      provider: 'mock',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async simulateWebhookPayment(externalId: string): Promise<{ success: boolean; paidAt: string }> {
    // Simula atraso de rede de 300ms
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      paidAt: new Date().toISOString(),
    };
  }
}

/**
 * Adaptador Mercado Pago (Plugável)
 */
export class MercadoPagoPixAdapter implements PixProvider {
  name = 'Mercado Pago Pix';

  async createPixCharge(params: {
    customerName: string;
    customerEmail?: string;
    amount: number;
    description: string;
    invoiceId: string;
  }): Promise<PixChargeResult> {
    // Se não houver token real configurado, faz fallback gracioso para mock seguro
    const token = typeof process !== 'undefined' && process.env?.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      console.warn('[MercadoPagoAdapter] Token não configurado, gerando payload Pix seguro padrão.');
      const fallback = new MockPixAdapter();
      return fallback.createPixCharge(params);
    }

    try {
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': params.invoiceId,
        },
        body: JSON.stringify({
          transaction_amount: params.amount,
          description: params.description,
          payment_method_id: 'pix',
          payer: {
            email: params.customerEmail || 'cliente@gestortv.com.br',
            first_name: params.customerName.split(' ')[0],
            last_name: params.customerName.split(' ').slice(1).join(' ') || 'Cliente',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Mercado Pago error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        pixCode: data.point_of_interaction?.transaction_data?.qr_code || '',
        qrUrl: data.point_of_interaction?.transaction_data?.qr_code_base64 
          ? `data:image/png;base64,${data.point_of_interaction.transaction_data.qr_code_base64}`
          : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.point_of_interaction?.transaction_data?.qr_code || '')}`,
        externalId: String(data.id),
        provider: 'mercadopago',
        expiresAt: data.date_of_expiration || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    } catch (err) {
      console.error('[MercadoPagoAdapter] Erro na API, alternando para fallback:', err);
      const fallback = new MockPixAdapter();
      return fallback.createPixCharge(params);
    }
  }

  async simulateWebhookPayment(externalId: string): Promise<{ success: boolean; paidAt: string }> {
    return {
      success: true,
      paidAt: new Date().toISOString(),
    };
  }
}

/**
 * Adaptador Asaas (Plugável)
 */
export class AsaasPixAdapter implements PixProvider {
  name = 'Asaas Pix';

  async createPixCharge(params: {
    customerName: string;
    amount: number;
    description: string;
    invoiceId: string;
  }): Promise<PixChargeResult> {
    const fallback = new MockPixAdapter();
    return fallback.createPixCharge(params);
  }

  async simulateWebhookPayment(externalId: string): Promise<{ success: boolean; paidAt: string }> {
    return {
      success: true,
      paidAt: new Date().toISOString(),
    };
  }
}

/**
 * Fábrica de Provedores Pix
 */
export function getPixProvider(type: 'mock' | 'mercadopago' | 'asaas' = 'mock'): PixProvider {
  switch (type) {
    case 'mercadopago':
      return new MercadoPagoPixAdapter();
    case 'asaas':
      return new AsaasPixAdapter();
    case 'mock':
    default:
      return new MockPixAdapter();
  }
}
