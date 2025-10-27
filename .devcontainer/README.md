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
    This command will build and start all the necessary services (database, API, frontends) in the background. The `-p` flag is crucial for isolating your environment.
    ```bash
    # Use the project name that matches your username (e.g., ayala, racheli, sivan)
    docker-compose -f docker-compose.dev.yml -p ayala up --build -d
    ```

3.  **Monitor the logs (optional):**
    To see the output from all services and check for any errors:
    ```bash
    # Use the project name that matches your username
    docker-compose -f docker-compose.dev.yml -p ayala logs -f
    ```

## How to Stop Your Environment

To stop and remove all the containers for your environment:
```bash
# Make sure you are in your project directory (e.g., /home/ubuntu/dev1)
docker-compose -f docker-compose.dev.yml down
```

## Accessing Your Application

Once the services are running, you can access your instance of the application through your web browser at the following URLs (replace `8081` with your assigned port):

-   **Storefront:** `http://<server-ip>:8081`
-   **Store Management:** `http://<server-ip>:8081/management`

## Important Notes

-   **Isolation:** Each developer's environment is completely isolated. This includes the database, containers, and network. Changes in one environment will not affect the others.
-   **Environment Variables:** Port configurations are managed through the `.env` file in your project directory. Do not modify the `docker-compose.dev.yml` file directly unless all developers agree on the change.
-   **Database:** Each environment has its own PostgreSQL database and data volume.

## Troubleshooting

If you encounter unexpected errors or services failing to start, it might be due to leftover, unused Docker objects. You can safely clean these up by running the following command.

**Warning:** This will remove all stopped containers, all dangling images, and all unused networks and build cache. It will not delete your database volumes.

```bash
docker system prune -f
```