# PAAL Research Web Page

Hello team,  
Below you'll find the technical overview, setup instructions, and our workflow guidelines for the PAAL Research Web Page project. Let's ensure we maintain consistency across our development environments.

---

## Tech Stack

**Frontend:**

- Next.js 14
- React
- TailwindCSS
- Recharts for data visualization
- Radix UI for accessible components

**Backend:**

- Node.js
- Express
- MongoDB
- Mongoose

---

## Prerequisites

- Node.js 18.x or higher
- MongoDB
- npm or pnpm
- Docker

> **Note:**  
> This repository includes a Docker Compose setup for MongoDB along with an automation script for backing up and restoring the database across machines. This helps ensure that we are all working with the same data without any sensitive production info.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/brodynelly/paal-test.git
cd paal-test
```

### 2. Create Your localDev Branch
```bash
git checkout -b LocalDev
```
This command creates a new branch named LocalDev and switches you to it. All changes you make now will be isolated from the main branch.


### 3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```env
MONGO_URI=mongodb://localhost:27017/mongodb_test
```

### 4. Start Mongo Db for Local Development 
to run MongoDB locally using docker, execute: 
```
docker-compose up -d mongodb
```
This command runs MongoDB in the background, mapping port 27017 on your container to port 27017 on your host.

### 4. Seed the database (optional):
Populate thedatabase with inital data by running: 
```bash
npm run seed
```

### 5. Start the development servers:
start the development server: Frontend( port: 3000 ), Backend( port: 5000 )
```bash
npm run test
```

### 6. When you push your work, make sure to not be working in main./default 
Commit your code to local branch 
```
git add <features/files-added>
git commit -m "Added some really cool feature "
```

### 7. Verification

    Test Connectivity: Run your application and check that it connects successfully to MongoDB.
    Inspect Containers: Use docker ps to verify that the MongoDB container is running.
    Logs: If needed, check logs with docker-compose logs mongodb for any issues.

This will start both the frontend (port 3000) and backend (port 5000) servers concurrently.

## RUNNING the Database 

### Starting the MongoDB Container 
Run the Container:

```
docker-compose up -d
```

### Backup Script Overview

With the container running, the (backup_to_github.sh) can execute `mongodump` inside `mongo_container` to export the data, archive it, and then commit it to the github repo. `instructions are down below`

## Backing up the Database 
We are using an automated scripted called `backup_to_github.sh` that is running on the linux machine to create a dump of the mongodb database, so every developer can work with the same data across any local machine. 

### 1. How to Use the backup_to_github Script:
Run:
```
chmod +x backup_to_github.sh
./backup_to_github.sh
```

### 2. Restoring Backups:
On any machine, you can simply pull the latest commit from the LocalDev branch and run a restore process using mongorestore if needed.

## Project Structure

```
├── server/             # Backend server files
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   └── index.js       # Server entry point
├── src/
│   ├── app/          # Next.js pages and routes
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   └── types/        # TypeScript type definitions
```

