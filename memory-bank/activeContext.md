# Active Context: Online Business Promotion System (Store-Specific Data & Routing)

## 1. Current Focus

*   **Backend API Implementation:** Implementing remaining endpoints for Storefront (Personal Info update, Payment Methods, etc.).
*   **Frontend Implementation:** Styling and refining implemented Account sub-pages. Implementing remaining Storefront pages (Checkout, Order Confirmation, etc.).
*   **Memory Bank Maintenance:** Updating documentation after Account page implementation.

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
 *   **404 Page Implementation (Frontend):** Implemented basic 404 page component, routing, styling, "Back to Home" link (with store slug), and placeholder search/suggestions. Fixed root redirect loop.
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

## 3. Next Steps (Immediate & Planned)

1.  **Implement Backend Endpoints:**
    *   `PATCH /api/account/personal-info`
    *   `GET /api/account/payment-methods`
    *   `DELETE /api/account/payment-methods/:id`
    *   (Others from plan: Checkout, Order Confirmation, Contact, About, Reviews, etc.)
2.  **Refine Frontend Account UI/UX:** Add styling, improve error handling, implement order details view.
3.  **Continue Frontend Page Implementation:** Checkout flow, Order Confirmation, Contact, About pages.
4.  **Refactor Cart to Use Database:** Backend (Entities, Migration, Service Update).
6.  **Refactor Cart to Use Database:** Backend (Entities, Migration, Service Update).

## 4. Active Decisions & Considerations

*   **Store Identification:** Using a URL slug (`/:storeSlug`) to identify the active store in the frontend.
*   **Backend Filtering:** API endpoints use the `storeSlug` passed as a query parameter (`?storeSlug=...`) to filter database results via TypeORM relations (`where: { store: { slug: storeSlug } }`).
*   **Frontend Context:** Using a dedicated Angular service (`StoreContextService`) to read the `storeSlug` from the route parameters and provide it as an observable. `ApiService` subscribes to this observable to add the slug to API requests.
*   **Frontend Routing Structure:** Routes requiring store context (including auth pages like login/register) must be nested under the `/:storeSlug` parameter to ensure context is available and preserved during navigation/redirection. Guards redirecting to auth pages must construct the store-specific path. Service-based navigation (like in `AuthService`) must also construct store-specific paths, potentially by accessing route parameters.
*   **Migration Strategy:** When adding non-nullable foreign keys (`storeId`) to tables with existing data, the migration must first add the column as nullable, update existing rows with a default value (potentially inserting the default referenced entity first), and then alter the column to be non-nullable.
*   **Production Environment:** (As before) Using Docker Compose with separate production Dockerfiles and Nginx reverse proxy. Environment variables managed via `.env` file on the server.
*   **Image Placeholders:** (As before) Using `picsum.photos`.
*   **Docker Caching:** (As before) Optimized Dockerfiles.
*   **TypeORM CLI:** (As before) Using `process.env` in `data-source.ts` and running commands via `docker exec`.

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

*(As of 4/10/2025 - Implemented backend structure and frontend components for Account sub-pages: Addresses, Orders, Wishlist, Personal Info, Password Change. Removed 'state' field from addresses. Next step: Implement remaining backend endpoints for Account page.)*
