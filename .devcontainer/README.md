# Developer Environment Instructions

This document provides instructions for each developer to run their isolated instance of the Magic Store project.

## Project Directories

Each developer has been assigned a dedicated project directory with its own set of ports to avoid conflicts:

| Developer | Project Path | Nginx Port (Cloudflare Compatible) | Debug Port (API) |
|---|---|---|---|
| Ayala Yaari | `/home/ayala/project` | `8080` | `9231` |
| Racheli Reisner | `/home/racheli/project` | `8880` | `9232` |
| Sivan Zargari | `/home/sivan/project` | `2052` | `9233` |

## How to Start Your Environment

1.  **Log In:**
    When you SSH into the server with your user, you will automatically be placed in your project directory.

2.  **Start the Docker containers:**
    This command will build and start all the necessary services (database, API, storefront) in the background. The `-p` flag is crucial for isolating your environment.
    
    **Default (without Store Management):**
    ```bash
    # Use the project name that matches your username (e.g., ayala, racheli, sivan)
    docker-compose -f docker-compose.dev.yml -p ayala up --build -d
    ```
    
    **With Store Management (optional):**
    If you need the Store Management frontend, add the `--profile store-management` flag:
    ```bash
    docker-compose -f docker-compose.dev.yml -p ayala --profile store-management up --build -d
    ```
    
    **Note:** By default, the Store Management frontend is not started to save resources. Only start it when you specifically need to work on the management interface.

3.  **Monitor the logs (optional):**
    To see the output from all services and check for any errors:
    ```bash
    # Use the project name that matches your username
    docker-compose -f docker-compose.dev.yml -p ayala logs -f
    ```

## How to Stop Your Environment

To stop and remove all the containers for your environment:
```bash
# Use the project name that matches your username (e.g., ayala, racheli, sivan)
docker-compose -f docker-compose.dev.yml -p ayala down
```

**For each developer:**
```bash
# Ayala
docker-compose -f docker-compose.dev.yml -p ayala down

# Racheli
docker-compose -f docker-compose.dev.yml -p racheli down

# Sivan
docker-compose -f docker-compose.dev.yml -p sivan down
```

## Restarting with Fewer Resources

If you need to restart your environment with fewer resources (without Store Management):

```bash
# Stop your environment first
docker-compose -f docker-compose.dev.yml -p ayala down

# Start without Store Management (saves CPU and memory)
docker-compose -f docker-compose.dev.yml -p ayala up --build -d
```

This will start only: database, API, storefront, and nginx — excluding the store-management frontend to reduce resource usage.

## Accessing Your Application

Once the services are running, you can access your instance of the application through your web browser at the following URLs (replace `8081` with your assigned port):

-   **Storefront:** `http://<server-ip>:8081`
-   **Store Management:** `http://<server-ip>:8081/management` (only available if started with `--profile store-management`)

## Important Notes

-   **Isolation:** Each developer's environment is completely isolated. This includes the database, containers, and network. Changes in one environment will not affect the others.
-   **Environment Variables:** Port configurations are managed through the `.env` file in your project directory. Do not modify the `docker-compose.dev.yml` file directly unless all developers agree on the change.
-   **Database:** Each environment has its own PostgreSQL database and data volume.
-   **Optional Services:** The Store Management frontend (`store-management-frontend-dev`) is configured as an optional service and won't start by default. Use `--profile store-management` when you need it to reduce resource usage.

## Troubleshooting

If you encounter unexpected errors or services failing to start, it might be due to leftover, unused Docker objects. You can safely clean these up by running the following command.

**Warning:** This will remove all stopped containers, all dangling images, and all unused networks and build cache. It will not delete your database volumes.

```bash
docker system prune -f
```