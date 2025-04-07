# Active Context: Online Business Promotion System (Store-Specific Data & Routing)

## 1. Current Focus

*   **Store-Specific Functionality:** Implementing the backend and frontend changes required to make the storefront application display data specific to a store identified by a URL slug (e.g., `/store-slug/home`).
*   **API Filtering:** Ensuring backend API endpoints correctly filter data (products, categories) based on the provided store context.
*   **Frontend Context:** Making the current store context available throughout the Angular application.
*   **Memory Bank Maintenance:** Updating documentation to reflect the new store architecture.

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

## 3. Next Steps (Immediate & Planned)

1.  **Commit Changes:** Commit all backend and frontend changes related to store implementation, login fixes, account routing fixes, and **carousel implementation/fixes**.
2.  **(DONE)** Fix JWT Configuration: Resolved.
3.  **Refactor Cart to Use Database:** Backend (Entities, Migration, Service Update). Consider if cart needs to be store-specific.
4.  **Implement Basic Account Page:** Backend (`/account/profile` exists), Frontend (`AccountPageComponent` data display, `JwtAuthGuard` applied). Needs UI implementation to show profile data.
5.  **Frontend UI Integration:** Update relevant frontend components (e.g., Category Page, Product Page) to use the `storeSlug` from `StoreContextService` when displaying data or making API calls via `ApiService`. (Homepage seems okay now).

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
*   **(Previous Learnings Still Valid):** TypeORM entity loading/CLI config, TS build includes, Docker build cache/CMD path, migration constraints, UUID format, Angular route structure/guards, JWT config, etc.

*(As of 4/6/2025 - Carousel implementation fixed, including backend entity/migration/service/controller, frontend service/component, seeding, and Docker troubleshooting. Misplaced carousel creation code removed from Storefront.)*
