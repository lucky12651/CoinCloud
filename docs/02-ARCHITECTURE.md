# 02 — Architecture

## System overview

CoinCloud uses a classic **SPA + REST API** architecture:

1. **Browser** loads the React app (Vite dev server or static build).
2. Frontend calls **`/api/*`** (Vite proxies to FastAPI in development).
3. FastAPI authenticates with **Bearer JWT**, reads/writes **PostgreSQL**, and talks to **blockchain APIs / RPC**.
4. Client-only UX state (network, lock, connected sites) lives in **localStorage** via Zustand.

---

## Component diagram

```
                    ┌──────────────────────────────────────┐
                    │           Browser (React)            │
                    │  Pages · Components · Zustand stores │
                    └──────────────────┬───────────────────┘
                                       │ HTTP JSON
                                       │ Authorization: Bearer <jwt>
                    ┌──────────────────▼───────────────────┐
                    │              FastAPI                 │
                    │  routers: auth | wallet | admin |    │
                    │           market                     │
                    │  services: wallet_service            │
                    │  security: bcrypt + JWT              │
                    └──────────────────┬───────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
       PostgreSQL              Public chain APIs            ETH JSON-RPC
       user                    mempool.space                eth_getBalance
       transaction_log         litecoinspace.org            eth_sendRawTransaction
                               BlockCypher (DOGE)           ERC-20 balanceOf/transfer
                               CoinGecko (prices)
                               TradingView (embed only)
```

---

## Backend layers

| Layer | Path | Responsibility |
|-------|------|----------------|
| **Entry** | `app/main.py` | FastAPI app, CORS, lifespan (`create_all`, migrations, admin bootstrap) |
| **Config** | `app/config.py` | `DATABASE_URL` / `POSTGRES_*`, JWT, CORS, ETH RPC |
| **DB** | `app/database.py` | Engine, `SessionLocal`, column ensure helpers |
| **Models** | `app/models.py` | SQLAlchemy `User`, `TransactionLog` |
| **Schemas** | `app/schemas.py` | Pydantic request/response models |
| **Security** | `app/security.py` | `hash_password`, `verify_password`, JWT create/decode |
| **Deps** | `app/deps.py` | `get_current_user`, `get_current_admin` |
| **Routers** | `app/routers/*` | HTTP endpoints |
| **Services** | `app/services/wallet_service.py` | Wallet create, balance, send, history, recovery keys |

### Request lifecycle (example: send BTC)

```
POST /api/wallet/send
  → deps.get_current_user (JWT)
  → wallet.send()
  → wallet_service.send_crypto()
       → ensure_wallet (bitcoinlib)
       → transaction_create + sign
       → POST raw hex to mempool.space
  → TransactionLog row
  → JSON { success, txid, ... }
```

---

## Frontend layers

| Layer | Path | Responsibility |
|-------|------|----------------|
| **Routes** | `src/App.jsx` | Public vs protected routes |
| **Layout** | `components/layout/*` | Desktop sidebar, mobile bottom nav, lock screen |
| **Pages** | `src/pages/*` | Screens (dashboard, send, settings, admin, …) |
| **API** | `src/services/api.js` | Axios instance, token header, long timeout for register |
| **Auth store** | `store/useAuthStore.js` | JWT + user in localStorage |
| **Wallet store** | `store/useWalletStore.js` | Network, lock, connected sites, hide balances |
| **Market embeds** | `components/market/*` | TradingView widgets, price ticker |

### Auth flow (frontend)

```
Login/Register → access_token + user
  → localStorage: cc_token, cc_user
  → axios Authorization header on every /api call
  → 401 → clear session (soft)
```

### Layout strategy

| Viewport | Navigation |
|----------|------------|
| **Desktop (lg+)** | Fixed left sidebar (Home, Send, …, Profile, Security) + main content |
| **Mobile** | Bottom tabs: Home, Activity, Send, Receive, Settings — no left drawer |

---

## External integrations

| Service | Used for |
|---------|----------|
| **PostgreSQL** | Users, app send logs |
| **mempool.space** | BTC balance, txs, broadcast |
| **litecoinspace.org** | LTC balance, txs, broadcast (Esplora-compatible) |
| **BlockCypher** | DOGE balance, txs, broadcast |
| **Ethereum RPC** (`ETH_RPC_URL`) | ETH balance/send, USDT ERC-20 |
| **CoinGecko** | Market prices for ticker/portfolio |
| **TradingView** | Chart & news embeds (client-side scripts only) |
| **eth.blockscout.com** | Optional ETH/USDT history APIs |

---

## Authentication & authorization

```
Password ──bcrypt──► password_hash (DB)
Login ──verify──► JWT { sub: user_id, email, is_admin, exp }

Protected routes:
  get_current_user  → valid JWT + active user
  get_current_admin → is_admin == true
```

- Token expiry: configurable (`JWT_EXPIRE_MINUTES`, default 7 days).
- First registered user becomes admin if `ADMIN_EMAIL` is not set.
- Optional env admin: `ADMIN_EMAIL` + `ADMIN_PASSWORD`.

---

## Wallet domain architecture

```
                    create_all_wallets()
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
   create_utxo_wallets()            create_eth_wallet(same mnemonic)
   bitcoinlib                       eth-account HD m/44'/60'/0'/0/0
   BTC + LTC + DOGE                 ETH address + private key
                                    USDT uses same address/key
            │                               │
            └───────────────┬───────────────┘
                            ▼
                     User row in Postgres
                     (addresses, WIFs, passphrase, eth key)
```

Broadcast map is centralized in `wallet_service.BROADCAST` and related helpers.

---

## Frontend UI state vs server state

| State | Where | Examples |
|-------|--------|----------|
| **Server** | PostgreSQL + API | Users, balances (live chain), addresses, send logs |
| **Client** | localStorage / Zustand | JWT, selected network, wallet lock, connected dApps list, hide balances |

Lock screen re-verifies password via `POST /api/auth/login` then unlocks UI.

---

## Design principles

1. **API-first** — UI is a client of `/api/*`; no server-rendered HTML for app pages.
2. **JWT stateless auth** — no Flask sessions.
3. **Chain of truth** — balances/history from explorers/RPC; DB holds identity + keys + app logs.
4. **Responsive UX** — desktop sidebar vs mobile bottom nav; same APIs.
5. **Reference scripts** — `btc/` keeps original broadcast/create logic for documentation and parity.

---

## Related docs

- [Database](./03-DATABASE.md)  
- [API Reference](./04-API.md)  
- [Wallet & Crypto](./06-WALLET-CRYPTO.md)  
