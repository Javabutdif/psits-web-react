# Docker Setup

The PSITS Web project supports two workflows: **manual** (local Node.js) and **Docker** (containerized). Docker is optional.

---

## Prerequisites

- Docker and Docker Compose (v2)
- MongoDB Atlas account (or any accessible MongoDB instance)

---

## Manual Workflow (Local Dev)

Run each module locally without Docker.

### 1. Backend

```bash
cd server-side
npm install
```

Create `.env` from the template and fill in required values:

```bash
cp ../.env.example server-side/.env
# Edit server-side/.env — set MONGODB_URI, JWT_SECRET, CORS
```

Start the server:

```bash
npm run dev
```

Server runs at `http://localhost:5000`.

### 2. Frontend (new terminal)

```bash
cd client-side-ts
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` requests to `http://localhost:5000`.

---

## Docker Workflow

Run the full stack inside containers.

### 1. Configure environment

```bash
# From repo root
cp .env.example server-side/.env
# Edit server-side/.env — fill in MONGODB_URI, JWT_SECRET, CORS
```

### 2. Start services

```bash
docker compose up -d
```

- Frontend: `http://localhost:5173`
- Server API: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

### 3. Hot reload

Source files are mounted as volumes (`src/`), so edits are reflected immediately:
- **Server**: nodemon watches `.ts` changes and restarts automatically
- **Client**: Vite HMR updates the browser on save

### 4. Stop and clean up

```bash
docker compose down
```

### 5. Rebuild after dependency changes

```bash
docker compose up -d --build
```

---

## Health Check Tests

Validate the Docker setup:

```bash
./docker-healthcheck.sh
```

Runs three tests:
1. Docker image build succeeds
2. Server starts and `/health` responds
3. Hot reload works (timestamp changes after source edit)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Server fails to connect to MongoDB | Verify `MONGODB_URI` in `server-side/.env` — ensure IP is whitelisted in Atlas |
| Frontend gets CORS errors | Set `CORS=http://localhost:5173` in `server-side/.env` |
| `docker compose up` hangs on healthcheck | Wait 15–20s for MongoDB connection; check `docker compose logs server` |
| Hot reload not working | Ensure volumes are mounted: `./server-side/src:/app/src` and `./client-side-ts/src:/app/src` |
