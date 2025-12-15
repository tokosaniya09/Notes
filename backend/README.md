# Notes Backend

This repository contains the backend infrastructure for a production-grade, multi-tenant SaaS application.

## 📂 Folder Structure Explanation

We adhere to a modular, domain-driven structure to ensure scalability and maintainability.

```
/backend
 ├── src
 │   ├── common/         # Shared utilities, filters, guards, and interceptors used across all modules.
 │   │   ├── config/     # Environment variable validation ensures the app never starts with missing config.
 │   │   ├── logger/     # Centralized structured logging (Winston) for observability in CloudWatch/Datadog.
 │   │   ├── filters/    # Global exception filters to standardize error responses for the frontend.
 │   ├── database/       # The Database Layer. Separated to allow replacing the ORM or DB strategy without touching business logic.
 │   ├── redis/          # The Caching/Queue Layer. Encapsulated to manage connections efficiently.
 │   ├── health/         # System endpoints for load balancers (AWS ALB / K8s probes).
 │   ├── main.ts         # Entry point. Configures global pipes (validation) and middleware.
 │   └── app.module.ts   # The root module wiring everything together.
```

## 🚀 How this Scales for a Real SaaS

### 1. **Modular Architecture (Feature Isolation)**
   - Each domain (e.g., Auth, Notes, Billing) will eventually have its own Module.
   - This prevents "spaghetti code" and allows different teams to work on different modules without conflicts.
   - **Future Proofing:** If a module becomes too heavy, it can be easily extracted into a separate microservice because dependencies are injected, not hardcoded.

### 2. **Global Validation Pipeline**
   - We utilize `ValidationPipe` globally with `whitelist: true`.
   - **Why:** This automatically sanitizes incoming requests, preventing malicious users from injecting unwanted fields into our database (Mass Assignment vulnerability protection).

### 3. **Centralized Configuration & Type Safety**
   - We use `@nestjs/config` with `Joi` validation.
   - **Why:** The app will crash immediately on startup if `DATABASE_URL` or `REDIS_URL` is missing. This prevents runtime errors in production that are hard to debug.

### 4. **Structured Logging (Winston)**
   - **Why:** `console.log` is not enough for high-scale apps. We output JSON logs.
   - This allows log aggregators (like Datadog, Splunk, or CloudWatch) to parse, index, and alert on errors automatically.

### 5. **Database Connection Pooling**
   - The `DatabaseModule` is `@Global()`.
   - **Why:** This ensures we maintain a single instance of `PrismaClient` across the application, managing the connection pool efficiently to prevent exhausting database connections under load.

### 6. **Redis Ready**
   - We integrated `ioredis` in a separate module.
   - **Why:** Required for future features like Queue management (BullMQ), session storage, or real-time WebSocket adapters (for the collaboration feature).

## 🛠 Usage

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the `backend` root:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL="postgresql://user:password@localhost:5432/notes_db"
   REDIS_URL="redis://localhost:6379"
   ```

3. **Run Development:**
   ```bash
   npm run start:dev
   ```
