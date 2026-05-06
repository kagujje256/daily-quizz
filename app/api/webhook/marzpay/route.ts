import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const OWNER_CUT = 0.30

export async function POST(req: Request) {
  const body = await req.json()
  const { event, data } = body

  if (event === 'collection.success') {
    const reference = data?.reference
    const amount_ugx = parseInt(data?.amount || '0')

    // Find pending transaction
    const { data: tx } = await supabaseAdmin
      .from('dq_transactions')
      .select('user_id')
      .eq('reference', reference)
      .eq('status', 'pending')
      .single()

    if (!tx) return NextResponse.json({ received: true })

    const userId = tx.user_id

    // Get user + level
    const { data: dqUser } = await supabaseAdmin
      .from('dq_users')
      .select('*, dq_levels(referral_percent, display_name)')
      .eq('id', userId)
      .single()

    if (!dqUser) return NextResponse.json({ received: true })

    const level = dqUser.dq_levels as any
    const referrerId = dqUser.referred_by
    const ownerCut = Math.floor(amount_ugx * OWNER_CUT)
    const referralPercent = level?.referral_percent || 10
    const referralBonus = referrerId ? Math.floor(amount_ugx * (referralPercent / 100)) : 0
    const lockedAmount = amount_ugx - ownerCut - referralBonus

    // Activate user
    await supabaseAdmin.from('dq_users').update({
      status: 'active',
      locked_balance: lockedAmount,
      entry_paid_at: new Date().toISOString(),
    }).eq('id', userId)

    // Mark transaction complete
    await supabaseAdmin.from('dq_transactions')
      .update({ status: 'completed', balance_after: lockedAmount })
      .eq('reference', reference)

    // Pay referral bonus
    if (referrerId && referralBonus > 0) {
      const { data: referrer } = await supabaseAdmin
        .from('dq_users').select('available_balance, referral_count').eq('id', referrerId).single()

      const newBal = (referrer?.available_balance || 0) + referralBonus
      await supabaseAdmin.from('dq_users').update({
        available_balance: newBal,
        referral_count: (referrer?.referral_count || 0) + 1,
      }).eq('id', referrerId)

      await supabaseAdmin.from('dq_transactions').insert({
        user_id: referrerId,
        type: 'referral_bonus',
        amount_ugx: referralBonus,
        balance_after: newBal,
        reference: `REF-${reference}`,
        description: `Referral bonus — new ${level?.display_name || 'member'}`,
        status: 'completed',
      })
    }

    // Track owner revenue
    const today = new Date().toISOString().split('T')[0]
    await supabaseAdmin.from('dq_revenue').upsert({
      date: today,
      entry_fees_collected: amount_ugx,
      owner_cut: ownerCut,
      referral_bonuses_paid: referralBonus,
    }, { onConflict: 'date' })
  }

  return NextResponse.json({ received: true })
}
