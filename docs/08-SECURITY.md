# 08 — Security (public repository checklist)

Use this before making **CoinCloud** public on GitHub.

---

## Critical rules

1. **Never commit** `.env`, API keys, database passwords, private keys, or seed phrases.
2. **Only** commit templates like `backend/.env.example` with fake placeholders.
3. Assume anything once pushed to a **public** repo is compromised forever (even if deleted later — git history).

---

## What is gitignored

| Pattern | Why |
|---------|-----|
| `.env`, `.env.*`, `backend/.env` | Real credentials |
| `*.pem`, `*.key`, `*credentials*.json` | Keys / service accounts |
| `.venv/`, `node_modules/`, `frontend/dist/` | Local installs / build |
| `*.db`, `instance/` | Local DB files |

Allowed: **`backend/.env.example`** only (no real secrets).

---

## Before first public push

```bash
# 1. Confirm .env is ignored
git check-ignore -v backend/.env
# Should print a matching .gitignore rule

# 2. Confirm it is NOT staged/tracked
git status
# backend/.env must NOT appear as "new file" or "modified"

# 3. Search for accidental secrets
git grep -i "password\|secret\|postgres\|private_key" -- ':!docs' ':!*.example' || true
```

If `backend/.env` was **ever** committed to any remote (including old private CryptoWallet history you made public), **rotate all secrets immediately** (see below).

---

## Secrets you must keep only in local `.env` / host env

| Variable | Purpose |
|----------|---------|
| `POSTGRES_HOST` / `USER` / `PASSWORD` / `DB` | Database access |
| `DATABASE_URL` | Full DB URL (optional) |
| `SECRET_KEY` | App secret |
| `JWT_SECRET` | Token signing |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin bootstrap |
| `ETH_RPC_URL` | Optional private RPC with API key |

Generate strong secrets:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

---

## Rotate if credentials leaked or were committed

1. **PostgreSQL password** — change on the DB server; update local `.env` and any deploy env UI (GridWork, etc.).
2. **SECRET_KEY / JWT_SECRET** — generate new values; all users must log in again.
3. **Admin password** — change via bootstrap script or DB.
4. **Any RPC API keys** — revoke/regenerate with the provider.
5. If this was a public push of secrets: consider the DB host **exposed** — restrict firewall (allow only your app server IPs), not `0.0.0.0/0` for port 5432.

---

## Application security notes (product)

| Topic | Status in this project |
|-------|------------------------|
| JWT auth | Yes |
| Password hashing | bcrypt |
| Seed / private keys in DB | Stored for wallet UX — **high risk** if DB leaks; not HSM-grade |
| Recovery endpoint | Authenticated owner only — still sensitive |
| CORS | Configure `CORS_ORIGINS` to real frontend domains only (avoid `*` in production) |

For production custody products: encrypt keys at rest, use KMS/HSM, never log secrets, use HTTPS only.

---

## Safe deploy pattern

1. Repo (public): code + `.env.example` only.  
2. Server / GridWork / host: inject real env vars or a private `.env` **on the server**, not in git.  
3. PostgreSQL: strong password, restricted network access.  
4. HTTPS in front of API and frontend.

---

## Related

- [Setup](./07-SETUP.md)  
- [Database](./03-DATABASE.md)  
