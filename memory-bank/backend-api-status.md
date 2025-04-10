# Backend API Implementation Status (Storefront Focus)

This document summarizes the status of NestJS backend API endpoints relevant to the Storefront website, based on a review of controllers on 2025-04-10.

**Base API Path:** `/api`

**Implemented Endpoints:**

*   **Auth (`/auth`)**
    *   `POST /register`: Handles user registration.
    *   `POST /login`: Handles user login and JWT generation.
*   **Products (`/products`)**
    *   `GET /featured`: Gets featured products (accepts `storeSlug`).
    *   `GET /`: Gets products with filtering, sorting, pagination (accepts `storeSlug`, `q` for search, etc.). Returns `{ products: ProductEntity[], total: number }`.
    *   `GET /:id`: Gets single product details (accepts `storeSlug`).
    *   `GET /suggest`: Gets search suggestions (accepts `q`, `storeSlug`, `limit`).
*   **Categories (`/categories`)**
    *   `GET /featured`: Gets featured categories (accepts `storeSlug`).
    *   `GET /:id`: Gets single category details (accepts `storeSlug`).
*   **Cart (`/cart`)**
    *   `POST /add`: Adds item to cart.
    *   `GET /`: Gets the current user's cart (TODO: User association).
    *   `PATCH /:productId`: Updates item quantity in cart.
    *   `DELETE /:productId`: Removes item from cart.
*   **Carousel (`/carousel`)**
    *   `GET /`: Gets carousel slides (accepts `storeSlug`).

**Missing/Unimplemented Endpoints (Based on Storefront Plan):**

*   **Auth (`/auth`)**
    *   `POST /forgot-password`
    *   `GET /social/{provider}`
*   **Navigation (`/navigation`)**
    *   `GET /popular`: Implemented (returns hardcoded links for now).
*   **Search (`/products`)**
    *   `GET /suggest`: Implemented in `ProductsController`.
    *   (Full search results handled by `GET /products?q=...`)
*   **Cart (`/cart`)**
    *   `POST /promo`
*   **Account (`/account` - Likely New Controller Needed)**
    *   `GET /overview`
    *   `GET /orders`
    *   `GET /addresses`
    *   `POST /addresses`
    *   `PATCH /addresses/:addressId`
    *   `DELETE /addresses/:addressId`
    *   `GET /payment-methods`
    *   `POST /payment-methods` (Potentially, depends on integration)
    *   `DELETE /payment-methods/:methodId`
    *   `PATCH /personal-info`
    *   `GET /wishlist`
    *   `POST /wishlist/add` (Could also be `/wishlist`)
    *   `DELETE /wishlist/:productId` (Could also be `/wishlist`)
    *   `POST /change-password`
*   **Checkout (New Controller Needed)**
    *   `GET /shipping/methods`
    *   `GET /tax/estimate`
    *   `POST /orders`
*   **Order Confirmation (Handled by `OrdersController`?)**
    *   `GET /orders/:id`
*   **Products (`/products`)**
    *   `GET /recommended` (e.g., `?based_on={order_id}` or `?related_to={product_id}`)
    *   `GET /:id/reviews`
    *   `POST /reviews` (Likely needs separate `ReviewsController`)
*   **Contact (New Controller Needed)**
    *   `POST /contact`
    *   `GET /faq`
*   **Store (New Controller Needed?)**
    *   `GET /about`
    *   `GET /testimonials`