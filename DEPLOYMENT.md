# PLAN-Z: Free portfolio deployment (Render + MongoDB Atlas)

This is a **collaborative university project**. The payment workflow is mocked;
it does not charge money and is not production commerce software.

## Architecture

- **MongoDB Atlas Free cluster** — stores demo accounts, events and bookings.
- **Render Free Web Service** — Node/Express API from `server/`.
- **Render free Static Site** — React/Vite frontend from `client/`.
- Branch for initial deployment: `portfolio-render-deploy`. Do **not** deploy the old `main` branch until this change has been reviewed and merged.

Public static sites and free web services have usage restrictions. In particular,
Render's free API service spins down after 15 minutes without requests and takes
time to wake. Atlas Free clusters have storage and traffic limits. Do not store
real customer or financial data in this demonstration.

## 1. Create MongoDB Atlas free cluster

1. Create an Atlas account at https://cloud.mongodb.com/ and create a **Free** cluster.
2. In **Database Access**, create a database user with a strong, unique password.
   Grant only the access needed for the demo database (`planz`).
3. In **Network Access**, allow the Render API to connect. If stable outbound IP
   rules are unavailable on the free host, a narrowly scoped allowlist may not
   be possible; `0.0.0.0/0` allows connections from anywhere. If you must use
   that setting, use a restricted database user and strong credentials. Do not
   expose the connection string in React, GitHub, screenshots, or messages.
4. Copy the **Drivers → Node.js** SRV connection string. Include the database
   name `planz` in its path; percent-encode any special password characters.

## 2. Deploy the API on Render

At https://dashboard.render.com/: **New → Web Service**. Connect the GitHub repo
`faraaz1027-cloud/PLAN-Z`. Use:

| Setting | Value |
|---|---|
| Branch | `portfolio-render-deploy` |
| Root directory | `server` |
| Language | Node |
| Build command | `npm ci` |
| Start command | `npm start` |
| Instance type | **Free** |
| Health check path | `/healthz` |

Set the following **environment variables** (in the Render dashboard only):

| Variable | Value |
|---|---|
| `NODE_VERSION` | `22.16.0` |
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your private Atlas SRV URI ending in `/planz` (plus any needed query parameters) |
| `JWT_SECRET` | A newly generated, unpredictable secret with at least 32 random bytes |
| `CLIENT_ORIGIN` | `https://YOUR-FRONTEND.onrender.com` (replace after you create the frontend) |

Give the service a unique name, then deploy. Its actual public URL will look like
`https://YOUR-BACKEND.onrender.com` (do not guess the assigned URL). Check
`https://YOUR-BACKEND.onrender.com/healthz` for `{"status":"ok"}`.

For `CLIENT_ORIGIN`, choose a tentative future frontend hostname now, and
update it to the **exact assigned URL** after creating the frontend. Do not
append a path or a trailing slash. If it does not match, browsers will block API calls.

## 3. Deploy the frontend on Render

**New → Static Site**, same repo, **same branch**, with:

| Setting | Value |
|---|---|
| Branch | `portfolio-render-deploy` |
| Root directory | `client` |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |
| Environment variable `NODE_VERSION` | `22.16.0` |
| Environment variable `VITE_API_URL` | `https://YOUR-BACKEND.onrender.com/api` |

Set **Redirects/Rewrites** for React Router:

- Source: `/*`
- Destination: `/index.html`
- Action: **Rewrite**

Vite bakes `VITE_API_URL` into the frontend **at build time**. If you change
it, rebuild/redeploy the static site. The value must be publicly readable and
must not contain credentials. After creating the frontend, copy its exact
`https://...` address into the backend's `CLIENT_ORIGIN`, save and redeploy
the backend if needed.

## 4. Create test events and check key flows

The user database starts empty. Register a test **organizer** and a test
**attendee** using the app. Create an event as an organizer; events start as
`pending` and will **not** be public until approved by an administrator.

Public account creation intentionally **does not allow registering an admin**.
To test administrative flows, you can register a separate account, and **only
as the database owner** change that account's role to `admin` in the Atlas
Data Explorer. Do not share admin credentials or create an open admin-signup
endpoint. Use fictitious data and keep the demo credentials private unless
prepared as low-privilege, disposable test accounts.

Manually test:

1. `/healthz` reports `ok` when Atlas is reachable.
2. Home page, event listings and React Router direct-navigation/reload work.
3. Sign-up works for attendee/organizer, **not admin**, including a direct API request.
4. Organizer creates an event; an administrator approves it.
5. Attendee browses the event, books a valid positive-integer quantity, and
   completes the **mock** payment; dashboard shows the booking.
6. Anonymous requests cannot access protected endpoints.
7. Return after 15+ idle minutes and confirm the frontend handles backend wake-up.

No Live Demo link should go into the CV until these tests pass. A public demo
is not a substitute for a professional security assessment: rate-limiting,
transactional stock updates, abuse prevention and deeper authorization reviews
would still be needed for real-world use.

## Local development

- Copy `server/.env.example` to `server/.env`, configure local MongoDB and the
  JWT secret, then `cd server && npm ci && npm run dev`.
- Copy `client/.env.example` to `client/.env`, then
  `cd client && npm ci && npm run dev`.
- Do not commit `.env` files, database credentials, or real accounts.
