'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart2, Users, ListTodo, DollarSign, Loader2, Plus, Trash2, Edit, CheckCircle, X, TrendingUp, LogOut } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Overview', icon: BarChart2 },
  { href: '/admin/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: DollarSign },
]

interface Task {
  id: string
  title: string
  task_type: string
  reward_ugx: number
  is_active: boolean
  total_completions: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '', description: '', task_type: 'watch_video', reward_ugx: 500, url: '',
    quiz_question: '', quiz_options: '', quiz_answer: '', min_level: 'starter', daily_limit: 5
  })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/dq-stats').then(r => r.json()),
      fetch('/api/admin/tasks').then(r => r.json()),
    ]).then(([s, t]) => {
      setStats(s)
      setTasks(Array.isArray(t) ? t : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          quiz_options: newTask.quiz_options ? newTask.quiz_options.split('\n').filter(Boolean) : null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setTasks(prev => [data, ...prev])
        setShowAddTask(false)
        setSaveMsg('Task added!')
        setNewTask({ title: '', description: '', task_type: 'watch_video', reward_ugx: 500, url: '', quiz_question: '', quiz_options: '', quiz_answer: '', min_level: 'starter', daily_limit: 5 })
      }
    } finally { setSaving(false) }
  }

  const toggleTask = async (id: string, active: boolean) => {
    await fetch(`/api/admin/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !active }) })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_active: !active } : t))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <aside className="w-56 border-r border-white/5 flex flex-col fixed h-full">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gold-bg rounded-lg flex items-center justify-center font-black text-black text-sm">DQ</div>
            <div>
              <span className="font-black text-sm">Daily Quizz</span>
              <span className="block text-[10px] text-white/30 uppercase tracking-wider">Admin</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <item.icon className="w-4 h-4" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <LogOut className="w-4 h-4" /> Back to site
          </Link>
        </div>
      </aside>

      <main className="ml-56 flex-1 p-8">
        <div className="max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black">Admin Overview</h1>
              <p className="text-white/40 text-sm mt-1">Daily Quizz platform management</p>
            </div>
            <button onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 gold-bg text-black font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>

          {saveMsg && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {saveMsg}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Users', value: stats?.total_users || 0, color: 'text-blue-400', icon: Users },
                  { label: 'Active Users', value: stats?.active_users || 0, color: 'text-green-400', icon: CheckCircle },
                  { label: 'Total Earned (UGX)', value: (stats?.total_earned || 0).toLocaleString(), color: 'text-yellow-400', icon: TrendingUp },
                  { label: 'Owner Revenue (UGX)', value: (stats?.owner_revenue || 0).toLocaleString(), color: 'text-purple-400', icon: DollarSign },
                ].map(s => (
                  <div key={s.label} className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">{s.label}</span>
                      <s.icon className={`w-4 h-4 ${s.color} opacity-50`} />
                    </div>
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Tasks list */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold mb-6">Tasks ({tasks.length})</h3>
                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-white/20">
                    <ListTodo className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No tasks yet. Add your first task!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${task.is_active ? 'bg-green-400' : 'bg-white/20'}`} />
                          <div>
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-xs text-white/30 capitalize">{task.task_type.replace('_', ' ')} · {task.total_completions} completions</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-400 font-bold text-sm">UGX {task.reward_ugx.toLocaleString()}</span>
                          <button onClick={() => toggleTask(task.id, task.is_active)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${task.is_active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}>
                            {task.is_active ? 'Disable' : 'Enable'}
                          </button>
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

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Add New Task</h3>
              <button onClick={() => setShowAddTask(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Task Type</label>
                <select value={newTask.task_type} onChange={e => setNewTask(p => ({ ...p, task_type: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-all">
                  {['watch_video', 'answer_quiz', 'share', 'follow', 'survey', 'refer'].map(t => (
                    <option key={t} value={t} className="bg-[#0a0a0a] capitalize">{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Title</label>
                <input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} required
                  placeholder="Watch this YouTube video and answer"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe what users need to do..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all h-20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Reward (UGX)</label>
                  <input type="number" value={newTask.reward_ugx} onChange={e => setNewTask(p => ({ ...p, reward_ugx: parseInt(e.target.value) }))} required min={100}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Min Level</label>
                  <select value={newTask.min_level} onChange={e => setNewTask(p => ({ ...p, min_level: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-all">
                    {['starter', 'active', 'pro'].map(l => <option key={l} value={l} className="bg-[#0a0a0a] capitalize">{l}</option>)}
                  </select>
                </div>
              </div>
              {newTask.task_type === 'watch_video' && (
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Video URL</label>
                  <input value={newTask.url} onChange={e => setNewTask(p => ({ ...p, url: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
                </div>
              )}
              {newTask.task_type === 'answer_quiz' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Question</label>
                    <input value={newTask.quiz_question} onChange={e => setNewTask(p => ({ ...p, quiz_question: e.target.value }))}
                      placeholder="What is the capital of Uganda?"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Options (one per line)</label>
                    <textarea value={newTask.quiz_options} onChange={e => setNewTask(p => ({ ...p, quiz_options: e.target.value }))}
                      placeholder={"Kampala\nNairobi\nDar es Salaam\nKigali"}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all h-24 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Correct Answer</label>
                    <input value={newTask.quiz_answer} onChange={e => setNewTask(p => ({ ...p, quiz_answer: e.target.value }))}
                      placeholder="Kampala"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-all" />
                  </div>
                </>
              )}
              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 gold-bg text-black font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Task</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
