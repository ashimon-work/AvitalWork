# Tranzila Integration Documentation

This document describes the Tranzila payment gateway integration for the Magic Store API.

## Overview

The Tranzila integration provides:
- Credit card tokenization for secure payment processing
- Payment processing using stored tokens
- Financial document generation (invoices/receipts)
- Complete PCI DSS compliance through token-based payments

## Required Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Tranzila Payment Gateway Configuration
# Tranzila public application key for Billing API authentication
TRANZILA_PUBLIC_KEY=your_tranzila_public_key_here

# Tranzila private secret key for Billing API authentication
TRANZILA_PRIVATE_KEY=your_tranzila_private_key_here

# Tranzila terminal name used for both payment processing and document creation
TRANZILA_TERMINAL_NAME=your_terminal_name_here

# Tranzila password for CGI API (legacy payment processing)
TRANZILA_PW=your_tranzila_password_here

# Tranzila CGI API URL (optional, has default value)
TRANZILA_PAYMENT_API_URL=https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi

# Default VAT percentage for financial documents
DEFAULT_VAT_PERCENT=18.0
```

## API Endpoints

### Card Tokenization
- **POST** `/api/tranzila/notify` - Tranzila server-to-server notification endpoint
- **POST** `/api/tranzila/success` - Success callback endpoint
- **POST** `/api/tranzila/failure` - Failure callback endpoint

### Payment Processing
- **POST** `/api/tranzila/process-payment` - Process payment using stored card token
- **GET** `/api/tranzila/me/credit-card` - Get current user's stored credit card info

### Document Management
- **POST** `/api/tranzila/create-document` - Create financial document
- **GET** `/api/tranzila/documents/order/:orderId` - Get documents for an order

## Database Entities

### CreditCardEntity
Stores tokenized credit card information:
- `token` - Tranzila token (TranzilaTK)
- `lastFour` - Last 4 digits of the card
- `expdate` - Expiry date in MMYY format
- `isDefault` - Whether this is the default payment method

### TranzilaDocumentEntity
Stores references to Tranzila financial documents:
- `tranzilaDocumentId` - Tranzila's internal document ID
- `tranzilaDocumentNumber` - Official document number
- `tranzilaRetrievalKey` - Key to retrieve document from Tranzila portal

## Integration Flow

### 1. Card Tokenization
1. User enters card details on Tranzila-hosted page/iframe
2. Tranzila processes the card and generates a token
3. Tranzila sends a server-to-server notification to `/api/tranzila/notify`
4. The API stores the token associated with the user

### 2. Payment Processing
1. When processing an order, the system retrieves the user's stored token
2. Payment is processed using the Tranzila CGI API
3. Payment success/failure is recorded in the order

### 3. Document Creation
1. After successful payment, a financial document is created
2. The document is generated using Tranzila's Billing API
3. Document reference is stored for future access

## Security Considerations

- Never store raw credit card numbers - only use Tranzila tokens
- All API communications use HTTPS
- Billing API uses HMAC-SHA256 authentication
- Environment variables should be kept secure

## Testing

To test the integration:
1. Set up a Tranzila test account
2. Configure the environment variables with test credentials
3. Use the provided endpoints to test tokenization and payment flows

## Error Handling

The integration includes comprehensive error handling for:
- Network connectivity issues
- Authentication failures
- Invalid payment details
- API response errors

Check the application logs for detailed error information. 