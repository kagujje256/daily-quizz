'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Wallet, ArrowDownLeft, ArrowUpRight, Loader2, Phone, CheckCircle, LayoutDashboard, ListTodo, Users, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/dashboard/referrals', icon: Users, label: 'Referrals' },
]

const NETWORKS = [
  { code: 'MTN', name: 'MTN MoMo', flag: '🟡' },
  { code: 'Airtel', name: 'Airtel Money', flag: '🔴' },
]

export default function WalletPage() {
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', phone: '', network: 'MTN' })
  const [withdrawing, setWithdrawing] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/user/wallet')
      .then(r => r.json())
      .then(data => { setBalance(data.balance || 0); setTransactions(data.transactions || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setWithdrawing(true)
    setErr('')
    setMsg('')
    try {
      const res = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_ugx: parseInt(withdrawForm.amount), phone_number: withdrawForm.phone, network: withdrawForm.network }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Withdrawal failed')
      setMsg(`✅ Withdrawal of UGX ${parseInt(withdrawForm.amount).toLocaleString()} initiated to ${withdrawForm.phone}`)
      setBalance(prev => prev - parseInt(withdrawForm.amount))
      setWithdrawForm(p => ({ ...p, amount: '', phone: '' }))
    } catch (e: any) { setErr(e.message) }
    finally { setWithdrawing(false) }
  }

  const signOut = async () => { await supabase.auth.signOut(); router.push('/') }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <aside className="w-56 border-r border-white/5 flex flex-col fixed h-full">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gold-bg rounded-lg flex items-center justify-center font-black text-black text-sm">DQ</div>
            <span className="font-black">Daily Quizz</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.href === '/dashboard/wallet' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}>
              <item.icon className="w-4 h-4" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all w-full">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="ml-56 flex-1 p-8">
        <div className="max-w-3xl">
          <div className="mb-8">
            <h1 className="text-2xl font-black">Wallet</h1>
            <p className="text-white/40 text-sm mt-1">Withdraw your earnings to mobile money</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Balance */}
            <div className="glass rounded-2xl p-6 border border-yellow-500/10">
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Available to Withdraw</p>
              {loading ? <div className="h-10 w-32 bg-white/5 rounded-lg animate-pulse" /> : (
                <div className="text-4xl font-black text-yellow-400">UGX {balance.toLocaleString()}</div>
              )}
              <p className="text-xs text-white/30 mt-2">Min. withdrawal: UGX 5,000</p>
            </div>

            {/* Withdraw form */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold mb-4">Withdraw Funds</h3>
              <form onSubmit={handleWithdraw} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Network</label>
                  <div className="flex gap-2">
                    {NETWORKS.map(n => (
                      <button key={n.code} type="button" onClick={() => setWithdrawForm(p => ({ ...p, network: n.code }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${withdrawForm.network === n.code ? 'gold-bg text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        {n.flag} {n.code}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Amount (UGX)</label>
                  <input type="number" value={withdrawForm.amount} onChange={e => setWithdrawForm(p => ({ ...p, amount: e.target.value }))}
                    required min={5000} max={balance} placeholder="Min. 5,000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="tel" value={withdrawForm.phone} onChange={e => setWithdrawForm(p => ({ ...p, phone: e.target.value }))}
                      required placeholder="0771234567"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
                  </div>
                </div>
                {msg && <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-400">{msg}</div>}
                {err && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{err}</div>}
                <button type="submit" disabled={withdrawing || balance < 5000}
                  className="w-full flex items-center justify-center gap-2 gold-bg text-black font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                  {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Withdraw Now'}
                </button>
              </form>
            </div>
          </div>

          {/* Transactions */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold mb-6">Transaction History</h3>
            {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-yellow-400" /></div>
              : transactions.length === 0 ? (
                <div className="text-center py-12 text-white/20">
                  <Wallet className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.amount_ugx > 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          {tx.amount_ugx > 0 ? <ArrowDownLeft className="w-4 h-4 text-green-400" /> : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-white/30">{new Date(tx.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-sm ${tx.amount_ugx > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount_ugx > 0 ? '+' : ''}UGX {Math.abs(tx.amount_ugx).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  )
}
