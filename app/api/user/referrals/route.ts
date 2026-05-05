import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('dq_users')
    .select('referral_code, referral_count, dq_levels(referral_percent)')
    .eq('id', user.id)
    .single()

  const { data: referrals } = await supabaseAdmin
    .from('dq_users')
    .select('id, full_name, created_at, dq_levels(name), locked_balance')
    .eq('referred_by', user.id)
    .order('created_at', { ascending: false })

  // Calculate total earned from referrals
  const referralPercent = (profile?.dq_levels as any)?.referral_percent || 10
  const totalEarned = (referrals || []).reduce((sum, r) => {
    return sum + ((r.locked_balance || 0) * referralPercent / 100)
  }, 0)

  return NextResponse.json({
    referral_code: profile?.referral_code || '',
    referral_percent: referralPercent,
    total_referrals: referrals?.length || 0,
    total_earned: totalEarned,
    referrals: (referrals || []).map(r => ({
      id: r.id,
      full_name: r.full_name,
      level: (r.dq_levels as any)?.name || 'starter',
      created_at: r.created_at,
      bonus_earned: (r.locked_balance || 0) * referralPercent / 100,
    })),
  })
}
