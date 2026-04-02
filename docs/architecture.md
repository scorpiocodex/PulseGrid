# PulseGrid – FINAL Architecture

---

## 1. System Overview

PulseGrid is a **modular monolith monitoring system** that ingests system metrics, detects anomalies using statistical methods, and delivers alerts via Telegram while providing a dashboard for visualization.

### Core Goals

* Reliable metric ingestion
* Accurate anomaly detection (z-score based)
* Real-time or near-real-time visibility
* Simple deployment for a solo developer

### Design Principles

* **Minimal complexity** (no distributed systems overhead)
* **Async where needed** (ingestion + background tasks)
* **Clear separation of concerns**
* **Production-ready but lightweight**

---

## 2. Architecture Style

### Modular Monolith

* Single deployable backend
* Internally modular (API, services, anomaly, workers)
* Avoids microservice overhead

---

### Execution Model

| Flow Type               | Usage                        |
| ----------------------- | ---------------------------- |
| Request-response        | API interactions             |
| Async tasks             | Anomaly detection + alerting |
| Event-driven (internal) | Worker-triggered pipelines   |

---

### Async Strategy

* FastAPI handles ingestion asynchronously
* Celery workers handle processing
* Redis used as broker + lightweight event bus

---

## 3. High-Level Architecture

### Components

#### 1. Agent (Metrics Collector)

* Collects CPU, memory, disk metrics
* Sends data to backend via HTTP

#### 2. Backend (FastAPI)

* Handles ingestion, queries, authentication
* Dispatches background jobs

#### 3. PostgreSQL

* Stores metrics, anomalies, services, alerts

#### 4. Redis

* Celery broker
* Alert deduplication store
* Pub/Sub for real-time updates

#### 5. Workers (Celery)

* Perform anomaly detection
* Trigger alerts
* Publish events

#### 6. Telegram Module

* Sends alerts using Bot API

#### 7. Frontend (React)

* Displays metrics and anomalies
* Uses polling (MVP) + optional WebSocket (future)

---

## 4. Component-Level Design

---

### 4.1 Backend (FastAPI)

#### Layers

#### **API Layer**

* Defines endpoints
* Handles authentication
* Validates input (Pydantic)

#### **Service Layer**

* Handles business logic
* Coordinates DB + workers

#### **Data Access Layer**

* SQLAlchemy ORM
* Async sessions

---

#### Key Modules

* `metrics_api` → ingestion + fetch
* `anomaly_api` → anomaly queries
* `service_api` → service management
* `auth` → API key validation

---

### 4.2 Anomaly Detection Engine

#### Pipeline

1. Fetch last N values (window)
2. Validate minimum data
3. Compute mean + std deviation
4. Compute z-score
5. Return result

#### Rule

```python
if len(values) < MIN_WINDOW:
    return no_anomaly

z = (current - mean) / std
if abs(z) > threshold:
    anomaly
```

#### Output

```json
{
  "is_anomaly": true,
  "z_score": 3.2,
  "mean": 45.0,
  "std_dev": 10.0
}
```

---

### 4.3 Metrics Ingestion System

#### Flow

* POST `/api/v1/metrics`
* Validate → store → enqueue job

#### Service Upsert

* Unique constraint on `services.name`
* Use `INSERT ... ON CONFLICT DO NOTHING`

---

### 4.4 Background Workers (Celery)

#### Responsibilities

* Anomaly detection
* Alert dispatch
* Cleanup jobs

#### Task Flow

```text
API → Redis (Celery queue) → Worker → Detection → Alert
```

---

### 4.5 Alert System (Telegram)

#### **Flow**

1. Worker detects anomaly
2. Check dedup lock (Redis)
3. Format message
4. Send alert

#### Deduplication

```python
key = f"alert:{service}:{metric}"
if redis.exists(key):
    skip
redis.setex(key, cooldown, 1)
```

---

### 4.6 Real-Time Layer (SIMPLIFIED)

#### MVP Decision: Polling

* Frontend polls every 5 seconds
* Avoids WebSocket complexity

#### Future (Optional)

* Redis Pub/Sub → FastAPI → WebSocket clients

---

### 4.7 Authentication

#### Strategy: API Key (MVP)

* Static API key stored in `.env`
* Sent via header:

```http
Authorization: Bearer <API_KEY>
```

* Validated via FastAPI dependency

---

## 5. Data Flow (Aligned Summary)

1. Agent collects metric
2. Sends HTTP request
3. Backend validates request
4. Metric stored in PostgreSQL
5. Celery job enqueued
6. Worker processes metric
7. Anomaly detected (if applicable)
8. Anomaly stored
9. Alert sent (if needed)
10. Frontend fetches updated data

---

## 6. Database Design (FINAL)

### services

* id (PK)
* name (UNIQUE)
* host
* created_at
* last_seen

---

### metrics

* id (PK)
* service_id (FK)
* metric_name
* value
* timestamp

INDEX:

* (service_id, metric_name, timestamp DESC)

---

### anomalies

* id (PK)
* metric_id (FK)
* service_id (denormalized)
* z_score
* severity
* detected_at

INDEX:

* (service_id, detected_at)

---

### alerts

* id (PK)
* anomaly_id (FK)
* status
* sent_at

---

## 7. Scalability Considerations

* Multiple agents supported naturally
* Worker processes scalable horizontally
* DB optimized via indexes

---

## 8. Reliability & Fault Tolerance

### Handling Failures

| Failure          | Handling                      |
| ---------------- | ----------------------------- |
| API failure      | Agent retry (in-memory queue) |
| Redis failure    | Log + retry enqueue           |
| Worker crash     | Tasks remain in queue         |
| Telegram failure | Retry + log                   |

---

## 9. Security

* API key authentication
* Input validation (Pydantic)
* No sensitive data in logs
* HTTPS required in production

---

## 10. Logging & Observability

* Structured logging (JSON)
* Request IDs for tracing
* Worker logs separated

---

## 11. Configuration

Environment variables:

```env
DATABASE_URL=
REDIS_URL=
API_KEY=
TELEGRAM_BOT_TOKEN=
```

---

## 12. Deployment Architecture

### Docker Services

* backend (FastAPI)
* worker (Celery)
* postgres
* redis
* frontend

---

## 13. Design Decisions & Trade-offs

### Why Modular Monolith

* Simpler deployment
* Faster development
* Easier debugging

---

### Why Polling over WebSockets (MVP)

* Avoid cross-process complexity
* Reliable and simple
* Good enough latency

---

### Why Simple Statistics

* Fast
* Explainable
* No ML overhead

---

## 14. Final Notes

This architecture is:

* Fully consistent across system design
* Implementable by a solo developer
* Production-ready for small-to-medium scale
* Designed for iterative improvement
