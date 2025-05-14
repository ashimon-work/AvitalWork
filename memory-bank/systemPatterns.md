# System Patterns: Online Business Promotion System

## 1. High-Level Architecture

The system comprises three distinct but interconnected web applications, communicating via APIs. The Storefront application is designed to be multi-tenant, serving different stores based on a URL slug.

```mermaid
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

```

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
