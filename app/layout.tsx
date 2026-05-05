import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Daily Quizz — Earn Money Daily',
  description: 'Answer quizzes, watch videos, refer friends and earn real UGX daily. Withdraw to MTN MoMo or Airtel.',
  keywords: 'earn money Uganda, daily quizz, make money online Uganda, MTN MoMo earnings',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
