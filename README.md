# PAAL Research Web Page

## Tech Stack

- **Frontend:**
  - Next.js 14
  - React
  - TailwindCSS
  - Recharts for data visualization
  - Radix UI for accessible components

- **Backend:**
  - Node.js
  - Express
  - MongoDB
  - Mongoose

## Prerequisites

- Node.js 18.x or higher
- MongoDB
- npm or pnpm

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/brodynelly/paal-test.git
cd paal-test.git
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
// ask me for .env variables, will not post publically 
```

4. Seed the database:
```bash
npm run seed
```

5. Start the development servers:
```bash
npm run dev
```

This will start both the frontend (port 3000) and backend (port 5000) servers concurrently.

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

