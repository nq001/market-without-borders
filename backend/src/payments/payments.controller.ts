import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({
    summary: 'Handle payment provider webhooks (e.g., Stripe, PayPal)',
  })
  @ApiHeader({
    name: 'x-webhook-signature',
    required: false,
    description: 'HMAC-SHA256 signature of the webhook payload',
  })
  @ApiBody({
    description: 'The webhook payload from the payment provider',
    type: PaymentWebhookDto,
  })
  @ApiResponse({ status: 200, description: 'Webhook received and processed.' })
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: PaymentWebhookDto,
    @Headers('x-webhook-signature') signature?: string,
  ) {
    this.paymentsService.verifyWebhookSignature(payload, signature);
    await this.paymentsService.handleWebhook(payload);
    return { received: true };
  }
}
