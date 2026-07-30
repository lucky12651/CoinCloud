# 07 — Setup & Deploy

## Prerequisites

- **Python** 3.11+ (3.12 tested)
- **Node.js** 18+
- **PostgreSQL** 14+ (remote or local)
- Windows / macOS / Linux

---

## 1. Clone

```bash
git clone https://github.com/lucky12651/CryptoWallet.git
cd CryptoWallet
```

---

## 2. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
```

### Environment

```bash
cd backend
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux
```

Edit **`backend/.env`** with real values. That file is **gitignored** and must never be committed.

```env
POSTGRES_HOST=your-host
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-strong-password
POSTGRES_DB=crypto-wallet

SECRET_KEY=generate-a-long-random-string
JWT_SECRET=generate-another-long-random-string

# Optional
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-password
ETH_RPC_URL=https://eth.llamarpc.com
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Generate secrets: `python -c "import secrets; print(secrets.token_urlsafe(48))"`

Ensure database `crypto-wallet` exists on the Postgres server.

See also: [08 — Security](./08-SECURITY.md).

### Run API

```bash
python run.py
# or
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
# Windows helper:
start.bat
```

- API: http://127.0.0.1:8000  
- Swagger: http://127.0.0.1:8000/docs  

### Bootstrap admin (optional)

```bash
python bootstrap_admin.py admin@example.com yourpassword
```

---

## 3. Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

App: http://127.0.0.1:5173  

Vite proxies `/api` → `http://127.0.0.1:8000`.

### Production build

```bash
npm run build
# serve frontend/dist with any static host; point API via reverse proxy or VITE_API_URL
```

---

## 4. Typical local workflow

| Terminal | Command |
|----------|---------|
| 1 | `cd backend && .venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000` |
| 2 | `cd frontend && npm.cmd run dev -- --host 127.0.0.1 --port 5173` |

Open **http://127.0.0.1:5173** (prefer `127.0.0.1` over `localhost` if DNS issues).

---

## 5. First user

1. Register a new account (wallet creation may take 30–60s).  
2. If no `ADMIN_EMAIL`, first user becomes admin.  
3. Or bootstrap admin via script / env.

---

## 6. Troubleshooting

| Symptom | Check |
|---------|--------|
| Registration / login failed | Backend running on :8000? |
| Network Error toast | API down or wrong proxy |
| Empty private keys | Open Security → Reveal (triggers backfill) |
| ETH balance error | `ETH_RPC_URL` public RPC rate limits |
| DB connection error | Postgres host/firewall/password/`POSTGRES_DB` |
| Port already in use | Stop old node/python on 5173/8000 |

Health checks:

```bash
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:5173/api/health   # via Vite proxy
```

---

## 7. Project dependencies (backend)

Key packages from `requirements.txt`:

- fastapi, uvicorn  
- sqlalchemy, psycopg2-binary  
- python-jose, passlib, bcrypt  
- bitcoinlib  
- eth-account, web3  
- requests, python-dotenv  

---

## Related docs

- [Overview](./01-OVERVIEW.md)  
- [Database](./03-DATABASE.md)  
- [API](./04-API.md)  
