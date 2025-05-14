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
