# Notes Frontend

A premium, fast, and scalable frontend architecture for the Notes application.

## 🏗 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI (Radix Primitives)
- **State Management**: 
  - `zustand` for client UI state (sidebar, modals).
  - `tanstack/react-query` for server state and caching.
- **Animations**: Framer Motion
- **Language**: TypeScript

## 📁 Folder Structure

```
/frontend
 ├── app/               # App Router pages and layouts
 ├── components/        # Shared React components
 │   ├── ui/            # Generic UI primitives (Buttons, Inputs) - shadcn style
 │   ├── layout/        # Layout specific components (Sidebars, Headers)
 │   └── motion/        # Animation wrappers
 ├── features/          # Domain-specific logic (e.g., /features/notes, /features/auth)
 ├── hooks/             # Custom React hooks
 ├── lib/               # Utilities and helper functions
 ├── store/             # Global Zustand stores
 └── styles/            # Global CSS and Tailwind directives
```

## 🎨 UX Philosophy

1.  **Immediacy**: Interactions should feel instant. We use optimistic updates and local state.
2.  **Calmness**: High whitespace, subtle borders (zinc-200/zinc-800), and fluid fade-ins.
3.  **Clarity**: Typography is prioritized using `Inter`.

## 🚀 Getting Started

```bash
cd frontend
npm install
npm run dev
```
