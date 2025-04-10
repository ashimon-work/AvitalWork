# Backend API Implementation Plan (Storefront Support) - Revision 2

This plan outlines the necessary NestJS backend API endpoints to support the Storefront website functionality, prioritized based on the frontend review and incorporating enhanced search features.

**Assumptions:**

*   The backend uses NestJS with TypeORM.
*   Existing entities (`User`, `Product`, `Category`, `Store`, `CarouselItem`, potentially `Cart`, `Order`) are available or will be created/updated.
*   Authentication (`AuthModule`, `JwtAuthGuard`) is set up.
*   Basic controllers (`ProductsController`, `CategoriesController`, `AuthController`, etc.) exist or will be created.

**Phase 1: Core Functionality & Enhanced Search**

1.  **`GET /api/navigation/popular` (Supports 404 Page - Implemented)**
    *   **Objective:** Provide a list of popular navigation links.
    *   **Controller:** `NavigationController` (Created).
    *   **Service:** `NavigationService` (Created).
    *   **Logic:** Currently returns hardcoded links. Accepts `storeSlug` query param (not used in current logic).
    *   **Response DTO:** `{ name: string; path: string; }[]`.

2.  **`GET /api/products/suggest` (Supports Search Autocomplete - Implemented)**
    *   **Objective:** Provide quick search suggestions (product names) based on partial user input.
    *   **Controller:** `ProductsController` (Existing).
    *   **Service:** `ProductsService` (Existing - `getSearchSuggestions` method added).
    *   **Logic:** Accepts query parameters (`q`, `storeSlug`, `limit`). Performs `ILike` search on product name within the store. Returns limited list (`id`, `name`).
    *   **Response DTO:** `ProductEntity[]` (subset of fields: `id`, `name`).

3.  **`GET /api/products?q=...` (Supports Full Search Results - Existing)**
    *   **Objective:** Provide full search results based on a user query, supporting pagination, filtering, sorting.
    *   **Controller:** `ProductsController` (Existing).
    *   **Service:** `ProductsService` (Existing).
    *   **Logic:** Uses the existing `findAll` method, leveraging the `q` parameter for full-text or partial matching across relevant fields (name, description, SKU, tags?) within the current `storeSlug`. Applies other filters/sorting/pagination as needed.
    *   **Response DTO:** `{ products: Product[]; total: number }` (Existing).

4.  **`POST /api/auth/register` (Supports Registration Page - Existing)**
    *   **Objective:** Register a new user account.
    *   **Controller:** `AuthController` (Existing).
    *   **Service:** `AuthService`, `UsersService` (Existing).
    *   **Logic:** Validate input DTO (`CreateUserDto`). Check if email already exists. Hash password. Create new `User` entity using `UsersService`. Return success message or error (e.g., 409 Conflict if email exists).
    *   **Request DTO:** `CreateUserDto` (includes name, email, password, phone?, newsletterOptIn?).
    *   **Response DTO:** Success message or error details.

5.  **`POST /api/auth/login` (Supports Login Page - Existing)**
    *   **Objective:** Authenticate an existing user and return a JWT.
    *   **Controller:** `AuthController` (Existing).
    *   **Service:** `AuthService` (Existing).
    *   **Logic:** Validate credentials (`LoginUserDto`). Find user by email. Compare hashed password. If valid, generate JWT containing user ID, email, roles, etc. Handle "Remember Me" for token expiry if applicable. Return JWT and user info (excluding password).
    *   **Request DTO:** `LoginUserDto` (email, password, rememberMe?).
    *   **Response DTO:** `{ accessToken: string; user: Omit<User, 'passwordHash'> }`.

