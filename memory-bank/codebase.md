# activeContext.md

```md
# Active Context: Online Business Promotion System (Store-Specific Data & Routing)

## 1. Current Focus

*   **Store Management Website Implementation:** Continuing implementation of pages and core functionality.
*   **Storefront Website Refinement:** Addressing remaining Storefront items like full Checkout & Order Confirmation flow, and Account page refinements.
*   **Global Marketplace Website:** Initial planning and development.
*   **Memory Bank Maintenance:** Keeping documentation updated with ongoing progress.

## 2. Recent Changes & Debugging

*   **(Previous Session) Production Deployment & Debugging:** Successfully configured Docker Compose, Dockerfiles, Nginx, database migrations, and seeding for the production environment. Resolved various build and runtime errors. Fixed featured products query.
*   **Store Entity & Relationships (Backend):**
    *   Created `StoreEntity` with `id`, `name`, `slug`, etc. (`backend/api/src/stores/entities/store.entity.ts`).
    *   Added `ManyToOne` relationship from `ProductEntity` and `CategoryEntity` to `StoreEntity`.
    *   Added corresponding `OneToMany` relationships in `StoreEntity`.
    *   Created `StoresModule` (`backend/api/src/stores/stores.module.ts`) and registered `StoreEntity` using `TypeOrmModule.forFeature`.
    *   Imported `StoresModule` into `AppModule` to enable entity auto-loading.
    *   Updated `data-source.ts` (for CLI) to include `StoreEntity`.
*   **Database Migration & Seeding (Store Implementation):**
    *   Troubleshot migration generation issues related to npm script argument passing, TypeORM entity metadata discovery (`StoreEntity` missing from `DataSource` and `AppModule`), and build configuration (`tsconfig.build.json` excluding `data-source.ts`).
    *   Corrected `CMD` path in `backend/api/Dockerfile.prod`.
    *   Generated `AddStoreEntityAndRelations` migration.
    *   Troubleshot migration run failures due to `NOT NULL` constraint on existing data and foreign key violations.
    *   Modified migration script (`1743592892142-AddStoreEntityAndRelations.ts`) to:
        *   Add `storeId` columns as nullable.
        *   Insert a default store record.
        *   Update existing rows to use the default store ID.
        *   Alter columns to `NOT NULL`.
        *   Add foreign key constraints.
    *   Troubleshot file permission errors preventing migration script updates.
    *   Successfully ran the corrected migration.
    *   Updated `seed.ts` to use valid UUIDs for stores and associate products/categories with specific stores.
    *   Successfully ran the updated seed script.
*   **API Filtering (Backend):**
    *   Updated `ProductsService` (`findAll`, `findOne`, `getFeaturedProducts`) to accept optional `storeSlug` and filter queries using `where.store = { slug: storeSlug }`. Added `store` to relations loaded.
    *   Updated `ProductsController` to accept optional `storeSlug` query parameter and pass it to the service.
    *   Updated `CategoriesService` (`findOne`, `getFeaturedCategories`) similarly.
    *   Updated `CategoriesController` similarly.
*   **Store Context & Routing (Frontend):**
    *   Modified `app.routes.ts` to wrap main application routes under a `/:storeSlug` parent route parameter. Added a temporary redirect from root to a default store slug.
    *   Created `StoreContextService` (`projects/storefront/src/app/core/services/store-context.service.ts`) to extract `storeSlug` from the route and provide it as an observable (`currentStoreSlug$`).
    *   Updated `ApiService` (`projects/storefront/src/app/core/services/api.service.ts`) to inject `StoreContextService` and add the `storeSlug` as a query parameter to relevant API calls (getProducts, getProductDetails, getFeaturedProducts, etc.).
*   **Configuration Verification:**
    *   Verified `docker/nginx/nginx.conf` correctly handles Angular routing with the new path structure using `try_files`.
*   **Frontend Link Fixes:**
    *   Updated `HomepageComponent`, `HeaderComponent`, `NavigationComponent`, `FooterComponent`, `CategoryPageComponent` to inject `StoreContextService` and expose `currentStoreSlug$`.
    *   Updated `ProductCardComponent` and `CategoryCardComponent` to accept `storeSlug` as an `@Input`.
    *   Updated `routerLink` directives in all affected component templates (`homepage`, `header`, `navigation`, `footer`, `product-card`, `category-card`, `category-page`) to correctly prepend the `storeSlug` for navigation.
    *   Fixed issue where product/category card content disappeared by adjusting `*ngIf` and using conditional `routerLink` binding.
*   **Login Functionality Debugging (Frontend):**
    *   Identified issue where `AuthGuard` redirected to global `/login`, losing `storeSlug` context.
    *   Moved `/login` and `/register` routes inside the `/:storeSlug` parent route in `app.routes.ts`.
    *   Updated `AuthGuard` to extract `storeSlug` from the target URL (`state.url`) and redirect to the store-specific login path (e.g., `/:storeSlug/login`).
    *   Verified the login flow now correctly handles redirection and maintains store context.
*   **Account Section Routing Debugging (Frontend):**
    *   Identified issue where navigating within the account section caused duplicated URL segments (e.g., `/account/account/orders`).
    *   Traced issue to absolute path redirection (`/account`, `/login`) in `AuthService` after login/logout.
    *   Updated `AuthService` to inject `ActivatedRoute` and construct store-specific relative paths (e.g., `['/', storeSlug, 'account']`) for navigation after login and logout.
    *   Verified navigation within the account section now works correctly.
*   **Carousel Implementation & Troubleshooting:**
    *   Corrected `CarouselItem` entity (UUID PK, relation to `StoreEntity`).
    *   Corrected `StoreEntity` (added `OneToMany` to `CarouselItem`).
    *   Corrected `CarouselModule` (import `CarouselItem`).
    *   Corrected `data-source.ts` (added `CarouselItem` to entities list).
    *   Cleaned up multiple incorrect migration files.
    *   Troubleshot migration generation failures:
        *   Docker permission errors (`/var/run/docker.sock`) resolved using `sudo`.
        *   `ENOENT` error for `package.json` resolved using `docker compose exec --workdir /usr/src/app/backend/api ...`.
        *   Migration file not appearing on host due to lack of volume mount in production `api` service (`docker-compose.yml`). Resolved by using `sudo docker cp ...` to copy the file from the container.
        *   Documented `--workdir` and `docker cp` necessity in `techContext.md`.
    *   Generated and successfully ran the correct `CreateCarouselItemsTable` migration.
    *   Updated `CarouselService` and `CarouselController` to filter by `storeSlug`.
    *   Updated `ApiService` (`getCarouselImages`) to pass `storeSlug`.
    *   Updated `CarouselComponent` to fetch its own data via `ApiService`.
    *   Fixed `HomepageComponent` template error by removing `[slides]` binding.
    *   Updated `seed.ts` to include `CarouselItem` data and ran seed script successfully.
    *   Identified and removed misplaced `CarouselAddComponent` and `createCarouselImage` method from Storefront project (belongs in Store Management). Fixed resulting build error.
 *   **Storefront Page Review (Frontend):** Reviewed implementation status of all 12 Storefront pages against the plan, documented in `storefront-page-status.md`. (Status updated for Account page).
 *   **404 Page Implementation (Storefront Frontend):** Implemented basic 404 page component, routing, styling, "Back to Home" link (with store slug), and placeholder search/suggestions. Fixed root redirect loop.
 *   **Backend API Implementation (Account):**
     *   Created Entities: `AddressEntity`, `OrderEntity`, `OrderItemEntity`, `WishlistEntity`, `WishlistItemEntity`.
     *   Updated `UserEntity` with relations.
     *   Created Modules: `AddressesModule`, `OrdersModule`, `WishlistModule`.
     *   Created Services: `AddressesService`, `OrdersService`, `WishlistService`.
     *   Created Controllers: `AddressesController`, `OrdersController`, `WishlistController`.
     *   Created DTOs for Addresses, Orders, Wishlist.
     *   Created `StoreContextGuard`.
     *   Implemented `changePassword` in `AuthService`/`AccountController`.
     *   Updated `AppModule`, `ProductsModule`, `StoresModule`, `data-source.ts`.
     *   Troubleshot and fixed various dependency injection issues.
 *   **Database (Account):**
     *   Generated `AddAccountEntities` migration.
     *   Updated `seed.ts` for new entities and fixed deletion order.
     *   Ran migration and seed script successfully after troubleshooting DB connection and FK constraint errors.
 *   **Address Field Removal ('state'):**
     *   Removed 'state' field from frontend component (.ts, .html), shared interface, backend DTOs, backend entity, seed data.
     *   Generated and ran migration `RemoveStateFromAddresses`.
 *   **Frontend Implementation (Account):**
     *   Updated `ApiService` with methods for Addresses, Orders, Wishlist, Personal Info, Password Change.
     *   Implemented components (.ts, .html) for `AccountAddressesComponent`, `AccountOrdersComponent`, `AccountWishlistComponent`, `AccountPersonalInfoComponent`, `AccountChangePasswordComponent`.
     *   Implemented basic `AccountPaymentMethodsComponent` (view/delete only).
     *   Fixed various template errors and service method signatures.
 *   **Store Management Website - Page Creation:** Defined routes and created basic component files for Login, Dashboard, Product Management, Order Management, Customer Management, Settings, Profile, and a dedicated 404 page.
 *   **Store Management Website - Login Page:** Partially implemented UI (logo placeholder, form structure, password toggle, forgot password link/modal placeholder). Implemented basic form handling and integrated with AuthService for login and forgot password API calls (placeholders). Added basic email validation to forgot password modal.
 *   **Store Management Website - Dashboard Page:** Partially implemented UI (basic header with navigation links, performance cards, sales chart placeholder with controls, recent orders table with pagination/sorting/status placeholders, inventory alerts, quick action buttons with router links, store health score). Integrated with DashboardService for data fetching (API calls replaced placeholders). Added `CommonModule` and `RouterModule` imports. Added methods for quick action buttons and view order (logic placeholders). Fixed Router injection error by injecting `ActivatedRoute` for relative navigation. Integrated ng2-charts for sales chart, added event handlers for time period and comparison controls, connected "View" button in Recent Orders table to component method. **Implemented frontend pagination and sorting logic for Recent Orders table (properties, methods, getters).**
 *   **Store Management Website - Product Management Page:** Partially implemented UI (basic action bar, product table, pagination, count summary placeholders).
 *   **Store Management Website - 404 Page:** Created a dedicated component (`ManagementNotFoundPageComponent`) and updated routing to use it for unmatched paths under `/:storeSlug`. Implemented basic UI with "Back to Dashboard" button and quick links using router links.
 *   **Store Management Website - Dashboard Service:** Updated `getRecentOrders` method to accept pagination and sorting parameters.

## 3. Next Steps (Immediate & Planned)

1.  **Storefront Website - Finalization:**
    *   **Complete Checkout Flow (I.5):** Full implementation of UI, multi-step form logic, API integration for shipping, tax, and order placement.
    *   **Implement Order Confirmation Page (I.6):** Display order summary, thank you message, links to account/continue shopping.
    *   **Refine Frontend Account UI/UX (I.9):**
        *   Implement full functionality for Payment Methods (Add/Edit, Set Default - requires backend).
        *   Ensure `GET /api/account/overview` is called and data displayed.
        *   Ensure `PATCH /api/account/personal-info` backend endpoint is fully implemented and integrated.
        *   Add styling, improve error handling, implement order details view within Account Orders.
    *   **Address any remaining UI/UX refinements** on already implemented pages.
    *   **Implement remaining minor features** as per PAGE FUNCTIONALITY PLAN (e.g., Newsletter subscription logic if not fully done, social login if planned).

2.  **Continue Store Management Website Implementation:**
    *   Refine UI elements and implement user actions for Dashboard (notifications), Product Management, Order Management, Customer Management, Settings, and Profile pages.
    *   Implement technical details (API integration, component interaction) for these pages.
    *   Implement Advanced Filter Sidebar and Add/Edit Product Modal for Product Management.
    *   Implement Order Details Modal for Order Management.
    *   Implement Customer Details Modal for Customer Management.
    *   Implement Settings forms and logic.
    *   Implement Profile update and password change logic.
    *   Implement Role-Based Access Control (RBAC).
    *   Implement 404 page user actions (Contact support, Report broken link).
    *   **Implement Backend WebSocket Gateway:** Add WebSocket functionality for real-time updates in the Store Management backend.
    *   **Update Nginx configuration for WebSocket proxying:** Configure Nginx to correctly proxy WebSocket connections to the backend API.

3.  **Implement Remaining Backend Endpoints (if any not covered by Storefront/Management tasks):**
    *   `PATCH /api/account/personal-info` (Verify full implementation).
    *   `GET /api/account/payment-methods`, `POST /api/account/payment-methods`, `DELETE /api/account/payment-methods/:id` (Implement full logic if not done).
    *   Store Management API Endpoints (as per ongoing Store Management dev).
    *   Marketplace API Endpoints (Aggregated Products, Categories, Stores, Search).

4.  **Global Marketplace Website (IV):**
    *   Begin core layout, navigation, and homepage implementation.

*(Cart is already refactored to use the database. Search suggestions, popular navigation, Contact, About, Reviews for Product Page are largely addressed for Storefront.)*

## 4. Active Decisions & Considerations

*   **Store Identification:** Using a URL slug (`/:storeSlug`) to identify the active store in the frontend.
*   **Backend Filtering:** API endpoints use the `storeSlug` passed as a query parameter (`?storeSlug=...`) to filter database results via TypeORM relations (`where: { store: { slug: storeSlug } }`).
*   **Frontend Context:** Using a dedicated Angular service (`StoreContextService`) to read the `storeSlug` from the route parameters and provide it as an observable (`currentStoreSlug$`). `ApiService` subscribes to this observable to add the slug to API requests.
*   **Frontend Routing Structure:** Routes requiring store context (including auth pages like login/register) must be nested under the `/:storeSlug` parameter to ensure context is available and preserved during navigation/redirection. Guards redirecting to auth pages must construct the store-specific path. Service-based navigation (like in `AuthService`) must also construct store-specific paths, potentially by accessing route parameters. Using `ActivatedRoute` for relative navigation within store context.
*   **Migration Strategy:** When adding non-nullable foreign keys (`storeId`) to tables with existing data, the migration must first add the column as nullable, update existing rows with a default value (potentially inserting the default referenced entity first), and then alter the column to be non-nullable.
*   **Production Environment:** (As before) Using Docker Compose with separate production Dockerfiles and Nginx reverse proxy. Environment variables managed via `.env` file on the server.
*   **Image Placeholders:** (As before) Using `picsum.photos`.
*   **Docker Caching:** (As before) Optimized Dockerfiles.
*   **TypeORM CLI:** (As before) Using `process.env` in `data-source.ts` and running commands via `docker exec`.
*   **WebSocket Implementation:** The backend WebSocket gateway is not yet implemented. Nginx configuration needs to be updated to proxy WebSocket connections when the backend is ready.

## 5. Learnings & Insights

*   **TypeORM Entity Loading:** `autoLoadEntities: true` in `TypeOrmModule.forRootAsync` requires entities to be registered via `TypeOrmModule.forFeature` in an imported module (e.g., `StoresModule`). Simply having the entity file is not enough for runtime discovery.
*   **TypeORM CLI vs. Runtime:** The `DataSource` configuration for the CLI (`data-source.ts`) must explicitly list all entities, whereas the runtime configuration can use `autoLoadEntities`.
*   **TypeScript Build Includes:** `tsconfig.build.json`'s `include` property dictates which files are compiled. Files outside the included paths (like `data-source.ts` at the root) need to be explicitly added if required in the build output.
*   **Docker Build Cache:** The build cache can prevent changes (like adding/modifying migration files or updating `tsconfig.build.json`) from being reflected in the image unless `--no-cache` is used or relevant `COPY` layers are invalidated.
*   **Docker `CMD` Path:** The path in the `CMD` instruction must exactly match the location of the compiled entry point file (`main.js`) within the final image stage.
*   **Docker Volumes vs. Build:** Volume mounts in `docker-compose.yml` can overwrite code built into the image at runtime, which can hide build issues or prevent code updates from taking effect without container recreation. (Verified no problematic volumes for `api` service in `docker-compose.yml`).
*   **Migration Constraints:** Adding `NOT NULL` columns or foreign key constraints to tables with existing data requires careful handling (add nullable, update data, alter to not null, add constraint) to avoid errors. Inserting required related data (like a default store) within the migration itself can resolve FK violations.
*   **UUID Format:** Ensure strings used for UUIDs adhere to the standard format when inserting or comparing in the database.
*   **Angular Route Structure:** The placement of routes (inside or outside parameterized parent routes) significantly impacts context availability and how guards should handle redirection.
*   **Docker `exec` Working Directory:** When running commands like `npm run ...` inside a container via `docker compose exec`, ensure the correct working directory is specified using `--workdir` if the `package.json` is not in the container's default working directory.
*   **Docker Volumes (Prod vs. Dev):** Production Docker Compose setups often omit source code volume mounts for performance/security. Files created inside the container (e.g., migrations) will *not* appear on the host unless explicitly copied out (e.g., using `docker cp`). Development setups (`docker-compose.dev.yml`) typically *do* mount volumes, allowing changes to reflect immediately.
*   **Docker Permissions:** Files created/copied from Docker containers might have incorrect host permissions, requiring `sudo chown`.
*   **Verify Feature Placement:** Always double-check component/feature placement against the project plan (e.g., `CarouselAddComponent` belonged in Store Management, not Storefront).
*   **(Previous Learnings Still Valid):** TypeORM entity loading/CLI config, TS build includes, Docker build cache/CMD path, migration constraints, UUID format, Angular route structure/guards, JWT config, Docker exec/cp, etc.
*   **NestJS Dependency Injection:** Ensure modules providing services/repositories are correctly imported *and exported* if needed by other modules. Check module context carefully when resolving dependency errors.
*   **TypeORM Relations in Queries:** Use the relation property name (e.g., `user: { id: userId }`) in `where` clauses for repository methods like `find`, `findOne`, `update`, `delete` when querying based on a relation's ID, not the raw foreign key column name.
*   **Database Constraints:** Foreign key constraints dictate the order of operations (e.g., delete dependent records before deleting the referenced record).
*   **Angular Template Access:** Component properties accessed in the template must be public. Global objects like `Math` are not directly accessible; calculations should be done in the component or via pipes/helper methods. Event bindings (`(click)`) cannot directly use complex expressions involving async pipes or non-null assertions.
*   **Angular Router `relativeTo`:** When using `router.navigate` with a relative path within a parameterized route (like `/:storeSlug`), inject `ActivatedRoute` and use it for the `relativeTo` option instead of trying to derive it from `router.routerState.snapshot`.

*(As of 5/13/2025 - Completed significant Storefront page implementations (Category, Product, Cart, Contact, About, 404) and resolved associated backend placeholder logic. Order creation flow verified. Memory bank updated.)*

```

