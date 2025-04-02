# System Patterns: Online Business Promotion System

## 1. High-Level Architecture

The system comprises three distinct but interconnected web applications, following a modular monolith approach, communicating via APIs.

```mermaid
graph TD
    subgraph User Facing
        SF[Storefront Website (Angular)]
        MP[Global Marketplace Website (Angular)]
    end

    subgraph Management
        SM[Store Management Website (Angular)]
    end

    subgraph Backend / API Layer (NestJS / TypeORM)
        API[Core API / Backend Services (/api prefix)]
        DB[(PostgreSQL Database)]
    end

    SF -- HTTP Calls --> API
    MP -- HTTP Calls --> API
    SM -- HTTP Calls --> API
    API -- Data Access (TypeORM) --> DB

    %% Data Sync/Flow (Conceptual)
    SM -- Manages Data --> API
    API -- Updates --> DB
    DB -- Provides Data --> API
    API -- Serves Data --> SF & MP
```

## 2. Key Architectural Decisions

*   **Separation of Concerns:** Three distinct Angular frontend applications (Storefront, Management, Marketplace) cater to different user groups and purposes.
*   **API-Driven:** All frontend applications interact with a central backend via RESTful APIs.
*   **Centralized Backend:** A single backend built with NestJS (TypeScript/Node.js) manages business logic, data persistence (PostgreSQL via TypeORM), and serves all three frontends.
*   **Global API Prefix:** The backend uses a global `/api` prefix for all its routes (`app.setGlobalPrefix('api')` in `main.ts`).
*   **Data Synchronization:** Product, order, and customer data managed via the Store Management site needs to be consistently reflected in the Storefront and Marketplace. This will likely involve direct API reads, potential caching, and possibly event-driven updates.
*   **Shared Library (`@shared-types`):** Common TypeScript types/interfaces are defined in a dedicated Angular library (`projects/shared-types`). This library is built into `dist/shared-types`, and both frontend and backend applications configure path mapping in their respective `tsconfig.json` files to reference the built output.

## 3. Frontend Architecture (Angular)

*   **Component-Based:** Standard Angular component architecture, favoring standalone components where appropriate.
*   **Services:** Services for API interaction (`ApiService`), state management (`CartService` using `BehaviorSubject`), and shared logic.
*   **Routing:** Angular Router for navigation within each application, utilizing lazy loading for feature modules.
*   **State Management:** Simple state management via services with `BehaviorSubject` for now (e.g., `CartService`). More complex solutions (NgRx) might be considered later if needed.
*   **Development Proxy:** Angular CLI development server uses `proxy.conf.json` to forward requests starting with `/api` to the backend service (running at `http://localhost:3000`) without path rewriting.

## 4. Backend Architecture (NestJS / TypeORM)

*   **Framework:** NestJS (TypeScript/Node.js).
*   **ORM:** TypeORM for database interaction with PostgreSQL.
*   **Database:** PostgreSQL.
*   **Modularity:** Backend structured modularly by domain (e.g., `ProductsModule`, `CategoriesModule`, `UsersModule`, `AuthModule`, `CartModule`, `NewsletterModule`). Modules are registered in `AppModule`.
*   **Configuration:** Uses `@nestjs/config` for environment variable management (`.env` file).
*   **Database Schema:** Managed via TypeORM migrations. `synchronize: false` is set in `data-source.ts`.
*   **Migrations:** TypeORM CLI used via npm scripts (`migration:generate`, `migration:run`, `migration:revert`) defined in `backend/api/package.json`, referencing `backend/api/data-source.ts`. Migration files stored in `backend/api/src/migrations`.
*   **Seeding:** Initial database data populated using a standalone script (`backend/api/src/seed.ts`) run via `npm run seed`. The script bootstraps the NestJS application context to access TypeORM repositories. Uses `upsert` to handle potential re-runs.
## 5. Authentication

*   **JWT (JSON Web Tokens):** Standard for securing API endpoints and managing user sessions (planned).
*   **Role-Based Access Control (RBAC):** Crucial for the Store Management website (planned).

## 6. Development Environment Pattern (Docker Compose)

*   **Services:** `docker-compose.yml` defines services for the database (`db`), backend (`api`), and frontend (`frontend`).
*   **Volumes:** Uses named volumes for `node_modules` persistence (`api_node_modules`, `frontend_node_modules`) and database data (`postgres_data`). Mounts the entire project root (`.:/usr/src/app`) into `api` and `frontend` containers to ensure access to shared code (`dist`) and facilitate hot-reloading/live updates.
*   **Networking:** Services communicate via Docker's default network, using service names (e.g., `db`) as hostnames.
*   **Debugging:** Running `docker compose up <service_name>` without `-d` allows viewing logs directly. Frontend often run locally via `ng serve` with proxy for easier debugging.

## 7. Development Workflow Pattern

*   **Vertical Slices:** Development proceeds by implementing UI and corresponding backend endpoints for a specific feature/page.
*   **Shared Library:** Build the `@shared-types` library (`ng build shared-types`) before starting/restarting the backend service to ensure it picks up the latest types.

## 8. Frontend Form Pattern (Reactive Forms)

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

*(Pattern definition updated as of 4/2/2025 based on implementation and debugging)*
