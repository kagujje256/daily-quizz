import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profileRes, txRes] = await Promise.all([
    supabaseAdmin.from('dq_users').select('available_balance, locked_balance').eq('id', user.id).single(),
    supabaseAdmin.from('dq_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
  ])

  return NextResponse.json({
    balance: profileRes.data?.available_balance || 0,
    locked: profileRes.data?.locked_balance || 0,
    transactions: txRes.data || [],
  })
}

