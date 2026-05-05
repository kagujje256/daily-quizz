// POST /api/join — initiate entry fee payment
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

const JoinSchema = z.object({
  level_id: z.string().uuid(),
  phone_number: z.string().min(10),
  country: z.enum(['UG', 'KE']),
  referral_code: z.string().optional(),
})

const MARZPAY_BASE = process.env.MARZPAY_BASE_URL!
const MARZPAY_AUTH = process.env.MARZPAY_AUTH_HEADER!
const OWNER_CUT = 0.30  // 30% to owner

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = JoinSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { level_id, phone_number, country, referral_code } = parsed.data

  // Get level details
  const { data: level } = await supabaseAdmin
    .from('dq_levels').select('*').eq('id', level_id).single()
  if (!level) return NextResponse.json({ error: 'Invalid level' }, { status: 404 })

  // Check if user already joined
  const { data: existing } = await supabaseAdmin
    .from('dq_users').select('id, status').eq('id', user.id).single()
  if (existing?.status === 'active') {
    return NextResponse.json({ error: 'Already a member' }, { status: 400 })
  }

  // Find referrer
  let referrerId: string | null = null
  if (referral_code) {
    const { data: referrer } = await supabaseAdmin
      .from('dq_users').select('id').eq('referral_code', referral_code).single()
    referrerId = referrer?.id || null
  }

  const reference = `DQ-${user.id.slice(0, 8)}-${Date.now()}`

  // Initiate MarzPay collection
  const form = new FormData()
  form.append('phone_number', phone_number)
  form.append('amount', level.entry_ugx.toString())
  form.append('country', country)
  form.append('reference', reference)
  form.append('description', `Daily Quizz ${level.display_name} entry fee`)
  form.append('callback_url', `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/marzpay`)

  const payRes = await fetch(`${MARZPAY_BASE}/collect-money`, {
    method: 'POST',
    headers: { Authorization: `Basic ${MARZPAY_AUTH}` },
    body: form,
  })
  const payment = await payRes.json()

  if (!payment.success) {
    return NextResponse.json({ error: payment.message || 'Payment failed' }, { status: 400 })
  }

  // Create/update user record as pending
  const entryUnlocksAt = new Date()
  entryUnlocksAt.setDate(entryUnlocksAt.getDate() + level.lock_days)

  await supabaseAdmin.from('dq_users').upsert({
    id: user.id,
    email: user.email!,
    level_id,
    referred_by: referrerId,
    status: 'pending',
    entry_unlocks_at: entryUnlocksAt.toISOString(),
  }, { onConflict: 'id' })

  // Record pending transaction
  await supabaseAdmin.from('dq_transactions').insert({
    user_id: user.id,
    type: 'entry_fee',
    amount_ugx: level.entry_ugx,
    balance_after: 0,
    reference,
    description: `${level.display_name} entry fee`,
    status: 'pending',
  })

  return NextResponse.json({
    message: 'Payment initiated. Check your phone for the prompt.',
    reference,
    amount_ugx: level.entry_ugx,
  })
}
