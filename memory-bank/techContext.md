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
    *   Modules: `AppModule`, `AuthModule`, `UsersModule`, `ProductsModule`, `CategoriesModule`, `StoresModule`, `CartModule`.
*   **Database:** PostgreSQL (~v15)
    *   Relational database managed via TypeORM.
    *   Entities defined in `src/*/entities/*.entity.ts`.
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
    *   **Development:** Uses `docker-compose.dev.yml`. Services: `db`, `api` (`start:dev`), `frontend` (`ng serve`). Mounts source code.
    *   **Production:** Uses `docker-compose.yml`. Services: `db`, `api` (runs compiled JS), `frontend` (Nginx). Uses multi-stage Dockerfiles (`backend/api/Dockerfile.prod`, `projects/storefront/Dockerfile.prod`) optimized for caching. Requires `.env` file on server for secrets.
*   **Linters/Formatters:** ESLint, Prettier (Root configs exist).
*   **Build Tools:** Angular CLI (`ng build`, `ng serve`), NestJS CLI (`nest build`, `nest start`), `tsc` (TypeScript Compiler via NestJS).
*   **Proxy (Development):** Angular CLI Dev Server proxy (`proxy.conf.json`) used to forward `/api` requests to the backend container.

## 3. Key Technical Requirements & Constraints

*   **Shared Code (`@shared-types`):** Common types/interfaces managed in an Angular library (`projects/shared-types`). The library is built (`ng build shared-types`) to `dist/shared-types`. Frontend and backend applications use TypeScript path mapping (`tsconfig.json`) to reference the built output. Production Dockerfiles copy necessary source/config for building or copy pre-built output.
*   **Responsiveness:** All frontend applications must be fully responsive across devices.
*   **Performance:** Adherence to performance goals outlined in the plan (e.g., page load times, API response times). Angular build budgets increased.
*   **Security:** Implementation of security best practices.
    *   Password hashing using `bcrypt` implemented in `UsersService`. Native compilation handled during Docker build.
    *   Basic DTO validation using `class-validator` and `ValidationPipe` implemented for registration.
    *   JWT Authentication requires `JWT_SECRET` environment variable in production.
    *   Authentication/Authorization (JWT, Guards, RBAC) still pending full implementation.
*   **Maintainability:** Code should be well-structured, documented, and testable.

## 4. Integration Points

*   **API:** Primary integration via RESTful endpoints with `/api` prefix.
*   **Third-Party Services:** Potential integrations mentioned (e.g., payment gateways, shipping providers, address validation, email services, social logins, Elasticsearch). API keys and configuration will be managed securely.
*   **Image Placeholders:** Using `picsum.photos` for seed data.

## 5. Progress Tracking

*   Markdown files (`progress.md`, `activeContext.md`, etc.) in `memory-bank` directory.

## 6. Database Management

*   **ORM:** TypeORM used for database interaction.
*   **Data Source:** Configuration for TypeORM CLI defined in `backend/api/data-source.ts` (reads `process.env` directly).
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
    *   Currently seeds stores, categories, and products, associating products/categories with stores.

*(Context updated as of 4/2/2025 reflecting store-specific implementation)*