6.  **`GET /api/products/:id` (Supports Product Page - Existing)**
    *   **Objective:** Get detailed information for a single product.
    *   **Controller:** `ProductsController` (Existing).
    *   **Service:** `ProductsService` (Existing).
    *   **Logic:** Find product by ID, ensuring it belongs to the specified `storeSlug` (if provided via query param/context). Eager load relations if necessary (e.g., category, variants - though variants aren't implemented yet). Return product details or 404 if not found.
    *   **Response DTO:** `Product` entity (or a specific `ProductDetailDto`).

7.  **`POST /api/cart/add` (Supports Product Page & Cart Service - Existing)**
    *   **Objective:** Add a product (with quantity) to the user's cart.
    *   **Controller:** `CartController` (Existing).
    *   **Service:** `CartService` (Existing).
    *   **Logic:** Identify user (via JWT). Find or create user's cart. Check product existence and stock (requires `ProductsService`). Add/update item quantity in the cart. Persist cart state (database or session). Return updated cart state or success message.
    *   **Request DTO:** `{ productId: string; quantity: number }`.
    *   **Response DTO:** Updated `Cart` state or success message.

8.  **`GET /api/categories/:id` (Supports Category Page - Existing)**
    *   **Objective:** Get details for a specific category.
    *   **Controller:** `CategoriesController` (Existing).
    *   **Service:** `CategoriesService` (Existing).
    *   **Logic:** Find category by ID, ensuring it belongs to the specified `storeSlug`. Return category details or 404.
    *   **Response DTO:** `Category` entity (or `CategoryDetailDto`).

9.  **`GET /api/products` (Supports Category Page - Existing)**
    *   **Objective:** Get a list of products, supporting filtering, sorting, and pagination.
    *   **Controller:** `ProductsController` (Existing).
    *   **Service:** `ProductsService` (Existing).
    *   **Logic:** Parse query parameters (`category_id`, `price_min`, `price_max`, `tags`, `sort`, `page`, `limit`, `q` for search, `storeSlug`). Build TypeORM query based on parameters. Fetch paginated list of products and the total count matching the criteria.
    *   **Response DTO:** `{ products: Product[]; total: number }` (Existing).

10. **`GET /api/cart` (Supports Cart Page & Cart Service - Existing)**
    *   **Objective:** Get the current user's cart contents.
    *   **Controller:** `CartController` (Existing).
    *   **Service:** `CartService` (Existing).
    *   **Logic:** Identify user (via JWT). Retrieve user's cart state (including product details for each item). Return cart state.
    *   **Response DTO:** `Cart` state (e.g., `{ items: CartItem[], subtotal: number, ... }`).

11. **`PATCH /api/cart/:productId` (Supports Cart Page & Cart Service - Existing)**
    *   **Objective:** Update the quantity of an item in the user's cart.
    *   **Controller:** `CartController` (Existing).
    *   **Service:** `CartService` (Existing).
    *   **Logic:** Identify user. Find cart item by `productId`. Update quantity. Check stock. Persist changes. Return updated cart state.
    *   **Request DTO:** `{ quantity: number }`.
    *   **Response DTO:** Updated `Cart` state.

12. **`DELETE /api/cart/:productId` (Supports Cart Page & Cart Service - Existing)**
    *   **Objective:** Remove an item from the user's cart.
    *   **Controller:** `CartController` (Existing).
    *   **Service:** `CartService` (Existing).
    *   **Logic:** Identify user. Remove item associated with `productId` from the cart. Persist changes. Return updated cart state.
    *   **Response DTO:** Updated `Cart` state.

13. **`GET /api/categories/featured` (Supports Homepage - Existing)**
    *   **Objective:** Get a list of featured categories for the store.
    *   **Controller:** `CategoriesController` (Existing).
    *   **Service:** `CategoriesService` (Existing).
    *   **Logic:** Fetch categories marked as "featured" for the specified `storeSlug`. Limit the number (e.g., 4-8).
    *   **Response DTO:** `Category[]`.

14. **`GET /api/products/featured` (Supports Homepage - Existing)**
    *   **Objective:** Get a list of featured products for the store.
    *   **Controller:** `ProductsController` (Existing).
    *   **Service:** `ProductsService` (Existing).
    *   **Logic:** Fetch products marked as "featured" for the specified `storeSlug`. Limit the number (e.g., 6-12).
    *   **Response DTO:** `Product[]`.

15. **`GET /api/carousel` (Supports Homepage Carousel - Existing)**
    *   **Objective:** Get the list of slides/images for the hero carousel.
    *   **Controller:** `CarouselController` (Existing).
    *   **Service:** `CarouselService` (Existing).
    *   **Logic:** Fetch active `CarouselItem` entities associated with the specified `storeSlug`.
    *   **Response DTO:** `CarouselSlide[]` (e.g., `{ imageUrl: string; altText?: string; linkUrl?: string }[]`).

**Phase 2: Endpoints for Unimplemented Frontend Pages**

*   **Account:** `GET /api/account/overview`, `GET /api/account/orders`, `GET/POST/PATCH/DELETE /api/account/addresses`, `GET/POST/DELETE /api/account/payment-methods`, `PATCH /api/account/personal-info`, `GET /api/account/wishlist`, `POST /api/account/change-password`. (Requires `AccountController`, `AccountService`, `OrdersService`, `AddressService`, etc.)
*   **Checkout:** `GET /api/shipping/methods`, `GET /api/tax/estimate`, `POST /api/orders`. (Requires `ShippingService`, `TaxService`, `OrdersService`, `CheckoutController`?)
*   **Order Confirmation:** `GET /api/orders/:id`, `GET /api/products/recommended?based_on={order_id}`. (Requires `OrdersService`, `ProductsService`).
*   **Contact:** `POST /api/contact`, `GET /api/faq`. (Requires `ContactController`, `FaqController`?)
*   **About:** `GET /api/store/about`, `GET /api/testimonials`. (Requires `StoreController`?, `TestimonialController`?)
*   **Product Page Extras:** `GET /api/products/:id/reviews`, `POST /api/wishlist/add`, `POST /api/reviews`. (Requires `ReviewsService`, `WishlistService`).
*   **Cart Extras:** `POST /api/cart/promo`. (Requires `CartService`, `PromoCodeService`?).
*   **Auth Extras:** `POST /api/auth/forgot-password`, `GET /api/auth/social/{provider}`. (Requires `AuthService`).