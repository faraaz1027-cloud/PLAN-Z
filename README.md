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

Run `npm run dev` in `server/` and `client/`. The frontend code expects the backend at `http://localhost:5000/api`. The app has not been independently confirmed deployment-ready.

## Important notes

- This portfolio upload excludes `node_modules` and locally generated files. Install packages as described above.
- **The original `client/src/assets/hero.png` image must still be restored** from the prepared ZIP or the authorized source. Its absence may affect the frontend build or visuals.
- Do not use development fallback JWT secrets in production.
- Payment functionality is mocked.

## Credit and provenance

This is a **team university project**, not solely authored by the portfolio owner. The original team repository and its commit history are here: [tashriquetanvir-commits/Git-project](https://github.com/tashriquetanvir-commits/Git-project). All original contributors deserve appropriate credit.
