# Backend Migration Guide: TypeORM in Docker Development

This document details the process of creating and running TypeORM migrations for the backend API within the Docker development environment. It includes successful commands and troubleshooting steps for common issues encountered during development.

## 1. Understanding the Environment

The backend API runs in a Docker container (`magic_store_api_dev`) with source code mounted from the host. TypeORM CLI commands are executed inside this container. The database runs in a separate container (`magic_store_db_dev`).

Key tools involved:
- Docker Compose (`docker compose exec`)
- TypeORM CLI (`typeorm migration:generate`, `typeorm migration:run`, etc.)
- `ts-node` and `tsconfig-paths` (for running TypeScript files directly)
- `psql` (PostgreSQL command-line client, for direct database interaction)

## 2. Successful Commands

After troubleshooting various issues, the following commands have been found to work reliably for managing migrations in this environment:

### Generating a New Migration

To generate a new migration file based on detected schema changes (new entities, changes to existing entities):

```bash
docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm --dataSource data-source.ts migration:generate ./src/migrations/YourMigrationName
```

- `--workdir /usr/src/app/backend/api`: Sets the working directory inside the container to the backend API project root.
- `-e TS_NODE_PROJECT=tsconfig.json`: Tells `ts-node` to use the `tsconfig.json` file in the working directory for path resolution and compilation.
- `api`: The name of the backend API service in `docker-compose.dev.yml`.
- `/usr/src/app/node_modules/.bin/ts-node`: The absolute path to the `ts-node` executable inside the container.
- `-r tsconfig-paths/register`: Registers `tsconfig-paths` to enable resolving path aliases defined in `tsconfig.json` (like `src/`).
- `/usr/src/app/node_modules/.bin/typeorm`: The absolute path to the TypeORM CLI binary inside the container.
- `--dataSource data-source.ts`: Specifies the path to the TypeORM data source file (relative to the working directory).
- `migration:generate ./src/migrations/YourMigrationName`: The TypeORM command to generate a migration file at the specified path and name.

**Important:** After generating the migration, you must copy the generated file from inside the container to your host machine and set its ownership to your user to be able to edit it.

### Running Pending Migrations

To apply pending migrations to the database:

```bash
docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm --dataSource data-source.ts migration:run
```

This command uses the same setup as `migration:generate` but executes the `migration:run` command.

## 3. Troubleshooting Common Issues

During the migration process, several issues were encountered. Here's a breakdown of the problems and their solutions:

### Issue: `No changes in database schema were found - cannot generate a migration.`

**Cause:** TypeORM CLI did not detect any differences between the entities defined in the project and the current database schema. This can happen if:
1. New entities or schema changes were not added to the `entities` array in `data-source.ts`.
2. The `data-source.ts` file was not correctly read or compiled by the TypeORM CLI command.

**Solution:**
1. Ensure all new or modified entity files are correctly imported and included in the `entities` array within `backend/api/data-source.ts`.
2. Verify that the migration generation command is correctly configured to use the `data-source.ts` file (see successful command above).
3. If using `migration:generate` continues to fail, consider creating an empty migration manually using `migration:create` and adding the SQL yourself.

### Issue: `Unknown argument: d` or `Unknown argument: dataSource`

**Cause:** The TypeORM CLI command (`migration:create` in particular) was called with the `-d` or `--dataSource` flag when it was not expected or recognized in that context. This often happens when using an `npm run` script that hardcodes these flags for all TypeORM commands, or when directly executing `typeorm-ts-node-commonjs` which might handle flags differently for different commands.

**Solution:**
- When using `migration:create` directly with `ts-node` and the TypeORM CLI binary, omit the `--dataSource` flag. The command should look like:
  ```bash
  docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm migration:create ./src/migrations/YourMigrationName
  ```
- If using an `npm run` script that includes the `-d` or `--dataSource` flag, you may need to modify the script in `package.json` or bypass the script and execute the TypeORM CLI binary directly as shown in the successful commands.

### Issue: `Cannot find module '/usr/src/app/backend/api/dist/data-source.js'` or `Cannot find module '/usr/src/app/backend/api/src/data-source.ts'`

**Cause:** The Node.js runtime or `ts-node` within the container is unable to locate the specified data source file. This can be due to:
1. The file not existing at the specified path inside the container (e.g., build not run, volume not mounted correctly).
2. Path resolution issues within the container's environment or the tools being used (`ts-node`, TypeORM CLI).

**Solution:**
1. Ensure the backend project is built (`npm run build`) if the command relies on compiled JavaScript (`dist/data-source.js`).
2. Verify that the source code volume is correctly mounted in `docker-compose.dev.yml` (`.:/usr/src/app`).
3. Use the correct absolute or relative path to the data source file within the container's file system.
4. Ensure `ts-node` is correctly configured to resolve paths, especially path aliases defined in `tsconfig.json`. This requires including `-r tsconfig-paths/register` and setting the `TS_NODE_PROJECT` environment variable (see successful commands).

