# PulseGrid – FINAL Technology Stack

---

## 1. Tech Stack Overview

PulseGrid uses a **minimal, production-ready stack** optimized for:

* Fast development (solo developer)
* Reliable async processing
* Clean architecture
* Moderate scalability without complexity

### Philosophy

* **Keep it simple** → avoid unnecessary tools
* **Use proven technologies** → reduce risk
* **Async where it matters** → ingestion + workers
* **Defer complexity** → only add when needed

---

## 2. Backend Stack

---

### 2.1 Framework — FastAPI

* **Purpose:** API layer and request handling
* **Why chosen:**

  * Native async support
  * Automatic OpenAPI docs (`/docs`)
  * High performance
* **Alternatives:**

  * Flask → no native async
  * Django → too heavy for this system

---

### 2.2 Language — Python (3.11+)

* **Purpose:** Backend logic and anomaly processing
* **Why chosen:**

  * Excellent ecosystem (data + backend)
  * Fast development speed
* **Alternatives:**

  * Node.js → weaker for statistical processing
  * Go → less flexible for rapid iteration

---

### 2.3 API Layer — REST

* **Purpose:** Communication between frontend and backend
* **Why chosen:**

  * Simple and predictable
  * Auto-documented via FastAPI
* **Alternatives:**

  * GraphQL → unnecessary complexity

---

### 2.4 Background Processing — Celery

* **Purpose:** Async task execution (anomaly detection, alerts)
* **Why chosen:**

  * Reliable retry support
  * Mature ecosystem
* **Alternatives:**

  * RQ → simpler but less robust for retries/scheduling

---

### 2.5 Message Broker / Cache — Redis

* **Purpose:**

  * Celery broker
  * Alert deduplication (TTL keys)
  * Future pub/sub (WebSockets)

* **Why chosen:**

  * Fast, lightweight
  * Multi-purpose (queue + cache)

* **Alternatives:**

  * RabbitMQ → more complex
  * Memcached → no queue support

---

### 2.6 ORM / Database Access — SQLAlchemy (Async)

* **Purpose:** Database interaction

* **Why chosen:**

  * Mature ORM
  * Full control over queries
  * Async support

* **Driver:**

  * `asyncpg` (required for async PostgreSQL)

* **Alternatives:**

  * Django ORM → tied to Django
  * SQLModel → less mature

---

### 2.7 Validation — Pydantic (v2)

* **Purpose:** Input validation and schema enforcement

* **Why chosen:**

  * Native FastAPI integration
  * Strong typing + runtime validation

* **Alternatives:**

  * Marshmallow → more verbose

---

### 2.8 Logging — structlog + Python logging

* **Purpose:** Structured logging
* **Why chosen:**

  * JSON logs for production debugging
  * Easy integration with Python logging

---

### 2.9 Database Migrations — Alembic

* **Purpose:** Schema versioning and migrations
* **Why chosen:**

  * Standard for SQLAlchemy
  * Essential for production DB changes

---

### 2.10 Environment Management

* **python-dotenv** → load `.env` variables

---

## 3. Frontend Stack

---

### 3.1 Framework — React

* **Purpose:** Dashboard UI
* **Why chosen:**

  * Component-based architecture
  * Large ecosystem

---

### 3.2 Styling — Tailwind CSS

* **Purpose:** UI styling
* **Why chosen:**

  * Rapid UI development
  * No CSS file maintenance

---

### 3.3 Charts — Recharts

* **Purpose:** Data visualization
* **Why chosen:**

  * Native React integration
  * Easy to use for time-series charts

---

### 3.4 State Management — React Query

* **Purpose:** Server state management

* **Why chosen:**

  * Handles API caching, polling, refetching
  * Eliminates need for heavy state libraries

* **Note:** Zustand removed (not required for MVP)

---

### 3.5 API Communication — Axios

* **Purpose:** HTTP requests
* **Why chosen:**

  * Interceptors support
  * Cleaner API vs fetch

---

## 4. Database Layer

---

### 4.1 Primary Database — PostgreSQL

* **Purpose:** Store metrics, anomalies, services
* **Why chosen:**

  * ACID compliance
  * Strong indexing support
  * Handles relational data well

