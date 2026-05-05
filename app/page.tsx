import Link from 'next/link'
import { ArrowRight, Star, Users, Zap, Shield, TrendingUp, CheckCircle } from 'lucide-react'

const levels = [
  {
    name: 'Starter',
    entry: '15,000',
    earn: '200 – 800',
    referral: '10%',
    tasks: ['Watch YouTube videos', 'Answer 3-question polls', 'Like & share posts', 'Join Telegram groups'],
    color: 'border-white/10',
    badge: '',
  },
  {
    name: 'Active',
    entry: '35,000',
    earn: '800 – 3,000',
    referral: '15%',
    tasks: ['Post comments & reviews', '5–10 question surveys', 'Follow accounts', 'Watch longer videos + quiz'],
    color: 'border-yellow-500/30',
    badge: 'POPULAR',
  },
  {
    name: 'Pro',
    entry: '75,000',
    earn: '3,000 – 12,000',
    referral: '20%',
    tasks: ['Create memes & 15s videos', 'Detailed product reviews', 'Refer new paying users', 'App testing & data entry'],
    color: 'border-purple-500/30',
    badge: 'HIGHEST EARNER',
  },
]

const stats = [
  { value: '12,400+', label: 'Active earners' },
  { value: 'UGX 36,500', label: 'Avg weekly earnings' },
  { value: '2 min', label: 'Withdrawal time' },
  { value: '120 days', label: 'Entry refund period' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gold-bg rounded-lg flex items-center justify-center font-black text-black text-sm">DQ</div>
            <span className="font-black text-lg">Daily Quizz</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white px-4 py-2 transition-colors">Sign in</Link>
            <Link href="/register" className="text-sm font-bold gold-bg text-black px-5 py-2 rounded-xl hover:opacity-90 transition-opacity">
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            12,400+ Ugandans earning daily
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            Answer quizzes.<br />
            <span className="text-yellow-400">Get paid.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            Watch videos, answer quizzes, share posts — earn real UGX every day.
            Withdraw to MTN MoMo or Airtel in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="inline-flex items-center gap-2 gold-bg text-black font-black px-8 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-105">
              Start Earning Today <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#levels"
              className="inline-flex items-center gap-2 border border-white/10 text-white/70 font-medium px-8 py-4 rounded-xl hover:border-white/20 hover:text-white transition-all">
              See earning levels
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-yellow-400">{s.value}</div>
              <div className="text-sm text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">How it works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Join & Pick a Level', desc: 'Sign up, choose Starter, Active, or Pro. Pay entry fee via MTN MoMo or Airtel.' },
              { step: '02', title: 'Complete Tasks Daily', desc: 'Watch videos, answer quizzes, share posts. Each task pays UGX directly to your wallet.' },
              { step: '03', title: 'Refer & Multiply', desc: 'Share your link. Earn a % of every friend\'s entry fee — forever. Top referrers earn UGX 200,000+/month.' },
            ].map(item => (
              <div key={item.step} className="glass rounded-2xl p-6">
                <div className="text-4xl font-black text-yellow-400/20 mb-4">{item.step}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Levels */}
      <section id="levels" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Choose your level</h2>
            <p className="text-white/40">Entry fee is refundable after 120 days. Task earnings are always withdrawable.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {levels.map(level => (
              <div key={level.name} className={`glass rounded-2xl p-6 border ${level.color} relative`}>
                {level.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full gold-bg text-black">
                    {level.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-black mb-1">{level.name}</h3>
                  <div className="text-3xl font-black text-yellow-400">UGX {level.entry}</div>
                  <div className="text-xs text-white/30 mt-1">Refundable after 120 days</div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Earn per task</span>
                    <span className="font-bold">UGX {level.earn}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Referral bonus</span>
                    <span className="font-bold text-yellow-400">{level.referral} of entry</span>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  {level.tasks.map(task => (
                    <div key={task} className="flex items-start gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      {task}
                    </div>
                  ))}
                </div>
                <Link href="/register"
                  className="w-full block text-center font-bold py-3 rounded-xl transition-all text-sm gold-bg text-black hover:opacity-90">
                  Join {level.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Users className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">
            Build your circle.<br />Multiply your bag.
          </h2>
          <p className="text-white/40 mb-10 leading-relaxed">
            Refer friends and earn a commission on every entry they pay — forever.
            Top referrers pull UGX 200,000+ a month in pure referral income.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 gold-bg text-black font-black px-8 py-4 rounded-xl hover:opacity-90 transition-all">
            Get my referral link <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 gold-bg rounded-md flex items-center justify-center font-black text-black text-xs">DQ</div>
            <span className="font-bold">Daily Quizz</span>
          </div>
          <p className="text-xs text-white/20">© 2026 Daily Quizz · daily.qzz.io · Part of Kagujje Digital</p>
          <div className="flex gap-6">
            {['Terms', 'Privacy', 'How it works'].map(l => (
              <a key={l} href="#" className="text-xs text-white/30 hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
