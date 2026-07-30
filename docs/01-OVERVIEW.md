# 01 — Project Overview

## What is CoinCloud?

**CoinCloud** is a multi-chain **self-custody style crypto wallet** web app. Users register, receive auto-generated wallets for several networks, view balances and market data, send/receive crypto, and manage recovery material. Admins can manage users and view platform activity.

It is a full rewrite of an older Flask + HTML wallet into:

- **Frontend:** React 18 + Vite + Tailwind CSS  
- **Backend:** FastAPI + SQLAlchemy + JWT  
- **Database:** PostgreSQL  

---

## Supported assets

| Coin | Type | Library / path |
|------|------|----------------|
| **BTC** | UTXO (Bitcoin) | bitcoinlib |
| **LTC** | UTXO (Litecoin) | bitcoinlib |
| **DOGE** | UTXO (Dogecoin) | bitcoinlib |
| **ETH** | Account (Ethereum) | eth-account + web3 |
| **USDT** | ERC-20 on Ethereum | same ETH key/address |

One **BIP39 recovery phrase** is shared across chains (multi-chain HD-style backup). Addresses and private keys still differ per network.

---

## Main features

### End users
- Register / login with JWT
- Auto wallet creation on signup (BTC, LTC, DOGE, ETH/USDT)
- Portfolio with CoinGecko prices
- Send & receive (QR + copy)
- On-chain transaction history
- Network switcher
- Lock wallet (password unlock)
- Hide balances (privacy)
- Settings: Profile, Security & privacy (seed + private keys)
- Connect dApps UI (session UX / WalletConnect-style demo)
- Swap UI (preview), Discover dApps
- TradingView charts & news (desktop dashboard)
- Infinite price ticker
- Mobile bottom navigation (app-like UX)

### Admins
- Platform stats (users, wallets, sends)
- Search users (email, username, addresses)
- Promote/revoke admin, enable/disable, delete users
- App send log

---

## High-level stack

```
┌─────────────────────┐     JWT + REST      ┌─────────────────────┐
│  React SPA (Vite)   │ ◄─────────────────► │  FastAPI backend    │
│  Tailwind, Zustand  │   /api/* (proxy)    │  SQLAlchemy, JWT    │
└─────────────────────┘                     └──────────┬──────────┘
                                                       │
                                                       ▼
                                            ┌─────────────────────┐
                                            │  PostgreSQL         │
                                            │  crypto-wallet DB   │
                                            └─────────────────────┘
                                                       │
                       ┌───────────────────────────────┼───────────────────────────────┐
                       ▼                               ▼                               ▼
              mempool.space /              litecoinspace.org /              Ethereum RPC
              BlockCypher DOGE             explorers                        + ERC-20 USDT
```

---

## Repository structure

```
CryptoWallet/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── main.py          # App entry, CORS, lifespan
│   │   ├── config.py        # Env / Postgres settings
│   │   ├── database.py      # Engine, sessions
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── security.py      # Password hash + JWT
│   │   ├── deps.py          # Auth dependencies
│   │   ├── routers/         # auth, wallet, admin, market
│   │   └── services/        # wallet_service (crypto logic)
│   ├── bootstrap_admin.py
│   ├── requirements.txt
│   ├── run.py / start.bat
│   └── .env                 # Local secrets (private repo may commit)
├── frontend/                # React SPA
│   ├── src/
│   │   ├── pages/           # Screens
│   │   ├── components/      # Layout, market, wallet UI
│   │   ├── services/api.js  # Axios client
│   │   └── store/           # Zustand (auth, wallet UI state)
│   ├── package.json
│   └── vite.config.js       # Dev proxy → :8000
├── btc/                     # Original CLI scripts (reference for BTC/LTC)
├── docs/                    # This documentation
└── Readme.md                # Quick start
```

---

## Roles

| Role | How | Capabilities |
|------|-----|--------------|
| **User** | Default on register | Own wallets, send/receive, settings |
| **Admin** | `is_admin=true` (first user, `ADMIN_EMAIL`, or promote) | All user features + `/app/admin` + admin APIs |

---

## Security notes (important)

- Seed phrases and private keys are stored in the database for demo/product continuity — **not** production HSM-grade custody.
- Treat `/api/auth/recovery-phrase` as highly sensitive (authenticated owner only).
- JWT secret and Postgres credentials must be kept private.
- On-chain sends use real broadcast endpoints — test carefully with real funds.

---

## Related docs

- [Architecture](./02-ARCHITECTURE.md)  
- [Database](./03-DATABASE.md)  
- [API](./04-API.md)  
- [Setup](./07-SETUP.md)  
