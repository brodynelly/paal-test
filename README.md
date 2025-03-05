
PAAL Research Web Page
======================

Hello team,

Below you'll find the technical overview, setup instructions, and workflow guidelines for the PAAL Research Web Page project. This guide covers our full setup—including Docker, MongoDB replica set configuration, environment variable management, and our development workflow. With these instructions, you should be able to clone the repository from the `localDev` branch and run everything seamlessly.

Tech Stack
----------

### Frontend

*   Next.js 14
*   React
*   TailwindCSS
*   Recharts for data visualization
*   Radix UI for accessible components

### Backend

*   Node.js
*   Express
*   MongoDB (configured as a replica set for high availability & authentication)
*   Mongoose

Prerequisites
-------------

*   Node.js 18.x or higher
*   MongoDB (no need for a local install if using Docker)
*   npm or pnpm
*   Docker and Docker Compose

**Note:** This repository includes a Docker Compose setup for MongoDB configured as a replica set (even in a single-node setup) along with a key file for secure internal authentication. It also includes automation scripts for backing up and restoring the database across machines, ensuring consistency without exposing sensitive production data.

Getting Started
---------------

### 1\. Clone the Repository

    git clone https://github.com/brodynelly/paal-test.git
    cd paal-test

### 2\. Create and Switch to Your `localDev` Branch

    git checkout -b localDev

This command creates a new branch named `localDev` and switches you to it. All changes you make now will be isolated from the main branch.

### 3\. Set Up Environment Variables

Create a `.env` file in the root directory with the following content (adjust as needed):

    # MongoDB Initialization Variables
    MONGO_INITDB_ROOT_USERNAME=PAAL
    MONGO_INITDB_ROOT_PASSWORD=PAAL
    MONGO_INITDB_DATABASE=paalab
    
    # MongoDB Connection Settings
    DATABASE_HOST=mongo-c
    DATABASE_PORT=27017
    DATABASE_COLLECTION=paalab
    
    # Backend & Server Variables
    SERVER_HOST=server-c
    SERVER_PORT=5005
    PORT=5005
    
    # MongoDB Connection URI
    # MongoDB Connection URI
    MONGODB_URI=mongodb://PAAL:PAAL@mongo:27017/paalab?replicaSet=rs0&authSource=admin
    
    # Clerk Environment Variables (if applicable)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
    CLERK_SECRET_KEY=your_secret_key_here
    
    # Clerk URLs
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/overview
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/overview
    
    # API URL for React App
    REACT_APP_API_URL=http://backend:5005

Docker Compose automatically loads a file named `.env` from the root directory when you run `docker compose up`.

### 4\. Docker Compose Setup for MongoDB with Replica Set

Our Docker Compose file sets up MongoDB with a replica set (`rs0`) and internal authentication using a key file.

*   **Replica Set:** Even a single node runs as a replica set for future scalability.
*   **Key File:** The key file is mounted from `./database/sslkey/security.keyFile` into the container at `/etc/secrets/security.keyFile`.
*   **Authentication:** The `--auth` flag is enabled, and the admin user is automatically created from environment variables.

Snippet from `docker-compose.yml`:

    version: "3.8"
    services:
      mongo:
        image: mongo:latest
        container_name: ${DATABASE_HOST}
        restart: always
        env_file: .env
        environment:
          MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
          MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
          MONGO_INITDB_DATABASE: ${DATABASE_COLLECTION}
        ports:
          - ${DATABASE_PORT}:27017
        networks:
          - app-net
        volumes:
          - database-v:/data/db
          - ./database/sslkey/security.keyFile:/etc/secrets/security.keyFile:rw
        command: [ "mongod", "--replSet", "rs0", "--auth", "--keyFile", "/etc/secrets/security.keyFile" ]
    

After starting the container, connect to MongoDB and run the replica set initiation command (see below).

### 5\. Frontend and Backend Services

The backend service runs your Node.js/Express server, while the frontend uses Next.js. For development, we set up code mounts and use the Next.js development command to enable live reloading.

