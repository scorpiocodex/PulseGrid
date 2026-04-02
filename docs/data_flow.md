# PulseGrid – FINAL Data Flow

---

## 1. Data Flow Overview

PulseGrid follows a **deterministic, async-enabled pipeline**:

### **Ingestion → Storage → Processing → Detection → Alerting → Visualization**

### Key Characteristics

* Write-heavy ingestion (frequent metric writes)
* Async processing via Celery
* Event-triggered alerting
* Read-optimized dashboard queries
* Polling-based frontend (MVP)

---

## 2. Core Data Flow Pipeline (CRITICAL SECTION)

---

### Step 1: Metrics Collection (Agent)

#### Data Collected

* CPU usage (%)
* Memory usage (%)
* Disk usage (%)
* Optional custom metrics

#### Format

```json
{
  "service": "api-server",
  "metric": "cpu",
  "value": 72.5,
  "timestamp": "2026-03-31T12:30:00Z"
}
```

#### Frequency

* Default: every 5 seconds
* Configurable via agent config

---

### Step 2: Data Transmission

#### Protocol

* HTTP POST

#### Endpoint

```http
POST /api/v1/metrics
```

#### Headers

```http
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

#### Retry Logic (Agent)

* In-memory retry queue
* Retry up to N times (configurable)
* Drop only after max retries

---

### Step 3: API Ingestion (FastAPI)

#### Flow

1. Request received
2. API key validated
3. Payload validated (Pydantic)
4. Forward to service layer

#### Validation Rules

* `service`: required string
* `metric`: required string
* `value`: float
* `timestamp`: ISO8601

#### Error Handling

* 400 → invalid payload
* 401 → invalid API key
* 500 → internal failure

---

### Step 4: Data Storage

#### Process

1. **Upsert service:**

   * UNIQUE constraint on `services.name`
   * `INSERT ... ON CONFLICT DO NOTHING`

2. **Insert metric into DB**

  ```sql
  INSERT INTO metrics (service_id, metric_name, value, timestamp)
  VALUES (...)
  ```

1. **Update service heartbeat:**

  ```sql
  UPDATE services SET last_seen = NOW()
  ```

#### Preprocessing

* Normalize metric name (lowercase)
* Ensure UTC timestamps

---

### Step 5: Processing Trigger

#### Mechanism

* After successful insert:

  * Enqueue Celery task

```python
detect_anomaly.delay(metric_id)
```

#### Failure Handling

* If Redis unavailable:

  * Log failure
  * Metric marked “unprocessed”

---

### Step 6: Anomaly Detection Engine

#### Data Retrieval

```sql
SELECT value FROM metrics
WHERE service_id = ?
AND metric_name = ?
ORDER BY timestamp DESC
LIMIT N
```

#### Processing Logic

```python
if len(values) < MIN_WINDOW:
    return no_anomaly
```

```python
mean = np.mean(values)
std = np.std(values)

z = (current - mean) / std
```

#### Output

```json
{
  "is_anomaly": true,
  "z_score": 3.1,
  "mean": 45.0,
  "std_dev": 10.0
}
```

---

### Step 7: Anomaly Handling

#### If anomaly detected

1. Insert into anomalies table

```json
{
  "metric_id": 123,
  "service_id": 1,
  "z_score": 3.1,
  "severity": "high",
  "detected_at": "timestamp"
}
```

1. Trigger alert task

---

### Step 8: Alert Triggering

#### Conditions

* `abs(z_score) > threshold`
* Dedup lock not active

#### Deduplication (Redis TTL)

```python
key = f"alert:{service_id}:{metric_name}"

if redis.exists(key):
    skip_alert

redis.setex(key, COOLDOWN_SECONDS, 1)
```

---

### Step 9: Telegram Notification

#### Message Format

```bash
⚠️ Anomaly Detected

Service: api-server
Metric: CPU
Value: 92%

