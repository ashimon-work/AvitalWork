# Active Context: Online Business Promotion System (Backend DB Integration & Auth)

## 1. Current Focus

*   **Backend Database Integration:** Refactoring backend services (Products, Categories) to use TypeORM and PostgreSQL instead of mock data. Setting up migrations and seeding.
*   **Backend API Implementation:** Adding missing API endpoints required by the frontend (e.g., product/category details, cart operations, registration).
*   **Storefront Implementation:** Implementing core pages (Category, Product, Cart, Registration) and connecting them to the backend API.
*   **Debugging:** Resolving backend dependency injection errors and frontend runtime errors.
*   **Memory Bank Maintenance:** Keeping progress and context files up-to-date.

## 2. Recent Changes & Debugging

*   **Backend Database Integration:**
    *   Refactored `ProductsService` and `CategoriesService` to use TypeORM repositories instead of mock data.
    *   Created `CategoryEntity`.
    *   Ensured `ProductEntity` and `CategoryEntity` are registered in their respective modules (`ProductsModule`, `CategoriesModule`).
    *   Created `data-source.ts` for TypeORM CLI configuration.
    *   Added TypeORM migration scripts to `backend/api/package.json`.
    *   Confirmed database tables exist (via `migration:generate` output).
    *   Created `seed.ts` script to populate `categories` and `products` tables.
    *   Updated seed data with static category IDs and placeholder image URLs (`placehold.co`).
    *   Ran seed script successfully.
*   **Backend API Endpoints:**
    *   Implemented `GET /products/:id` endpoint.
    *   Implemented `GET /categories/:id` endpoint.
    *   Implemented `GET /products` endpoint (with basic filtering/sorting/pagination on DB data).
    *   Implemented `POST /api/cart/add` endpoint (using in-memory cart).
    *   Implemented `GET /api/cart`, `PATCH /api/cart/:productId`, `DELETE /api/cart/:productId` endpoints (using in-memory cart).
    *   Implemented `POST /auth/register` endpoint (hashes password, saves user to DB).
*   **Frontend Implementation:**
    *   Implemented basic `CategoryPageComponent` (TS logic, HTML, SCSS) connected to backend.
    *   Implemented basic `ProductPageComponent` (TS logic, HTML, SCSS) connected to backend.
    *   Implemented basic `CartPageComponent` (TS logic, HTML, SCSS) connected to backend cart endpoints.
    *   Implemented `RegistrationPageComponent` (TS logic with Reactive Forms, HTML, SCSS) connected to backend.
    *   Added routes for all implemented pages (`/category/:id`, `/product/:id`, `/cart`, `/register`, `/faq`, `/shipping`, `/returns`, `/shop`, `/about`, `/contact`, `/account`).
    *   Updated `ApiService` with methods for product details, cart operations, and registration.
    *   Refactored `CartService` to use `ApiService` and manage state based on backend responses.
*   **Debugging:**
    *   Fixed `404 Not Found` errors for product/category details and product list by implementing backend endpoints.
    *   Fixed `404 Not Found` error for cart operations by implementing backend endpoints.
    *   Fixed frontend runtime error (`ReferenceError: process is not defined`) by removing NestJS `Logger` from Angular `CartService`.
    *   Fixed backend dependency injection error (`UnknownDependenciesException`) for `AuthController` by exporting `UsersService` from `UsersModule`.
    *   Fixed TypeORM migration generation errors related to shared types and CLI pathing.

## 3. Next Steps (Based on Plan)

1.  **Implement Login Functionality:** Backend (`/auth/login`, JWT) and Frontend (`LoginPageComponent`, `AuthService`).
2.  **Implement Product <-> Category Relationship:** Backend (Entities, Migration, Seeding, Service Update).
3.  **Refactor Cart to Use Database:** Backend (Entities, Migration, Service Update).
4.  **Implement Basic Account Page:** Backend (`/account/profile`), Frontend (`AccountPageComponent` data display, `JwtAuthGuard`).
5.  **Implement Static Pages:** Frontend (`AboutPageComponent`, `ContactPageComponent` content/styling).

## 4. Active Decisions & Considerations

*   **API Prefix:** Using a global `/api` prefix in the NestJS backend.
*   **Proxy:** Angular dev server proxies `/api` to `http://localhost:3000` without path rewriting.
*   **Shared Library:** Building the `@shared-types` library and referencing the `dist` output in the backend `tsconfig.json`. Docker mounts the root project directory for the `api` service to ensure access to `dist`.
*   **Development:** Running frontend (`ng serve`) locally and backend (`db`, `api`) via `docker compose up`. Backend uses TypeORM connected to the DB. Seeding via `npm run seed`.

## 5. Learnings & Insights

*   Angular proxy configuration (`proxy.conf.json` and `angular.json`) is crucial for local development.
*   Path aliases (`@shared-types`) in monorepos require building the library and careful configuration.
*   Global API prefixes in NestJS simplify routing.
*   Debugging requires checking configurations, code logic, and logs across frontend, backend, and potentially the database.
*   NestJS Dependency Injection requires providers to be exported from their modules if used by other modules.
*   TypeORM CLI requires correct data source configuration and often needs shared libraries to be built first.
*   Frontend code cannot directly use backend-specific modules (like NestJS `Logger`).

*(As of 4/2/2025 - Backend refactored to use DB for products/categories, basic Cart API and Registration implemented, frontend pages connected)*
