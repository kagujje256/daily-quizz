'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Copy, CheckCircle, Loader2, Wallet, LayoutDashboard, ListTodo, LogOut, TrendingUp, Gift } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/dashboard/referrals', icon: Users, label: 'Referrals' },
]

export default function ReferralsPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/user/referrals')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const referralLink = `https://daily.qzz.io/register?ref=${data?.referral_code || ''}`

  const copy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
                item.href === '/dashboard/referrals' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'
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
            <h1 className="text-2xl font-black">Referrals</h1>
            <p className="text-white/40 text-sm mt-1">Earn a % of every friend's entry fee — forever</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="glass rounded-2xl p-5">
                  <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Total Referrals</p>
                  <div className="text-3xl font-black text-yellow-400">{data?.total_referrals || 0}</div>
                </div>
                <div className="glass rounded-2xl p-5">
                  <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Total Earned</p>
                  <div className="text-3xl font-black text-green-400">UGX {(data?.total_earned || 0).toLocaleString()}</div>
                </div>
                <div className="glass rounded-2xl p-5">
                  <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Your Rate</p>
                  <div className="text-3xl font-black text-purple-400">{data?.referral_percent || 10}%</div>
                  <p className="text-xs text-white/30 mt-1">of entry fee</p>
                </div>
              </div>

              {/* Referral link */}
              <div className="glass rounded-2xl p-6 mb-8">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-yellow-400" /> Your Referral Link
                </h3>
                <div className="flex gap-3">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 font-mono truncate">
                    {referralLink}
                  </div>
                  <button onClick={copy}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${copied ? 'bg-green-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    { level: 'Starter', entry: '15,000', earn: '1,500' },
                    { level: 'Active', entry: '35,000', earn: '5,250' },
                    { level: 'Pro', entry: '75,000', earn: '15,000' },
                  ].map(l => (
                    <div key={l.level} className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-white/40 mb-1">{l.level} referral</p>
                      <p className="font-black text-yellow-400 text-sm">+UGX {l.earn}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referrals list */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <Users className="w-4 h-4 text-yellow-400" /> Your Referrals ({data?.referrals?.length || 0})
                </h3>
                {!data?.referrals?.length ? (
                  <div className="text-center py-12 text-white/20">
                    <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No referrals yet. Share your link!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.referrals.map((ref: any) => (
                      <div key={ref.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center text-xs font-black text-yellow-400">
                            {ref.full_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{ref.full_name}</p>
                            <p className="text-xs text-white/30 capitalize">{ref.level} · {new Date(ref.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-400">+UGX {ref.bonus_earned?.toLocaleString() || 0}</p>
                          <p className="text-xs text-white/30">earned</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
