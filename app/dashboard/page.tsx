'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wallet, CheckCircle, Users, Star, ArrowRight, Loader2, LogOut, LayoutDashboard, ListTodo, TrendingUp, Gift, Play, HelpCircle, Share2, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  full_name: string
  level: string
  available_balance: number
  locked_balance: number
  total_earned: number
  referral_code: string
  referral_count: number
  status: string
}

interface Task {
  id: string
  title: string
  description: string
  task_type: string
  reward_ugx: number
  url?: string
  quiz_question?: string
  quiz_options?: string[]
  quiz_answer?: string
}

const TASK_ICONS: Record<string, any> = {
  watch_video: Play,
  answer_quiz: HelpCircle,
  share: Share2,
  follow: Users,
  survey: ListTodo,
  refer: Gift,
}

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/dashboard/referrals', icon: Users, label: 'Referrals' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [quizAnswer, setQuizAnswer] = useState('')
  const [completing, setCompleting] = useState(false)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [profileRes, tasksRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/tasks'),
      ])
      const profileData = await profileRes.json()
      const tasksData = await tasksRes.json()
      setProfile(profileData)
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setLoading(false)
    }
    load()
  }, [router])

  const completeTask = async (task: Task, answer?: string) => {
    setCompleting(true)
    try {
      const res = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: task.id, proof: answer || 'completed' }),
      })
      const data = await res.json()
      if (res.ok) {
        setCompletedIds(prev => new Set([...prev, task.id]))
        setProfile(prev => prev ? { ...prev, available_balance: prev.available_balance + task.reward_ugx, total_earned: prev.total_earned + task.reward_ugx } : prev)
        setActiveTask(null)
        setQuizAnswer('')
      }
    } finally {
      setCompleting(false)
    }
  }

  const copyReferral = () => {
    const link = `https://daily.qzz.io/register?ref=${profile?.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all w-full">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black">Welcome back, {profile?.full_name?.split(' ')[0] || 'Earner'} 👋</h1>
            <p className="text-white/40 text-sm mt-1 capitalize">{profile?.level || 'Starter'} Level · {profile?.status}</p>
          </div>

          {/* Balance cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Available', value: `UGX ${(profile?.available_balance || 0).toLocaleString()}`, color: 'text-yellow-400', icon: Wallet },
              { label: 'Locked (entry)', value: `UGX ${(profile?.locked_balance || 0).toLocaleString()}`, color: 'text-white/60', icon: Star },
              { label: 'Total Earned', value: `UGX ${(profile?.total_earned || 0).toLocaleString()}`, color: 'text-green-400', icon: TrendingUp },
              { label: 'Referrals', value: String(profile?.referral_count || 0), color: 'text-purple-400', icon: Users },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">{s.label}</span>
                  <s.icon className="w-4 h-4 text-white/20" />
                </div>
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Referral link */}
          <div className="glass rounded-2xl p-5 mb-8 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">Your Referral Link</p>
              <p className="text-sm font-mono text-white/60 truncate">
                https://daily.qzz.io/register?ref={profile?.referral_code}
              </p>
            </div>
            <button onClick={copyReferral}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${copied ? 'bg-green-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Today's Tasks</h2>
              <span className="text-xs text-white/30">{tasks.length} available</span>
            </div>
            {tasks.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center text-white/20">
                <ListTodo className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No tasks available right now. Check back soon!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {tasks.map(task => {
                  const Icon = TASK_ICONS[task.task_type] || CheckCircle
                  const done = completedIds.has(task.id)
                  return (
                    <div key={task.id}
                      className={`glass rounded-2xl p-5 transition-all ${done ? 'opacity-50' : 'hover:border-yellow-500/20 cursor-pointer'}`}
                      onClick={() => !done && setActiveTask(task)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                          <Icon className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 font-black">+{task.reward_ugx.toLocaleString()}</div>
                          <div className="text-xs text-white/30">UGX</div>
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{task.title}</h3>
                      <p className="text-xs text-white/40 line-clamp-2">{task.description}</p>
                      {done && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Completed
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Task Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">{activeTask.title}</h3>
              <button onClick={() => setActiveTask(null)} className="text-white/30 hover:text-white text-xl">×</button>
            </div>
            <p className="text-sm text-white/50 mb-4">{activeTask.description}</p>

            {activeTask.url && (
              <a href={activeTask.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 w-full justify-center py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 hover:text-white hover:border-white/20 transition-all mb-4">
                <Play className="w-4 h-4" /> Open Task Link
              </a>
            )}

            {activeTask.quiz_question && (
              <div className="mb-4">
                <p className="text-sm font-semibold mb-3">{activeTask.quiz_question}</p>
                <div className="space-y-2">
                  {(activeTask.quiz_options || []).map((opt, i) => (
                    <button key={i} onClick={() => setQuizAnswer(opt)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                        quizAnswer === opt ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400' : 'bg-white/5 border border-white/10 text-white/60 hover:border-white/20'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-yellow-400 font-black">+{activeTask.reward_ugx.toLocaleString()} UGX</span>
              <button
                onClick={() => completeTask(activeTask, quizAnswer || 'completed')}
                disabled={completing || (!!activeTask.quiz_question && !quizAnswer)}
                className="flex items-center gap-2 gold-bg text-black font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 text-sm"
              >
                {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Complete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
