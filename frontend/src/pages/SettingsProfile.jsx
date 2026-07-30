import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, KeyRound, User } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/useAuthStore'
import { getApiError } from '../lib/errors'

export default function SettingsProfile() {
  const user = useAuthStore((s) => s.user)
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' })
  const [loadingPw, setLoadingPw] = useState(false)

  const changePassword = async (e) => {
    e.preventDefault()
    if (pw.new_password !== pw.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoadingPw(true)
    try {
      await authApi.changePassword({
        current_password: pw.current_password,
        new_password: pw.new_password,
      })
      toast.success('Password updated')
      setPw({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(getApiError(err, 'Failed to change password'))
    } finally {
      setLoadingPw(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          to="/app/settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Settings</p>
          <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
        </div>
      </div>

      {/* Avatar card */}
      <div className="x-card flex items-center gap-4 p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-white/60 text-xl font-bold text-black">
          {(user?.username || 'U')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{user?.username}</p>
          <p className="truncate text-sm text-white/45">{user?.email}</p>
        </div>
      </div>

      <div className="x-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4 text-white/50" /> Profile details
        </h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-white/40">Username</dt>
            <dd className="mt-1 font-medium">{user?.username}</dd>
          </div>
          <div>
            <dt className="text-xs text-white/40">Email</dt>
            <dd className="mt-1 break-all font-medium">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-white/40">Role</dt>
            <dd className="mt-1">{user?.is_admin ? 'Administrator' : 'User'}</dd>
          </div>
          <div>
            <dt className="text-xs text-white/40">User ID</dt>
            <dd className="mt-1 font-mono text-white/70">#{user?.id}</dd>
          </div>
          {user?.created_at && (
            <div>
              <dt className="text-xs text-white/40">Joined</dt>
              <dd className="mt-1 text-white/70">
                {new Date(user.created_at).toLocaleDateString()}
              </dd>
            </div>
          )}
          {user?.last_login && (
            <div>
              <dt className="text-xs text-white/40">Last login</dt>
              <dd className="mt-1 text-white/70">
                {new Date(user.last_login).toLocaleString()}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <form onSubmit={changePassword} className="x-card space-y-4 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <KeyRound className="h-4 w-4 text-white/50" /> Change password
        </h2>
        <div>
          <label className="x-label">Current password</label>
          <input
            type="password"
            className="x-input"
            value={pw.current_password}
            onChange={(e) => setPw((p) => ({ ...p, current_password: e.target.value }))}
            required
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="x-label">New password</label>
          <input
            type="password"
            className="x-input"
            value={pw.new_password}
            onChange={(e) => setPw((p) => ({ ...p, new_password: e.target.value }))}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="x-label">Confirm new password</label>
          <input
            type="password"
            className="x-input"
            value={pw.confirm}
            onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" disabled={loadingPw} className="x-btn-primary w-full sm:w-auto">
          {loadingPw ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
