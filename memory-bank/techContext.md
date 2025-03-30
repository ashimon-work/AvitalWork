# Tech Context: Online Business Promotion System

## 1. Core Technologies

*   **Frontend:** Angular (Specific version TBD, likely latest stable)
    *   Framework for building the user interfaces of all three websites (Storefront, Store Management, Global Marketplace).
    *   TypeScript as the primary language.
    *   HTML/CSS (or SCSS/SASS) for structure and styling.
*   **Backend:** TypeScript (Node.js runtime)
    *   Language for building the API layer and business logic.
    *   Likely using a framework like Express.js or NestJS (TBD).
*   **Database:** TBD (Relational like PostgreSQL or NoSQL like MongoDB could be suitable, depending on detailed data modeling).
*   **API Style:** Primarily RESTful, with potential for GraphQL for specific complex queries as mentioned in the plan.

## 2. Development Environment & Tooling

*   **Package Manager:** npm (based on `package-lock.json`).
*   **Version Control:** Git (Monorepo structure within `magic-store-workspace`, hosted at `https://github.com/hishtadlut/magic-store-monorepo.git`).
*   **Code Editor:** VS Code (Implied by user environment).
*   **Linters/Formatters:** ESLint, Prettier (Root configs exist).
*   **Build Tools:** Angular CLI for frontend, `tsc` (TypeScript Compiler) for backend.

## 3. Key Technical Requirements & Constraints

*   **Shared Code:** Explicit requirement to use shared folders for common types, classes, models, DTOs, and potentially reusable resources/logic between the frontend projects and the backend. This needs careful planning regarding project structure (monorepo vs. shared libraries).
*   **Responsiveness:** All frontend applications must be fully responsive across devices.
*   **Performance:** Adherence to performance goals outlined in the plan (e.g., page load times, API response times).
*   **Security:** Implementation of security best practices, especially for authentication, authorization (RBAC in Management portal), data handling (encryption), and API protection.
*   **Maintainability:** Code should be well-structured, documented, and testable.

## 4. Integration Points

*   **API:** The primary integration point between frontends and backend.
*   **Third-Party Services:** Potential integrations mentioned (e.g., payment gateways, shipping providers, address validation, email services, social logins, Elasticsearch). API keys and configuration will be managed securely.

## 5. Progress Tracking

*   As requested, Markdown files with checkboxes will be used to track progress, likely within the `progress.md` file or dedicated feature files.

*(This initial context is based on the "PAGE FUNCTIONALITY PLAN" document and explicit instructions provided on 3/28/2025.)*
