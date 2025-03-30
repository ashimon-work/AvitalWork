# Active Context: Online Business Promotion System (Git Setup & Dev Environment)

## 1. Current Focus

*   **Git Repository Setup:** Ensuring the project is correctly configured under Git version control and pushed to the remote repository.
*   **Resume Dev Environment Setup:** Continue setting up the VS Code Dev Container and local Docker build verification process.

## 2. Reason for Pivot

*   Encountered persistent `esbuild` platform/version mismatch errors during local Angular build (`ng serve` on Windows). Multiple attempts to resolve via dependency reinstallation were unsuccessful.
*   Using a Dev Container provides a consistent Linux-based development environment directly within VS Code.
*   Using a separate Docker build file allows for local simulation of CI build checks without relying on external services like GitHub Actions.

## 3. Recent Changes

*   Completed initial Storefront Homepage vertical slice implementation.
*   Attempted to run `ng serve` locally, encountering persistent `esbuild` errors.
*   Discussed and revised the plan to focus on local Docker solutions (Dev Containers + local build check).
*   Initialized Git repository within `magic-store-workspace`.
*   Updated `.gitignore` to exclude `backend/api/.env`.
*   Corrected initial Git setup issues where files outside the workspace were tracked and the remote URL was incorrect.
*   Successfully force-pushed the clean initial commit to the `master` branch on `https://github.com/hishtadlut/magic-store-monorepo.git`.

## 4. Next Steps (Resume Dev Environment Setup)

*   **Continue Dev Container Strategy:**
    *   Verify/Create `.devcontainer` folder in `magic-store-workspace`.
    *   Verify/Create `.devcontainer/devcontainer.json`: Configure image/Dockerfile, VS Code extensions (e.g., Docker, Angular Language Service, ESLint, Prettier), settings, port forwarding (4200 for Angular, 3000 for API), and a `postCreateCommand` (e.g., `npm install`) to install dependencies after the container starts.
    *   Verify/Create `.devcontainer/Dockerfile`: Use a Node.js LTS image (e.g., `node:20-bullseye-slim`), install necessary OS packages (`git`, etc.), set up a non-root user.
*   **Continue Local Build Dockerfile Strategy:**
    *   Verify/Create `Dockerfile.build` in `magic-store-workspace`.
    *   Use multi-stage builds.
    *   Base stage with Node.js LTS (e.g., `node:20-slim`).
    *   Dependency stage: Copy `package*.json`, run `npm ci`.
    *   Build stage(s): Copy source code, copy `node_modules` from dependency stage, run build commands (`npm run build --workspace=backend/api`, `npm run build --workspace=projects/storefront -- --configuration=production`).
*   **Test:**
    *   Attempt to "Reopen in Container" in VS Code.
    *   Run `docker build -f Dockerfile.build .` locally to check the production build process.

## 5. Active Decisions & Considerations

*   **Development Environment:** VS Code Dev Container using Docker.
*   **Build Verification:** Local `docker build` using a dedicated `Dockerfile.build`.
*   **Dev Container Base Image:** `node:20-bullseye-slim` (or similar Debian-based slim image) for better dev tool compatibility.
*   **Build Dockerfile Base Image:** `node:20-slim` is suitable.
*   **Dependency Installation (Dev Container):** Use `postCreateCommand` in `devcontainer.json` for flexibility.
*   **Dependency Installation (Build Dockerfile):** Use `npm ci` in a dedicated stage for caching.

## 6. Important Patterns & Preferences

*   **Memory Bank:** Maintain diligently.
*   **Consistency:** Dev Containers provide a consistent Linux environment for all developers.
*   **Local Control:** Keep build and development processes local using Docker.

## 7. Learnings & Insights

*   Local environment inconsistencies can be effectively bypassed using containerized development environments like VS Code Dev Containers.
*   A separate Dockerfile for build verification provides a local alternative to cloud CI for checking production builds.
*   Initializing Git and running `git add .` must be done carefully from the correct project root directory to avoid tracking unintended files from parent directories. Force-pushing (`git push --force`) is necessary but potentially dangerous when correcting repository history.

*(As of 3/30/2025 - Git setup corrected, resuming Dev Container setup)*
