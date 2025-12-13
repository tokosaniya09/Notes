# Notes SaaS (Enterprise Edition)

A production-grade, multi-tenant SaaS application designed for high performance, scalability, and a premium user experience.

## 🏗 Architecture

This project follows a monorepo structure separating concerns between the client and server:

### **Backend (`/backend`)**
*   **Framework**: NestJS (Node.js)
*   **Language**: TypeScript
*   **Database**: PostgreSQL (via Prisma ORM)
*   **Caching/PubSub**: Redis (ioredis)
*   **Authentication**: JWT & Google OAuth (Passport)
*   **AI Engine**: Google Gemini API
*   **Billing**: Stripe API
*   **Key Features**:
    *   Modular Domain-Driven Design
    *   Global Validation & Error Handling
    *   Structured JSON Logging (Winston)
    *   Real-time Collaboration Engine (Socket.io + Redis)

### **Frontend (`/frontend`)**
*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS + Shadcn UI
*   **State Management**: React Query (Server) + Zustand (Client)
*   **Real-time**: Socket.io Client
*   **Key Features**:
    *   Optimistic UI Updates
    *   AI Streaming Integration
    *   Live Cursor Tracking & Presence
    *   Dark Mode Support

---

## 🚀 Getting Started

### Prerequisites
*   Node.js v18+
*   PostgreSQL
*   Redis
*   Stripe Account
*   Google Cloud Project (for Gemini AI & OAuth)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Environment Configuration
# Create .env file based on the validation schema in src/common/config/env.validation.ts
# Required keys: DATABASE_URL, REDIS_URL, JWT_SECRET, API_KEY (Gemini), STRIPE_SECRET_KEY, etc.

# Run Database Migrations
npx prisma generate
npx prisma db push

# Start Server
npm run start:dev
```

The backend API will run on `http://localhost:3000`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Environment Configuration
# Create .env.local file
# NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...

# Start Development Server
npm run dev
```

The frontend will run on `http://localhost:3001` (or 3000 if backend is on a different port).

---

## 🛠 Features

### 📝 Collaborative Editor
Real-time operational transformation support allowing multiple users to edit notes simultaneously. Includes presence indicators and live cursor tracking.

### 🧠 AI Assistant
Integrated deeply into the editor. Features include:
*   **Summarization**: Convert long notes into paragraphs or bullet points.
*   **Rewriting**: Adjust tone, fix grammar, or concise text.
*   **Q&A**: Chat with your notes using context-aware AI.

### 💳 Subscription Billing
Complete billing lifecycle management:
*   Tiered Plans (Free, Pro, Team)
*   Stripe Checkout Integration
*   Customer Portal for plan management
*   Entitlement enforcement (Storage limits, AI quotas)

## 🤝 Contributing

Please ensure code passes all linting and type checks before submitting a PR.

```bash
# Backend
npm run lint
npm run format

# Frontend
npm run lint
```