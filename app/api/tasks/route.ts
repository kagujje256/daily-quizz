import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get user's level
  const { data: profile } = await supabaseAdmin
    .from('dq_users')
    .select('level_id, dq_levels(name)')
    .eq('id', user.id)
    .single()

  const userLevel = (profile?.dq_levels as any)?.name || 'starter'
  const levelOrder = { starter: 1, active: 2, pro: 3 }
  const userLevelOrder = levelOrder[userLevel as keyof typeof levelOrder] || 1

  // Get tasks user hasn't completed today
  const today = new Date().toISOString().split('T')[0]
  const { data: completedToday } = await supabaseAdmin
    .from('dq_completions')
    .select('task_id')
    .eq('user_id', user.id)
    .gte('completed_at', today)

  const completedIds = (completedToday || []).map(c => c.task_id)

  const { data: tasks } = await supabaseAdmin
    .from('dq_tasks')
    .select('id, title, description, task_type, reward_ugx, url, quiz_question, quiz_options, min_level')
    .eq('is_active', true)
    .order('reward_ugx', { ascending: false })

  // Filter by level and not completed today
  const filtered = (tasks || []).filter(t => {
    const taskLevelOrder = levelOrder[t.min_level as keyof typeof levelOrder] || 1
    return taskLevelOrder <= userLevelOrder && !completedIds.includes(t.id)
  })

  return NextResponse.json(filtered)
}

