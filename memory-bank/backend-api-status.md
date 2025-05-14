# Backend API Implementation Status

This document summarizes the status of NestJS backend API endpoints, based on a review of controllers and file structure as of 2025-05-14.

**Base API Path:** `/api`

---

## Storefront API Endpoints

*   **Auth (`/auth`)**
    *   `POST /register`: Handles user registration. (Implemented)
    *   `POST /login`: Handles user login and JWT generation. (Implemented)
    *   `POST /forgot-password`: Handles password reset initiation. (Implemented)
    *   `GET /social/{provider}`: Placeholder/skeleton implemented.
*   **Products (`/products`)**
    *   `GET /featured`: Gets featured products (accepts `storeSlug`). (Implemented)
    *   `GET /`: Gets products with filtering, sorting, pagination (accepts `storeSlug`, `q` for search, etc.). Returns `{ products: ProductEntity[], total: number }`. (Implemented)
    *   `GET /:id`: Gets single product details (accepts `storeSlug`). (Implemented)
    *   `GET /suggest`: Gets search suggestions (accepts `q`, `storeSlug`, `limit`). (Implemented)
    *   `GET /recommended`: Gets general recommended products. (Implemented)
    *   `GET /:id/reviews`: Gets reviews for a product. (Implemented)
*   **Categories (`/categories`)**
    *   `GET /featured`: Gets featured categories (accepts `storeSlug`). (Implemented)
    *   `GET /:id`: Gets single category details (accepts `storeSlug`). (Implemented)
*   **Cart (`/cart`)**
    *   `POST /add`: Adds item to cart. (Implemented)
    *   `GET /`: Gets the current user's cart (Uses database). (Implemented)
    *   `PATCH /:productId`: Updates item quantity in cart. (Implemented)
    *   `DELETE /:productId`: Removes item from cart. (Implemented)
    *   `POST /promo`: Full logic implemented (validation, DB update for cart discount). (Implemented)
*   **Carousel (`/carousel`)**
    *   `GET /`: Gets carousel slides (accepts `storeSlug`). (Implemented)
*   **Account (`/account`)**
    *   `GET /profile`: Gets basic user profile (from JWT). (Implemented)
    *   `POST /change-password`: Changes user password. (Implemented)
    *   `GET /overview`: Backend logic implemented. (Implemented)
    *   `PATCH /personal-info`: Backend logic implemented. (Implemented)
*   **Addresses (`/account/addresses`)**
    *   `GET /`: Gets user's addresses. (Implemented)
    *   `POST /`: Adds a new address. (Implemented)
    *   `PATCH /:id`: Updates an address. (Implemented)
    *   `DELETE /:id`: Deletes an address. (Implemented)
    *   `PUT /:id/default/shipping`: Sets default shipping address. (Implemented)
    *   `PUT /:id/default/billing`: Sets default billing address. (Implemented)
*   **Orders (`/account/orders` - Storefront Customer)**
    *   `GET /`: Gets user's orders (paginated). (Implemented)
    *   `GET /:id`: Gets details for a single order. (Implemented)
*   **Wishlist (`/account/wishlist`)**
    *   `GET /`: Gets user's wishlist for the current store. (Implemented)
    *   `POST /items`: Adds an item to the wishlist. (Implemented)
    *   `DELETE /items/:itemId`: Removes an item from the wishlist. (Implemented)
*   **Payment Methods (`/account/payment-methods`)**
    *   `GET /`: Full logic implemented (fetches from DB). (Implemented)
    *   `POST /`: Full logic implemented (saves to DB, handles default). (Implemented)
    *   `PATCH /:methodId`: Full logic implemented (updates in DB, handles default). (Implemented)
    *   `DELETE /:methodId`: Full logic implemented (deletes from DB). (Implemented)
*   **Newsletter (`/newsletter`)**
    *   `POST /subscribe`: Full logic implemented (saves to `NewsletterSubscription` entity, handles existing/reactivation). (Implemented)
    *   `DELETE /unsubscribe/:email`: Full logic implemented (updates `isActive` flag). (Implemented)
*   **Checkout (`/checkout`)**
    *   `GET /shipping/methods`: Returns a predefined list. (Implemented)
    *   `POST /tax/estimate`: Implemented.
    *   `POST /orders`: Full logic implemented (order/item creation, inventory update, payment placeholder, cart clearing). (Implemented)
*   **Order Confirmation (Handled by `OrdersController` and `ProductsController`)**
    *   `GET /orders/:id`: Implemented.
    *   `GET /products/recommended?based_on={order_id}`: Implemented.
*   **Reviews (`/reviews`)**
    *   `POST /`: Posts a new review. (Implemented)
*   **Contact (`/contact`)**
    *   `POST /`: Handles contact form submission (saves to DB). (Implemented)
*   **FAQ (`/faq`)**
    *   `GET /`: Returns a predefined list of FAQ items. (Implemented)
*   **Store (`/store`)**
    *   `GET /about`: Returns actual about content from DB for the store. (Implemented)
    *   `GET /testimonials`: Returns actual testimonials from DB for the store. (Implemented)
*   **Navigation (`/navigation`)**
    *   `GET /popular`: Refined to return real popular navigation links. (Implemented)

---

## Store Management API Endpoints (`/manager/:storeSlug`)

**Implemented Endpoints:**

