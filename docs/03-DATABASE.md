# 03 — Database

## Engine

| Property | Value |
|----------|--------|
| **DBMS** | PostgreSQL |
| **Default DB name** | `crypto-wallet` |
| **ORM** | SQLAlchemy 2.x |
| **Connection** | `postgresql+psycopg2://...` via env |
| **Schema create** | `Base.metadata.create_all()` on API startup |
| **Migrations** | Lightweight `ensure_postgres_columns()` (no Alembic) |

### Connection configuration

Set either full URL or discrete variables in `backend/.env`:

```env
POSTGRES_HOST=...
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=...
POSTGRES_DB=crypto-wallet

# Or:
# DATABASE_URL=postgresql+psycopg2://user:password@host:5432/crypto-wallet
```

Password special characters are URL-encoded automatically when using `POSTGRES_*` fields.

---

## Entity relationship

```
┌──────────────────────── user ────────────────────────┐
│  id (PK)                                             │
│  username, email, password_hash                      │
│  is_admin, is_active                                 │
│  wallet_name*, wallet_name_ltc*, wallet_name_doge*   │
│  wallet_address_btc/ltc/doge/eth                     │
│  passphrase, passphrase_eth                          │
│  private_master_key_wif_btc/ltc/doge                 │
│  private_key_eth                                     │
│  created_at, last_login                              │
└───────────────────────┬──────────────────────────────┘
                        │ 1
                        │
                        │ N
┌───────────────────────▼──────────────────────────────┐
│              transaction_log                         │
│  id (PK)                                             │
│  user_id (FK → user.id)                              │
│  coin, txid, recipient, amount, fee, status          │
│  created_at                                          │
└──────────────────────────────────────────────────────┘
```

\* bitcoinlib local wallet names (not on-chain).

---

## Table: `user`

SQLAlchemy model: `app.models.User`  
PostgreSQL table name: `"user"` (quoted; reserved word).

| Column | Type | Notes |
|--------|------|--------|
| `id` | Integer PK | Auto-increment |
| `username` | String(150) unique | Required |
| `email` | String(150) unique | Stored lowercased in app logic |
| `is_admin` | Boolean | Default false |
| `is_active` | Boolean | Disabled users cannot use API |
| `password_hash` | String(255) | bcrypt via passlib |
| `wallet_name` | String(150) unique | bitcoinlib BTC wallet id |
| `wallet_name_ltc` | String(150) unique | bitcoinlib LTC wallet id |
| `wallet_name_doge` | String(150) unique | bitcoinlib DOGE wallet id |
| `wallet_address_btc` | String(150) | Deposit address |
| `wallet_address_ltc` | String(150) | Deposit address |
| `wallet_address_doge` | String(150) | Deposit address |
| `wallet_address_eth` | String(150) | ETH + USDT deposit address |
| `passphrase` | String(500) | BIP39 for UTXO (+ usually ETH) |
| `passphrase_eth` | String(500) | BIP39 for EVM (often same as `passphrase`) |
| `private_master_key_wif_btc` | String(500) | BTC WIF (backfilled if empty) |
| `private_master_key_wif_ltc` | String(500) | LTC WIF |
| `private_master_key_wif_doge` | String(500) | DOGE WIF |
| `private_key_eth` | String(200) | ETH hex private key (no 0x required in storage) |
| `created_at` | DateTime | UTC |
| `last_login` | DateTime | Updated on login |

### Indexes
- PK on `id`
- Unique indexes on `username`, `email`
- Unique on wallet names when present
- Index on `email` / `username` for lookups

---

## Table: `transaction_log`

SQLAlchemy model: `app.models.TransactionLog`

Local **application log** of sends initiated through CoinCloud — not a full chain indexer.

| Column | Type | Notes |
|--------|------|--------|
| `id` | Integer PK | |
| `user_id` | Integer FK | → `user.id`, cascade delete |
| `coin` | String(10) | BTC, LTC, ETH, DOGE, USDT |
| `txid` | String(120) | On-chain id if broadcast OK |
| `recipient` | String(200) | Destination address |
| `amount` | String(50) | Decimal as string |
| `fee` | String(50) | Optional |
| `status` | String(40) | Default `broadcast` |
| `created_at` | DateTime | |

---

## What is **not** in the database

| Data | Source instead |
|------|----------------|
| Live balances | mempool / litecoinspace / BlockCypher / ETH RPC |
| Full tx history | Chain explorers / RPC APIs |
| Market prices | CoinGecko |
| Connected dApps list | Browser `localStorage` |
| Selected network / lock / hide balances | Browser `localStorage` |
| bitcoinlib internal key DB | Local bitcoinlib storage on the API host |

---

## Lifecycle & backfill

On API start:
1. `create_all()` creates missing tables.
2. `ensure_postgres_columns()` adds any new columns if upgrading an older schema.

On user actions:
- **Register** → insert `user` with wallets + keys.
- **Login** → update `last_login`.
- **Send** → insert `transaction_log`.
- **Recovery reveal** → `ensure_addresses_backfill` + `sync_private_keys` may fill empty WIF fields from live bitcoinlib wallets.

---

## Sensitive data policy

Columns that must never be exposed publicly:

- `password_hash`
- `passphrase`, `passphrase_eth`
- `private_master_key_wif_*`
- `private_key_eth`

Only the authenticated owner may read recovery material via `GET /api/auth/recovery-phrase`.

Admin list endpoints return **public** user fields and addresses — not private keys or passphrases.

---

## Example SQL

```sql
-- Count users
SELECT count(*) FROM "user";

-- List admins
SELECT id, username, email FROM "user" WHERE is_admin = true;

-- Recent app sends
SELECT t.id, u.email, t.coin, t.amount, t.txid, t.created_at
FROM transaction_log t
JOIN "user" u ON u.id = t.user_id
ORDER BY t.created_at DESC
LIMIT 20;
```

---

## Related docs

- [Architecture](./02-ARCHITECTURE.md)  
- [API Reference](./04-API.md)  
- [Wallet & Crypto](./06-WALLET-CRYPTO.md)  
