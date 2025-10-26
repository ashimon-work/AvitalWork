import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from './entities/credit-card.entity';

export interface TranzilaPaymentRequest {
  amount: number; // Amount in cents
  currency?: string;
  userId: string;
  userEmail: string;
  orderDescription: string;
  internalOrderId: string;
  creditCardToken?: string;
  expdate?: string; // MMYY format
}

export interface TranzilaPaymentResponse {
  success: boolean;
  message: string;
  tranzilaTransactionId?: string;
  rawResponse?: any;
}

export interface TranzilaDocumentRequest {
  terminalName: string;
  documentType: string; // e.g., "IR" for Tax Invoice/Receipt
  action: number; // 1 for Debit
  documentCurrencyCode: string;
  vatPercent: string;
  clientName: string;
  clientEmail: string;
  clientId: string;
  items: Array<{
    name: string;
    type: string; // "I" for Item
    unitsNumber: string;
    unitType: number;
    unitPrice: number; // Price in cents
    priceType: string; // "G" for Gross price
    currencyCode: string;
  }>;
  payments: Array<{
    paymentMethod: number; // 1 for Credit Card, 10 for Other
    paymentDate: string; // YYYY-MM-DD
    ccLast4Digits?: string;
    amount: number; // Amount in cents
    currencyCode: string;
    otherDescription?: string;
  }>;
}

export interface TranzilaDocumentResponse {
  statusCode: number;
  statusMsg?: string;
  document?: {
    id: number;
    number: number;
    retrievalKey: string;
  };
}

@Injectable()
export class TranzilaService {
  private readonly logger = new Logger(TranzilaService.name);