### Issue: Permission Denied (`EACCES`) when editing migration files on the host

**Cause:** Migration files generated inside the Docker container are often created with `root` ownership. When attempting to edit these files from the host machine with a different user, permission errors occur.

**Solution:** After copying a migration file from the container to the host, set the ownership of the file to your current user using `sudo chown $(whoami):$(whoami) path/to/migration.ts`.

### Issue: `relation "tablename" already exists` during `migration:run`

**Cause:** The migration attempts to create a table that already exists in the database. This happens when the database schema has been modified outside of the TypeORM migration process, or if migrations were partially applied.

**Solution:**
1. Identify which migrations have already been applied to the database schema (e.g., by inspecting the database schema or comparing it to migration files).
2. Manually insert records into the `migrations` table in the database for all migrations that have already been applied to the schema. This tells TypeORM to skip these migrations during `migration:run`. Use `docker exec CONTAINER_ID psql -d your_db -U your_user -c "INSERT INTO migrations (timestamp, name) VALUES (your_timestamp, 'YourMigrationName')"` for each applied migration.
3. Modify the `CREATE TABLE` statements in your migration files to include `IF NOT EXISTS`. This allows the migration to run without error even if the table already exists, which is useful in development environments or for idempotent migrations.

## 4. Workflow Summary

1. Create or modify entities in `backend/api/src/*/entities/`.
2. Update `backend/api/data-source.ts` to include any new entities in the `entities` array.
3. Generate a new migration file using the successful `migration:generate` command.
4. Copy the generated migration file from the container to the host using `docker cp`.
5. Set the ownership of the copied file on the host using `sudo chown`.
6. Edit the migration file on the host to add `IF NOT EXISTS` to `CREATE TABLE` statements and implement any custom SQL logic if needed.
7. If tables already exist in the database that correspond to migrations not recorded in the `migrations` table, manually insert records into the `migrations` table for those migrations using `psql` via `docker exec`.
8. Run the pending migrations using the successful `migration:run` command.
9. Verify the schema changes in the database.

By following this guide and using the provided commands, developers can effectively manage TypeORM migrations within this project's Docker development environment.
## 5. Step-by-Step Example: Creating and Running a New Migration (Command Sequence)

This example demonstrates the sequence of commands to create and run a new migration for a hypothetical `ExampleEntity`.

**Prerequisites:**
- You have created `backend/api/src/example/entities/example.entity.ts`.
- You have added `ExampleEntity` to the `entities` array in `backend/api/data-source.ts`.
- Your Docker containers are running (`docker compose up -d`).

**Step 1: Generate the migration file inside the container.**

```bash
docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm --dataSource data-source.ts migration:generate ./src/migrations/CreateExampleEntity
```

*Wait for the command to complete and note the generated filename (e.g., `174607XXXXXXX-CreateExampleEntity.ts`).*

**Step 2: Copy the generated migration file from the container to the host.**

Replace `CONTAINER_ID` with the current ID of the `magic_store_api_dev` container (get it using `docker ps`) and `TIMESTAMP` with the actual timestamp from the generated filename.

```bash
sudo docker cp CONTAINER_ID:/usr/src/app/backend/api/src/migrations/TIMESTAMP-CreateExampleEntity.ts ./backend/api/src/migrations/
```

*Wait for the command to complete.*

**Step 3: Set ownership of the copied file on the host.**

Replace `TIMESTAMP` with the actual timestamp.

```bash
sudo chown $(whoami):$(whoami) ./backend/api/src/migrations/TIMESTAMP-CreateExampleEntity.ts
```

*Wait for the command to complete.*

**Step 4: Edit the migration file on the host.**

Open `backend/api/src/migrations/TIMESTAMP-CreateExampleEntity.ts` in your editor. Add `IF NOT EXISTS` to the `CREATE TABLE` statement in the `up` method. Save the file.

**Step 5: Run the migration inside the container.**

```bash
docker compose exec --workdir /usr/src/app/backend/api -e TS_NODE_PROJECT=tsconfig.json api /usr/src/app/node_modules/.bin/ts-node -r tsconfig-paths/register /usr/src/app/node_modules/.bin/typeorm --dataSource data-source.ts migration:run
```

*Wait for the command to complete. The output should show the new migration being executed.*

**Step 6: Verify the schema changes in the database.**

Replace `CONTAINER_ID` with the current ID of the `magic_store_db_dev` container (get it using `docker ps`).

```bash
docker exec CONTAINER_ID psql -d magic_store_prod -U postgres -c "\dt"
```

*Check the output to confirm the new table exists.*

This sequence of commands covers the typical workflow for managing migrations in this project's development environment.