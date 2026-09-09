# LankaCare

Sri Lanka National Digital Health & Hospital Access Platform.

## Phase 1 foundation

This repository is intentionally split into two deployable applications:

- `frontend/` — Next.js citizen and operations experience.
- `backend/` — Express REST API boundary, ready for MongoDB/Mongoose modules.

## Local development

1. Install Node.js 20+ and Docker.
2. Copy `backend/.env.example` to `backend/.env`.
3. Run `npm install`.
4. Run `docker compose up -d mongodb`.
5. Run `npm run dev`.

The web app is available at `http://localhost:3000` and the API health endpoint at `http://localhost:4000/health`.

## Delivery principles

Production data must come from verified Ministry, hospital, or approved integration sources. Demo content in the dashboard is clearly labelled and must not be treated as live clinical information.