---

### Why NOT NoSQL

* Requires relationships (service → metrics → anomalies)
* Need structured queries and joins

---

### 4.2 Schema Considerations

* Composite index:

  * `(service_id, metric_name, timestamp DESC)`
* Time-based queries optimized
* No TimescaleDB (MVP simplicity)

---

## 5. Real-Time Layer

---

### MVP: Polling (Chosen)

* Frontend polls every 5 seconds
* Simple and reliable

---

### Future: WebSockets

* FastAPI WebSocket endpoints
* Redis Pub/Sub for cross-process events

---

## 6. AI / Anomaly Detection Stack

---

### Libraries

* **NumPy** → numerical computations

---

### Removed

* ❌ Pandas (unnecessary for MVP)
* ❌ Heavy ML frameworks

---

### Why Lightweight Approach

* Fast execution
* Easy debugging
* No infrastructure overhead

---

## 7. Telegram Integration

---

### Library — python-telegram-bot

* **Purpose:** Send alerts
* **Why chosen:**

  * Simple API
  * Reliable and well-documented

---

## 8. DevOps & Infrastructure

---

### 8.1 Containerization

* Docker → consistent environments
* Docker Compose → multi-service setup

---

### 8.2 Process Management

* Uvicorn → development server
* Gunicorn + Uvicorn workers → production

---

### 8.3 Version Control

* Git + GitHub

---

### 8.4 CI/CD

* GitHub Actions
* Runs:

  * tests
  * linting

---

## 9. Development Tooling

---

* **Editor:** VS Code
* **Linting:** Ruff
* **Formatting:** Black
* **Type Checking:** mypy (optional)

---

## 10. Testing Stack

---

* **pytest** → unit tests
* **httpx** → API tests

### Strategy

* Unit tests → anomaly logic
* API tests → endpoints
* Focus on ingestion + detection

---

## 11. Project Structure Alignment

---

This stack supports:

* Modular backend layers
* Clear separation (API, services, workers)
* Independent frontend development
* Easy extensibility

---

## 12. Performance Considerations

---

* Async FastAPI → high throughput
* Redis → fast queue + caching
* Indexed DB queries → efficient reads
* Background workers → offload CPU work

---

## 13. Security Stack

---

* API key authentication
* Pydantic validation
* Secure environment variables

---

## 14. Observability Stack

---

* Structured logging (JSON)
* Request ID tracing
* Worker logs

---

## 15. Alternative Stack Options (Brief)

---

### Node.js Alternative

* Express / NestJS
* Not chosen:

  * weaker data processing ecosystem

---

### Django Alternative

* Full-featured framework
* Not chosen:

  * unnecessary complexity

---

## 16. Final Stack Summary Table

| Layer             | Technology          | Purpose             |
| ----------------- | ------------------- | ------------------- |
| Backend Framework | FastAPI             | API + async backend |
| Language          | Python 3.11+        | Core logic          |
| Background Jobs   | Celery              | Async processing    |
| Broker/Cache      | Redis               | Queue + caching     |
| ORM               | SQLAlchemy (async)  | DB interaction      |
| DB Driver         | asyncpg             | Async PostgreSQL    |
| Validation        | Pydantic v2         | Data validation     |
| Migrations        | Alembic             | Schema management   |
| Frontend          | React               | UI dashboard        |
| Styling           | Tailwind CSS        | UI design           |
| Charts            | Recharts            | Visualization       |
| State             | React Query         | Data fetching       |
| HTTP Client       | Axios               | API calls           |
| Database          | PostgreSQL          | Persistent storage  |
| Realtime (MVP)    | Polling             | UI updates          |
| ML/Stats          | NumPy               | Anomaly detection   |
| Alerts            | python-telegram-bot | Notifications       |
| DevOps            | Docker              | Containerization    |
| CI/CD             | GitHub Actions      | Automation          |
| Testing           | pytest, httpx       | Quality assurance   |

---

## Final Notes

* Stack is minimal and production-ready
* All tools are justified and necessary
* No unnecessary dependencies
* Fully aligned with architecture and data flow

---

**Reference Source:**  

---
