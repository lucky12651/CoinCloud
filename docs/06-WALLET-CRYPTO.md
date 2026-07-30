# 06 — Wallet & Crypto

## Supported coins

| Symbol | Network | Key material | Balance source | Broadcast |
|--------|---------|--------------|----------------|-----------|
| **BTC** | Bitcoin | bitcoinlib + WIF | mempool.space Esplora | `POST https://mempool.space/api/tx` |
| **LTC** | Litecoin | bitcoinlib + WIF | litecoinspace.org Esplora | `POST https://litecoinspace.org/api/tx` |
| **DOGE** | Dogecoin | bitcoinlib + WIF | BlockCypher | BlockCypher push TX |
| **ETH** | Ethereum | eth-account private key | JSON-RPC `eth_getBalance` | `eth_sendRawTransaction` |
| **USDT** | ERC-20 | **Same as ETH** | `balanceOf` on USDT contract | ERC-20 `transfer` |

USDT contract (mainnet): `0xdAC17F958D2ee523a2206206994597C13D831ec7` (6 decimals).

---

## Recovery model

### One phrase, many chains

On registration:

```
mnemonic = BIP39 (12 words)
  ├─ bitcoinlib → BTC, LTC, DOGE wallets
  └─ eth-account HD m/44'/60'/0'/0/0 → ETH (+ USDT)
```

So **BTC/LTC/DOGE recovery phrase** and **ETH/USDT recovery phrase** are often **the same string**. That is **by design**, not a bug.

| Item | Same across chains? |
|------|---------------------|
| Recovery phrase | Usually **yes** |
| Deposit addresses | **No** (except ETH=USDT) |
| Private keys (WIF/hex) | **No** (except ETH=USDT) |

### Backfill

Older users may have empty WIF columns.  
`GET /api/auth/recovery-phrase` runs `sync_private_keys()` to extract classic WIF from bitcoinlib and store them in Postgres.

---

## UTXO send flow (BTC / LTC / DOGE)

Same logic as original `btc/` scripts:

```
1. Open/create bitcoinlib Wallet for user
2. wallet.transaction_create([(to, amount_sats)], fee=fee_sats)
3. tx.sign()
4. raw = tx.raw_hex()
5. POST raw to explorer broadcast URL
6. Return txid; log TransactionLog
```

Default fees (overridable in API):

| Coin | Default fee (coin units) |
|------|---------------------------|
| BTC | 0.000006 |
| LTC | 0.00001 |
| DOGE | 1.0 |

---

## ETH / USDT send flow

```
1. Load private_key_eth
2. Build legacy-style tx (gasPrice) via web3
3. Sign with eth_account
4. send_raw_transaction via ETH_RPC_URL
```

USDT: encode ERC-20 `transfer(to, amount)` and send as contract call.

---

## Balance & history

| Coin | Balance | History |
|------|---------|---------|
| BTC | mempool address API | mempool txs |
| LTC | litecoinspace address API | litecoinspace txs |
| DOGE | BlockCypher balance | BlockCypher full address |
| ETH | RPC get_balance | Blockscout-style API (best effort) |
| USDT | ERC-20 balanceOf | Blockscout token txs (best effort) |

---

## Reference scripts (`btc/`)

Original CLI tools kept for reference and parity:

| Script | Purpose |
|--------|---------|
| `bitcoin_transaction_broadcaster.py` | Sign + broadcast BTC via mempool |
| `litecoin_wallet_generator.py` | Create LTC wallet |
| `litecoin_transaction_creator.py` | Sign LTC raw tx |
| `seed.py`, `master_key.py`, … | Key/seed utilities |

Production path uses `backend/app/services/wallet_service.py`.

---

## Security warnings

1. **Seed phrase controls all chains** in this design.  
2. Keys/phrases in **PostgreSQL** are for product demo — encrypt at rest / HSM for real production.  
3. Real mainnet broadcasts spend real money.  
4. Always verify network before send (wrong chain = loss).  
5. USDT must be **ERC-20 on Ethereum**, not TRC-20/BEP-20, to match this wallet.

---

## Related docs

- [Database](./03-DATABASE.md)  
- [API](./04-API.md)  
- [Architecture](./02-ARCHITECTURE.md)  
