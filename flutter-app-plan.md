# **Global Marketplace App: Technical Plan (Final)**

## 1. Introduction

This document outlines the technical plan for building the "Global Marketplace App," a new Flutter application. The app will serve as a unified, central marketplace aggregating products from all individual stores defined in the `websites-plan.md`. The core objective is to provide a complete, end-to-end user journey—from product discovery to purchase and order management—within a single, cohesive mobile application.

## 2. Overall Architecture & Data Flow

The application will be built using the Flutter framework for cross-platform compatibility (iOS & Android). It will communicate with the existing backend via a set of well-defined RESTful API endpoints.

### High-Level Data Flow:

```mermaid
graph TD
    subgraph Flutter App
        A[User Interface]
        B[State Management]
        C[API Client]
    end

    subgraph Backend
        D[API Gateway (/api/v1/)]
        E[Business Logic]
        F[Database]
    end

    subgraph Data Sources
        G[Products]
        H[Stores]
        I[Orders]
        J[Users]
    end

    A <--> B
    B <--> C
    C -- REST API Calls --> D
    D <--> E
    E <--> F
    F -- Reads/Writes --> G
    F -- Reads/Writes --> H
    F -- Reads/Writes --> I
    F -- Reads/Writes --> J

    style Flutter App fill:#cde4ff
    style Backend fill:#d5e8d4
```

## 3. Core Data Entities

The application will be modeled around the backend's existing data entities, including `StoreEntity`, `ProductEntity`, `UserEntity`, `OrderEntity`, `CartEntity`, `ReviewEntity`, `WishlistEntity`, and more.

## 4. API Endpoint Analysis

A significant portion of the required functionality can be mapped to existing endpoints. However, the key challenge is that most current endpoints are scoped to a single store (`:storeSlug`). The Global Marketplace App requires new, aggregated endpoints.

### 4.1. Marketplace Curation Strategy

To manage featured content on the global marketplace homepage, we will implement a new curation mechanism separate from individual store settings.

1.  **Database Schema Change**: A new boolean field, `isFeaturedInMarketplace`, will be added to the `ProductEntity`, `CategoryEntity`, and `StoreEntity`.
2.  **Curation Process**: This flag will be managed by a marketplace super-administrator via a dedicated interface, allowing them to highlight the best products, categories, and stores from across the platform.
3.  **API Logic**: The new **`GET /api/v1/marketplace/home`** endpoint will be built to specifically query for entities where these "featured" flags are set to `true`.

### 4.2. Reusable Endpoints (Store-Scoped)

The following existing endpoints can be reused directly by the Flutter app, provided the app supplies the correct `:storeSlug` context when making calls.

*   **Authentication**: All endpoints in `auth.controller.ts` (`/register`, `/login`).
*   **Account Management**: All endpoints in `account.controller.ts` (`/profile`, `/orders`, etc.) and `addresses.controller.ts`.
*   **Cart**: All endpoints in `cart.controller.ts`. The app will manage one cart per store and will need to provide the correct `:storeSlug`.
*   **Checkout & Orders**:
    *   `GET /shipping/methods` from `shipping.controller.ts`.
    *   `POST /orders` from `storefront-orders.controller.ts`.
*   **Product Details**: `GET /stores/:storeSlug/products/:id` and its sub-routes (`/reviews`, `/related`) from `products.controller.ts` and `reviews.controller.ts`.
*   **Wishlist**: All endpoints in `wishlist.controller.ts`.

### 4.3. New Endpoints Required

To support the global, aggregated nature of the app, the following new endpoints must be created under a `/api/v1/marketplace/` prefix.

*   **`GET /api/v1/marketplace/home`**: Fetches all curated content (featured products, categories, stores) for the main Home Screen.
*   **`GET /api/v1/marketplace/search`**: Powers the global search across all stores with filtering and sorting.
*   **`GET /api/v1/marketplace/products`**: Fetches products for a specific category, aggregated from all stores.
*   **`GET /api/v1/marketplace/categories`**: Returns a de-duplicated list of all unique categories across the marketplace.
*   **`GET /api/v1/marketplace/stores`**: Returns a list of all stores in the marketplace.
*   **`GET /api/v1/account/wishlists/all`**: Returns a user's wishlisted items from all stores in a single call.

