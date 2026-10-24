# PLAN-Z — Event Management & Ticketing Platform

A **collaborative** full-stack event management application built with MongoDB, Express.js, React, and Node.js.

## Features
- JWT login and role-based attendee, organizer, and administrator dashboards
- Event browsing, search, approval, and booking history
- Multiple ticket types and digital ticket generation
- Merchandise and cart flows, complaints and administration
- Mock payment workflow (**not a production payment gateway**)

## Structure

```text
client/     React + Vite frontend
server/     Express API, MongoDB models, controllers and routes
test_booking.js     Development booking test
```

## Local setup

Install dependencies by running `npm install` inside **both** `client/` and `server/`. Create an untracked `server/.env` with:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/planz
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
```

Run `npm run dev` in `server/` and `client/`. The frontend uses `VITE_API_URL` from `client/.env` (defaults to `http://localhost:5000/api` for local development). Copy the sample environment files from `client/.env.example` and `server/.env.example` before starting.

## Important notes

- This portfolio upload excludes `node_modules` and locally generated files. Install packages as described above.
- The missing historical `hero.png` asset is not currently referenced by the checked-in frontend source. A clean production build is still required to confirm readiness.
- Do not use development fallback JWT secrets in production.
- Payment functionality is mocked.

## Free live demo deployment (in progress)

**[Render + Atlas deployment guide](DEPLOYMENT.md)** — instructions for the free MongoDB Atlas database, Render Express API, and Render React static site. The `portfolio-render-deploy` branch contains preliminary hosting fixes and has **not yet** passed a complete live end-to-end test. No Live Demo URL is claimed until the frontend, database, signup, organizer approval, booking, and mock payment flows are verified.

## Credit and provenance

This is a **team university project**, not solely authored by the portfolio owner. The original team repository and its commit history are here: [tashriquetanvir-commits/Git-project](https://github.com/tashriquetanvir-commits/Git-project). All original contributors deserve appropriate credit.
