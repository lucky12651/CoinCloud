import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Activity,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react'
import { adminApi } from '../services/api'
import { cn, formatDate, shortAddress } from '../lib/utils'
import { useAuthStore } from '../store/useAuthStore'

export default function Admin() {
  const me = useAuthStore((s) => s.user)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [txs, setTxs] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('users')

  const load = async (query = q) => {
    setLoading(true)
    try {
      const [s, u, t] = await Promise.all([
        adminApi.stats(),
        adminApi.users(query || undefined),
        adminApi.transactions(40),
      ])
      setStats(s.data)
      setUsers(u.data || [])
      setTxs(t.data || [])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleAdmin = async (user) => {
    if (user.id === me?.id) {
      toast.error('You cannot change your own admin role here')
      return
    }
    try {
      await adminApi.updateUser(user.id, { is_admin: !user.is_admin })
      toast.success(user.is_admin ? 'Admin revoked' : 'Promoted to admin')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    }
  }

  const toggleActive = async (user) => {
    if (user.id === me?.id) {
      toast.error('You cannot disable your own account')
      return
    }
    try {
      await adminApi.updateUser(user.id, { is_active: !user.is_active })
      toast.success(user.is_active ? 'User disabled' : 'User enabled')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    }
  }

  const removeUser = async (user) => {
    if (user.id === me?.id) return
    if (!window.confirm(`Delete user ${user.username}? This cannot be undone.`)) return
    try {
      await adminApi.deleteUser(user.id)
      toast.success('User deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    }
  }

  const statCards = [
    { label: 'Total users', value: stats?.total_users, icon: Users },
    { label: 'Active', value: stats?.active_users, icon: Activity },
    { label: 'Admins', value: stats?.admin_users, icon: Shield },
    { label: 'App sends', value: stats?.recent_sends, icon: Wallet },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Control plane</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-white/45">
            Manage users, roles, and platform activity
          </p>
        </div>
        <button onClick={() => load()} className="x-btn-secondary" disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="x-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/40">{s.label}</p>
              <s.icon className="h-4 w-4 text-white/30" />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {s.value ?? '—'}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'BTC wallets', value: stats?.wallets_btc },
          { label: 'LTC wallets', value: stats?.wallets_ltc },
          { label: 'DOGE wallets', value: stats?.wallets_doge },
          { label: 'ETH / USDT', value: stats?.wallets_eth },
        ].map((s) => (
          <div key={s.label} className="x-card-solid px-4 py-3">
            <p className="text-xs text-white/40">{s.label}</p>
            <p className="mt-1 text-xl font-semibold">{s.value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 rounded-full border border-white/10 bg-black/40 p-1 w-fit">
        {[
          { id: 'users', label: 'Users' },
          { id: 'activity', label: 'Send log' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium transition',
              tab === t.id ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="x-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                className="x-input pl-10"
                placeholder="Search username, email, address…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load(q)}
              />
            </div>
            <button onClick={() => load(q)} className="x-btn-secondary">
              Search
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-white/35">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Wallets</th>
                  <th className="px-4 py-3 font-medium">Flags</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.username}</p>
                      <p className="text-xs text-white/40">{u.email}</p>
                      <p className="font-mono text-[10px] text-white/25">#{u.id}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-white/55">
                      <div>BTC {shortAddress(u.wallet_address_btc)}</div>
                      <div>LTC {shortAddress(u.wallet_address_ltc)}</div>
                      <div>DOGE {shortAddress(u.wallet_address_doge)}</div>
                      <div>ETH {shortAddress(u.wallet_address_eth)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.is_admin && (
                          <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                            Admin
                          </span>
                        )}
                        <span
                          className={cn(
                            'rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide',
                            u.is_active !== false
                              ? 'border-emerald-500/20 text-emerald-300/90'
                              : 'border-red-500/20 text-red-300/90'
                          )}
                        >
                          {u.is_active !== false ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => toggleAdmin(u)}
                          className="x-btn-ghost px-2 py-1 text-xs"
                          disabled={u.id === me?.id}
                        >
                          {u.is_admin ? 'Revoke admin' : 'Make admin'}
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          className="x-btn-ghost px-2 py-1 text-xs"
                          disabled={u.id === me?.id}
                        >
                          {u.is_active !== false ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => removeUser(u)}
                          className="x-btn-danger px-2 py-1 text-xs"
                          disabled={u.id === me?.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-white/35">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="x-card overflow-hidden">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-medium">Sends initiated via CoinCloud</h2>
            <p className="text-xs text-white/40">Local application log (not full chain history)</p>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {txs.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-white/35">No send logs yet</p>
            )}
            {txs.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {t.username}{' '}
                    <span className="font-normal text-white/40">sent {t.amount} {t.coin}</span>
                  </p>
                  <p className="font-mono text-[11px] text-white/35">
                    → {shortAddress(t.recipient, 10, 8)} · {t.txid ? shortAddress(t.txid, 10, 8) : 'no txid'}
                  </p>
                </div>
                <div className="text-right text-xs text-white/40">
                  <p>{formatDate(t.created_at)}</p>
                  <p className="capitalize">{t.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