## 5. Screen-by-Screen & Widget Breakdown

### **Screen 1: Home Screen**
*   **Purpose**: Main entry point to discover products, categories, and stores.
*   **API Endpoint**: `GET /api/v1/marketplace/home`.
*   **Custom Widgets**:
    *   `ProductCard` (Reusable):
        *   **Purpose**: A compact representation of a single product.
        *   **State**: StatelessWidget.
        *   **Properties**: `product: ProductEntity`.
        *   **Data**: Displays `Product.name`, `Product.price`, `Product.images[0]`, and for **Store Attribution**, `Product.store.name` and `Product.store.logoUrl`.

### **Screen 2: Search Screen**
*   **Purpose**: Global product search with filtering and sorting.
*   **API Endpoint**: `GET /api/v1/marketplace/search`.
*   **Custom Widgets**:
    *   `SearchFilterSidebar`:
        *   **Data**: Fetches all `StoreEntity` and `CategoryEntity` from the new marketplace endpoints to populate filter options.

### **Screen 3: Product Detail Screen**
*   **Purpose**: Comprehensive view of a single product.
*   **API Endpoints**: `GET /stores/:storeSlug/products/:id`, `GET /.../reviews`, `POST /.../reviews`, `POST /.../wishlist/add`.
*   **Custom Widgets**:
    *   `StoreInfoBanner`: Clearly attributes the product using `Store.name`, `Store.logoUrl`.
    *   `VariantSelector`: Consumes `Product.variants` from `ProductVariantEntity`.
    *   `ReviewList`: Consumes `ReviewEntity` data.

### **Screen 4: Shopping Cart Screen**
*   **Purpose**: Review cart contents and apply discounts.
*   **Note**: The app will manage multiple carts, one for each store a user adds an item from. The UI will display them as separate sections.
*   **API Endpoints**: `GET /stores/:storeSlug/cart`, `POST /.../cart/item`, `DELETE /.../cart/item/{itemId}`, `POST /.../cart/promo`.
*   **Custom Widgets**:
    *   `StoreCartSection`: A new widget that contains the `CartItemCard`s and summary for a single store's cart.
    *   `CartItemCard`: Displays `CartItemEntity` data, including `product.store.name`.

### **Screen 5: Checkout Screen (Multi-Step)**
*   **Purpose**: Collect shipping and payment information.
*   **Note**: The checkout process will be initiated *per store*. The user will select one store's cart to check out at a time.
*   **API Endpoints**: `GET /.../addresses`, `GET /.../shipping-methods`, `GET /.../credit-cards`, `POST /orders`.
*   **Widgets**:
    *   **Step 1: Shipping Address**: Consumes `AddressEntity` list.
    *   **Step 2: Shipping Method**: Consumes `ShippingMethodEntity` list.
    *   **Step 3: Payment Method**: Consumes `CreditCardEntity` list.
    *   **Step 4: Order Summary & Place Order**.

### **Screen 6: Order Confirmation Screen**
*   **Purpose**: Confirm a successful order.
*   **API Endpoint**: `GET /account/orders/:orderId`.
*   **Custom Widgets**:
    *   `OrderDetailsCard`: Consumes an `OrderEntity`.

### **Screen 7: Account Management Screen**
*   **Purpose**: A hub for users to manage their profile, orders, and lists.
*   **Widgets**:
    *   `ListTile`: "My Orders" -> **Order History Screen**.
    *   `ListTile`: "My Wishlists" -> **Unified Wishlist Screen**.
    *   "Address Book" -> Manages `AddressEntity`.
    *   "Payment Methods" -> Manages `CreditCardEntity`.

### **Screen 8: Unified Wishlist Screen**
*   **Purpose**: To display all of a user's wishlisted items from various stores.
*   **API Endpoint**: `GET /api/v1/account/wishlists/all`.
*   **Widgets**:
    *   `ListView` with `StoreWishlistSection` widgets. Each section shows items wishlisted from a particular store.