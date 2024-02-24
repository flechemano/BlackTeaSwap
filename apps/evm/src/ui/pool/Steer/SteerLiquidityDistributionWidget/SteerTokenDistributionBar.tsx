'use client'

import { Pool } from '@sushiswap/client'
import { usePrices } from '@sushiswap/react-query'
import { getTokenRatios } from '@sushiswap/steer-sdk'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

interface SteerTokenDistributionBarProps {
  vault: Pool['steerVaults'][0]
}

export function SteerTokenDistributionBar({
  vault,
}: SteerTokenDistributionBarProps) {
  const { data: prices } = usePrices({ chainId: vault.chainId })
  const { data: tokenRatios } = useQuery({
    queryKey: ['tokenRatios', vault, prices],
    queryFn: async () => {
      if (!prices) return

      const numPrices = Object.entries(prices).reduce<Record<string, number>>(
        (acc, [key, value]) => {
          acc[key] = Number(value.toFixed(18))
          return acc
        },
        {},
      )

      try {
        return getTokenRatios({ vault, prices: numPrices })
      } catch (e) {
        console.error(e)
      }

      return {
        token0: 0,
        token1: 0,
      }
    },
    enabled: !!prices,
  })

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500"
          style={{ width: tokenRatios ? `${tokenRatios.token0 * 100}%` : '0%' }}
        />
      </div>
      <div className="flex justify-between text-sm font-extralight">
        <div>{vault.token0.symbol}</div>
        <div>{vault.token1.symbol}</div>
      </div>
    </div>
  )
}
