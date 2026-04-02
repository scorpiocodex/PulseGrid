# 🚀 PulseGrid — Real-Time System Monitoring Dashboard

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/pulsegrid/pulsegrid)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue)](https://python.org)
[![React](https://img.shields.io/badge/react-18+-blue)](https://react.dev)

A lightweight, developer-friendly monitoring system that collects, processes, and visualizes real-time system metrics through a modern web dashboard.

## Why PulseGrid?

PulseGrid is designed as a lightweight alternative to complex monitoring systems like Prometheus and Grafana.

It focuses on:

- **Simplicity** over heavy configuration
- **Real-time visibility** for developers
- **Easy local setup** using Docker

## Quick Preview

- Live CPU, Memory, Disk metrics
- Real-time updating charts
- Offline detection with retry handling

## Features

- **Real-time Metrics**: CPU, Memory, and Disk usage tracking
- **Background Collector**: Automatic metric collection service
- **Fault-tolerant Frontend**: Offline detection with retry handling
- **Live Charts**: Smooth, updating visualizations with gradient fills
- **Status State Machine**: Live / Updating / Offline indicators
- **Docker Deployment**: Full containerized stack

## Use Cases

- Monitor local development environments
- Debug performance issues in applications
- Learn system monitoring concepts
- Lightweight alternative for small projects

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite
- **Database**: PostgreSQL
- **Cache**: Redis
- **Container**: Docker

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Collector │────▶│   FastAPI   │────▶│  PostgreSQL │     │   React     │
│   (Agent)   │     │   Backend   │     │   Database  │◀────│  Frontend   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Redis    │
                    │    Cache    │
                    └─────────────┘
```

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Running the Project

```bash
docker-compose up --build
```

### Access Points

| Service     | URL                  |
|-------------|----------------------|
| Frontend    | http://localhost:3000|
| Backend API | http://localhost:8000|
| API Docs    | http://localhost:8000/docs |

## Project Structure

```
pulsegrid/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/       # API endpoints
│   │   ├── core/      # Configuration
│   │   └── db/        # Database models
│   └── requirements.txt
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── agent/             # Metric collector
├── docker/            # Dockerfiles
└── docker-compose.yml
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/pulsegrid
REDIS_URL=redis://localhost:6379/0
TELEGRAM_TOKEN=      # Optional: for alerts
TELEGRAM_CHAT_ID=    # Optional: for alerts
```

## Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Roadmap

| Version | Description |
|---------|-------------|
| v1.0.0  | Core monitoring with real-time dashboard |
| v2.0.0  | Alerting and anomaly detection |
| v3.0.0  | Multi-service monitoring |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## License

MIT License - see [LICENSE](LICENSE)
