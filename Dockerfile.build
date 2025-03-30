# ---- Builder Stage ----
# Use a specific Node.js LTS version for reproducibility
FROM node:20-slim AS builder

WORKDIR /app

# Install necessary build tools (if any native modules require them)
# Keep this minimal, only add if 'npm ci' fails without them.
# RUN apt-get update && apt-get install -y --no-install-recommends build-essential python3 && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set PATH to include local node_modules binaries
ENV PATH /app/node_modules/.bin:$PATH

# Build backend API
WORKDIR /app/backend/api
RUN nest build

# Build frontend storefront
WORKDIR /app
# Assuming the output path is dist/storefront based on angular.json defaults
RUN ng build storefront --configuration=production


# ---- Production Stage ----
FROM node:20-slim AS production

WORKDIR /app

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built backend application from builder stage
COPY --from=builder /app/backend/api/dist ./backend/api/dist
# Copy backend package files to install production dependencies
COPY --from=builder /app/backend/api/package.json ./backend/api/package.json
# If the backend has its own lock file, copy that too
# COPY --from=builder /app/backend/api/package-lock.json ./backend/api/package-lock.json

# Copy built frontend application from builder stage
# Angular typically builds to dist/<project-name> relative to workspace root
COPY --from=builder /app/dist/storefront ./dist/storefront

# Install backend production dependencies
WORKDIR /app/backend/api
# Use --omit=dev for production dependencies only
RUN npm ci --omit=dev

# Switch back to the app root for consistency if needed, or stay in backend/api
WORKDIR /app

# Change ownership of the app directory to the non-root user
# Ensure all necessary files are owned correctly before switching user
RUN chown -R nestjs:nodejs /app

# Switch to the non-root user
USER nestjs

# Expose the port the backend runs on (default for NestJS is 3000)
EXPOSE 3000

# Command to run the backend application
CMD ["node", "backend/api/dist/main.js"]
