import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class MockProviderService {
  generateCheckoutSession(orderId: string, amount: number) {
    return {
      session_id: crypto.randomUUID(),
      payment_url: `https://mock.provider.com/pay/${orderId}`,
    };
  }

  // Helper for tests to simulate a webhook payload
  simulateWebhookPayload(orderId: string, status: 'success' | 'failed') {
    return {
      event_id: crypto.randomUUID(),
      type: status === 'success' ? 'payment.succeeded' : 'payment.failed',
      data: {
        order_id: orderId,
        amount: 1000,
      },
    };
  }
}