**Example Docker Compose entry for Frontend (development override):**

    services:
      frontend:
        build:
          context: .
          dockerfile: Dockerfile.frontend
        container_name: frontend
        environment:
          - NODE_ENV=development
        ports:
          - "3000:3000"
        volumes:
          - ./:/usr/src/app
          - /usr/src/app/node_modules
        command: ["npm", "run", "dev"]

You can use a separate override file (e.g., `docker-compose.override.yml`) to differentiate between production and development setups.

Running the Application
-----------------------

### 1\. Start the Docker Containers

    docker-compose up -d

### 2\. Initiate the MongoDB Replica Set

Once MongoDB is running, connect to it with authentication from the admin database:

    mongosh "mongodb://PAAL:PAAL@mongo:27017/admin?authSource=admin"

Then, initiate the replica set:

    rs.initiate({
      _id: "rs0",
      members: [
        { _id: 0, host: "mongo:27017" }
      ]
    })

Verify the configuration:

    rs.status()

### 3\. Seed the Database (Optional)

If you have an initial seed script to populate your database, run:

    npm run seed

### 4\. Start the Development Servers

Make sure your frontend is running on port `3000` and your backend on port `5005`. Access the frontend via `http://localhost:3000`.

### 5\. Verify Connectivity

*   **Test Application:** Run the application to ensure it connects to MongoDB correctly.
*   **Check Containers:** Use `docker ps` to verify that all containers are running.
*   **Logs:** For troubleshooting, view logs with:
    
        docker-compose logs mongo
    

Backup & Restore
----------------

### Backup Script Overview

We include an automated script (`backup_to_github.sh`) that runs `mongodump` inside the MongoDB container to export the database, archive it, and commit the backup to GitHub. This helps ensure that all developers work with the same data across local machines.

#### How to Use the Backup Script:

1.  Make the script executable:
    
        chmod +x backup_to_github.sh
    
2.  Run the script:
    
        ./backup_to_github.sh
    

### Restoring Backups

*   Pull the latest commit from the `localDev` branch.
*   If necessary, run `mongorestore` (or a provided script) to restore the database from the backup.

Project Structure
-----------------

    paal-test/
    ├── server/                   # Backend server files
    │   ├── models/               # MongoDB models
    │   ├── routes/               # API routes
    │   └── index.js              # Server entry point
    ├── src/                      # Frontend source code
    │   ├── app/                 # Next.js pages and routes
    │   ├── components/          # React components
    │   ├── lib/                 # Utility functions
    │   └── types/               # TypeScript type definitions
    ├── docker-compose.yml        # Docker Compose configuration
    ├── .env                      # Environment variables for Docker Compose
    ├── Dockerfile.frontend       # Dockerfile for frontend build
    ├── backup_to_github.sh       # Database backup automation script
    └── README.md                 # This file

How It All Works
----------------

*   **Docker & Environment Variables:** Docker Compose automatically loads your `.env` file to replace placeholders in the configuration. This ensures consistency across environments and makes it easy to adjust credentials, ports, and other settings.
*   **MongoDB Replica Set:** MongoDB is configured to run as a replica set even if it's a single node. A key file is mounted for secure inter-node authentication, and the container automatically creates a root user based on your `.env` variables. After container startup, you manually initiate the replica set using `rs.initiate()`.
*   **Development Workflow:** The frontend service is set up for development with live reloading by mounting your source code directory. The backend service connects to MongoDB using a connection string that includes the replica set and authentication parameters.
*   **Backup and Restore:** The backup script leverages MongoDB’s `mongodump` and `mongorestore` commands to maintain a consistent dataset across local machines, ensuring every developer works with the same data.
*   **Version Control:** Always commit your changes to your local development branch (`localDev`) and avoid pushing directly to `main` or the default branch.

Final Notes
-----------

With this setup, you should be able to:

*   Clone the repository.
*   Create and switch to your `localDev` branch.
*   Configure your environment using `.env`.
*   Launch MongoDB with a secure replica set configuration via Docker Compose.
*   Run both frontend and backend development servers with live reloading.
*   Use our backup script to maintain consistent database snapshots.

Happy coding!