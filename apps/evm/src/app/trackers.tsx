'use client'

import { GoogleAnalytics } from '@sushiswap/ui/components/scripts'
import { Analytics as VercelAnalytics } from '@vercel/analytics/react'

export function Trackers() {
  return (
    <>
      <VercelAnalytics />
      <GoogleAnalytics />
    </>
  )
}
