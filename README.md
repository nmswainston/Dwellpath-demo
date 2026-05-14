# Dwellpath Demo

A demo version of the Dwellpath residency management platform.

## Overview

Dwellpath is a property/residency management application. This demo build showcases the core features with a full-stack architecture — a Vite + React frontend, a Node.js backend, and a Drizzle ORM database layer — all in a single monorepo.

## Tech Stack

- TypeScript
- Vite
- Drizzle ORM
- Netlify (deployment)
- shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
client/      # Frontend Vite/React application
server/      # Backend API
shared/      # Shared types and utilities
docs/        # Project documentation
```

## Deployment

Configured for Netlify via `netlify.toml`. Database migrations managed by Drizzle (`drizzle.config.ts`).

## Related

- [`OG-Dwellpath`](https://github.com/nmswainston/OG-Dwellpath) — the original Dwellpath build

---

*Built by [nmswainston](https://github.com/nmswainston)*