Mean: 45%
Deviation: +3.1σ
Time: 2026-03-31 12:30 UTC
```

#### Delivery

* Sent via Telegram Bot API

#### **Failure Handling**

* Retry (3 attempts)
* Log status in `alerts` table

---

### Step 10: Frontend Visualization

#### Data Fetching

* REST endpoints:

```bash
GET /api/v1/metrics
GET /api/v1/anomalies
```

#### Update Strategy (MVP)

* Poll every 5 seconds

#### Behavior

* Fetch latest data
* Render charts
* Highlight anomalies

---

## 3. Data Flow Variants (IMPORTANT)

---

### 3.1 Normal Flow

* Metric received
* Stored in DB
* Processed
* No anomaly → no alert
* Visible in dashboard

---

### 3.2 Anomaly Flow

* Metric deviates significantly
* Anomaly created
* Alert triggered
* Telegram notification sent
* Dashboard shows anomaly marker

---

### 3.3 High Load Scenario

#### Situation

* Many agents sending metrics

#### **Behavior**

* API handles async ingestion
* Redis queue grows
* Workers process backlog

#### Mitigation

* Increase worker count
* Optimize DB indexing

---

### 3.4 Failure Scenarios

#### API Failure

* Agent retries (in-memory queue)

---

#### DB Failure

* API returns 500
* Agent retries

---

#### Redis Failure

* Job enqueue fails
* Metric stored but not processed
* Logged for recovery

---

#### Worker Failure

* Jobs remain in Redis queue
* Worker resumes after restart

---

#### Telegram Failure

* Retry attempts
* Mark alert as failed

---

## 4. Data Models in Flow Context

### Metric

* Entry point of system
* Stored immediately after ingestion

---

### Service

* Logical grouping
* Tracks `last_seen` heartbeat

---

### Anomaly

* Derived from metric
* Stored after detection

---

### Alert

* Final output
* Linked to anomaly

---

### Relationships

* Service → Metrics (1:N)
* Metric → Anomaly (1:N)
* Anomaly → Alert (1:1)

---

## 5. Real-Time Data Flow

### MVP Decision: Polling

* Frontend polls API every 5 seconds

---

### Future (WebSocket Flow)

```bash
Worker → Redis Pub/Sub → Backend → WebSocket → Frontend
```

* Worker publishes anomaly event
* Backend pushes to clients

---

## 6. Background Processing Flow

### Queue Flow

```bash
API → Redis (Celery) → Worker → Detection → Alert
```

### Tasks

* `detect_anomaly(metric_id)`
* `send_alert(anomaly_id)`
* `cleanup_old_metrics()`

---

## 7. Data Validation Flow

### API Level

* Pydantic schema validation

### Sanitization

* Normalize values
* Reject invalid types

### Error Response

```json
{
  "error": "Invalid input"
}
```

---

## 8. Data Transformation & Processing

### **Preprocessing**

* Normalize metric names
* Convert timestamps to UTC

---

### Window Handling

* Sliding window of last N values
* Default: N = 50

---

### Edge Handling

* Skip detection if insufficient data
* Prevent divide-by-zero in std dev

---

## 9. Data Retention Strategy

### Metrics

* Retain for 7–30 days

---

### Cleanup

* Daily scheduled Celery task:

```python
delete metrics older than retention window
```

---

## 10. Sequence Diagrams (TEXT-BASED)

---

### 10.1 Metric Ingestion Flow

```bash
Agent → API → Auth → Validation → DB → Celery Queue → Worker → Detection → Anomaly → Alert
```

---

### 10.2 Anomaly Alert Flow

```bash
Detection → Anomaly Record → Dedup Check → Telegram API → User
```

---

## 11. Performance Considerations

* Async ingestion improves throughput
* Indexed queries optimize reads
* Background workers prevent blocking
* Redis ensures fast task handling

---

## 12. Bottlenecks & Mitigation

### Bottlenecks

* DB write load
* Worker queue backlog
* Telegram rate limits

---

### **Mitigation**

* Scale workers
* Optimize DB indexes
* Alert deduplication
* Retry logic

---

## 13. Design Decisions & Trade-offs

### Why Async Workers

* Keeps API responsive
* Handles spikes effectively

---

### Why NOT Kafka

* Overkill for system size
* High operational complexity

---

### Why Polling (MVP)

* Simpler than WebSockets
* Reliable
* Good enough latency

---

## Final Notes

* Fully consistent with architecture
* Covers all edge cases
* Ready for direct implementation
* Optimized for a solo developer
