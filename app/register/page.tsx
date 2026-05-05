'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const LEVELS = [
  { id: 'starter', name: 'Starter', entry: 15000, earn: '200–800', color: 'border-white/20' },
  { id: 'active', name: 'Active', entry: 35000, earn: '800–3,000', color: 'border-yellow-500/40', popular: true },
  { id: 'pro', name: 'Pro', entry: 75000, earn: '3,000–12,000', color: 'border-purple-500/40' },
]

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') || ''

  const [step, setStep] = useState(1)
  const [selectedLevel, setSelectedLevel] = useState('active')
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', password: '', referral_code: refCode })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, phone: form.phone, level: selectedLevel, referral_code: form.referral_code }
      }
    })
    if (error) { setError(error.message); setLoading(false) }
    else { setSuccess(true); setTimeout(() => router.push('/dashboard'), 2000) }
  }

  if (success) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-yellow-400" />
        </div>
        <h2 className="text-xl font-black mb-2">You're in!</h2>
        <p className="text-white/40 text-sm">Setting up your dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 gold-bg rounded-xl flex items-center justify-center font-black text-black">DQ</div>
            <span className="font-black text-xl">Daily Quizz</span>
          </Link>
          <h1 className="text-2xl font-black">Join & start earning</h1>
          <p className="text-white/40 text-sm mt-2">Step {step} of 2</p>
        </div>

        {step === 1 ? (
          <div>
            <h2 className="text-center font-bold mb-6 text-white/70">Choose your earning level</h2>
            <div className="grid gap-4 mb-6">
              {LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`glass rounded-2xl p-5 text-left border-2 transition-all relative ${
                    selectedLevel === level.id ? 'border-yellow-500/60 bg-yellow-500/5' : level.color
                  }`}
                >
                  {level.popular && (
                    <span className="absolute -top-2.5 right-4 text-[10px] font-black px-2 py-0.5 gold-bg text-black rounded-full">POPULAR</span>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-lg">{level.name}</p>
                      <p className="text-sm text-white/40 mt-0.5">Earn UGX {level.earn} per task</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-yellow-400">{level.entry.toLocaleString()}</p>
                      <p className="text-xs text-white/30">UGX entry</p>
                    </div>
                  </div>
                  {selectedLevel === level.id && (
                    <div className="mt-3 pt-3 border-t border-yellow-500/20 text-xs text-yellow-400/70">
                      ✓ Entry fee refundable after 120 days · Earn daily from tasks
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 gold-bg text-black font-bold py-3.5 rounded-xl hover:opacity-90 transition-all"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400 font-semibold">
                {LEVELS.find(l => l.id === selectedLevel)?.name} Level — UGX {LEVELS.find(l => l.id === selectedLevel)?.entry.toLocaleString()} entry
              </span>
              <button onClick={() => setStep(1)} className="ml-auto text-xs text-white/30 hover:text-white">Change</button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Full Name</label>
                  <input name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Your name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required placeholder="0771234567"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} required minLength={8}
                    placeholder="Min. 8 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  Referral Code <span className="text-white/20 normal-case font-normal">(optional)</span>
                </label>
                <input name="referral_code" value={form.referral_code} onChange={handleChange} placeholder="Enter code"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 gold-bg text-black font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-white/40">
                Already have an account?{' '}
                <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold">Sign in</Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}
