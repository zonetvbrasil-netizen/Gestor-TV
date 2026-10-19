import { QueuedMessage } from '../types/index.ts';

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Cria URL direta para envio pelo WhatsApp Web / App
 */
export function createWhatsAppWebLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Envia ou simula o envio de uma mensagem pela fila
 */
export async function sendQueuedMessage(message: QueuedMessage): Promise<WhatsAppSendResult> {
  // Simula latência de rede
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Validação simples de número
  const digits = message.phone.replace(/\D/g, '');
  if (digits.length < 10) {
    return {
      success: false,
      error: 'Número de WhatsApp inválido (mínimo 10 dígitos com DDD)',
    };
  }

  return {
    success: true,
    messageId: `wamid_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
  };
}
