import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('dq_users')
    .select('*, dq_levels(name, display_name, referral_percent)')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Auto-create profile from auth metadata
    const meta = user.user_metadata || {}
    const { data: level } = await supabaseAdmin
      .from('dq_levels')
      .select('id, name')
      .eq('name', meta.level || 'starter')
      .single()

    const { data: newProfile } = await supabaseAdmin
      .from('dq_users')
      .insert({
        id: user.id,
        email: user.email,
        full_name: meta.full_name || '',
        phone: meta.phone || '',
        level_id: level?.id,
        status: 'pending',
      })
      .select('*, dq_levels(name, display_name, referral_percent)')
      .single()

    return NextResponse.json({
      full_name: newProfile?.full_name || '',
      level: (newProfile?.dq_levels as any)?.name || 'starter',
      available_balance: 0,
      locked_balance: 0,
      total_earned: 0,
      referral_code: newProfile?.referral_code || '',
      referral_count: 0,
      status: 'pending',
    })
  }

  return NextResponse.json({
    full_name: profile.full_name || '',
    level: (profile.dq_levels as any)?.name || 'starter',
    available_balance: profile.available_balance || 0,
    locked_balance: profile.locked_balance || 0,
    total_earned: profile.total_earned || 0,
    referral_code: profile.referral_code || '',
    referral_count: profile.referral_count || 0,
    status: profile.status || 'pending',
  })
}