  private readonly apiUrlCreateDocument =
    'https://billing5.tranzila.com/api/documents_db/create_document';
  private readonly apiUrlInitiatePayment: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly terminalName: string;
  private readonly tranzilaPw: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CreditCardEntity)
    private readonly creditCardRepository: Repository<CreditCardEntity>,
  ) {
    this.apiUrlInitiatePayment = this.configService.get<string>(
      'TRANZILA_PAYMENT_API_URL',
      'https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi',
    );
    this.publicKey =
      this.configService.get<string>('TRANZILA_PUBLIC_KEY') || '';
    this.privateKey =
      this.configService.get<string>('TRANZILA_PRIVATE_KEY') || '';
    this.terminalName =
      this.configService.get<string>('TRANZILA_TERMINAL_NAME') || '';
    this.tranzilaPw = this.configService.get<string>('TRANZILA_PW') || '';

    if (!this.publicKey || !this.privateKey) {
      this.logger.warn(
        'WARNING: Tranzila public or private key not fully configured. Billing API operations might fail.',
      );
    }
  }

  /**
   * Generates authentication headers for Tranzila Billing API
   */
  private generateTranzilaHeaders(): Record<string, string> {
    if (!this.publicKey || !this.privateKey) {
      throw new Error(
        'Tranzila public or private key not configured for Billing API.',
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomBytes(40).toString('hex'); // 80-character hex string
    const hmacKeyString = `${this.privateKey}${timestamp}${nonce}`;
    const hmacMessageString = this.publicKey;

    const accessToken = crypto
      .createHmac('sha256', hmacKeyString)
      .update(hmacMessageString)
      .digest('hex');

    return {
      'Content-Type': 'application/json',
      'X-tranzila-api-app-key': this.publicKey,
      'X-tranzila-api-request-time': timestamp.toString(),
      'X-tranzila-api-nonce': nonce,
      'X-tranzila-api-access-token': accessToken,
    };
  }

  /**
   * Process payment using Tranzila CGI API
   */
  async processPayment(
    request: TranzilaPaymentRequest,
  ): Promise<TranzilaPaymentResponse> {
    this.logger.log(
      `Processing payment for user ${request.userId}, amount ${request.amount} cents`,
    );

    if (!request.creditCardToken || !request.expdate) {
      throw new HttpException(
        'Credit card token and expiry date are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Use configured credentials or fallback to hardcoded ones (for backward compatibility)
    const supplier = this.terminalName || 'zamzasdmintok';
    const password = this.tranzilaPw || 'Gps9v4Io';

    // Convert amount from cents to major units (e.g., 1234 cents = 12.34)
    const amountInMajorUnits = (request.amount / 100).toFixed(2);

    const payload = {
      supplier,
      TranzilaPW: password,
      TranzilaTK: request.creditCardToken,
      expdate: request.expdate,
      sum: amountInMajorUnits,
      currency: request.currency === 'USD' ? '2' : '1', // 1 for ILS, 2 for USD
      cred_type: '1', // Credit card type
      tranmode: 'A', // Authorize and Capture
      Order: request.internalOrderId,
      email: request.userEmail,
    };

    try {
      this.logger.debug(`Tranzila payment payload: ${JSON.stringify(payload)}`);

      const response = await axios.get(this.apiUrlInitiatePayment, {
        params: payload,
      });
      const responseData = response.data;

      this.logger.log(`Tranzila raw response: ${responseData}`);

      // Parse Tranzila's key-value response string
      const responseParams: Record<string, string> = {};
      if (responseData) {
        try {
          responseData.split('&').forEach((item: string) => {
            if (item.includes('=')) {
              const [key, value] = item.split('=', 2);
              responseParams[key] = value;
            }
          });
        } catch (error) {
          this.logger.error(
            `Could not parse Tranzila response: ${responseData}`,
          );
          return {
            success: false,
            message: 'Error parsing Tranzila response',
            rawResponse: responseData,
          };
        }
      }

      if (responseParams.Response === '000') {
        const confirmationCode =
          responseParams.ConfirmationCode ||
          `tranzila_cgi_${request.internalOrderId}`;
        this.logger.log(
          `Payment successful for user ${request.userId}. Tranzila ConfirmationCode: ${confirmationCode}`,
        );
        return {
          success: true,
          message: 'Payment processed successfully',
          tranzilaTransactionId: confirmationCode,
          rawResponse: responseParams,
        };
      } else {
        const errorMessage =
          responseParams.ErrorMessage ||
          responseParams.tranmode_error ||
          'Unknown Tranzila Error';
        const responseCode = responseParams.Response || 'N/A';
        this.logger.warn(
          `Payment failed for user ${request.userId}. Tranzila Response Code: ${responseCode}, Message: ${errorMessage}`,
        );
        return {
          success: false,
          message: `Tranzila Error (Code: ${responseCode}): ${errorMessage}`,
          rawResponse: responseParams,
        };
      }
    } catch (error) {
      this.logger.error(
        `Tranzila API request error: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `API request error: ${error.message}`,
      };
    }
  }

  /**
   * Create a financial document (invoice/receipt) using Tranzila Billing API
   */
  async createFinancialDocument(
    payload: TranzilaDocumentRequest,
  ): Promise<TranzilaDocumentResponse> {
    if (!this.publicKey || !this.privateKey) {
      this.logger.error(
        'ERROR: Tranzila public or private key not configured for document creation.',
      );
      throw new HttpException(
        'Tranzila document creation is not configured correctly (missing API keys).',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const headers = this.generateTranzilaHeaders();

      this.logger.debug(
        `Tranzila document payload: ${JSON.stringify(payload)}`,
      );

      const response = await axios.post(this.apiUrlCreateDocument, payload, {
        headers,
      });
      const result: TranzilaDocumentResponse = response.data;

      if (result.statusCode !== 0) {
        this.logger.error(
          `Tranzila API Error (create_document): Code ${result.statusCode}, Msg: ${result.statusMsg}`,
        );
        throw new HttpException(
          `Tranzila document creation failed: ${result.statusMsg || 'Unknown error'}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log('Tranzila document created successfully');
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Network error calling Tranzila API (create_document): ${error.message}`,
        );
        throw new HttpException(
          `Could not connect to Tranzila service: ${error.message}`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      this.logger.error(
        `Unexpected error during Tranzila document creation: ${error.message}`,
      );
      throw new HttpException(
        `An unexpected error occurred during document creation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMyCreditCard(userId: string): Promise<any> {
    const creditCard = await this.creditCardRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!creditCard) {
      return {};
    }

    return {
      lastFour: creditCard.lastFour,
      expdate: creditCard.expdate,
      isDefault: creditCard.isDefault,
    };
  }
}