# backend-api-plan.md

```md
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
*   **Order Management:** `GET /api/manager/orders` (Filtering by status, date range, search term implemented in service). `GET /api/manager/orders/{id}`. `PATCH /api/manager/orders/{id}`. `POST /api/manager/orders/{id}/notes`. `POST /api/manager/orders/{id}/email`. `POST /api/manager/orders/{id}/shipping`. `GET /api/manager/orders/{id}/packing-slip`. `GET /api/manager/orders/export`.
```

# backend-api-status.md

```md
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
```

# backend-migration-guide.md

```md
# Backend Migration Guide: TypeORM in Docker Development

This document details the process of creating and running TypeORM migrations for the backend API within the Docker development environment. It includes successful commands and troubleshooting steps for common issues encountered during development.

## 1. Understanding the Environment

The backend API runs in a Docker container (`magic_store_api_dev`) with source code mounted from the host. TypeORM CLI commands are executed inside this container. The database runs in a separate container (`magic_store_db_dev`).

Key tools involved:
- Docker Compose (`docker compose exec`)
- TypeORM CLI (`typeorm migration:generate`, `typeorm migration:run`, etc.)
- `ts-node` and `tsconfig-paths` (for running TypeScript files directly)
- `psql` (PostgreSQL command-line client, for direct database interaction)

## 2. Successful Commands

After troubleshooting various issues, the following commands have been found to work reliably for managing migrations in this environment:

### Generating a New Migration

To generate a new migration file based on detected schema changes (new entities, changes to existing entities):

\`\`\`bash
docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm --dataSource data-source.ts migration:generate ./src/migrations/YourMigrationName
\`\`\`

- `--workdir /usr/src/app/backend/api`: Sets the working directory inside the container to the backend API project root.
- `-e TS_NODE_PROJECT=tsconfig.json`: Tells `ts-node` to use the `tsconfig.json` file in the working directory for path resolution and compilation.
- `api`: The name of the backend API service in `docker-compose.dev.yml`.
- `/usr/src/app/node_modules/.bin/ts-node`: The absolute path to the `ts-node` executable inside the container.
- `-r tsconfig-paths/register`: Registers `tsconfig-paths` to enable resolving path aliases defined in `tsconfig.json` (like `src/`).
- `/usr/src/app/node_modules/.bin/typeorm`: The absolute path to the TypeORM CLI binary inside the container.
- `--dataSource data-source.ts`: Specifies the path to the TypeORM data source file (relative to the working directory).
- `migration:generate ./src/migrations/YourMigrationName`: The TypeORM command to generate a migration file at the specified path and name.

**Important:** After generating the migration, you must copy the generated file from inside the container to your host machine and set its ownership to your user to be able to edit it.

### Running Pending Migrations

To apply pending migrations to the database:

\`\`\`bash
docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm --dataSource data-source.ts migration:run
\`\`\`

This command uses the same setup as `migration:generate` but executes the `migration:run` command.

## 3. Troubleshooting Common Issues

During the migration process, several issues were encountered. Here's a breakdown of the problems and their solutions:

### Issue: `No changes in database schema were found - cannot generate a migration.`

**Cause:** TypeORM CLI did not detect any differences between the entities defined in the project and the current database schema. This can happen if:
1. New entities or schema changes were not added to the `entities` array in `data-source.ts`.
2. The `data-source.ts` file was not correctly read or compiled by the TypeORM CLI command.

**Solution:**
1. Ensure all new or modified entity files are correctly imported and included in the `entities` array within `backend/api/data-source.ts`.
2. Verify that the migration generation command is correctly configured to use the `data-source.ts` file (see successful command above).
3. If using `migration:generate` continues to fail, consider creating an empty migration manually using `migration:create` and adding the SQL yourself.

### Issue: `Unknown argument: d` or `Unknown argument: dataSource`

**Cause:** The TypeORM CLI command (`migration:create` in particular) was called with the `-d` or `--dataSource` flag when it was not expected or recognized in that context. This often happens when using an `npm run` script that hardcodes these flags for all TypeORM commands, or when directly executing `typeorm-ts-node-commonjs` which might handle flags differently for different commands.

**Solution:**
- When using `migration:create` directly with `ts-node` and the TypeORM CLI binary, omit the `--dataSource` flag. The command should look like:
  \`\`\`bash
  docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm migration:create ./src/migrations/YourMigrationName
  \`\`\`
- If using an `npm run` script that includes the `-d` or `--dataSource` flag, you may need to modify the script in `package.json` or bypass the script and execute the TypeORM CLI binary directly as shown in the successful commands.

### Issue: `Cannot find module '/usr/src/app/backend/api/dist/data-source.js'` or `Cannot find module '/usr/src/app/backend/api/src/data-source.ts'`

**Cause:** The Node.js runtime or `ts-node` within the container is unable to locate the specified data source file. This can be due to:
1. The file not existing at the specified path inside the container (e.g., build not run, volume not mounted correctly).
2. Path resolution issues within the container's environment or the tools being used (`ts-node`, TypeORM CLI).

**Solution:**
1. Ensure the backend project is built (`npm run build`) if the command relies on compiled JavaScript (`dist/data-source.js`).
2. Verify that the source code volume is correctly mounted in `docker-compose.dev.yml` (`.:/usr/src/app`).
3. Use the correct absolute or relative path to the data source file within the container's file system.
4. Ensure `ts-node` is correctly configured to resolve paths, especially path aliases defined in `tsconfig.json`. This requires including `-r tsconfig-paths/register` and setting the `TS_NODE_PROJECT` environment variable (see successful commands).

### Issue: Permission Denied (`EACCES`) when editing migration files on the host

**Cause:** Migration files generated inside the Docker container are often created with `root` ownership. When attempting to edit these files from the host machine with a different user, permission errors occur.

**Solution:** After copying a migration file from the container to the host, set the ownership of the file to your current user using `sudo chown $(whoami):$(whoami) path/to/migration.ts`.

### Issue: `relation "tablename" already exists` during `migration:run`

**Cause:** The migration attempts to create a table that already exists in the database. This happens when the database schema has been modified outside of the TypeORM migration process, or if migrations were partially applied.

**Solution:**
1. Identify which migrations have already been applied to the database schema (e.g., by inspecting the database schema or comparing it to migration files).
2. Manually insert records into the `migrations` table in the database for all migrations that have already been applied to the schema. This tells TypeORM to skip these migrations during `migration:run`. Use `docker exec CONTAINER_ID psql -d your_db -U your_user -c "INSERT INTO migrations (timestamp, name) VALUES (your_timestamp, 'YourMigrationName')"` for each applied migration.
3. Modify the `CREATE TABLE` statements in your migration files to include `IF NOT EXISTS`. This allows the migration to run without error even if the table already exists, which is useful in development environments or for idempotent migrations.

## 4. Workflow Summary

1. Create or modify entities in `backend/api/src/*/entities/`.
2. Update `backend/api/data-source.ts` to include any new entities in the `entities` array.
3. Generate a new migration file using the successful `migration:generate` command.
4. Copy the generated migration file from the container to the host using `docker cp`.
5. Set the ownership of the copied file on the host using `sudo chown`.
6. Edit the migration file on the host to add `IF NOT EXISTS` to `CREATE TABLE` statements and implement any custom SQL logic if needed.
7. If tables already exist in the database that correspond to migrations not recorded in the `migrations` table, manually insert records into the `migrations` table for those migrations using `psql` via `docker exec`.
8. Run the pending migrations using the successful `migration:run` command.
9. Verify the schema changes in the database.

By following this guide and using the provided commands, developers can effectively manage TypeORM migrations within this project's Docker development environment.
## 5. Step-by-Step Example: Creating and Running a New Migration (Command Sequence)

This example demonstrates the sequence of commands to create and run a new migration for a hypothetical `ExampleEntity`.

**Prerequisites:**
- You have created `backend/api/src/example/entities/example.entity.ts`.
- You have added `ExampleEntity` to the `entities` array in `backend/api/data-source.ts`.
- Your Docker containers are running (`docker compose up -d`).

**Step 1: Generate the migration file inside the container.**

\`\`\`bash
docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm --dataSource data-source.ts migration:generate ./src/migrations/CreateExampleEntity
\`\`\`

*Wait for the command to complete and note the generated filename (e.g., `174607XXXXXXX-CreateExampleEntity.ts`).*

**Step 2: Copy the generated migration file from the container to the host.**

Replace `CONTAINER_ID` with the current ID of the `magic_store_api_dev` container (get it using `docker ps`) and `TIMESTAMP` with the actual timestamp from the generated filename.

\`\`\`bash
sudo docker cp CONTAINER_ID:/usr/src/app/backend/api/src/migrations/TIMESTAMP-CreateExampleEntity.ts ./backend/api/src/migrations/
\`\`\`

*Wait for the command to complete.*

**Step 3: Set ownership of the copied file on the host.**

Replace `TIMESTAMP` with the actual timestamp.

\`\`\`bash
sudo chown $(whoami):$(whoami) ./backend/api/src/migrations/TIMESTAMP-CreateExampleEntity.ts
\`\`\`

*Wait for the command to complete.*

**Step 4: Edit the migration file on the host.**

Open `backend/api/src/migrations/TIMESTAMP-CreateExampleEntity.ts` in your editor. Add `IF NOT EXISTS` to the `CREATE TABLE` statement in the `up` method. Save the file.

**Step 5: Run the migration inside the container.**

\`\`\`bash
docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm --dataSource data-source.ts migration:run
\`\`\`

*Wait for the command to complete. The output should show the new migration being executed.*

**Step 6: Verify the schema changes in the database.**

Replace `CONTAINER_ID` with the current ID of the `magic_store_db_dev` container (get it using `docker ps`).

\`\`\`bash
docker exec CONTAINER_ID psql -d magic_store_prod -U postgres -c "\dt"
\`\`\`

*Check the output to confirm the new table exists.*

This sequence of commands covers the typical workflow for managing migrations in this project's development environment.
```

# documentation-update-plan.md

```md
# Documentation Update Plan

**My Plan to Update Project Documentation:**

**I. Update [`store-management-page-status.md`](memory-bank/store-management-page-status.md:1)**

I will meticulously review each section of this file and apply the following updates, ensuring the status markers (`[x]`, `[/]`, `[ ]`) are adjusted accurately and specific notes are added:

1.  **Login Page (Section II.1):**
    *   Review existing statuses. It appears largely complete (`[x]`).
    *   The note "Security Features: Brute force protection, IP logging, 2FA option" will likely remain `[ ]` or be explicitly marked as `Pending/Deferred`.

2.  **Dashboard (Section II.2):**
    *   Overall Status: Will be marked as `[/] Partially Implemented`.
    *   Add Note: "Chart comparison logic is a TODO."
    *   Sub-items like "Switch time periods" (currently `[ ]`) and "View/clear notifications" (currently `[ ]`) will be reviewed, but the primary change will be the added note.

3.  **Product Management Page (Section II.3):**
    *   Overall Status: Will be marked as `[/] Partially Implemented`.
    *   Add Note: "Styling for advanced filter sidebar and modal tabs needs review. Variant generator UI is functional but might need UX polish. Inventory alert logic is pending."
    *   Update status for "Advanced filter sidebar" (currently `[ ]`) to `[/]` (Styling Pending).
    *   Update status for "Manage product variants" (currently `[ ]`) to `[/]` (UX Polish Needed).
    *   Update status for "Set inventory levels" (currently `[ ]`) to `[ ]` (Inventory Alert Logic Pending).

4.  **Order Management Page (Section II.4):**
    *   Overall Status: Will be marked as `[/] Partially Implemented`.
    *   Add Note: "Date range picker UI could be enhanced (currently dropdown). Fulfillment workflow logic beyond status update is basic. Communication history display is pending."
    *   Update status for "Process orders" (currently `[ ]`) to `[/]` (Basic Fulfillment Logic).
    *   A new item or note for "Communication history display" will be added as `[ ] Pending`.

5.  **Customer Management Page (Section II.5):**
    *   Overall Status: Will be marked as `[/] Partially Implemented`.
    *   Add Note: "Communication history and top customer identification are deferred."
    *   Ensure "View communication history" (currently `[ ]`) and "Identify top customers" (currently `[ ]`) are marked as `[ ] Deferred`.

6.  **Settings Page (Section II.6) & Profile Page (Section II.7):**
    *   Overall Status for both: `[/] Partially Implemented`.
    *   Add Note (likely under each or a shared context): "Frontend complete pending full backend integration and styling review."
    *   UI elements and user actions currently marked `[ ]` will be reviewed. If frontend aspects are done, they'll be `[/]` (Backend/Styling Pending).

7.  **404 Page (Section II.8):**
    *   Overall Status: Will be marked as `[x] Implemented`.
    *   Sub-items like "Contact support" and "Report broken link" (currently `[ ]`) will be reviewed. If not implemented, they will remain `[ ]`, but the page itself is considered implemented as per instruction.

**II. Update [`backend-api-status.md`](memory-bank/backend-api-status.md:1)**

I will add a dedicated section for Store Management API status or significantly revise the existing content if more appropriate:

1.  **New/Updated Section: "Store Management API Endpoints"**

2.  **Implemented Endpoints (Status: `Implemented`):**
    *   This list will be compiled from the "Technical Details" in the updated [`store-management-page-status.md`](memory-bank/store-management-page-status.md:1) and your specific list:
        *   **Authentication:** `POST /api/manager/login`
        *   **Dashboard:** `GET /api/manager/dashboard`, `GET /api/manager/sales/chart`, `GET /api/manager/orders/recent`, `GET /api/manager/inventory/alerts`
        *   **Product Management:** `GET /api/manager/products`, `POST /api/manager/products`, `GET /api/manager/products/{id}`, `PATCH /api/manager/products/{id}`, `DELETE /api/manager/products/{id}`, `POST /api/manager/products/bulk-delete`, `POST /api/manager/products/bulk-update-status`, `POST /api/manager/products/import`, `GET /api/manager/products/export`
        *   **Order Management:** `GET /api/manager/orders`, `GET /api/manager/orders/{id}`, `PATCH /api/manager/orders/{id}/status`, `POST /api/manager/orders/{id}/notes`, `POST /api/manager/orders/{id}/email`, `POST /api/manager/orders/{id}/shipping`, `GET /api/manager/orders/{id}/packing-slip`, `GET /api/manager/orders/export`, `PATCH /api/manager/orders/{id}/cancel`
        *   **Customer Management:** `GET /api/manager/customers`, `GET /api/manager/customers/{id}`, `PATCH /api/manager/customers/{id}`, `POST /api/manager/customers/{id}/notes`, `POST /api/manager/customers/{id}/email`, `GET /api/manager/customers/export`. (I will verify if a separate `GET /api/manager/customers/{id}/orders` for customer order history exists or is part of `GET /api/manager/orders` with filtering).
        *   **Settings:** `GET /api/manager/settings/{category}`, `PATCH /api/manager/settings/{category}`, `POST /api/manager/settings/test-email`, `POST /api/manager/settings/test-payment`, `GET /api/manager/settings/backup`, `POST /api/manager/settings/restore`
        *   **Profile:** `GET /api/manager/profile`, `PATCH /api/manager/profile`, `POST /api/manager/profile/password`, `POST /api/manager/profile/2fa/enable`, `POST /api/manager/profile/2fa/disable`, `GET /api/manager/profile/login-history`
        *   **Notifications:** (e.g., `GET /api/manager/notifications`, `PATCH /api/manager/notifications/{id}` - I will confirm these specific endpoints from project context if possible, or list as a general "Notifications API implemented").
        *   **Error Reporting:** `POST /api/manager/error-report`

3.  **Pending/Deferred Endpoints (Status: `Pending` or `Deferred`):**
    *   Specific endpoints for RBAC (e.g., `/api/manager/roles`, `/api/manager/users/{id}/roles`).
    *   Endpoints for advanced customer communication/top customer features.
    *   Endpoints related to full WebSocket event broadcasting logic (if more than basic setup is needed).

**III. Update [`progress.md`](memory-bank/progress.md:1)**

I will revise this file to reflect the latest status:

1.  **Update Top Summary:**
    *   Adjust the date and summarize the completion of Store Management frontend UI, core backend APIs, and this documentation update.

2.  **Section III. Store Management Website Development:**
    *   Reflect changes from the updated [`store-management-page-status.md`](memory-bank/store-management-page-status.md:1):
        *   Dashboard, Product Management, Order Management, Customer Management: Update status to `[/]` or `[x]` for core features, noting pending items.
        *   Settings Pages, User Profile & Security: Mark as `[/]` or `[x]` for implemented frontend/backend, noting pending full integration/styling.
        *   Role-Based Access Control (RBAC) Implementation: Remains `[ ]`.
        *   API Integration: Update to `[x]` for core APIs, noting WebSocket "full logic" as pending.

3.  **Section V. Backend API Development:**
    *   Update item 70 (Store Management API Endpoints) to `[x]` for core APIs, with a note about deferred items (RBAC, advanced customer features, full WebSockets).

4.  **Key Accomplishments & Deferred Items (Enhanced Summary):**
    *   Clearly list:
        *   **Accomplishments:** Frontend UI for all core Store Management pages, Core backend APIs supporting these pages.
        *   **Deferred Items:** RBAC, Full WebSocket event broadcasting logic, Full styling pass for Store Management, specific pending TODOs from [`store-management-page-status.md`](memory-bank/store-management-page-status.md:1) (e.g., Dashboard chart comparison, Product Management styling/UX/inventory, Order Management UI/advanced fulfillment/communication, Customer Management communication history/top customer ID).

5.  **Percentage Completion:**
    *   Re-evaluate and update the percentage completion for the "Store Management Website Finalization" task.

**Visual Plan (Mermaid Diagram):**

\`\`\`mermaid
graph TD
    A[Start: Update Documentation] --> B{Read Existing Files};
    B --> B1[Read store-management-page-status.md];
    B --> B2[Read backend-api-status.md];
    B --> B3[Read progress.md];

    B1 --> C1{Analyze & Plan Updates for store-management-page-status.md};
    C1 --> D1[Draft New store-management-page-status.md];

    B2 --> C2{Analyze & Plan Updates for backend-api-status.md};
    C2 --> D2[Draft New backend-api-status.md];

    B3 & D1 & D2 --> C3{Analyze & Plan Updates for progress.md};
    C3 --> D3[Draft New progress.md];

    D1 --> E1{Write to store-management-page-status.md};
    D2 --> E2{Write to backend-api-status.md};
    D3 --> E3{Write to progress.md};

    E1 & E2 & E3 --> F[All Documentation Updated];
    F --> G[Present to User for Final Review / Completion];
```

# productContext.md

```md
# Product Context: Online Business Promotion System

## 1. Problem Solved

Many small to medium-sized businesses lack the resources or technical expertise to establish a robust online presence, manage e-commerce operations effectively, and gain visibility in a crowded digital marketplace. This system aims to solve these problems by providing an integrated, easy-to-use platform.

## 2. Core Purpose

*   **Empower Businesses:** Provide individual businesses with their own functional, customizable online storefronts (Storefront Website).
*   **Simplify Management:** Offer a comprehensive backend system (Store Management Website) for businesses to manage products, orders, customers, and settings without needing deep technical knowledge.
*   **Increase Visibility:** Aggregate products from all participating stores into a central marketplace (Global Marketplace Website) to enhance product discovery and drive traffic to individual stores.

## 3. Target Users

*   **Store Customers:** End-users browsing and purchasing products on the individual Storefront Websites.
*   **Store Managers:** Business owners or staff using the Store Management Website to operate their online store.
*   **Marketplace Visitors:** Users browsing the Global Marketplace Website to discover products and stores.
*   **(Implicit) System Administrators:** Personnel managing the overall platform (though their interface isn't detailed in the initial plan).

## 4. Desired User Experience

*   **Storefront:** Intuitive, visually appealing, easy navigation, seamless purchasing flow, secure checkout, mobile-friendly. Users should easily find products, get detailed information, and complete purchases with confidence.
*   **Store Management:** Efficient, clear, comprehensive. Managers should be able to perform all necessary tasks (product updates, order processing, customer management, settings configuration) with minimal friction and have a clear overview of their store's performance.
*   **Global Marketplace:** Engaging discovery platform. Users should find it easy to browse diverse products, filter results effectively, learn about different stores, and seamlessly transition to individual store sites.

## 5. Key Functionality Areas (High-Level)

*   **E-commerce Core (Storefront):** Product display, filtering/sorting, cart management, checkout, order confirmation, user accounts.
*   **Store Operations (Management):** Dashboard analytics, product catalog management, order processing workflow, customer relationship management, store configuration.
*   **Product Aggregation (Marketplace):** Cross-store search, category browsing, store discovery, referral tracking.
*   **Authentication & Security:** Secure login for customers and managers, role-based access control (Management).
*   **Data Synchronization:** Ensuring product, inventory, and order data consistency across relevant platforms.

*(This context is derived from the "PAGE FUNCTIONALITY PLAN" document provided on 3/28/2025.)*

## 6. Development Approach

*   **Vertical Slices:** Implement functionality page-by-page, starting with the UI and minimal mock backend support, then iterating to connect to the real backend. Initial focus is on the Storefront Homepage.

```

# progress.md

```md
# Project Progress: Online Business Promotion System

*(As of 5/14/2025 - Core frontend UI and backend API implementation for the Store Management Website are largely complete. Documentation updated to reflect current status. RBAC, WebSockets, and full styling pass are deferred.)*

## I. Project Setup & Foundation

*   [x] Initialize Memory Bank (`projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`)
*   [x] Define Project Structure (Monorepo/Separate Repos, Folder Layout) - Decided on Angular CLI Monorepo
*   [x] Initialize Frontend Workspace/Projects (Angular) - Inside `magic-store-workspace`
    *   [x] Storefront App (`projects/storefront`)
    *   [x] Store Management App (`projects/store-management`)
    *   [x] Global Marketplace App (`projects/global-marketplace`)
*   [x] Initialize Backend Project (TypeScript/Node.js) - Initialized NestJS project `api` in `backend` dir
*   [x] Initialize Shared Library/Folder Structure (`projects/shared-types`)
*   [x] Setup Version Control (Git) - Corrected initial setup, force-pushed clean history to remote. Configured user, credential helper. Untracked node_modules.
*   [x] Configure Linters/Formatters (ESLint, Prettier) - Added root configs
*   [x] Choose and Configure Database - Chose PostgreSQL, added TypeORM config & .env
*   [x] Setup Dev Container & Local Docker Build - Development setup (`docker-compose.dev.yml`) functional.

## II. Storefront Website Development

*   [x] Core Layout & Navigation (Header, Footer, Menu) - Basic structure generated and integrated
*   [x] Homepage Implementation - Frontend complete (Carousel **fixed & seeded**, Featured Sections, Search/Newsletter/Cart integration). Backend endpoints for Search, Newsletter needed. Featured products endpoint fixed.
*   [x] Homepage Styling (Modern & Minimalist Theme) - Applied global styles and styled core/homepage components.
*   [x] Category Page Implementation - Color/Size filters, direct add to cart from product card, and out-of-stock visual disabling implemented.
*   [x] Product Page Implementation - Out-of-stock variants visually disabled in selection dropdowns.
*   [x] Shopping Cart Implementation - Promo code logic, recently viewed products, and proceed to checkout navigation implemented. Cart uses database.
*   [x] Checkout Flow Implementation - Component implemented with multi-step UI, form validations (including Luhn), API integrations for shipping methods, tax estimation, and order placement.
*   [x] Order Confirmation Page - Component implemented, fetches and displays order details and recommended products.
*   [x] Authentication (Login, Registration, Recovery) - Registration page (frontend/backend) functional. Login page (frontend/backend) functional, including JWT handling (secret/expiration config fixed), profile loading, and store-specific routing/guard fixes. Recovery pending.
*   [x] User Account Pages (Overview, Orders, Addresses, Wishlist, Personal Info, Password Change, Payment Methods) - All sections implemented with frontend and backend logic. Includes add/edit/delete for payment methods, order detail view, and full overview data. Newsletter subscription in footer implemented.
*   [x] Contact Page - Frontend implemented with form, FAQ display, and API integration. Backend saves submissions.
*   [x] About Page - Frontend implemented, displays dynamic content (about, testimonials) from API.
*   [x] 404 Page - Product search suggestions and frontend logging implemented.
*   [ ] Responsiveness & Mobile Optimization
*   [x] API Integration - Core API service updated with methods for product details, cart operations, registration. Backend endpoints implemented for these (using DB for products/categories, in-memory for cart). Search/Newsletter endpoints still pending. **Updated to pass store context.**
*   [x] Store-Specific Routing & Context - Implemented URL structure `/:storeSlug/...`, `StoreContextService` created, `ApiService` updated to use context. Fixed `routerLink`s in Header, Footer, Navigation, Product/Category Cards, Category Page, Login Page, Registration Page to use store context. Fixed `AuthService` redirection logic.

## III. Store Management Website Development

*   [x] Core Layout & Navigation - Basic structure generated and integrated
*   [x] Login Page
*   [/] Dashboard Implementation - Integrated ng2-charts for sales chart, added event handlers for chart controls, connected "View" button in Recent Orders table. **Implemented frontend pagination and sorting logic for Recent Orders table. Updated Dashboard service to accept pagination and sorting parameters. Note: Chart comparison logic is a TODO.**
*   [/] Product Management (List, Add, Edit, Delete, Variants, Bulk Actions) - Backend APIs and frontend logic for list, add, edit, delete, bulk delete, bulk update status, import, and export implemented. **Note: Styling for advanced filter sidebar and modal tabs needs review. Variant generator UI is functional but might need UX polish. Inventory alert logic is pending.**
*   [/] Order Management (List, View, Update Status, Fulfillment) - Backend APIs and frontend logic for list, view details, update status, add notes, send email, add shipping, generate packing slip, and cancel order implemented. **Note: Date range picker UI could be enhanced (currently dropdown). Fulfillment workflow logic beyond status update is basic. Communication history display is pending.**
*   [/] Customer Management (List, View, Edit, Notes) - Backend APIs and frontend logic for list, view details, edit, add notes, send email, and export implemented. **Note: Communication history and top customer identification are deferred.**
*   [/] Settings Pages (General, Shipping, Payments, Taxes, etc.) - Backend APIs and frontend logic for getting/updating by category, testing email/payment, backup, and restore implemented. **Note: Frontend complete pending full backend integration and styling review.**
*   [/] User Profile & Security (Password, 2FA) - Backend APIs and frontend logic for getting profile, updating personal info, changing password, enabling/disabling 2FA, and getting login history implemented. **Note: Frontend complete pending full backend integration and styling review.**
*   [ ] Role-Based Access Control (RBAC) Implementation
*   [x] 404 Page - Basic frontend component and routing are implemented. Backend error reporting endpoint implemented.
*   [x] API Integration - Core APIs implemented. **Note: Full WebSocket event broadcasting logic deferred.**

## IV. Global Marketplace Website Development

*   [ ] Core Layout & Navigation
*   [ ] Homepage Implementation
*   [ ] Category Page Implementation
*   [ ] Product Preview Page
*   [ ] About Page
*   [ ] Contact Page
*   [ ] 404 Page
*   [ ] Responsiveness & Mobile Optimization
*   [ ] API Integration (Read-only focus, Store referrals)

## V. Backend API Development

*   [x] Initial Setup (NestJS, TypeORM, Config, Modules) - Basic setup complete
*   [x] Define Basic Entities (User, Product, Category, Store, CarouselItem, **Address, Order, OrderItem, Wishlist, WishlistItem, Cart, CartItem, Review, FAQ, AboutContent, Testimonial, LoginHistory, Setting, NewsletterSubscription, PaymentMethod**) - Entities created and configured with TypeORM. Relationships established. `state` field removed from Address. `UserEntity` updated with `paymentMethods` relation.
*   [x] Authentication Endpoints (Storefront Customer, Store Manager) - `/auth/register`, `/auth/login`, `/account/profile` implemented. `/account/change-password` implemented.
*   [x] Storefront API Endpoints (Categories, Products, Cart, Orders, Account, Carousel, etc.) - Endpoints for Products, Categories, Cart, Carousel, Auth, Account (including full Payment Methods CRUD, Newsletter subscription/unsubscription), Checkout, Reviews, Contact, FAQ, Store (About, Testimonials), Navigation (Popular) implemented. Placeholder logic for `POST /api/cart/promo`, `POST /api/contact`, `GET /api/tax/estimate`, `GET /api/store/about`, `GET /api/store/testimonials` replaced with full implementations. `POST /api/orders` logic verified and completed (inventory, cart clearing). Services refactored to use TypeORM. Endpoints updated to filter by storeSlug where applicable. Backend status documented in `backend-api-status.md`. Plan created in `backend-api-plan.md`.
*   [x] Store Management API Endpoints (Dashboard, Products, Orders, Customers, Settings, Profile, etc.) - Backend APIs for Product Management (list, add, get, update, delete, bulk delete, bulk update status, import, export), Order Management (list, get, update status, add notes, send email, add shipping, generate packing slip, export, cancel), Customer Management (list, get, update, add notes, send email, export), Settings (get/update by category, test email/payment, backup, restore), Profile (get, update, password change, enable/disable 2FA, login history), and 404 error reporting implemented. **Note: Core APIs implemented. Deferred items include RBAC, advanced customer features, and full WebSocket logic.**
*   [ ] Marketplace API Endpoints (Aggregated Products, Categories, Stores, Search)
*   [x] Database Schema Design & Migrations - Initial entities defined, TypeORM configured, data source file created, migration scripts added/fixed. Migrations for Store, User, CarouselItem, Account Entities (Address, Order, Wishlist), Address state removal, Cart, Review, FAQ, Store Content, Order Notes, User Notes, Login History, Settings, NewsletterSubscription, PaymentMethod created and run successfully after troubleshooting. `data-source.ts` updated.
*   [x] Database Seeding (Initial) - Script created, expanded, fixed, and run for stores, categories, products, carousel items, users, addresses, orders, wishlists, cart, reviews, faq, store content. Deletion order fixed. Ran successfully. `state` removed from address data.
*   [ ] Data Synchronization Logic (Inventory, etc.)
*   [ ] Security Implementation (Validation, Rate Limiting, Permissions)
*   [ ] Testing (Unit, Integration)

## VI. Shared Library Development

*   [x] Define Core Data Models/Interfaces (Product, Order, User, Category, Address, etc.) - Interfaces updated (`state` removed from Address). New interfaces added for Cart, Review, FAQ, Store Content, Order Notes, Login History, and Settings.
*   [x] Setup Build/Packaging for Shared Library - Built successfully.
*   [x] Define DTOs (Data Transfer Objects) for API communication - DTOs created for User, Auth, Addresses, Orders, Wishlist, Cart, Checkout, Contact, Reviews, Payment Methods, Manager-specific DTOs for Products, Orders, Customers, Settings, and Error Reporting.
*   [ ] Implement Shared Utility Functions/Classes

## VII. Testing & Deployment

*   [ ] Unit Testing Strategy & Implementation
*   [ ] Integration Testing
*   [ ] End-to-End Testing Strategy
*   [/] Deployment Strategy & Setup (Per environment) - Production Docker setup (Compose, Dockerfiles, Nginx) configured and debugged. Cloudflare DNS/SSL steps outlined.
*   [ ] Performance Testing & Optimization

---

## Overall Progress Summary (Store Management Website Finalization)

**Key Accomplishments:**
*   Frontend UI for all core Store Management pages (Dashboard, Product Management, Order Management, Customer Management, Settings, Profile, 404) is implemented.
*   Core backend APIs supporting these pages are implemented and verified.
*   Project documentation ([`store-management-page-status.md`](memory-bank/store-management-page-status.md:1), [`backend-api-status.md`](memory-bank/backend-api-status.md:1), [`progress.md`](memory-bank/progress.md:1)) updated to reflect current status.

**Major Deferred Items:**
*   Role-Based Access Control (RBAC) implementation.
*   Full WebSocket event broadcasting logic for comprehensive real-time updates.
*   Complete styling pass and UX polish for the Store Management Website.
*   Specific pending TODOs from [`store-management-page-status.md`](memory-bank/store-management-page-status.md:1):
    *   Dashboard: Chart comparison logic.
    *   Product Management: Styling for advanced filter sidebar/modal tabs, variant generator UX polish, inventory alert logic.
    *   Order Management: Date range picker UI enhancement, advanced fulfillment workflow, communication history display.
    *   Customer Management: Communication history display, top customer identification logic.
    *   Settings & Profile: Full backend integration for all sub-sections and comprehensive styling review.

**Estimated Completion (Store Management Website Finalization Task):** ~75%

---

**Legend:**
*   `[ ]` - Not Started
*   `[/]` - In Progress
*   `[x]` - Completed

```

# projectbrief.md

```md
# Project Brief: Online Business Promotion System

## 1. Overview

This project aims to build a comprehensive Online Business Promotion System consisting of three interconnected web applications:

1.  **Storefront Website:** A customer-facing e-commerce site template for individual businesses to showcase and sell their products. Each business using the system will have its own instance of this storefront.
2.  **Store Management Website:** A secure, manager-facing portal for each business to manage their products, inventory, orders, customers, and store settings.
3.  **Global Marketplace Website:** An aggregator platform that displays products from all participating stores, providing broader visibility and cross-store discovery for customers.

## 2. Core Goals

*   Provide businesses with a customizable and functional online store presence.
*   Offer robust tools for store managers to efficiently run their online operations.
*   Create a central marketplace to increase product discoverability and drive traffic to individual stores.
*   Ensure a seamless and integrated experience across all three platforms.
*   Build a scalable and maintainable system using the specified technology stack.

## 3. Scope

The scope includes the design, development, and integration of the three websites as detailed in the "PAGE FUNCTIONALITY PLAN" document. This involves:

*   Frontend development for all user interfaces.
*   Backend development for APIs, data management, and business logic.
*   Database design and implementation.
*   Integration points between the three systems.
*   Authentication and authorization mechanisms.
*   Basic performance optimization and responsiveness.

*(This brief is based on the initial "PAGE FUNCTIONALITY PLAN" document provided on 3/28/2025.)*

```

# store-management-design.md

```md
# Store Management Website Design Plan

## 1. Design Principles (Modern & Minimalist)

*   **Clean Layout:** Ample whitespace, clear separation of sections, and a focus on essential information.
*   **Intuitive Navigation:** Consistent and easily accessible navigation elements.
*   **Professional Typography:** Use of modern, readable fonts for headings and body text.
*   **Subtle Color Palette:** A primary accent color for key actions and branding, with a neutral palette for backgrounds and text. Use shades of grey, white, and a single accent color (e.g., a professional blue or green).
*   **Consistent UI Components:** Standardized buttons, forms, tables, cards, and modals across all pages.
*   **Responsiveness:** Design must adapt seamlessly to various screen sizes (desktop, tablet, mobile).
*   **Data Visualization:** Clear and concise presentation of data, especially on the Dashboard.
*   **Action-Oriented:** Prominent placement of key actions (e.g., "Add Product", "Save Changes").

## 2. Color Palette

*   **Primary Accent:** #28A745 (Green, as used for Login button in plan) - For primary actions, buttons, highlights.
*   **Secondary Accent:** #007BFF (Blue, as used for Storefront price) - Could be used for links or secondary actions, or a different shade of green for consistency. Let's stick to shades of green/grey for a unified management feel.
*   **Neutral Palette:**
    *   Background: #F8F9FA (Light Grey) or #FFFFFF (White)
    *   Text: #343A40 (Dark Grey)
    *   Borders/Dividers: #DEE2E6 (Light Grey)
    *   Hover/Active States: Subtle variations of background or accent color.
*   **Status Colors:**
    *   Success: #28A745 (Green)
    *   Warning: #FFC107 (Yellow)
    *   Danger: #DC3545 (Red)
    *   Info: #17A2B8 (Cyan)

## 3. Typography

*   **Font Family:** A clean, modern sans-serif font (e.g., 'Roboto', 'Open Sans', 'Lato').
*   **Headings:** Clear hierarchy using different font sizes and weights (H1 for page titles, H2 for section titles, etc.).
*   **Body Text:** Readable size and line spacing.

## 4. Layout Structure (General)

*   **Header:** Consistent header across all pages (except Login/404) with logo, navigation, manager info, notifications, and logout.
*   **Sidebar (Optional):** Used on pages with extensive filtering (Product Management, Customer Management) or multi-section content (Settings, Profile).
*   **Main Content Area:** Primary area for page-specific content, forms, tables, charts.
*   **Action Bars:** Consistent placement for page-level actions (Add, Search, Filter, Bulk Actions).

## 5. Page-Specific Design Outlines

### 5.1. Login Page

*   **Layout:** Centered form on a clean background.
*   **Elements:**
    *   Store management portal logo (prominent).
    *   Welcome message (simple, professional).
    *   Login form: Email input, Password input (with toggle), "Remember this device" checkbox, "Login" button (Primary Accent Green, full width).
    *   "Forgot Password" link.
    *   System requirements/Support info (subtle text below form).
*   **Styling:** Clean card-like container for the form, ample padding, subtle shadows.

### 5.2. Dashboard

*   **Layout:** Grid-based layout for performance snapshot cards, sales chart, recent orders, and alerts.
*   **Elements:**
    *   Header (as per general layout).
    *   Performance Snapshot Cards: Clean cards with key metrics (Total Sales, Orders Today, Low Stock Items). Use bold text for values, smaller text for trend indicators and labels. Use status colors for Low Stock alerts.
    *   Sales Chart: Prominent area for the line graph. Clear labels, interactive toggles for time periods.
    *   Recent Orders Table: Clean table with sortable columns, color-coded status indicators (using status colors). Action buttons (View/Update) as icons or small buttons. Pagination below the table.
    *   Inventory Alerts: Simple list or card-like display for alerts. Use warning/danger colors.
    *   Quick Action Buttons: Prominent buttons (Primary Accent Green) for key tasks.
    *   Store Health Score: A visual indicator (e.g., progress bar or score card) with recommendations.
*   **Styling:** Use cards for sections, consistent spacing, clear headings.

### 5.3. Product Management Page

*   **Layout:** Action bar at the top, main product table below. Optional filter sidebar.
*   **Elements:**
    *   Header.
    *   Action Bar: "Add Product" button (Primary Accent Green), Bulk actions dropdown, Search bar, Filter dropdowns/buttons.
    *   Product Table: Clean table with columns as specified. Product image thumbnails (small, consistent size). Stock level color-coded. Action icons (Edit, Duplicate, Delete). Selection checkboxes. Pagination and count summary below.
    *   Advanced Filter Sidebar (if toggled): Collapsible sidebar with detailed filter options (checkboxes, sliders).
    *   Add/Edit Product Modal: Multi-tabbed modal with forms for product details. Image uploader with drag-and-drop area and previews. Variant generator interface. Save/Cancel buttons (Primary Accent Green for Save).
*   **Styling:** Clean table design with hover effects. Modal with clear sections and form validation feedback.

### 5.4. Order Management Page

*   **Layout:** Action bar with status tabs, main orders table below.
*   **Elements:**
    *   Header.
    *   Action Bar: Order status filter tabs (visually distinct for active tab), Date range picker, Search bar, Export button.
    *   Orders Table: Clean table with columns as specified. Payment and Fulfillment status with color indicators. Action icons (View, Update, Cancel). Pagination and count summary below.
    *   Order Details Modal: Modal with sections for order summary, customer info, items list, payment, shipping, notes. Status update controls (dropdown/buttons). Fulfillment actions (buttons/icons). Customer communication tools.
*   **Styling:** Tabs with clear visual states. Table with status color coding. Modal with well-organized sections.

### 5.5. Customer Management Page

*   **Layout:** Action bar, main customers table below.
*   **Elements:**
    *   Header.
    *   Action Bar: Search bar, Filter options (dropdowns/buttons), Export button, Customer segmentation options.
    *   Customers Table: Clean table with columns as specified. Account status indicator. Action icons (View, Edit, Contact). Pagination and count summary below.
    *   Customer Details Modal: Modal with sections for personal info, address book, order history (expandable), communication history, notes. Account status controls. Direct contact options (email icon).
*   **Styling:** Similar table and modal styling to other management pages for consistency.

### 5.6. Settings Page

*   **Layout:** Left sidebar for setting categories, main content area for setting forms.
*   **Elements:**
    *   Header.
    *   Left Sidebar: Navigation list for setting categories. Highlight active category.
    *   Main Content Area: Forms for the selected setting category. Use clear labels, input fields, dropdowns, checkboxes, toggles. "Save Changes" button (Primary Accent Green) and "Reset to Defaults" button below each form section.
*   **Styling:** Sidebar with clear navigation. Forms with consistent input styling and validation feedback.

### 5.7. Profile Page

*   **Layout:** Sections for profile information, password change, 2FA, notifications, login history.
*   **Elements:**
    *   Header.
    *   Profile Information: Display fields with edit options. Profile picture upload area.
    *   Password Change: Form with current, new, confirm password fields. Password strength meter (visual indicator).
    *   Two-Factor Authentication: Toggle switch, setup instructions, backup codes button.
    *   Notification Preferences: Checkboxes for email/SMS/in-app notifications.
    *   Login History Table: Simple table displaying login details.
    *   "Save Changes" button (Primary Accent Green) at the bottom.
*   **Styling:** Use cards or distinct sections for each area. Clear form fields and validation.

### 5.8. 404 Page

*   **Layout:** Centered content.
*   **Elements:**
    *   "404 - Page Not Found" header (large, distinct).
    *   Friendly error message.
    *   "Back to Dashboard" button (Primary Accent Green).
    *   Quick links to common management pages.
    *   Support contact information.
*   **Styling:** Simple, clear, and on-brand.

## 6. UI Component Styling (General)

*   **Buttons:** Consistent padding, border-radius, hover/active states. Primary (Green), Secondary (Outlined/Grey), Danger (Red).
*   **Forms:** Standardized input field height, borders, focus states. Clear labels. Validation feedback (e.g., red borders, error messages below fields).
*   **Tables:** Clean borders, alternating row colors for readability, hover effects.
*   **Cards:** Subtle borders or shadows, consistent padding.
*   **Modals:** Overlay background, centered modal window, close button, clear header and footer (with action buttons).
*   **Icons:** Use a consistent icon library (e.g., Font Awesome, Material Icons) for actions and indicators.

## 7. Responsiveness Considerations

*   **Mobile Navigation:** Implement a collapsible sidebar or a bottom navigation bar for smaller screens.
*   **Tables:** Use responsive table patterns (e.g., stacking rows, horizontal scrolling, displaying key info and hiding less critical columns).
*   **Forms:** Stack form fields vertically on small screens.
*   **Dashboard:** Adjust grid layout for cards and charts to stack vertically on smaller screens.

## 8. Implementation Notes

*   Use SCSS variables for colors, typography, and spacing to ensure consistency.
*   Create reusable Angular components for common UI elements (buttons, inputs, tables, modals, cards).
*   Implement form validation using Angular Reactive Forms.
*   Utilize Angular Material or a similar component library as a base, customizing it to match the "Modern & Minimalist" theme and color palette. (Decision: Use Angular Material or similar, but heavily customize to fit the specific theme, rather than using default Material design).
```

# store-management-page-status.md

```md
# Store Management Page Implementation Status

This document tracks the implementation status of each page defined in the "ONLINE BUSINESS PROMOTION SYSTEM - PAGE FUNCTIONALITY PLAN" for the Store Management Website.

Status Legend:
*   `[x]` - Fully Implemented
*   `[/]` - Partially Implemented
*   `[ ]` - Not Implemented

---

## II. STORE MANAGEMENT WEBSITE

### 1. Login Page

*   **Functionality:** Authenticate store managers with secure access controls
*   **Status:**
    *   `[x]` Routing & Component:
        *   `[x]` Route defined.
        *   `[x]` Component created.
    *   `[x]` UI Elements:
        *   `[/]` Store management portal logo. (Placeholder image added)
        *   `[x]` Welcome message.
        *   `[x]` Login form (Email, Password, Remember device, Login button). (Basic structure with classes, password toggle, and form binding added)
        *   `[x]` "Forgot Password" link.
        *   `[x]` System requirements notice.
        *   `[x]` Support contact information.
    *   `[x]` User Actions:
        *   `[x]` Enter credentials.
        *   `[/]` Request password reset. (Modal implemented with email input and basic validation)
        *   `[x]` Contact support. (Information is displayed)
        *   `[x]` Toggle password visibility.
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `POST /api/manager/login`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/forgot-password`.
        *   `[ ]` Security Features: Brute force protection, IP logging, 2FA option. (Pending/Deferred)

---

### 2. Dashboard

*   **Functionality:** Provide comprehensive overview of store performance with actionable insights
*   **Status:** `[/]` Partially Implemented
    *   **Notes:** Chart comparison logic is a TODO.
    *   `[x]` Routing & Component:
        *   `[x]` Route defined.
        *   `[x]` Component created.
    *   `[/]` UI Elements:
        *   `[/]` Header (Logo, Navigation, Manager info, Notifications, Logout). (Basic structure with navigation links and data binding for store name, manager name, notification count added)
        *   `[/]` Performance snapshot cards (Total Sales, Orders Today, Low Stock Items). (Basic structure with data binding and dynamic trend/alert indicators added)
        *   `[/]` Sales chart. (Integrated ng2-charts component with data binding and options)
        *   `[/]` Recent Orders table. (Basic table structure with data binding, pagination, count summary, sorting indicators, and color-coded status placeholders added. **Pagination controls and count summary bound to component properties.**)
        *   `[/]` Inventory alerts. (Basic list structure with data binding added)
        *   `[/]` Quick action buttons. (Basic structure with router links added)
        *   `[/]` Store health score. (Data binding added)
    *   `[/]` User Actions:
        *   `[/]` View performance metrics. (Data displayed with dynamic trends/alerts)
        *   `[/]` Monitor sales trends. (Chart component integrated)
        *   `[ ]` Switch time periods.
        *   `[/]` Access recent orders. (View button added, logic placeholder. **Pagination and sorting implemented in frontend component.**)
        *   `[/]` Take quick actions. (Buttons added, logic placeholder)
        *   `[/]` Receive alerts. (Data displayed)
        *   `[/]` Navigate to other sections. (Navigation links added)
        *   `[ ]` View/clear notifications.
    *   `[/]` Technical Details:
        *   `[/]` API Integration: `GET /api/manager/dashboard`. (Backend module, controller, and service created. Placeholder endpoint implemented.)
        *   `[x]` API Integration: `GET /api/manager/sales/chart`.(Implemented with aggregation logic for daily, monthly, all)
        *   `[x]` API Integration: `GET /api/manager/orders/recent`. (Service method updated to accept pagination/sorting params. Backend service created.)
        *   `[x]` API Integration: `GET /api/manager/inventory/alerts`.(Implemented)
        *   `[x]` Component Interaction: Real-time updates, Chart interactions, WebSocket notifications. (Chart component integrated. **Pagination and sorting logic implemented in component. Backend service created.** WebSocket gateway and Nginx config implemented)

---

### 3. Product Management Page

*   **Functionality:** Comprehensive tool for managing product catalog and inventory
*   **Status:** `[/]` Partially Implemented
    *   **Notes:** Styling for advanced filter sidebar and modal tabs needs review. Variant generator UI is functional but might need UX polish. Inventory alert logic is pending.
    *   `[x]` Routing & Component:
        *   `[x]` Route defined.
        *   `[x]` Component created.
    *   `[x]` UI Elements:
        *   `[x]` Action bar (Add Product, Bulk actions, Search, Filters). (Basic structure added, styling refined)
        *   `[x]` Product table (Columns: Checkbox, Image, Name, SKU, Category, Price, Stock, Status, Actions). (Basic table structure with placeholder row added, styling refined, sorting indicators added)
        *   `[x]` Pagination controls. (Placeholders updated to use component properties, styling refined)
        *   `[x]` Product count summary. (Placeholder updated to use component properties, styling refined)
        *   `[/]` Advanced filter sidebar. (Styling Pending)
        *   `[x]` Add/Edit Product modal (Tabs: Basic Info, Pricing, Inventory, Images, Variants, SEO). (Basic structure added, styling refined)
    *   `[x]` User Actions:
        *   `[x]` View products. (Frontend logic for fetching and displaying products with pagination, sorting, and filtering implemented)
        *   `[x]` Search and filter products. (Frontend logic implemented with debouncing)
        *   `[x]` Add new products. (Frontend logic to open modal and call service implemented)
        *   `[x]` Edit existing products. (Frontend logic to open modal with data and call service implemented)
        *   `[ ]` Duplicate products.
        *   `[x]` Delete products. (Frontend logic implemented)
        *   `[/]` Manage product variants. (UX Polish Needed)
        *   `[ ]` Upload images.
        *   `[ ]` Set inventory levels. (Inventory Alert Logic Pending)
        *   `[x]` Perform bulk actions. (Bulk delete and bulk update status implemented)
        *   `[x]` Export product data. (Frontend logic implemented)
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `GET /api/manager/products`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/products`. (Implemented and integrated)
        *   `[x]` API Integration: `GET /api/manager/products/{id}`. (Implemented and integrated)
        *   `[x]` API Integration: `PATCH /api/manager/products/{id}`. (Implemented and integrated)
        *   `[x]` API Integration: `DELETE /api/manager/products/{id}`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/products/bulk-delete`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/products/bulk-update-status`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/products/import`. (Implemented and integrated)
        *   `[x]` API Integration: `GET /api/manager/products/export`. (Implemented and integrated)
        *   `[x]` Component Interaction: Form validation, Image uploader, Variant generator. (Basic pagination, sorting, and filtering logic implemented in component. Modal open/close logic implemented. Bulk actions and import/export logic implemented)

---

### 4. Order Management Page

*   **Functionality:** Track, update, and process customer orders efficiently
*   **Status:** `[/]` Partially Implemented
    *   **Notes:** Date range picker UI could be enhanced (currently dropdown). Fulfillment workflow logic beyond status update is basic. Communication history display is pending.
    *   `[x]` Routing & Component:
        *   `[x]` Route defined.
        *   `[x]` Component created.
    *   `[x]` UI Elements:
        *   `[/]` Action bar (Status filter tabs, Date range picker, Search, Export). (Basic structure added, styling needed)
        *   `[x]` Orders table (Columns: Order ID, Date/Time, Customer, Items count, Total, Payment status, Fulfillment status, Actions). (Basic table structure added, styling needed)
        *   `[x]` Pagination controls. (Basic structure added, styling needed)
        *   `[x]` Orders count summary. (Basic structure added, styling needed)
        *   `[x]` Order details modal (Summary, Customer info, Items, Payment, Shipping, Notes, Status controls, Fulfillment actions, Communication tools). (Basic structure added, content and logic implemented for viewing details, updating status, adding notes, sending emails, adding shipping, generating packing slip, canceling order)
    *   `[x]` User Actions:
        *   `[x]` View all orders. (Frontend logic for fetching and displaying orders with pagination, sorting, and filtering implemented)
        *   `[x]` Search for orders. (Frontend logic implemented with debouncing)
        *   `[x]` Update order status. (Implemented in modal)
        *   `[x]` View order details. (Frontend logic to open modal with data implemented)
        *   `[/]` Process orders. (Basic Fulfillment Logic)
        *   `[x]` Add tracking information. (Implemented in modal)
        *   `[x]` Communicate with customers. (Send email and add notes implemented in modal)
        *   `[ ]` Display communication history. (Pending)
        *   `[x]` Generate packing slips/labels. (Generate packing slip implemented in modal)
        *   `[x]` Export order data. (Frontend logic implemented)
        *   `[x]` Cancel orders. (Implemented in modal)
        *   `[x]` Add internal notes. (Implemented in modal)
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `GET /api/manager/orders`. (Implemented and integrated)
        *   `[x]` API Integration: `GET /api/manager/orders/{id}`. (Implemented and integrated)
        *   `[x]` API Integration: `PATCH /api/manager/orders/{id}/status`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/orders/{id}/notes`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/orders/{id}/email`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/orders/{id}/shipping`. (Implemented and integrated)
        *   `[x]` API Integration: `GET /api/manager/orders/{id}/packing-slip`. (Implemented and integrated)
        *   `[x]` API Integration: `GET /api/manager/orders/export`. (Implemented and integrated)
        *   `[x]` API Integration: `PATCH /api/manager/orders/{id}/cancel`. (Implemented and integrated)
        *   `[x]` Component Interaction: Status updates, Email templates, Print functionality. (Basic pagination, sorting, and filtering logic implemented in component. Modal open/close logic implemented. All modal functionalities implemented)

---

### 5. Customer Management Page

*   **Functionality:** View and manage customer information for personalized service
*   **Status:** `[/]` Partially Implemented
    *   **Notes:** Communication history and top customer identification are deferred.
    *   `[x]` Routing & Component:
        *   `[x]` Route defined.
        *   `[x]` Component created.
    *   `[x]` UI Elements:
        *   `[x]` Action bar (Search, Filter options, Export, Segmentation). (Basic structure added, styling needed)
        *   `[x]` Customers table (Columns: Name, Email, Phone, Location, Orders count, Total spent, Last order date, Account status, Actions). (Basic table structure added, styling needed)
        *   `[x]` Pagination controls. (Basic structure added, styling needed)
        *   `[x]` Customers count summary. (Basic structure added, styling needed)
        *   `[x]` Customer details modal (Personal info, Address book, Order history, Communication history, Notes, Status controls, Contact options). (Basic structure added, content and logic implemented for viewing details, editing info, adding notes, sending emails)
        *   `[ ]` View communication history. (Deferred)
        *   `[ ]` Identify top customers. (Deferred)
    *   `[x]` User Actions:
        *   `[x]` View customer list. (Frontend logic for fetching and displaying customers with pagination and filtering implemented)
        *   `[x]` Search and filter customers. (Frontend logic implemented with debouncing)
        *   `[x]` View customer profile. (Frontend logic to open modal with data implemented)
        *   `[x]` See order history. (Displayed in modal)
        *   `[x]` Add notes. (Implemented in modal)
        *   `[x]` Contact customers. (Send email implemented in modal)
        *   `[x]` Export customer data. (Frontend logic implemented)
        *   `[x]` Update customer information. (Implemented in modal)
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `GET /api/manager/customers`. (Implemented and integrated)
        *   `[x]` API Integration: `GET /api/manager/customers/{id}`. (Implemented and integrated)
        *   `[x]` API Integration: `PATCH /api/manager/customers/{id}`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/customers/{id}/notes`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/customers/{id}/email`. (Implemented and integrated)
        *   `[x]` API Integration: `GET /api/manager/customers/export`. (Implemented and integrated)
        *   `[x]` Component Interaction: Order history, Timeline view, Address verification. (Basic pagination and filtering logic implemented in component. Modal open/close logic implemented. All modal functionalities implemented except communication history/timeline view)

---

### 6. Settings Page

*   **Functionality:** Configure all aspects of store operation and appearance
*   **Status:** `[/]` Partially Implemented
    *   **Notes:** Frontend complete pending full backend integration and styling review.
    *   `[x]` Routing & Component:
        *   `[x]` Route defined.
        *   `[x]` Component created.
    *   `[/]` UI Elements: (Backend/Styling Pending for items below)
        *   `[/]` Left sidebar (Setting categories).
        *   `[/]` Main content area (Settings forms).
        *   `[/]` "Save Changes" button.
        *   `[/]` "Reset to Defaults" button.
    *   `[/]` User Actions: (Backend/Styling Pending for items below unless otherwise noted)
        *   `[/]` Configure store settings.
        *   `[/]` Set up shipping.
        *   `[/]` Configure payments.
        *   `[/]` Manage tax rules.
        *   `[/]` Customize notifications.
        *   `[/]` Add/manage staff users.
        *   `[/]` Adjust appearance.
        *   `[/]` Connect third-party services.
        *   `[x]` Save changes. (Implemented for current category)
        *   `[/]` Reset to defaults.
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `GET /api/manager/settings/{category}`. (Implemented and integrated)
        *   `[x]` API Integration: `PATCH /api/manager/settings/{category}`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/settings/test-email`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/settings/test-payment`. (Implemented and integrated)
        *   `[x]` API Integration: `GET /api/manager/settings/backup`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/settings/restore`. (Implemented and integrated)
        *   `[x]` Component Interaction: Form validation, Confirmation dialogs, Testing tools. (Basic display and update logic implemented. Test email/payment, backup/restore implemented)

---

### 7. Profile Page

*   **Functionality:** Manage personal account settings and security
*   **Status:** `[/]` Partially Implemented
    *   **Notes:** Frontend complete pending full backend integration and styling review.
    *   `[x]` Routing & Component:
        *   `[x]` Route defined.
        *   `[x]` Component created.
    *   `[/]` UI Elements: (Backend/Styling Pending for items below)
        *   `[/]` Profile information section (Picture, Name, Email, Phone, Role).
        *   `[/]` Password change section.
        *   `[/]` Two-factor authentication section.
        *   `[/]` Notification preferences.
        *   `[/]` Login history table.
        *   `[/]` "Save Changes" button.
    *   `[/]` User Actions: (Backend/Styling Pending for items below unless otherwise noted)
        *   `[x]` Update personal information. (Implemented)
        *   `[x]` Change password. (Implemented)
        *   `[x]` Enable/disable 2FA. (Enable and Disable implemented)
        *   `[/]` Manage notification preferences.
        *   `[/]` View login history. (UI for viewing history)
        *   `[/]` Upload profile picture.
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `GET /api/manager/profile`. (Implemented and integrated)
        *   `[x]` API Integration: `PATCH /api/manager/profile`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/profile/password`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/profile/2fa/enable`. (Implemented and integrated)
        *   `[x]` API Integration: `POST /api/manager/profile/2fa/disable`. (Implemented and integrated)
        *   `[ ]` API Integration: `GET /api/manager/profile/2fa/backup-codes`.
        *   `[x]` API Integration: `GET /api/manager/profile/login-history`. (Implemented)
        *   `[x]` Security Features: Password strength, Current password verification, Login notification. (Basic implementation for password change and 2FA)

---

### 8. 404 Page

*   **Functionality:** Handle page not found errors in the management interface
*   **Status:** `[x]` Implemented
    *   `[x]` Routing & Component:
        *   `[x]` Route defined.
        *   `[x]` Component created.
    *   `[x]` UI Elements:
        *   `[x]` "404 - Page Not Found" header.
        *   `[x]` Error message.
        *   `[x]` "Back to Dashboard" button. (Router link added)
        *   `[x]` Quick links to common pages. (Router links added)
        *   `[x]` Support contact information.
    *   `[x]` User Actions:
        *   `[x]` Return to dashboard. (Button added, logic placeholder)
        *   `[x]` Navigate to common pages. (Links added, logic placeholder)
        *   `[ ]` Contact support.
        *   `[ ]` Report broken link.
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `POST /api/manager/error-report`. (Implemented)
        *   `[ ]` Error Handling: Logs 404s, Tracks referring page.
```

# storefront-page-status.md

```md
# Storefront Page Implementation Status

This document tracks the implementation status of each page defined in the "ONLINE BUSINESS PROMOTION SYSTEM - PAGE FUNCTIONALITY PLAN".

Status Legend:
*   `[x]` - Fully Implemented
*   `[/]` - Partially Implemented
*   `[ ]` - Not Implemented

---

## I. STOREFRONT WEBSITE

### 12. 404 Page

*   **Functionality:** Handle page not found errors with helpful navigation
*   **Status:**
    *   `[x]` Routing: Wildcard route (`**`) and explicit `/404` route exist in `app.routes.ts`, pointing to `NotFoundPageComponent`.
    *   `[x]` Component (`NotFoundPageComponent`): Exists. Fetches suggested links, implements store search, product search suggestions, and 404 logging.
    *   `[x]` UI Elements:
        *   `[x]` "404 - Page Not Found" header implemented.
        *   `[x]` Friendly error message implemented.
        *   `[x]` Search bar: Implemented with product suggestions (if store context) and store search. Product search form navigates away.
        *   `[x]` "Back to Home" button implemented (links conditionally to store or site home).
        *   `[x]` Suggested popular pages/categories: Implemented dynamically based on API call (`getPopularNavigation`), shown only in store context.
        *   `[ ]` Humorous image/animation (Optional, placeholder commented out).
    *   `[x]` User Actions:
        *   `[x]` Search functionality: Product suggestions on page, store search reactive, product search form navigates.
        *   `[x]` Return to homepage button action implemented conditionally.
        *   `[x]` Navigate to suggested pages implemented dynamically.
        *   `[ ]` Report broken link (Not implemented).
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `GET /api/products/suggest` used for on-page product suggestions.
        *   `[x]` API Integration: `GET /api/navigation/popular` implemented via `apiService.getPopularNavigation()`.
        *   `[x]` API Integration: `apiService.searchStores()` implemented for reactive store search.
        *   `[x]` Component Interaction: Logging 404s (`console.warn` with path) implemented.

---

### 11. About Page

*   **Functionality:** Share store information, story, and mission
*   **Status:**
    *   `[x]` Routing & Component: Route exists (`/:storeSlug/about`), `AboutPageComponent` implemented to fetch and display store content and testimonials.
    *   `[x]` UI Elements:
        *   `[x]` Hero section (Assumed part of fetched content display)
        *   `[x]` Company story section (Displayed from `aboutContent.body`)
        *   `[x]` Mission statement (Assumed part of `aboutContent.body`)
        *   `[ ]` Team section (Not explicitly implemented, depends on fetched content)
        *   `[ ]` Timeline (Not explicitly implemented, depends on fetched content)
        *   `[x]` Testimonials (Fetched and displayed)
        *   `[ ]` Values/Commitments (Assumed part of `aboutContent.body`)
        *   `[ ]` Certifications/Awards (Not explicitly implemented, depends on fetched content)
        *   `[ ]` "Contact Us" CTA button (Can be added if required by plan)
    *   `[x]` User Actions:
        *   `[x]` Read content
        *   `[x]` View images (If `imageUrl` provided in `aboutContent`)
        *   `[ ]` Navigate to contact (Can be added if required by plan)
        *   `[ ]` Share functionality (Not implemented)
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `GET /api/store/about`, `GET /api/store/testimonials` implemented via `ApiService`.
        *   `[x]` Component Interaction: Fetches and displays dynamic content.

---

### 10. Contact Page

*   **Functionality:** Allow customers to contact the store with inquiries
*   **Status:**
    *   `[x]` Routing & Component: Route exists (`/:storeSlug/contact`), `ContactPageComponent` implemented with form, FAQ display, and API integration.
    *   `[x]` UI Elements:
        *   `[x]` Contact form (Name, Email, Subject, Message, Submit) implemented with validation.
        *   `[x]` Store contact information (Email, Phone, Address) displayed (currently hardcoded, can be dynamic).
        *   `[x]` FAQ section implemented, fetches and displays FAQs.
        *   `[ ]` Map (Optional, not implemented).
    *   `[x]` User Actions:
        *   `[x]` Submit form (sends data to backend).
        *   `[ ]` Attach files (Not implemented).
        *   `[x]` View FAQ.
        *   `[ ]` Call store (Depends on how contact info is displayed).
        *   `[ ]` Get map directions (Not implemented).
        *   `[ ]` Follow social media (Not implemented).
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `POST /api/contact`, `GET /api/faq` implemented via `ApiService`.
        *   `[x]` Component Interaction: Form validation, success/error message display for submission.

---

9. Account Page

*   **Functionality:** Central hub for customer to manage their information and orders
*   **Status (Main Structure):**
  *   `[x]` Routing: Parent route (`/:storeSlug/account`) and child routes (overview, orders, etc.) are defined.
  *   `[x]` Component (`AccountPageComponent`): Exists and provides the main layout.
  *   `[x]` UI Elements: Sidebar navigation with `routerLink` and `routerLinkActive` is implemented. Main content area uses `<router-outlet>`.
  *   `[x]` User Actions: Logout button calls `AuthService.logout()`. Navigation between sections via sidebar links works.
  *   `[x]` Technical Details: `AuthGuard` protects the route. `AuthService` is injected.
*   **Status (Child Sections):**
  *   **Overview:**
      *   `[x]` Component (`AccountOverviewComponent`): Implemented. Calls `GET /api/account/overview` via `ApiService`.
      *   `[x]` UI Elements: Welcome message, recent orders, default address, profile completeness displayed.
      *   `[x]` API Integration: `GET /api/account/overview` implemented and called.
  *   **Orders:**
      *   `[x]` Component (`AccountOrdersComponent`): Implemented with logic to fetch paginated orders via `ApiService`.
      *   `[x]` UI Elements: Table of orders (Order #, Date, Status, Total, View Details button linking to detail page) implemented. Pagination controls implemented.
      *   `[x]` API Integration: `GET /api/account/orders` implemented via `ApiService`.
      *   `[x]` Detail View: `AccountOrderDetailComponent` created and route `orders/:orderId` added. Fetches and displays order details using `GET /api/account/orders/:id`.
  *   **Addresses:**
      *   `[x]` Component (`AccountAddressesComponent`): Implemented with logic to fetch, add, update, delete, and set default addresses via `ApiService`. Includes Reactive Form for add/edit. `state` field removed.
      *   `[x]` UI Elements: Address list display, add/edit form, action buttons (Edit, Delete, Set Default) implemented. `state` field removed. Country defaulted to 'Israel' and disabled.
      *   `[x]` API Integration: `GET/POST/PATCH/DELETE /api/account/addresses`, `PUT /api/account/addresses/:id/default/:type` implemented via `ApiService`.
  *   **Payment Methods:**
      *   `[x]` Component (`AccountPaymentMethodsComponent`): Implemented logic to fetch, add, edit, and delete payment methods via `ApiService`. Uses `NotificationService`.
      *   `[x]` UI Elements: List view, add/edit form (simplified, assumes tokenization), delete button implemented.
      *   `[x]` API Integration: `GET/POST/PATCH/DELETE /api/account/payment-methods` implemented via `ApiService`. Backend endpoints implemented.
  *   **Personal Information:**
      *   `[x]` Component (`AccountPersonalInfoComponent`): Implemented with Reactive Form and logic to fetch profile (`GET /api/account/profile`) and update info (`PATCH /api/account/personal-info`) via `ApiService`. Includes updating `AuthService` state.
      *   `[x]` UI Elements: Form implemented for First Name, Last Name, Phone (Email display only).
      *   `[x]` API Integration: `GET /api/account/profile` and `PATCH /api/account/personal-info` implemented and integrated.
  *   **Wishlist:**
      *   `[x]` Component (`AccountWishlistComponent`): Implemented logic to fetch wishlist, remove items, and add items to cart via `ApiService` and `CartService`.
        *   `[x]` UI Elements: Grid display implemented for wishlist items (Image, Name, Price, Added Date, Add to Cart button, Remove button).
        *   `[x]` API Integration: `GET /api/account/wishlist`, `POST /api/account/wishlist/items`, `DELETE /api/account/wishlist/items/:itemId` implemented via `ApiService`.
    *   **Password Change:**
        *   `[x]` Component (`AccountChangePasswordComponent`): Implemented with Reactive Form and logic to change password via `ApiService`. Includes password match validation.
        *   `[x]` UI Elements: Form implemented for Current Password, New Password, Confirm New Password.
        *   `[x]` API Integration: `POST /api/account/change-password` implemented via `ApiService` and backend `AccountController`/`AuthService`.

---

### 8. Registration Page

*   **Functionality:** Create new customer accounts with validation
*   **Status:**
    *   `[/]` Routing & Component: Route exists (`/:storeSlug/register`), `RegistrationPageComponent` exists with Reactive Form setup and submission logic.
    *   `[/]` UI Elements:
        *   `[x]` Registration form (Name, Email, Password, Confirm Password, Phone, Newsletter opt-in, Terms checkbox) implemented with Reactive Forms and validation messages.
        *   `[ ]` Password strength meter (HTML placeholder exists, logic/UI missing).
        *   `[ ]` Social registration options (Missing).
        *   `[x]` "Already have an account?" link implemented with `routerLink`.
        *   `[x]` Password requirements list (Static list displayed).
    *   `[/]` User Actions:
        *   `[x]` Enter personal information and create password (Form submission implemented).
        *   `[ ]` See password strength indicator (Logic/UI missing).
        *   `[x]` Opt in to newsletters (Checkbox implemented).
        *   `[x]` Agree to terms and conditions (Checkbox implemented, link exists, but no modal).
        *   `[ ]` Register via social accounts (Missing).
        *   `[x]` Navigate to login page (Link implemented).
    *   `[/]` Technical Details:
        *   `[x]` API Integration: `POST /api/auth/register` implemented via `ApiService.register()` with success/error handling (incl. 409 for email exists).
        *   `[ ]` API Integration: `GET /api/auth/social/{provider}` not implemented.
        *   `[x]` Component Interaction: Real-time validation (required, format, length, password match) via Reactive Forms. Email uniqueness check via API error.
        *   `[ ]` Component Interaction: Password strength evaluation logic/UI missing.
        *   `[ ]` Component Interaction: Terms and conditions modal missing.

---

### 7. Login Page

*   **Functionality:** Authenticate existing customers and provide account recovery options
*   **Status:**
    *   `[/]` Routing & Component: Route exists (`/:storeSlug/login`), `LoginPageComponent` exists and contains core login logic.
    *   `[/]` UI Elements:
        *   `[x]` Login form (Email, Password) implemented with Reactive Forms.
        *   `[x]` Password show/hide toggle implemented.
        *   `[x]` "Remember me" checkbox implemented.
        *   `[x]` "Login" button implemented with disabled state.
        *   `[/]` "Forgot Password" link implemented, but route/logic likely missing.
        *   `[ ]` Social login options (Missing).
        *   `[x]` "New customer?" link implemented with `routerLink`.
    *   `[/]` User Actions:
        *   `[x]` Enter credentials.
        *   `[x]` Show/hide password text.
        *   `[x]` Choose to remain logged in ("Remember me" checkbox exists, backend logic TBD).
        *   `[ ]` Request password reset ("Forgot Password" link exists, logic missing).
        *   `[ ]` Log in with social accounts (Missing).
        *   `[x]` Navigate to registration page (Link implemented).
    *   `[/]` Technical Details:
        *   `[x]` API Integration: `POST /api/auth/login` implemented via `AuthService.login()`.
        *   `[ ]` API Integration: `POST /api/auth/forgot-password` not implemented.
        *   `[ ]` API Integration: `GET /api/auth/social/{provider}` not implemented.
        *   `[x]` Component Interaction: Form validation implemented.

---

### 6. Order Confirmation Page

*   **Functionality:** Confirm successful order placement and provide order details
*   **Status:**
    *   `[x]` Routing: Route `/:storeSlug/order-confirmation/:id` exists in `app.routes.ts`.
    *   `[x]` Component (`OrderConfirmationPageComponent`): Exists. Fetches order details and recommended products.
    *   `[x]` UI Elements: Success message, order details (reference, date, items, totals, shipping), "Continue Shopping", "My Account" buttons, and recommended products section implemented.
    *   `[x]` User Actions: Navigation buttons implemented.
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `GET /api/orders/{id}` (via `apiService.getUserOrderDetails`) implemented.
        *   `[x]` API Integration: `GET /api/products/recommended?based_on={order_id}` (via `apiService.getRecommendedProducts`) implemented.
        *   `[x]` Component Interaction: Displays fetched data.

---

### 5. Checkout Page

*   **Functionality:** Collect shipping, billing, and payment information to complete purchase
*   **Status:**
    *   `[x]` Routing: Route `/:storeSlug/checkout` exists in `app.routes.ts`.
    *   `[x]` Component (`CheckoutPageComponent`): Implemented with multi-step form (Shipping, Payment, Review).
    *   `[x]` UI Elements: Progress indicator, forms for shipping, billing, payment (simplified), order summary implemented.
    *   `[x]` User Actions: Enter info, select shipping, toggle billing, navigate steps, place order implemented.
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `GET /api/shipping/methods` implemented and integrated.
        *   `[x]` API Integration: `GET /api/tax/estimate` (via `POST` in frontend `ApiService` for payload) implemented and integrated.
        *   `[x]` API Integration: `POST /api/orders` implemented and integrated.
        *   `[x]` Component Interaction: Real-time validation (basic required, Luhn for card, format for expiry/CVV), dynamic total updates, step navigation implemented. Cart refresh on order success.

---

### 4. Shopping Cart Page

*   **Functionality:** Review and adjust cart contents before proceeding to checkout
*   **Status:**
    *   `[x]` Routing & Component: Route exists (`/:storeSlug/cart`), `CartPageComponent` implemented with core logic, promo codes, and recently viewed products.
    *   `[x]` UI Elements:
        *   `[x]` Table of cart items (image, name/link, price, quantity input, item subtotal, remove button) implemented and bound to `cartState$`.
        *   `[x]` "Continue Shopping" button implemented with `routerLink`.
        *   `[x]` "Update Cart" button implemented (calls placeholder method, less relevant now).
        *   `[x]` Order summary card: Subtotal, discount, and final total implemented. Shipping/Taxes are placeholders.
        *   `[x]` Promo code input field and "Apply" button implemented with logic and API connection.
        *   `[x]` "Proceed to Checkout" button implemented with navigation.
        *   `[x]` Recently viewed products section implemented.
        *   `[x]` Empty cart message implemented.
    *   `[x]` User Actions:
        *   `[x]` Adjust product quantities (calls `cartService.updateItemQuantity`).
        *   `[x]` Remove items from cart (calls `cartService.removeItem`).
        *   `[x]` Apply promo codes.
        *   `[x]` See real-time subtotal, discount, and total update.
        *   `[ ]` Save cart for later (Not implemented).
        *   `[x]` Proceed to checkout.
        *   `[x]` Continue shopping (Button implemented).
    *   `[x]` Technical Details:
        *   `[x]` API Integration: Cart item management via `CartService`.
        *   `[x]` API Integration: `POST /api/cart/promo` frontend integration complete.
        *   `[x]` API Integration: Fetching recently viewed product details.
        *   `[x]` Component Interaction: Client-side calculation for totals implemented. Promo code application updates display.

---

### 3. Product Page

*   **Functionality:** Show detailed product information with variants and purchasing options
*   **Status:**
    *   `[/]` Routing & Component: Route exists (`/:storeSlug/product/:id`), `ProductPageComponent` exists and fetches product details via `ApiService`. Logic added for variant selection, quantity adjustment, and wishlist integration.
    *   `[/]` UI Elements:
        *   `[x]` Image carousel/thumbnails/zoom: `ImageCarouselComponent` integrated, displays multiple images with basic zoom on hover and navigation buttons. Automatic rotation removed as not required for product page.
        *   `[x]` Product name displayed.
        *   `[x]` Price displayed: Dynamically updates based on selected variant.
        *   `[x]` Average review rating (Implemented with numerical and star display).
        *   `[x]` Product description displayed (basic).
        *   `[x]` Variant selection dropdowns: Implemented and functional.
        *   `[x]` Quantity selector: Implemented with input and +/- buttons, limited by stock.
        *   `[x]` "Add to Cart" button implemented: Adds the selected variant (or base product) with the correct price and quantity.
        *   `[/]` "Add to Wishlist" button: Button added, visible based on login status. Logic implemented, but styling/icon/state update needs refinement.
        *   `[/]` Shipping/Return info (Basic section added).
        *   `[/]` Tabs/Sections for Specs, Reviews (Tabbed interface implemented, dynamic spec display pending backend data).
        *   `[x]` Related products section (Implemented with horizontal scroll).
        *   `[x]` "Write a Review" button (Implemented within Reviews tab, visible if logged in).
        *   `[x]` Breadcrumbs (Implemented with category link).
    *   `[x]` User Actions:
        *   `[x]` Browse/zoom images: Can view multiple images via the carousel component, basic zoom on hover implemented.
        *   `[x]` Select different product variants: Implemented and updates price/stock.
        *   `[x]` Select quantity: Implemented via input and buttons, limited by stock.
        *   `[x]` Add product to cart: Implemented for selected variant/base product.
        *   `[x]` Add product to wishlist: Button action implemented via `WishlistService`, status displayed.
        *   `[x]` Read and write product reviews (if logged in): Display implemented, write form/logic implemented.
        *   `[x]` View related products: Implemented with horizontal scroll.
        *   `[x]` Navigate to product category or homepage via breadcrumbs: Implemented.
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `GET /api/products/{id}` implemented via `ApiService`. Backend updated to return multiple images, variants, and categories.
        *   `[x]` API Integration: `POST /api/cart/add` implemented via `CartService`. Handles adding selected variants.
        *   `[x]` API Integration: `GET /api/products/{id}/reviews` implemented.
        *   `[x]` API Integration: `POST /api/wishlist/add` implemented via `WishlistService`.
        *   `[x]` API Integration: `POST /api/reviews` implemented.
        *   `[x]` Component Interaction: Variant selection updates price/availability: Implemented.
        *   `[x]` Component Interaction: Out-of-stock variants disabled: Variant options in dropdowns are now visually disabled if they lead to an out-of-stock combination.
        *   `[x]` Component Interaction: Tab switching implemented.
        *   `[x]` Component Interaction: Wishlist status check on load implemented.
        *   `[x]` Component Interaction: Toast notifications for user actions implemented via `NotificationService`.

---

### 2. Category Page

*   **Functionality:** Display products within a specific category with filtering and sorting capabilities
*   **Status:**
    *   `[x]` Routing & Component: Route exists (`/:storeSlug/category/:id`), `CategoryPageComponent` exists with robust logic for fetching data, filtering, sorting, pagination, and URL sync.
    *   `[x]` UI Elements:
        *   `[x]` Category title/description displayed.
        *   `[x]` Product grid implemented using `app-product-card`. Handles loading/empty states.
        *   `[x]` Left sidebar: Price range, Tags, Color, and Size filters implemented. "Clear All Filters" button implemented.
        *   `[/]` Top bar: Sorting dropdown implemented (Best Selling functionality still depends on API, not explicitly added if unsupported).
        *   `[x]` Pagination controls implemented.
        *   `[x]` Breadcrumbs implemented (Home > Category Name).
    *   `[x]` User Actions:
        *   `[x]` Filter products by price range, tags, colors, and sizes.
        *   `[x]` Sort products.
        *   `[x]` Add products directly to cart (Implemented in `ProductCardComponent` with stock check).
        *   `[x]` Click on products to view detailed information (Handled by `ProductCardComponent` link).
        *   `[x]` Navigate between pages of products using pagination.
        *   `[x]` Clear all filters with one click.
        *   `[x]` Return to homepage via breadcrumb.
    *   `[x]` Technical Details:
        *   `[x]` API Integration: `GET /api/categories/{id}` implemented.
        *   `[x]` API Integration: `GET /api/products?category_id={id}&...` implemented with dynamic params including new filters.
        *   `[x]` API Integration: `POST /api/cart/add` (Handled by `ProductCardComponent`).
        *   `[x]` Component Interaction: Filter/Sort/Page changes trigger API calls via RxJS streams.
        *   `[x]` Component Interaction: URL parameters store and initialize filter/sort/page state.

---

### 1. Homepage

*   **Functionality:** Entry point to store that showcases featured content
*   **Status:**
    *   `[x]` Routing & Component: Default route (`/:storeSlug`) maps to `HomepageComponent` via lazy-loaded `HomeModule`. Component fetches featured categories, products, and carousel slides via `ApiService`.
    *   `[/]` UI Elements:
        *   `[ ]` Store logo in header (Assumed in Header Component).
        *   `[ ]` Navigation menu (Assumed in Header Component).
        *   `[ ]` Search bar (Assumed in Header Component).
        *   `[/]` Hero banner carousel (Implemented via `<app-carousel>`. Functionality within that component TBD).
        *   `[x]` Featured categories grid (Implemented via `<app-category-card>` loop).
        *   `[x]` Featured products grid (Implemented via `<app-product-card>` loop).
        *   `[ ]` Newsletter signup form (Assumed in Footer Component).
        *   `[ ]` Social media links (Assumed in Footer Component).
    *   `[/]` User Actions:
        *   `[x]` Click on category cards (Handled by `CategoryCardComponent`).
        *   `[ ]` Use search bar (Assumed in Header Component).
        *   `[ ]` Click on product cards (Handled by `ProductCardComponent`).
        *   `[ ]` Add products directly to cart (Handled by `ProductCardComponent`).
        *   `[ ]` Navigate between carousel slides (Handled by `CarouselComponent`).
        *   `[ ]` Subscribe to newsletter (Assumed in Footer Component).
        *   `[ ]` Access account/cart icons (Assumed in Header Component).
    *   `[/]` Technical Details:
        *   `[x]` API Integration: `GET /api/categories/featured` implemented.
        *   `[x]` API Integration: `GET /api/products/featured` implemented.
        *   `[x]` API Integration: `GET /api/carousel/images` implemented (for `<app-carousel>`).
        *   `[ ]` API Integration: `GET /api/search?q={query}` (Assumed in Header Component).
        *   `[ ]` API Integration: `POST /api/newsletter/subscribe` (Assumed in Footer Component).
        *   `[ ]` Component Interaction: Search debounce (Assumed in Header Component).
        *   `[ ]` Component Interaction: Add to Cart updates cart count (Handled by `ProductCardComponent` -> `CartService`).
```

# storefront-styling-plan.md

```md
# Storefront Styling Plan: Modern & Minimalist

This document outlines the plan for implementing a Modern & Minimalist visual style for the storefront application.

**Phase 1: Foundation - Global Styles**

1.  **Define Core Elements:**
    *   **Color Palette:** Establish a primary accent color (e.g., a shade of blue or green), a secondary color (optional), neutral grays, black, and white.
    *   **Typography:** Select a clean sans-serif font (e.g., Inter, Lato, Roboto). Define base sizes, line heights, and styles for headings (h1-h6) and paragraphs (p).
    *   **Spacing:** Implement a consistent spacing system (e.g., 8px base unit).
    *   **Layout:** Define a `.container` class for content centering and max-width.
    *   **Base Elements:** Apply default styles to `body`, `a`, `button`, form inputs.

2.  **Implement in `styles.scss`:**
    *   Use CSS custom properties (`:root`) for colors, fonts, spacing.
    *   Apply base styles to `html`, `body`.
    *   Define styles for typography, links, buttons.
    *   Create the `.container` utility class.

**Phase 2: Component Styling**

1.  **Core Layout Components:**
    *   **Header (`header.component.scss`):** Style header bar, logo, navigation, search bar integration.
    *   **Footer (`footer.component.scss`):** Style footer layout, links, copyright.
    *   **Search Bar (`search-bar.component.scss`):** Style input and button.

2.  **Homepage Specific Components:**
    *   **Homepage Container (`homepage.component.scss`):** Add padding/margins to sections.
    *   **Carousel (`carousel.component.scss`):** Style container, slides, controls.
    *   **Category Card (`category-card.component.scss`):** Style card background, padding, image, text. Use subtle borders/shadows.
    *   **Product Card (`product-card.component.scss`):** Style layout, image, title, price, action buttons.

**Phase 3: Review & Handover**

1.  **Review:** Check homepage and other key pages for consistency and responsiveness.
2.  **Documentation (Optional):** Create `style-guide.md` documenting design system elements.
3.  **Implementation:** Propose switching to "Code" mode for implementation.

**Visual Plan (Mermaid Diagram):**

\`\`\`mermaid
graph TD
    A[Define Modern & Minimalist Style (Colors, Fonts, Spacing)] --> B(Implement Global Styles in styles.scss);
    B --> C{Style Core Components};
    C --> C1[Header];
    C --> C2[Footer];
    C --> C3[Search Bar];
    C1 & C2 & C3 --> D{Style Homepage Components};
    D --> D1[Homepage Container];
    D --> D2[Carousel];
    D --> D3[Category Card];
    D --> D4[Product Card];
    D1 & D2 & D3 & D4 --> E(Review & Refine);
    E --> F(Optional: Document Style Guide);
    F --> G(Propose Switch to Code Mode for Implementation);
```

# systemPatterns.md

```md
# System Patterns: Online Business Promotion System

## 1. High-Level Architecture

The system comprises three distinct but interconnected web applications, communicating via APIs. The Storefront application is designed to be multi-tenant, serving different stores based on a URL slug.

\`\`\`mermaid
graph TD
    subgraph User Facing
        SF[Storefront Website (Angular)]:::angular
        MP[Global Marketplace Website (Angular)]:::angular
    end

    subgraph Management
        SM[Store Management Website (Angular)]:::angular
    end

    subgraph Backend / API Layer (NestJS / TypeORM)
        API[Core API / Backend Services (/api prefix)]:::nestjs
        DB[(PostgreSQL Database)]:::db
    end

    subgraph Data Model
        Store[Store Entity]:::entity
        Product[Product Entity]:::entity
        Category[Category Entity]:::entity
        User[User Entity]:::entity
        Order[Order Entity]:::entity
        OrderItem[OrderItem Entity]:::entity
        Address[Address Entity]:::entity
        Wishlist[Wishlist Entity]:::entity
        WishlistItem[WishlistItem Entity]:::entity
        Cart[Cart (DB/Session)]:::entity
    end

    SF -- HTTP Calls (/:storeSlug/*) --> API
    MP -- HTTP Calls --> API
    SM -- HTTP Calls --> API
    API -- Data Access (TypeORM) --> DB

    %% Data Relationships
    Store -- OneToMany --> Product
    Store -- OneToMany --> Category
    Product -- ManyToOne --> Store
    Category -- ManyToOne --> Store
    User -- OneToMany --> Address
    User -- OneToMany --> Order
    User -- OneToMany --> Wishlist
    Order -- OneToMany --> OrderItem
    Order -- ManyToOne --> Address
    Wishlist -- OneToMany --> WishlistItem
    %% Other relations omitted for brevity

    %% Data Sync/Flow (Conceptual)
    SM -- Manages Data --> API
    API -- Updates --> DB
    DB -- Provides Data --> API
    API -- Serves Data (Filtered by Store) --> SF
    API -- Serves Aggregated Data --> MP

    classDef angular fill:#DD0031,stroke:#333,stroke-width:2px,color:#fff;
    classDef nestjs fill:#E0234E,stroke:#333,stroke-width:2px,color:#fff;
    classDef db fill:#336791,stroke:#333,stroke-width:2px,color:#fff;
    classDef entity fill:#4DB33D,stroke:#333,stroke-width:2px,color:#fff;

\`\`\`

## 2. Key Architectural Decisions

*   **Separation of Concerns:** Three distinct Angular frontend applications (Storefront, Management, Marketplace) cater to different user groups and purposes.
*   **API-Driven:** All frontend applications interact with a central backend via RESTful APIs.
*   **Centralized Backend:** A single backend built with NestJS (TypeScript/Node.js) manages business logic, data persistence (PostgreSQL via TypeORM), and serves all three frontends.
*   **Global API Prefix:** The backend uses a global `/api` prefix for all its routes (`app.setGlobalPrefix('api')` in `main.ts`).
*   **Multi-Tenancy (Storefront):** The Storefront app uses a URL parameter (`/:storeSlug`) to identify the current store context. Backend APIs filter data based on this context (passed as `?storeSlug=...` query parameter).
*   **Data Synchronization:** (As before) Product, order, and customer data managed via the Store Management site needs to be consistently reflected in the Storefront and Marketplace.
*   **Shared Library (`@shared-types`):** Common TypeScript types/interfaces are defined in a dedicated Angular library (`projects/shared-types`). This library is built into `dist/shared-types`, and both frontend and backend applications configure path mapping in their respective `tsconfig.json` files to reference the built output.

## 3. Frontend Architecture (Angular)

*   **Component-Based:** Standard Angular component architecture, favoring standalone components where appropriate.
*   **Services:** Services for API interaction (`ApiService`), state management (`CartService` using `BehaviorSubject`), and shared logic.
*   **Routing:** Angular Router for navigation. Storefront uses a parent route `/:storeSlug` to capture store context.
*   **State Management:** Simple state management via services with `BehaviorSubject` (e.g., `CartService`, `StoreContextService`).
*   **Development Proxy:** Angular CLI development server uses `proxy.conf.json` to forward requests starting with `/api` to the backend service (running at `http://localhost:3000`) without path rewriting.
*   **Production Serving:** Built static files served via Nginx.

## 4. Backend Architecture (NestJS / TypeORM)

*   **Framework:** NestJS (TypeScript/Node.js).
*   **ORM:** TypeORM for database interaction with PostgreSQL.
*   **Database:** PostgreSQL.
*   **Modularity:** Backend structured modularly by domain (e.g., `ProductsModule`, `CategoriesModule`, `StoresModule`, `UsersModule`, `AuthModule`, `CartModule`, `AddressesModule`, `OrdersModule`, `WishlistModule`, `NavigationModule`). Modules are registered in `AppModule`. Modules export providers (`TypeOrmModule`) where necessary for cross-module dependency injection (`ProductsModule` -> `WishlistModule`, `StoresModule` -> `WishlistModule` via `StoreContextGuard`).
*   **Configuration:** Uses `@nestjs/config` for environment variable management (`.env` file) within the running application. `data-source.ts` reads `process.env` directly for CLI compatibility. `tsconfig.build.json` explicitly includes `data-source.ts` for compilation.
*   **Database Schema:** Managed via TypeORM migrations. `synchronize: false` is set in `data-source.ts`. Entities are loaded at runtime via `autoLoadEntities: true` in `AppModule` (requires entities to be registered via `forFeature` in imported modules).
*   **Migrations:** TypeORM CLI used via npm scripts (`migration:generate`, `migration:run`, `migration:revert`) defined in `backend/api/package.json`, referencing the compiled `dist/data-source.js`. Migration files stored in `backend/api/src/migrations`. Migrations generated via `docker exec` need copying to host.
*   **Seeding:** Initial database data populated using a standalone script (`backend/api/src/seed.ts`) run via `npm run seed:prod` (using compiled JS). The script bootstraps the NestJS application context to access TypeORM repositories. Uses `upsert` to handle potential re-runs.

## 5. Authentication

*   **JWT (JSON Web Tokens):** Used for securing API endpoints (`JwtAuthGuard`). Requires `JWT_SECRET` environment variable.
*   **Guards:** `JwtAuthGuard` protects authenticated routes. `StoreContextGuard` created to extract `storeId` from `storeSlug` route parameter and attach to request (used by `WishlistController`).
*   **Role-Based Access Control (RBAC):** Crucial for the Store Management website (planned).

## 6. Deployment Pattern (Docker Compose - Production)

*   **Files:** Uses `docker-compose.yml`, `backend/api/Dockerfile.prod`, `projects/storefront/Dockerfile.prod`, `docker/nginx/nginx.conf`, and `.env` (on server).
*   **Services:**
    *   `db`: PostgreSQL container using `postgres:15` image. Data persisted in named volume (`postgres_data_prod`). Runs on `internal_network`.
    *   `api`: NestJS backend built using multi-stage `Dockerfile.prod`. Runs compiled JS (`node dist/src/main`). Connects to `db` via `internal_network`. Listens internally on port 3000. Also connected to `web_network`.
    *   `frontend`: Nginx container using `nginx:stable-alpine`. Serves static Angular build output copied from multi-stage `Dockerfile.prod`. Mounts `nginx.conf`. Exposes port 80. Runs on `web_network`.
*   **Networking:**
    *   `internal_network`: For `db` <-> `api` communication.
    *   `web_network`: For `frontend` (Nginx) <-> `api` communication and external access via Nginx.
*   **Nginx Configuration (`nginx.conf`):**
    *   Serves static files from `/usr/share/nginx/html`.
    *   Uses `try_files $uri $uri/ /index.html;` for Angular routing.
    *   Proxies `/api/` location to `http://api:3000` (using `resolver 127.0.0.11;` and variable for Docker DNS resolution, no trailing slash on `proxy_pass`). Handles Angular routes like `/:storeSlug/*` correctly.
*   **Environment Variables:** Managed via `.env` file in the project root on the server (e.g., `POSTGRES_PASSWORD`, `JWT_SECRET`). Referenced in `docker-compose.yml`.
*   **Build Process:** Requires building `shared-types` locally (`npx ng build shared-types`) before running `docker compose build`. Dockerfiles optimized for `npm install` caching.
*   **Database Setup:** Requires running `npm run migration:run` and `npm run seed:prod` via `docker exec` after initial container startup.

## 7. Development Environment Pattern (Docker Compose - Development)

*   **Files:** Uses `docker-compose.dev.yml`.
*   **Services:** `db`, `api` (runs `npm run start:dev`), `frontend` (runs `ng serve storefront`), `store-management-frontend-dev` (builds and serves static files).
*   **Volumes:** Mounts source code (`.:/usr/src/app`) for hot-reloading (where applicable). Uses named volumes for `node_modules`, DB data, and frontend build output.
    *   `store_management_build`: Named volume used to persist the build output of the `store-management-frontend-dev` service.
*   **Networking:** Uses two custom bridge networks, `internal_network` and `web_network`, for explicit service communication control.
    *   `db`: Connected to `internal_network`.
    *   `api`: Connected to `internal_network` and `web_network`.
    *   `frontend`: Connected to `web_network`.
    *   `store-management-frontend-dev`: Connected to `web_network`.
    *   `nginx`: Connected to `web_network`.
*   **Nginx Configuration (`docker/nginx/nginx.conf`):**
    *   Configured to serve the Storefront application for `localhost` and `smartyapp.co.il`. In development, this proxies to the `frontend` service running `ng serve`.
    *   Configured to serve the Store Management application for `manager.localhost` and `manager.smartyapp.co.il`. In development, this serves static files from the `store_management_build` named volume mounted at `/app/store-management-build`.
    *   Proxies `/api/` requests to the `api` service.
*   **Build Process (Store Management Dev):** The `store-management-frontend-dev` service's command is modified to run `npx ng build store-management` to generate the build output into the `store_management_build` named volume, and then keeps the container running.

## 8. Development Workflow Pattern

*   **Vertical Slices:** Development proceeds by implementing UI and corresponding backend endpoints for a specific feature/page.
*   **Shared Library:** Build the `@shared-types` library (`ng build shared-types`) before starting/restarting the backend service to ensure it picks up the latest types.

## 9. Frontend Form Pattern (Reactive Forms)

*   **Implementation:** Angular Reactive Forms (`ReactiveFormsModule`, `FormBuilder`, `FormGroup`, `FormControl`) used for complex forms like Registration.
*   **Validation:**
    *   Built-in Angular validators (`Validators.required`, `Validators.email`, `Validators.minLength`, `Validators.maxLength`, etc.).
    *   Custom synchronous validators added to the `FormGroup` options (e.g., `passwordMatchValidator`).
    *   Backend DTO validation (`class-validator`) provides server-side checks.
*   **Error Handling:**
    *   Template displays validation errors using `*ngIf` based on control status (`invalid`, `dirty`, `touched`) and specific error keys (`errors?.['required']`).
    *   Component's `onSubmit` checks `form.invalid` before proceeding.
    *   API call errors (e.g., `409 Conflict` for existing email) are caught, and specific error messages are displayed to the user. `form.setErrors` can be used to mark specific fields as invalid based on API response.
*   **UI Feedback:** Submit button disabled (`[disabled]="isSubmitting"`) during API call. Success/error messages displayed using `*ngIf`.

*(Pattern definition updated as of 4/26/2025 reflecting development environment network and volume configuration)*

```

# techContext.md

```md
# Tech Context: Online Business Promotion System

## 1. Core Technologies

*   **Frontend:** Angular (~v18)
    *   Framework for building the user interfaces of all three websites (Storefront, Store Management, Global Marketplace).
    *   TypeScript as the primary language.
    *   SCSS for styling.
    *   Styling Theme: Modern & Minimalist (See [Storefront Styling Plan](./storefront-styling-plan.md)).
    *   Standalone Components preferred where applicable.
*   **Backend:** NestJS (~v10, Node.js ~v20 runtime)
    *   Framework for building the API layer and business logic.
    *   TypeScript as the primary language.
    *   Modules: `AppModule`, `AuthModule`, `UsersModule`, `ProductsModule`, `CategoriesModule`, `StoresModule`, `CartModule`, `AddressesModule`, `OrdersModule`, `WishlistModule`, `NavigationModule`.
*   **Database:** PostgreSQL (~v15)
    *   Relational database managed via TypeORM.
    *   Entities defined in `src/*/entities/*.entity.ts` (User, Product, Category, Store, CarouselItem, Address, Order, OrderItem, Wishlist, WishlistItem).
    *   TypeORM configuration via `TypeOrmModule.forRootAsync` in `AppModule` and `TypeOrmModule.forFeature` in feature modules.
*   **API Style:** RESTful with a global `/api` prefix.
*   **Web Server (Production):** Nginx (`stable-alpine` image)
    *   Serves static Angular build output.
    *   Acts as a reverse proxy for the backend API.
    *   Configuration managed via `docker/nginx/nginx.conf`.

## 2. Development Environment & Tooling

*   **Package Manager:** npm (using workspaces for monorepo).
*   **Version Control:** Git (Monorepo hosted at `https://github.com/hishtadlut/magic-store-monorepo.git`). Credential helper configured.
*   **Code Editor:** VS Code.
*   **Containerization:** Docker and Docker Compose.
    *   **Development:** Uses `docker-compose.dev.yml`. Services: `db`, `api` (`start:dev`), `frontend` (`ng serve storefront`), `store-management-frontend-dev` (builds and serves static files), `nginx`. Mounts source code. Uses named volumes for `node_modules`, DB data, and frontend build output. Configured with custom networks.
    *   **Production:** Uses `docker-compose.yml`. Services: `db`, `api` (runs compiled JS), `frontend` (Nginx). Uses multi-stage Dockerfiles (`backend/api/Dockerfile.prod`, `projects/storefront/Dockerfile.prod`) optimized for caching. Requires `.env` file on server for secrets.
*   **Linters/Formatters:** ESLint, Prettier (Root configs exist).
*   **Build Tools:** Angular CLI (`ng build`, `ng serve`), NestJS CLI (`nest build`, `nest start`), `tsc` (TypeScript Compiler via NestJS).
*   **Proxy (Development):** Angular CLI Dev Server proxy (`proxy.conf.json`) used to forward `/api` requests to the backend container (for the `frontend` service). The `nginx` service handles routing for both frontends and proxies to the `api` service.

## 3. Key Technical Requirements & Constraints

*   **Shared Code (`@shared-types`):** Common types/interfaces managed in an Angular library (`projects/shared-types`). The library is built (`ng build shared-types`) to `dist/shared-types`. Frontend and backend applications use TypeScript path mapping (`tsconfig.json`) to reference the built output. Production Dockerfiles copy necessary source/config for building or copy pre-built output. (`state` field removed from `Address` interface).
*   **Responsiveness:** All frontend applications must be fully responsive across devices.
*   **Performance:** Adherence to performance goals outlined in the plan (e.g., page load times, API response times). Angular build budgets increased.
*   **Security:** Implementation of security best practices.
    *   Password hashing using `bcrypt` implemented in `UsersService`. Native compilation handled during Docker build.
    *   Basic DTO validation using `class-validator` and `ValidationPipe` implemented for registration.
    *   JWT Authentication implemented (`JwtModule`, `JwtStrategy`, `JwtAuthGuard`). Requires `JWT_SECRET` environment variable in production.
    *   `StoreContextGuard` created to extract `storeId` from route slug.
    *   Role-Based Access Control (RBAC) still pending full implementation.
*   **Maintainability:** Code should be well-structured, documented, and testable.

## 4. Integration Points

*   **API:** Primary integration via RESTful endpoints with `/api` prefix.
*   **Third-Party Services:** Potential integrations mentioned (e.g., payment gateways, shipping providers, address validation, email services, social logins, Elasticsearch). API keys and configuration will be managed securely.
*   **Image Placeholders:** Using `picsum.photos` for seed data.

## 5. Progress Tracking

*   Markdown files (`progress.md`, `activeContext.md`, etc.) in `memory-bank` directory.

## 6. Database Management

*   **ORM:** TypeORM used for database interaction.
*   **Data Source:** Configuration for TypeORM CLI defined in `backend/api/data-source.ts` (reads `process.env` directly, explicitly lists all entities).
*   **Migrations:**
    *   Managed via TypeORM CLI scripts added to `backend/api/package.json` (`migration:generate`, `migration:run`, `migration:revert`), referencing compiled data source.
    *   Migration files stored in `backend/api/src/migrations`.
    *   Generated via `docker compose exec --workdir /usr/src/app/backend/api api npm run typeorm -- migration:generate ...`. The `--workdir` is crucial because the `npm run typeorm` script needs to find `package.json` in `backend/api`. **Note:** Files generated inside Docker by root might have incorrect host permissions; use `sudo chown $(whoami):$(whoami) path/to/migration.ts` if needed.
    *   **Production Environment Note:** Since the production `api` service in `docker-compose.yml` does not mount the source code volume, generated files (like migrations) exist only inside the container. Use `docker cp CONTAINER_NAME:/path/to/file /local/path` (e.g., `sudo docker cp magic_store_api_prod:/usr/src/app/backend/api/src/migrations/MIGRATION_FILE.ts ./backend/api/src/migrations/`) to copy them to the host.
    *   Run via `docker compose exec --workdir /usr/src/app/backend/api api npm run migration:run`.
*   **Seeding:**
    *   Initial data seeding handled by `backend/api/src/seed.ts`.
    *   Script uses NestJS application context to access repositories.
    *   Run via `npm run seed:prod` script (using compiled JS) via `docker exec`.
    *   Currently seeds stores, categories, products, carousel items, users, addresses, orders, and wishlists. Deletion order corrected for FK constraints. `state` removed from address data.

## 7. Docker Compose Development Network and Volume Configuration (`docker-compose.dev.yml`)

*   **Networks:** Defines two custom bridge networks:
    *   `internal_network`: Used for communication between the `db` and `api` services.
    *   `web_network`: Used for communication between the frontend services (`frontend`, `store-management-frontend-dev`), the `api` service, and the `nginx` service. This network is exposed to the host for external access via Nginx.
*   **Service Network Connections:**
    *   `db`: Connected to `internal_network`.
    *   `api`: Connected to `internal_network` and `web_network`.
    *   `frontend`: Connected to `web_network`.
    *   `store-management-frontend-dev`: Connected to `web_network`.
    *   `nginx`: Connected to `web_network`.
*   **Volumes:** Uses named volumes for persistence and sharing data between services:
    *   `postgres_data_dev`: Persists PostgreSQL database data.
    *   `api_node_modules`: Caches `node_modules` for the `api` service.
    *   `frontend_node_modules`: Caches `node_modules` for the `frontend` service.
    *   `angular_cache`: Caches Angular build artifacts for the `frontend` service.
    *   `store_management_frontend_node_modules`: Caches `node_modules` for the `store-management-frontend-dev` service.
    *   `store_management_angular_cache`: Caches Angular build artifacts for the `store-management-frontend-dev` service.
    *   `store_management_build`: **Crucially, this named volume is used to share the build output of the `store-management-frontend-dev` service with the `nginx` service.** The `store-management-frontend-dev` service builds the application into this volume, and the `nginx` service mounts this volume to serve the static files.
*   **Nginx Configuration (`docker/nginx/nginx.conf`):**
    *   The `nginx` service is configured to serve the Store Management application for `manager.localhost` and `manager.smartyapp.co.il` by setting its `root` directive to `/app/store-management-build`. This directory is populated by the `store_management_build` named volume.
    *   The Nginx configuration also handles routing for the main storefront and proxies API requests to the `api` service over the `web_network`.

## 8. Running TypeORM Migrations in Docker (Development)

Running TypeORM migrations within the Docker development environment requires careful command construction due to the interaction between `docker compose exec`, `ts-node`, `tsconfig-paths`, and the mounted source code volume.

**Troubleshooting Steps & Learnings:**

*   Initial attempts using `npm run typeorm -- migration:generate/run` failed due to the `typeorm` script's hardcoded `-d dist/data-source.js` flag conflicting with `migration:create` and issues with `migration:run` finding the compiled data source.
*   Directly executing `typeorm-ts-node-commonjs` or `typeorm` binaries from `./node_modules/.bin/` required finding the correct absolute path within the container (`/usr/src/app/node_modules/.bin/`).
*   Running `migration:run` with `ts-node` initially failed to find the data source file (`src/data-source.ts` or `dist/data-source.js`) even with `--dataSource` and `--workdir`.
*   TypeScript compilation errors ("Cannot find module 'src/...'") when using `ts-node` indicated that path aliases from `tsconfig.json` were not being resolved. This required including `-r tsconfig-paths/register` and setting the `TS_NODE_PROJECT` environment variable.
*   "Property 'POSTGRES_HOST' comes from an index signature" errors were resolved by accessing `process.env` properties using bracket notation (`process.env['PROPERTY_NAME']`) in `data-source.ts`.
*   Repeated "service is not running" errors when using `docker compose exec` for the database container were transient; using `docker exec` directly with the container ID proved more reliable for database interactions.
*   When running `migration:run` on a database with existing tables that were not applied via TypeORM migrations, the command will fail on the first `CREATE TABLE` statement for an existing table. To resolve this without dropping the database, manually insert records into the `migrations` table for all migrations that have already been applied to the schema.
*   The `CREATE TABLE IF NOT EXISTS` syntax in migration files helps prevent errors if tables already exist, allowing the migration to proceed to add constraints or other changes.

**Successful Command for Running Migrations:**

To run pending TypeORM migrations in the Docker development environment, use the following command:

\`\`\`bash
docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm --dataSource data-source.ts migration:run
\`\`\`

**Successful Command for Generating Migrations:**

To generate a new TypeORM migration file based on schema changes, use the following command:

\`\`\`bash
docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm --dataSource data-source.ts migration:generate ./src/migrations/YourMigrationName
\`\`\`
Replace `YourMigrationName` with a descriptive name for your migration. Remember to copy the generated file from the container to the host if necessary (see section 6).

*(Context updated as of 5/1/2025 reflecting successful TypeORM migration command and troubleshooting)*

## 9. Frontend Form Pattern (Reactive Forms)

*   **Implementation:** Angular Reactive Forms (`ReactiveFormsModule`, `FormBuilder`, `FormGroup`, `FormControl`) used for complex forms like Registration.
*   **Validation:**
    *   Built-in Angular validators (`Validators.required`, `Validators.email`, `Validators.minLength`, `Validators.maxLength`, etc.).
    *   Custom synchronous validators added to the `FormGroup` options (e.g., `passwordMatchValidator`).
    *   Backend DTO validation (`class-validator`) provides server-side checks.
*   **Error Handling:**
    *   Template displays validation errors using `*ngIf` based on control status (`invalid`, `dirty`, `touched`) and specific error keys (`errors?.['required']`).
    *   Component's `onSubmit` checks `form.invalid` before proceeding.
    *   API call errors (e.g., `409 Conflict` for existing email) are caught, and specific error messages are displayed to the user. `form.setErrors` can be used to mark specific fields as invalid based on API response.
*   **UI Feedback:** Submit button disabled (`[disabled]="isSubmitting"`) during API call. Success/error messages displayed using `*ngIf`.

*(Pattern definition updated as of 4/26/2025 reflecting development environment network and volume configuration)*

```

