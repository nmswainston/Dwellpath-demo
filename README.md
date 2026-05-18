# Dwellpath Demo

A full-stack residency management platform — demo build.

## Problem

Property managers and residency programs rely on fragmented spreadsheets and manual processes to track applications, units, and residents. There's no affordable, purpose-built tool for this workflow.

## Solution

Dwellpath is a full-stack web app that centralizes the entire residency management process — from application intake to unit assignment — in one place. This demo showcases the core features with a real backend and database layer.


## Tech Stack

- TypeScript
- Vite
- Drizzle ORM
- Tailwind CSS
- shadcn/ui
- Netlify

## Features

- Resident application tracking and management
- Unit inventory and assignment
- Full-stack monorepo (client + server + shared types)
- Drizzle ORM for type-safe database access
- shadcn/ui component library

## Installation

```bash
npm install
```

Copy the environment file and fill in your database credentials:

```bash
cp .env.example .env
npm run dev
```

## Lessons Learned

- Full-stack monorepo architecture keeps shared types in sync between client and server
- Drizzle ORM provides excellent TypeScript ergonomics with minimal overhead
- Building a demo with real data models (not mocked) makes stakeholder conversations much more productive

## Future Improvements

- Real-time notifications for application status changes
- Document upload for applications
- Payment processing for deposits

## Related

- [`OG-Dwellpath`](https://github.com/nmswainston/OG-Dwellpath) — the original Dwellpath build

---

*Built by [nmswainston](https://github.com/nmswainston)*
