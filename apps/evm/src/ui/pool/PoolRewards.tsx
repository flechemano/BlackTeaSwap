'use client'

import { Pool } from '@sushiswap/client'
import {
  CardContent,
  CardCurrencyAmountItem,
  CardGroup,
  CardHeader,
  CardLabel,
  CardTitle,
} from '@sushiswap/ui'
import { Card, CardDescription } from '@sushiswap/ui/components/card'
import React, { FC } from 'react'
import { incentiveRewardToToken } from 'src/lib/functions'
import { ChainId } from 'sushi/chain'
import { tryParseAmount } from 'sushi/currency'

export const PoolRewards: FC<{ pool: Pool }> = ({ pool }) => {
  const incentives = pool.incentives.filter(
    (incentive) => incentive.rewardPerDay > 0,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rewards</CardTitle>
        <CardDescription>
          Distributed to everyone who provides liquidity to this pool. <br />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CardGroup>
          <CardLabel>Tokens (per day)</CardLabel>
          {incentives.map((incentive, index) => {
            const amount = tryParseAmount(
              incentive.rewardPerDay.toString(),
              incentiveRewardToToken(pool.chainId as ChainId, incentive),
            )
            return <CardCurrencyAmountItem key={index} amount={amount} />
          })}
        </CardGroup>
      </CardContent>
    </Card>
  )
}
