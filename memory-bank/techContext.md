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

```bash
docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm --dataSource data-source.ts migration:run
```

**Successful Command for Generating Migrations:**

To generate a new TypeORM migration file based on schema changes, use the following command:

```bash
docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm --dataSource data-source.ts migration:generate ./src/migrations/YourMigrationName
```
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
