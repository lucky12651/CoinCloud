import { useState } from 'react'
import toast from 'react-hot-toast'
import { Lock } from 'lucide-react'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../store/useAuthStore'
import { useWalletStore } from '../../store/useWalletStore'
import { getApiError } from '../../lib/errors'
import BrandLogo from '../BrandLogo'

export default function LockScreen() {
  const user = useAuthStore((s) => s.user)
  const unlock = useWalletStore((s) => s.unlock)
  const logout = useAuthStore((s) => s.logout)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onUnlock = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.login({ email: user.email, password })
      unlock()
      toast.success('Wallet unlocked')
    } catch (err) {
      toast.error(getApiError(err, 'Wrong password'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black px-6">
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-80" />
      <div className="relative w-full max-w-sm text-center">
        <div className="mx-auto mb-5 overflow-hidden rounded-2xl shadow-glow">
          <BrandLogo size={72} rounded="rounded-2xl" />
        </div>
        <p className="mb-1 text-sm text-white/50">CoinCloud</p>
        <h1 className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-tight">
          <Lock className="h-5 w-5 text-white/50" />
          Wallet locked
        </h1>
        <p className="mt-2 text-sm text-white/45">
          Enter your password to unlock {user?.username || 'your account'}
        </p>

        <form onSubmit={onUnlock} className="mt-8 space-y-3 text-left">
          <input
            type="password"
            className="x-input text-center"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" disabled={loading} className="x-btn-primary w-full py-3">
            {loading ? 'Unlocking…' : 'Unlock'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            unlock()
            logout()
            window.location.href = '/login'
          }}
          className="mt-6 text-xs text-white/40 underline hover:text-white/70"
        >
          Sign out instead
        </button>
      </div>
    </div>
  )
}
