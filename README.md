# OrphanGuard AI - Surveillance & Care System

AI-powered surveillance and care management system designed for orphanage safety and child welfare.

## Features

- **Live Camera Monitoring** - Real-time camera feeds with AI person detection
- **Zone Monitoring** - Track headcounts across zones (dormitories, kitchen, garden, etc.)
- **Smart Alerts** - AI-generated alerts for unauthorized access, missing children, perimeter breach
- **Visitor Management** - Check-in/check-out with webcam photo capture and CNIC tracking
- **Children Registry** - Complete child profiles with health records
- **Health Tracking** - Vaccination records, checkups, medical history per child
- **Activity Log** - Real-time event tracking across the facility
- **WebSocket Updates** - Live dashboard updates without page refresh

## Tech Stack

- **Backend**: Node.js, Express, WebSocket
- **Database**: PostgreSQL
- **AI Detection**: TensorFlow.js / OpenCV (simulated in prototype)
- **Frontend**: Vanilla JS, CSS Grid, WebSocket client

## Setup

```bash
# Install dependencies
npm install

# Set up PostgreSQL database
createdb orphanage_ai

# Initialize database with tables and sample data
npm run init-db

# Start the server
npm start
```

Server runs on `http://localhost:3000`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://localhost:5432/orphanage_ai` | PostgreSQL connection string |
| `PORT` | `3000` | Server port |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Dashboard statistics |
| GET/POST | `/api/children` | Children CRUD |
| GET/POST | `/api/children/:id/health` | Health records |
| GET/POST | `/api/visitors` | Visitor management |
| PUT | `/api/visitors/:id/checkout` | Visitor checkout |
| GET | `/api/alerts` | Security alerts |
| PUT | `/api/alerts/:id/acknowledge` | Acknowledge alert |
| GET | `/api/activity` | Activity log |
| GET | `/api/zones` | Zone monitoring |
