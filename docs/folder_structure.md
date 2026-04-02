# PulseGrid – FINAL Folder Structure

---

## 1. Root Directory Structure

```bash
pulsegrid/
├── backend/
├── frontend/
├── agent/
├── docs/
├── docker/
├── scripts/
├── .env
├── docker-compose.yml
├── README.md
```

### Explanation

* **backend/** → FastAPI backend (core system)
* **frontend/** → React dashboard
* **agent/** → Metrics collector (runs on monitored machines)
* **docs/** → All design and architecture documents
* **docker/** → Dockerfiles
* **scripts/** → Utility scripts
* **.env** → Environment configuration
* **docker-compose.yml** → Service orchestration
* **README.md** → Project overview

---

## 2. Backend Structure (DETAILED)

```bash
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── metrics.py
│   │   │   ├── anomalies.py
│   │   │   ├── services.py
│   │   │   ├── health.py
│   │   │   └── ws.py
│   │   └── deps.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── logging.py
│   │   └── connection_manager.py
│   │
│   ├── models/
│   │   ├── metric.py
│   │   ├── anomaly.py
│   │   ├── service.py
│   │   └── alert.py
│   │
│   ├── schemas/
│   │   ├── metric.py
│   │   ├── anomaly.py
│   │   ├── service.py
│   │   └── alert.py
│   │
│   ├── services/
│   │   ├── metric_service.py
│   │   ├── anomaly_service.py
│   │   ├── alert_service.py
│   │   └── service_manager.py
│   │
│   ├── anomaly/
│   │   ├── engine.py
│   │   ├── detectors/
│   │   │   ├── base.py
│   │   │   ├── zscore.py
│   │   │   └── rolling_avg.py
│   │   └── utils.py
│   │
│   ├── telegram/
│   │   ├── bot.py
│   │   └── formatter.py
│   │
│   ├── workers/
│   │   ├── celery_app.py
│   │   ├── tasks.py
│   │   └── scheduler.py
│   │
│   ├── db/
│   │   ├── session.py
│   │   ├── base.py
│   │   ├── init_db.py
│   │   └── migrations/
│   │
│   ├── utils/
│   │   ├── time.py
│   │   └── helpers.py
│   │
│   └── main.py
│
├── tests/
│   ├── test_api.py
│   ├── test_services.py
│   ├── test_anomaly.py
│   └── conftest.py
│
├── requirements.txt
└── README.md
```

---

### Backend Folder Explanations

---

### api/

* Defines HTTP endpoints
* Organized by domain

**routes/**

* `metrics.py` → ingestion + fetch
* `anomalies.py` → anomaly queries
* `services.py` → service management
* `health.py` → health checks
* `ws.py` → (future) WebSocket endpoint

**deps.py**

* Shared dependencies (DB session, auth validation)

---

### core/

* Core infrastructure logic

**config.py**

* Loads environment variables

**security.py**

* API key validation logic

**logging.py**

* Structured logging setup

**connection_manager.py**

* Manages WebSocket connections (future use)

---

### models/

* SQLAlchemy models
* Direct mapping to database tables

---

### schemas/

* Pydantic schemas
* Request/response validation

---

### services/

* Business logic layer
* No direct HTTP or worker logic

**Responsibilities**

* Metric persistence
* Service resolution
* Data queries

---

### anomaly/

* Anomaly detection system

**engine.py**

* Main detection pipeline

**detectors/**

* `base.py` → abstract detector interface
* `zscore.py` → z-score implementation
* `rolling_avg.py` → rolling computations

---

### telegram/

* Telegram alert system

**bot.py**

* Telegram API calls

**formatter.py**

* Formats alert messages

---

### workers/

* Background processing (Celery)

**celery_app.py**

* Celery configuration

**tasks.py**

* Defines async jobs:

  * anomaly detection
  * alert sending
  * cleanup tasks

**scheduler.py**

* Periodic jobs (cleanup)

---

### db/

* Database layer

**session.py**

* Async DB session management

**base.py**

* Base model definition

**init_db.py**

* DB initialization

**migrations/**

* Alembic migration files

---

### utils/

* Shared helper utilities

---

### main.py

* FastAPI app entry point
* Registers routes and middleware

---

## 3. Frontend Structure (DETAILED)

```bash
frontend/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   ├── layout/
│   │   └── common/
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Services.jsx
│   │   └── Anomalies.jsx
│   │
│   ├── hooks/
│   │   ├── useMetrics.js
│   │   └── usePolling.js
│   │
│   ├── services/
│   │   ├── api.js
│   │   └── metricsService.js
│   │
│   ├── utils/
│   │   └── format.js
│   │
│   ├── assets/
│   │   └── styles/
│   │
│   └── App.jsx
│
├── public/
├── tests/
│   └── components.test.js
│
├── package.json
└── README.md
```

---

### Frontend Explanation

---

### components/

* Reusable UI blocks

* `charts/` → graph components

* `layout/` → navbar, sidebar

* `common/` → buttons, loaders

---

### pages/

* Route-level pages
* Each page = feature

---

### hooks/

* Encapsulate logic

* `useMetrics` → data fetching

* `usePolling` → polling logic

---

### services/

* API abstraction layer

* `api.js` → Axios instance

* `metricsService.js` → API calls

---

### utils/

* Formatting + helpers

---

## 4. Agent (Metrics Collector)

```bash
agent/
├── collector.py
├── config.py
├── utils.py
├── retry_queue.py
├── requirements.txt
```

---

### Responsibilities

* Collect system metrics
* Send to backend
* Retry failed requests

---

### Files

**collector.py**

* Main loop

**config.py**

* Endpoint + interval config

**retry_queue.py**

* In-memory retry mechanism

---

## 5. Telegram Module

### Location: `backend/app/telegram/`

### Reason

* Tight coupling with alert system
* Simpler architecture
* No need for separate service

---

## 6. Background Workers

```bash
backend/app/workers/
```

### Responsibilities

* Anomaly detection
* Alert dispatch
* Cleanup tasks

---

## 7. Database Layer

```bash
backend/app/db/
```

### Includes

* Async session management
* Base models
* Alembic migrations

---

## 8. Configuration Management

---

### .env Example

```bash
DATABASE_URL=
REDIS_URL=
API_KEY=
TELEGRAM_BOT_TOKEN=
```

---

### config.py

* Central config loader
* Used across backend

---

## 9. Docker & Deployment Files

```bash
docker/
├── backend.Dockerfile
├── frontend.Dockerfile
```

---

### docker-compose.yml Services

* backend
* worker
* postgres
* redis
* frontend

---

## 10. Scripts Directory

```bash
scripts/
├── setup.sh
├── run_dev.sh
└── cleanup.sh
```

---

### Purpose

* Setup environment
* Start development
* Maintenance tasks

---

## 11. Documentation Directory

```bash
docs/
├── architecture.md
├── data_flow.md
├── tech_stack.md
├── features.md
├── folder_structure.md
├── implementation_plan.md
├── api_spec.md
```

---

## 12. Testing Structure

---

### Backend

```bash
backend/tests/
```

* API tests
* Service tests
* Anomaly tests

---

### Frontend

```bash
frontend/tests/
```

* Component tests

---

## 13. Naming Conventions

---

### Backend

* Files: `snake_case`
* Classes: `PascalCase`

---

### Frontend

* Components: `PascalCase`
* Hooks: `useSomething`

---

### APIs

* `/api/v1/resource`

---

## 14. Import Strategy

---

### Use Absolute Imports

```python
from app.services.metric_service import save_metric
```

---

### Rules

* Avoid circular imports
* Keep layers independent

---

## 15. Scalability Considerations

---

* Add new modules under `services/`
* Extend detectors easily
* Scale workers independently
* DB optimized via indexing

---

## 16. Design Decisions & Trade-offs

---

### Why Modular Monolith

* Simpler than microservices
* Easier debugging

---

### Why This Structure

* Clear separation of concerns
* Direct mapping to architecture
* Easy to scale and extend

---

## Final Notes

* Clean, consistent, and production-ready
* Fully aligned with architecture and data flow
* No unnecessary complexity
* Ready for immediate development

---

**Reference Source:**  

---
