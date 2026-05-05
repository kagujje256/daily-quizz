import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const [usersRes, activeRes, earnedRes] = await Promise.all([
    supabaseAdmin.from('dq_users').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('dq_users').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('dq_users').select('total_earned, locked_balance'),
  ])

  const totalEarned = (earnedRes.data || []).reduce((sum, u) => sum + (u.total_earned || 0), 0)
  const totalEntryFees = (earnedRes.data || []).reduce((sum, u) => sum + (u.locked_balance || 0), 0)
  const ownerRevenue = totalEntryFees * 0.30  // 30% owner cut

  return NextResponse.json({
    total_users: usersRes.count || 0,
    active_users: activeRes.count || 0,
    total_earned: totalEarned,
    owner_revenue: ownerRevenue,
    total_entry_fees: totalEntryFees,
  })
}
