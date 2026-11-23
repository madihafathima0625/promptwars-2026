# LabLink

Campus lab equipment sharing with fair, explainable allocation.

**Live demo:** https://lablink-two-olive.vercel.app

## Problem
Shared lab equipment is booked first-come-first-served, so urgent and early-stage projects lose out and nobody can see why a request was decided the way it was.

## What makes it different
A deterministic allocation engine (`src/engine`, pure functions) scores competing requests out of 100:
urgency 35, project stage 20, fairness 30, reliability 15. It applies hard constraints, breaks ties deterministically, suggests alternatives and writes a plain-language explanation. No AI model decides anything, so every decision can be reproduced and audited.

## Features
- Discover equipment with search and filters
- Request form with validation
- "Why this decision?" panel showing factor scores, rank, explanation and alternatives
- Admin allocation desk: load a demo conflict, see ranked contenders, approve or reject with a recorded override reason, capacity blocking, audit trail

## Demo mode and limits (please read)
- Sign-in is a **persona picker** (Asha, Ravi: students; Dr. Rao: admin). There are no passwords.
- Roles are **UI-only**. They are not security boundaries.
- Data is stored in the browser's `localStorage` plus seed data. There is no backend or database, and data is not shared between users.
- Use "Reset demo data" to restore the seed data.

## Tech
React 19, Vite 8, react-router-dom 7, plain CSS, Vitest. No external fonts or images.

## Run and test
```bash
npm install
npm run dev
npm test
npm run build
```

## Structure
- `src/engine`: pure scoring and allocation logic
- `src/data`: seed data, store, validation, decisions
- `src/components`, `src/pages`: UI

## Deployment
Deployed on Vercel (SPA rewrite and security headers in `vercel.json`).
