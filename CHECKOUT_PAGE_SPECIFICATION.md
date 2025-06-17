# Checkout Page Specification - Updated with Tranzila Integration

## 5. Checkout Page
   * **Functionality**: Collect shipping, billing, and payment information to complete purchase using secure Tranzila payment processing
   * **User will see**: 
     - Progress indicator at top (Cart > Checkout > Confirmation)
     - Left section (60%):
       * **Shipping address form** with auto-populated fields from user's default shipping address:
         - Full name (auto-filled if available)
         - Street address (2 lines) (auto-filled if available)
         - City (auto-filled if available)
         - Postal code (auto-filled if available)
         - Country (defaults to Israel, auto-filled if available)
       * **Shipping method selection** with options and prices
       * **Payment information section** with secure Tranzila integration:
         - **If no credit card stored**: "Add Credit Card" button that opens secure Tranzila popup
         - **If credit card exists**: 
           * Display masked card information (•••• •••• •••• 1234)
           * "Update Credit Card" button to change payment method
           * Card security indicators
       * **Billing address section**:
         - Toggle: "Same as shipping address" (checked by default)
         - If unchecked: Billing address form (auto-populated from user's default billing address if available)
     - Right section (40%):
       * **Order summary** with:
         - Collapsed list of items (expandable)
         - Subtotal
         - Shipping cost (based on selected method)
         - Taxes (calculated in real-time)
         - Applied discounts
         - **Total** (prominently displayed)
       * **"Place Order" button** (prominent, green - only enabled when credit card is stored)
       * Security badges and Tranzila payment security indicators
     - Newsletter signup checkbox
     - Terms and conditions checkbox (required)
   
   * **User can**: 
     - **Auto-benefit from saved addresses**: Forms pre-populate if user has default shipping/billing addresses
     - Enter or modify shipping information
     - Select preferred shipping method with real-time total updates
     - **Securely add credit card**: Click "Add Credit Card" to open Tranzila's PCI-compliant popup
     - **Manage payment method**: View masked card details and update if needed
     - Specify separate billing address if needed
     - Review order summary with real-time tax calculation
     - Agree to terms and conditions
     - Opt in to newsletter
     - **Place order** (only after credit card is stored)
     - Return to cart to make changes
   
   * **Technical Details**:
     - **API Endpoints**:
       * `GET /api/shipping/methods` - Returns available shipping methods
       * `GET /api/tax/estimate` - Returns tax estimate based on location and cart items
       * `POST /api/orders` - Creates order and processes payment via Tranzila
       * `GET /api/account/addresses` - Fetches user's saved addresses for auto-population
       * `POST /api/tranzila/tokenization-url` - Generates secure Tranzila tokenization URL
       * `GET /api/tranzila/me/credit-card` - Checks user's stored credit card status
       * `POST /api/tranzila/notify` - Server-to-server notification from Tranzila (internal)
     
     - **Component Interaction**:
       * **Address Auto-Population**: Loads user's default addresses on page initialization
       * **Real-time form validation** with inline error messages
       * **Secure Payment Processing**: 
         - Tranzila tokenization popup for PCI-compliant card collection
         - No sensitive payment data stored in application database
         - Server-to-server token exchange for secure payments
       * **Smart billing logic**: Auto-detects if user has different default billing address
       * **Tax calculation**: Real-time updates based on shipping address and cart contents
       * **Shipping method selection** updates total dynamically
       * **Credit card requirement**: Order placement blocked until valid payment method stored