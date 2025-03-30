# System Patterns: Online Business Promotion System

## 1. High-Level Architecture

The system comprises three distinct but interconnected web applications, likely following a microservices or modular monolith approach, communicating via APIs.

```mermaid
graph TD
    subgraph User Facing
        SF[Storefront Website (Angular)]
        MP[Global Marketplace Website (Angular)]
    end

    subgraph Management
        SM[Store Management Website (Angular)]
    end

    subgraph Backend / API Layer (TypeScript)
        API[Core API / Backend Services]
        DB[(Database)]
    end

    SF -- API Calls --> API
    MP -- API Calls --> API
    SM -- API Calls --> API
    API -- Data Access --> DB

    %% Data Sync/Flow (Conceptual)
    SM -- Manages Data --> API
    API -- Updates --> DB
    DB -- Provides Data --> API
    API -- Serves Data --> SF & MP
```

## 2. Key Architectural Decisions (Initial)

*   **Separation of Concerns:** Three distinct frontend applications (Storefront, Management, Marketplace) cater to different user groups and purposes.
*   **API-Driven:** All frontend applications interact with a central backend via RESTful APIs (or potentially GraphQL as mentioned). This promotes decoupling and allows for potential future clients (e.g., mobile apps).
*   **Centralized Backend:** A single backend (likely built with TypeScript/Node.js) manages business logic, data persistence, and serves all three frontends. This simplifies data synchronization initially.
*   **Data Synchronization:** Product, order, and customer data managed via the Store Management site needs to be consistently reflected in the Storefront and Marketplace. This will likely involve:
    *   Direct API reads for real-time data.
    *   Potential caching layers for performance.
    *   Possible event-driven updates (e.g., using webhooks or message queues) for inventory changes.
*   **Shared Components/Types:** As requested, shared folders will be used for common TypeScript types, classes, models, DTOs, and potentially reusable UI components or logic libraries to ensure consistency and reduce duplication.

## 3. Frontend Architecture (Angular)

*   **Component-Based:** Standard Angular component architecture for UI elements.
*   **Services:** Services for API interaction, state management, and shared logic.
*   **Routing:** Angular Router for navigation within each application.
*   **State Management:** A dedicated state management solution (like NgRx or services with BehaviorSubjects) might be needed, especially for complex state like the shopping cart or management dashboards.

## 4. Backend Architecture (TypeScript)

*   **Framework:** Likely Node.js with a framework like Express.js or NestJS to structure the API.
*   **ORM/Database Client:** A tool like TypeORM, Prisma, or Sequelize for database interaction.
*   **Modularity:** The backend should be structured modularly (e.g., by domain: products, orders, users, auth) to manage complexity.

## 5. Authentication

*   **JWT (JSON Web Tokens):** Standard for securing API endpoints and managing user sessions in both Storefront and Management portals.
*   **Role-Based Access Control (RBAC):** Crucial for the Store Management website to restrict access based on user roles (e.g., admin, manager, staff).

## 6. Development Approach Pattern

*   **Vertical Slices:** Development proceeds by implementing UI and corresponding mock backend endpoints for a specific feature/page first (e.g., Storefront Homepage), followed by connecting to the actual backend logic and database later. This allows for faster UI iteration and feedback.

*(Pattern definition based on the "PAGE FUNCTIONALITY PLAN" and planning discussions as of 3/28/2025.)*