*   **Authentication & General:**
    *   `POST /login`: Handles manager login and JWT generation. (Status: Implemented)
    *   `POST /error-report`: Reports frontend errors. (Status: Implemented)
*   **Dashboard:**
    *   `GET /dashboard`: Retrieves dashboard overview data. (Status: Implemented)
    *   `GET /sales/chart`: Retrieves sales chart data. (Status: Implemented)
    *   `GET /orders/recent`: Retrieves recent orders for the dashboard. (Status: Implemented)
    *   `GET /inventory/alerts`: Retrieves inventory alerts. (Status: Implemented)
*   **Product Management (`/products`):**
    *   `GET /`: Gets products with filtering, sorting, pagination. (Status: Implemented)
    *   `POST /`: Creates a new product. (Status: Implemented)
    *   `GET /:id`: Gets a single product by ID. (Status: Implemented)
    *   `PATCH /:id`: Updates a product by ID. (Status: Implemented)
    *   `DELETE /:id`: Deletes a product by ID. (Status: Implemented)
    *   `POST /bulk-delete`: Deletes multiple products. (Status: Implemented)
    *   `POST /bulk-update-status`: Updates status for multiple products. (Status: Implemented)
    *   `POST /import`: Imports products from a file. (Status: Implemented)
    *   `GET /export`: Exports product data. (Status: Implemented)
*   **Order Management (`/orders`):**
    *   `GET /`: Gets orders with filtering, sorting, pagination. (Status: Implemented)
    *   `GET /:id`: Gets a single order by ID. (Status: Implemented)
    *   `PATCH /:id/status`: Updates order status. (Status: Implemented)
    *   `POST /:id/notes`: Adds a note to an order. (Status: Implemented)
    *   `POST /:id/email`: Sends an email related to an order. (Status: Implemented)
    *   `POST /:id/shipping`: Adds shipping information to an order. (Status: Implemented)
    *   `GET /:id/packing-slip`: Generates a packing slip for an order. (Status: Implemented)
    *   `GET /export`: Exports order data. (Status: Implemented)
    *   `PATCH /:id/cancel`: Cancels an order. (Status: Implemented)
*   **Customer Management (`/customers`):**
    *   `GET /`: Gets customers with filtering, sorting, pagination. (Status: Implemented)
    *   `GET /:id`: Gets a single customer by ID. (Status: Implemented)
    *   `PATCH /:id`: Updates a customer by ID. (Status: Implemented)
    *   `POST /:id/notes`: Adds a note to a customer. (Status: Implemented)
    *   `POST /:id/email`: Sends an email to a customer. (Status: Implemented)
    *   `GET /export`: Exports customer data. (Status: Implemented)
    *   *(Note: Customer order history is typically retrieved via `/manager/:storeSlug/orders` with customer filtering)*
*   **Settings (`/settings`):**
    *   `GET /:category`: Gets settings for a specific category. (Status: Implemented)
    *   `PATCH /:category`: Updates settings for a specific category. (Status: Implemented)
    *   `POST /test-email`: Sends a test email. (Status: Implemented)
    *   `POST /test-payment`: Tests payment gateway configuration (placeholder). (Status: Implemented)
    *   `GET /backup`: Backs up store settings. (Status: Implemented)
    *   `POST /restore`: Restores store settings from a backup. (Status: Implemented)
*   **Profile (`/profile`):**
    *   `GET /`: Gets manager profile information. (Status: Implemented)
    *   `PATCH /`: Updates manager profile information. (Status: Implemented)
    *   `POST /password`: Changes manager password. (Status: Implemented)
    *   `POST /2fa/enable`: Enables two-factor authentication. (Status: Implemented)
    *   `POST /2fa/disable`: Disables two-factor authentication. (Status: Implemented)
    *   `GET /login-history`: Retrieves manager login history. (Status: Implemented)
*   **Notifications:**
    *   *(General notification endpoints like `GET /notifications`, `PATCH /notifications/:id` are assumed to be implemented as part of the core notification system, accessible by managers.)*

**Pending/Deferred Endpoints (Store Management):**

*   **RBAC (Role-Based Access Control):**
    *   e.g., `GET /roles`, `POST /roles`, `GET /users/:userId/roles`, `PUT /users/:userId/roles` (Status: Deferred)
*   **Advanced Customer Features:**
    *   Endpoints for detailed communication history tracking beyond notes/emails. (Status: Deferred)
    *   Endpoints for identifying top customers based on complex criteria. (Status: Deferred)
*   **WebSockets:**
    *   Full, granular event broadcasting logic for all relevant real-time updates beyond basic setup. (Status: Deferred)
*   **Profile:**
    *   `GET /profile/2fa/backup-codes`: Retrieves 2FA backup codes. (Status: Pending)

---

**Backend DTO Updates:**

*   `OrderDto` updated to include optional `user` property for manager view.
*   New DTOs created for Checkout, Contact, Reviews, Payment Methods, Newsletter.
*   Manager-specific DTOs for Products, Orders, Customers, Settings, Error Reporting, etc.

**Database Changes:**

*   New entities created for Cart, CartItem, Review, FAQ, AboutContent, Testimonial, NewsletterSubscription, PaymentMethod.
*   Migrations generated and run for these new entities.
*   Seed script (`seed.ts`) updated to include data for new entities.
*   `UserEntity` updated with `paymentMethods` relation.