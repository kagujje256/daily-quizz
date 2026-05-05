import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const MIN_WITHDRAWAL = 5000

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount_ugx, phone_number, network } = await req.json()

  if (!amount_ugx || amount_ugx < MIN_WITHDRAWAL) {
    return NextResponse.json({ error: `Minimum withdrawal is UGX ${MIN_WITHDRAWAL.toLocaleString()}` }, { status: 400 })
  }

  const { data: profile } = await supabaseAdmin
    .from('dq_users')
    .select('available_balance, status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status !== 'active') {
    return NextResponse.json({ error: 'Account not active' }, { status: 403 })
  }

  if (profile.available_balance < amount_ugx) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 })
  }

  const reference = `DQ-${user.id.slice(0, 8)}-${Date.now()}`

  // Initiate MarzPay payout
  const marzRes = await fetch(`${process.env.MARZPAY_BASE_URL}/disbursements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.MARZPAY_AUTH_HEADER}`,
    },
    body: JSON.stringify({
      phone_number,
      amount: amount_ugx,
      country: 'UG',
      reference,
      description: `Daily Quizz withdrawal`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/marzpay`,
    }),
  })

  const marzData = await marzRes.json()

  // Deduct balance regardless (pending)
  const newBalance = profile.available_balance - amount_ugx
  await supabaseAdmin.from('dq_users').update({ available_balance: newBalance }).eq('id', user.id)

  // Record withdrawal
  await supabaseAdmin.from('dq_withdrawals').insert({
    user_id: user.id,
    amount_ugx,
    phone_number,
    network,
    status: 'pending',
    marzpay_reference: reference,
  })

  // Record transaction
  await supabaseAdmin.from('dq_transactions').insert({
    user_id: user.id,
    type: 'withdrawal',
    amount_ugx: -amount_ugx,
    balance_after: newBalance,
    reference,
    description: `Withdrawal to ${phone_number} (${network})`,
    status: 'pending',
  })

  return NextResponse.json({ success: true, message: 'Withdrawal initiated', reference })
}

