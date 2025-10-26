import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DocumentItemDto {
  @IsString()
  name: string;

  @IsString()
  type: string; // "I" for Item

  @IsString()
  unitsNumber: string;

  @IsNumber()
  unitType: number;

  @IsNumber()
  unitPrice: number; // Price in cents

  @IsString()
  priceType: string; // "G" for Gross price

  @IsString()
  currencyCode: string;
}

export class DocumentPaymentDto {
  @IsNumber()
  paymentMethod: number; // 1 for Credit Card, 10 for Other

  @IsString()
  paymentDate: string; // YYYY-MM-DD

  @IsString()
  @IsOptional()
  ccLast4Digits?: string;

  @IsNumber()
  amount: number; // Amount in cents

  @IsString()
  currencyCode: string;

  @IsString()
  @IsOptional()
  otherDescription?: string;
}

export class CreateDocumentDto {
  @IsString()
  terminalName: string;

  @IsString()
  documentType: string; // e.g., "IR" for Tax Invoice/Receipt

  @IsNumber()
  action: number; // 1 for Debit

  @IsString()
  documentCurrencyCode: string;

  @IsString()
  vatPercent: string;

  @IsString()
  clientName: string;

  @IsString()
  clientEmail: string;

  @IsString()
  clientId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentItemDto)
  items: DocumentItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentPaymentDto)
  payments: DocumentPaymentDto[];
}
