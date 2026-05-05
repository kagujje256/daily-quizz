'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 gold-bg rounded-xl flex items-center justify-center font-black text-black">DQ</div>
            <span className="font-black text-xl">Daily Quizz</span>
          </Link>
          <h1 className="text-2xl font-black">Welcome back</h1>
          <p className="text-white/40 text-sm mt-2">Sign in to continue earning</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 gold-bg text-black font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-white/40">
              New here?{' '}
              <Link href="/register" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">Join & start earning</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
