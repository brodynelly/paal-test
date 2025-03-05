
PAAL Research Web Page
======================

Hey,

This is the documentation for the local developemnt for the PAAL Web Page project. This is a short !read-me with general set-up instructions and workflow  guide for other developers to understand the project on a higher-level. This guide covers full setup—instructions, that anyone with little development knowledge can understand (hopefully). You will learn how to set up Docker, MongoDB running on replica sets, environment variable management, and our development workflow. With these instructions, you should be able to clone the repository from the `localDev` branch and run everything seamlessly.

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

    git clone --branch localDev --single-branch https://github.com/brodynelly/paal-test.git
    cd paal-test

### 2\. Create and Switch to Your Specified `localDev` Branch

    git checkout -b <user_name>localDev

This command creates a new branch named `localDev` and switches you to it. Remember to replace `<user_name>` with your own git username. All changes you make now will be isolated from the main branch.

### 3\. Set Up Environment Variables

Create a `.env` file in the root directory with the following content (adjust as needed):

    # MongoDB Initialization Variables
    MONGO_INITDB_ROOT_USERNAME=<username> 
    MONGO_INITDB_ROOT_PASSWORD=<password> 
    MONGO_INITDB_DATABASE=paalab
    
    # MongoDB Connection Settings
    DATABASE_HOST=mongo-c
    DATABASE_PORT=27017
    DATABASE_COLLECTION=paalab
    
    # Backend & Server Variables
    SERVER_HOST=server-c
    SERVER_PORT=5005
    PORT=3000
    
    # Clerk Environment Variables (if applicable)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here (reach out to me if need) 
    CLERK_SECRET_KEY=your_secret_key_here (reach out to me if need) 
    
    # Clerk URLs
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/overview
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/overview
    
    # API URL for React App
    REACT_APP_API_URL=http://server-c:5005

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
    

After starting the container, connect to MongoDB and run the replica set initiation command (see RUNNING THE APPLICATION SECTION).

### 5\. Frontend and Backend Services

The backend service runs the Node.js/Express server, the frontend service runs Next.js, and the Mongo service hosts the database. Each container operates in an isolated network environment. If you were to check your router, each Docker container would register as its own device. These containers communicate through a Docker network bridge, which provides a secure link between them. This setup is particularly useful in production, as it helps restrict communication gateways, reducing exposure to external threats and minimizing potential internal bugs.

Now, let's examine what makes our Docker environment function. Everything is defined as services within our docker-compose.yml file. Each service is started based on its Dockerfile, which provides specific instructions for launching the server. And each service is operated with our 'DockerFile' identifier for specific instructions to start our server. There are two sets of DockerFiles in the main directory of the project. one is for production and has the suffix `.production`, and the other is for development with the suffix `.development`. For now, we will focus on the development build, which uses the Next.js development command that enables live reloading!!

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

Once MongoDB is running, connect to it with authentication from the admin database (this is a seperate database from PAAL that sets the user Auth) :

    mongosh "mongodb://PAAL:PAAL@mongo:27017/admin?authSource=admin"

Then, initiate the replica set:

    rs.initiate({
      _id: "rs0",
      members: [
        { _id: 0, host: "mongo-c:27017" }
      ]
    })

Verify the configuration:

    rs.status()

### 3\. Seed the Database (Optional)

Now, when you first load the DB there will be no data. Lets populate it with some prop data, run:

    docker exec -it server-c /bin/bash
    npm run seed

*We first load into the Docker CLI to execute our seed command, because the connection to the database is over the docker-network*

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

*    TODO:
*        I will bind the docker `mongodb` image to a volume with backup data stored in this github repo for percistant data flow. 

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

*   **Docker & Environment Variables:** Docker Compose automatically loads your `.env` file to replace placeholders in the configuration. This ensures consistency across environments and levels of production. Simply by changing our env variables, we can have a production build in less than a week. This also makes it easy to adjust credentials, ports, and other settings.
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
