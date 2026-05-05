import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('dq_tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('dq_tasks')
    .insert({
      title: body.title,
      description: body.description,
      task_type: body.task_type,
      reward_ugx: body.reward_ugx,
      url: body.url || null,
      quiz_question: body.quiz_question || null,
      quiz_options: body.quiz_options || null,
      quiz_answer: body.quiz_answer || null,
      min_level: body.min_level || 'starter',
      daily_limit: body.daily_limit || 5,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
