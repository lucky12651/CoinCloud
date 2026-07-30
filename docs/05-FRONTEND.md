# 05 — Frontend

## Stack

| Tool | Use |
|------|-----|
| React 18 | UI |
| Vite 5 | Build / dev server |
| Tailwind CSS 3 | Styling |
| React Router 6 | Routing |
| Axios | HTTP |
| Zustand | Client state |
| Lucide React | Icons |
| qrcode.react | Receive / WalletConnect QR |
| react-hot-toast | Toasts |
| Framer Motion | Landing motion (where used) |

**Dev URL:** `http://127.0.0.1:5173`  
**API proxy:** `/api` → `http://127.0.0.1:8000`

---

## Directory map

```
frontend/src/
├── main.jsx                 # React root + Toaster
├── App.jsx                  # Routes
├── index.css                # Tailwind + design tokens
├── pages/                   # Screen components
├── components/
│   ├── layout/              # App shell, bottom nav, lock
│   ├── market/              # Ticker, TradingView embeds
│   └── wallet/              # Network switcher
├── services/api.js          # API client
├── store/
│   ├── useAuthStore.js      # JWT + user
│   └── useWalletStore.js    # Network, lock, dApps, privacy
└── lib/
    ├── coins.js             # WALLET_COINS, fees, TV symbols
    ├── utils.js             # format, explorer URLs, copy
    └── errors.js            # API error → user message
```

---

## Routes

### Public
| Path | Page |
|------|------|
| `/` | Landing |
| `/login` | Login |
| `/register` | Register |

### Protected (`/app/*` — requires JWT)

| Path | Page | Notes |
|------|------|--------|
| `/app` | Dashboard | Mobile MetaMask-style home; desktop charts |
| `/app/send` | Send | Multi-coin send |
| `/app/receive` | Receive | Address + QR |
| `/app/activity` | Transactions | Alias of history |
| `/app/transactions` | Transactions | Same component |
| `/app/swap` | Swap | UI preview |
| `/app/connect` | Connect | dApp connect / WC URI demo |
| `/app/browser` | Browser | Discover links |
| `/app/networks` | Networks | Select active network |
| `/app/settings` | Settings hub | Profile + Security entry cards |
| `/app/settings/profile` | Profile | Details + password |
| `/app/settings/security` | Security | Recovery + private keys |
| `/app/admin` | Admin | Admin only |

---

## Navigation UX

### Desktop (`lg` and up)
- Fixed left sidebar
- Items: Home, Send, Receive, Activity, Swap, Connect, Discover, Networks, **Profile**, **Security**
- Footer: user card, Lock wallet, Sign out
- No separate “Settings” sidebar item (hub optional via routes)

### Mobile
- **No** left hamburger drawer
- Bottom tabs: **Home · Activity · Send · Receive · Settings**
- Settings hub contains Profile box, Security box, More links, Sign out

---

## State stores

### `useAuthStore`
- `token`, `user`
- `setSession`, `logout`, `refreshMe`
- Persistence: `localStorage` keys `cc_token`, `cc_user`

### `useWalletStore`
- `networkId` — active network for UI
- `locked` — lock screen overlay
- `hideBalances` — mask amounts
- `connectedSites` — dApp sessions (client-only)
- Persistence: `cc_network`, `cc_locked`, `cc_hide_balances`, `cc_connected_sites`, etc.

---

## API client (`services/api.js`)

```js
baseURL: import.meta.env.VITE_API_URL || ''  // empty → same origin / Vite proxy
timeout: 180000  // register can take long (wallet creation)
Authorization: Bearer <cc_token>
```

Modules: `authApi`, `walletApi`, `adminApi`, `marketApi`.

---

## Key UI patterns

| Pattern | Where |
|---------|--------|
| Infinite price ticker | Header (sm+) |
| TradingView chart + news | Desktop dashboard |
| Token list + quick actions | Mobile dashboard |
| Network pill | Header switcher |
| Lock screen | Full-screen unlock with password |
| Settings cards | Profile / Security navigation |

---

## Build

```bash
cd frontend
npm install
npm run dev      # development
npm run build    # production → dist/
npm run preview  # preview dist
```

---

## Related docs

- [Overview](./01-OVERVIEW.md)  
- [Architecture](./02-ARCHITECTURE.md)  
- [Setup](./07-SETUP.md)  
