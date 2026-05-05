import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { task_id, proof } = await req.json()
  if (!task_id) return NextResponse.json({ error: 'task_id required' }, { status: 400 })

  // Get task
  const { data: task } = await supabaseAdmin
    .from('dq_tasks')
    .select('*')
    .eq('id', task_id)
    .eq('is_active', true)
    .single()

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  // Check if already completed today
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabaseAdmin
    .from('dq_completions')
    .select('id')
    .eq('user_id', user.id)
    .eq('task_id', task_id)
    .gte('completed_at', today)
    .single()

  if (existing) return NextResponse.json({ error: 'Already completed today' }, { status: 409 })

  // Validate quiz answer if applicable
  if (task.quiz_answer && proof !== task.quiz_answer) {
    return NextResponse.json({ error: 'Wrong answer' }, { status: 400 })
  }

  // Get user balance
  const { data: profile } = await supabaseAdmin
    .from('dq_users')
    .select('available_balance, total_earned, status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status !== 'active') {
    return NextResponse.json({ error: 'Account not active. Please complete your entry payment.' }, { status: 403 })
  }

  const newBalance = (profile.available_balance || 0) + task.reward_ugx
  const newTotalEarned = (profile.total_earned || 0) + task.reward_ugx

  // Record completion
  await supabaseAdmin.from('dq_completions').insert({
    user_id: user.id,
    task_id,
    reward_ugx: task.reward_ugx,
    proof,
    status: 'completed',
  })

  // Update balance
  await supabaseAdmin.from('dq_users').update({
    available_balance: newBalance,
    total_earned: newTotalEarned,
  }).eq('id', user.id)

  // Record transaction
  await supabaseAdmin.from('dq_transactions').insert({
    user_id: user.id,
    type: 'task_reward',
    amount_ugx: task.reward_ugx,
    balance_after: newBalance,
    description: `Task reward: ${task.title}`,
    status: 'completed',
  })

  // Update task completion count
  await supabaseAdmin.from('dq_tasks')
    .update({ total_completions: (task.total_completions || 0) + 1 })
    .eq('id', task_id)

  return NextResponse.json({
    success: true,
    reward_ugx: task.reward_ugx,
    new_balance: newBalance,
  })
}

