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
    *   Modules: `AppModule`, `AuthModule`, `UsersModule`, `ProductsModule`, `CategoriesModule`, `CartModule`.
*   **Database:** PostgreSQL (~v15)
    *   Relational database managed via TypeORM.
    *   Entities defined in `src/*/entities/*.entity.ts`.
    *   TypeORM configuration via `TypeOrmModule.forRootAsync` in `AppModule` and `TypeOrmModule.forFeature` in feature modules.
*   **API Style:** RESTful with a global `/api` prefix.

## 2. Development Environment & Tooling

*   **Package Manager:** npm (using workspaces for monorepo).
*   **Version Control:** Git (Monorepo hosted at `https://github.com/hishtadlut/magic-store-monorepo.git`).
*   **Code Editor:** VS Code.
*   **Containerization:** Docker and Docker Compose.
    *   Services defined for `db` (PostgreSQL), `api` (NestJS), `frontend` (Angular CLI serve).
    *   Project root mounted into `api` and `frontend` containers for code access and hot-reloading.
    *   Named volumes used for `node_modules` and database persistence.
*   **Linters/Formatters:** ESLint, Prettier (Root configs exist).
*   **Build Tools:** Angular CLI (`ng build`, `ng serve`), NestJS CLI (`nest start`), `tsc` (TypeScript Compiler via NestJS).
*   **Proxy:** Angular CLI Dev Server proxy (`proxy.conf.json`) used to forward `/api` requests to the backend container.

## 3. Key Technical Requirements & Constraints

*   **Shared Code (`@shared-types`):** Common types/interfaces managed in an Angular library (`projects/shared-types`). The library is built (`ng build shared-types`) to `dist/shared-types`. Frontend and backend applications use TypeScript path mapping (`tsconfig.json`) to reference the built output. Docker volumes ensure the `dist` folder is accessible to the backend container.
*   **Responsiveness:** All frontend applications must be fully responsive across devices.
*   **Performance:** Adherence to performance goals outlined in the plan (e.g., page load times, API response times)
*   **Security:** Implementation of security best practices.
    *   Password hashing using `bcrypt` implemented in `UsersService`.
    *   Basic DTO validation using `class-validator` and `ValidationPipe` implemented for registration.
    *   Authentication/Authorization (JWT, Guards, RBAC) still pending.
*   **Maintainability:** Code should be well-structured, documented, and testable.
## 4. Integration Points

*   **API:** Primary integration via RESTful endpoints with `/api` prefix.
*   **Third-Party Services:** Potential integrations mentioned (e.g., payment gateways, shipping providers, address validation, email services, social logins, Elasticsearch). API keys and configuration will be managed securely.

## 5. Progress Tracking

*   Markdown files (`progress.md`, `activeContext.md`, etc.) in `memory-bank` directory.

## 6. Database Management

*   **ORM:** TypeORM used for database interaction.
*   **Data Source:** Configuration for TypeORM CLI defined in `backend/api/data-source.ts`.
*   **Migrations:**
    *   Managed via TypeORM CLI scripts added to `backend/api/package.json` (`migration:generate`, `migration:run`, `migration:revert`).
    *   Migration files stored in `backend/api/src/migrations`.
    *   Initial schema for `products` and `categories` tables assumed to exist (based on `migration:generate` output).
*   **Seeding:**
    *   Initial data seeding handled by `backend/api/src/seed.ts`.
    *   Script uses NestJS application context to access repositories.
    *   Run via `npm run seed` script in `backend/api/package.json`.
    *   Currently seeds categories and products (without relations).

*(Context updated as of 4/2/2025 based on implementation and debugging)*
