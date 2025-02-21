# IoT Pig Monitoring System

A comprehensive IoT-based monitoring system for tracking pig health and environmental conditions in real-time. This system helps farmers and veterinarians monitor pig health metrics, environmental conditions, and automate data collection for better livestock management.

## Features

- Real-time monitoring of:
  - Body Condition Score (BCS)
  - Posture Analysis
  - Environmental Temperature
  - Device Status
- Interactive dashboards with historical data visualization
- Automated alerts for critical conditions
- Device management system
- Detailed pig health records
- Group-based monitoring

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
git clone https://github.com/yourusername/iot-pig-monitoring.git
cd iot-pig-monitoring
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
MONGODB_URI=your_mongodb_connection_string
PORT=5000
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

## API Endpoints

- `/api/stats` - Get system statistics
- `/api/devices` - Device management
- `/api/pigs` - Pig data management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Team

- [Your Name] - Project Lead
- [Team Member 1] - Frontend Developer
- [Team Member 2] - Backend Developer
- [Team Member 3] - IoT Specialist

## Acknowledgments

- [Any third-party libraries or resources you want to acknowledge]
- [Any inspiration or reference projects]