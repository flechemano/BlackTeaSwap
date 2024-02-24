'use client'

import { Pool } from '@sushiswap/client'
import { Chip, SkeletonBox, classNames } from '@sushiswap/ui'
import React, { FC, useMemo } from 'react'
import { SushiSwapV3ChainId } from 'sushi/config'
import { Token } from 'sushi/currency'
import { useConcentratedActiveLiquidity } from '../../../../lib/pool/v3/use-concentrated-active-liquidity'

interface SteerLiquidityInRangeChipProps {
  vault: Pool['steerVaults'][0]
}

export const SteerLiquidityInRangeChip: FC<SteerLiquidityInRangeChipProps> = ({
  vault,
}) => {
  const concentratedActiveLiquidityArgs = useMemo(() => {
    const token0 = new Token({ ...vault.token0, chainId: vault.chainId })
    const token1 = new Token({ ...vault.token1, chainId: vault.chainId })

    return {
      token0,
      token1,
      feeAmount: vault.feeTier * 1000000,
      chainId: vault.chainId as SushiSwapV3ChainId,
    }
  }, [vault.chainId, vault.feeTier, vault.token0, vault.token1])

  const { activeTick, isLoading: isActiveTickLoading } =
    useConcentratedActiveLiquidity(concentratedActiveLiquidityArgs)

  const inRange = useMemo(() => {
    if (activeTick === undefined) return undefined
    return vault.lowerTick < activeTick && vault.upperTick > activeTick
  }, [vault.lowerTick, vault.upperTick, activeTick])

  if (isActiveTickLoading)
    return <SkeletonBox className="w-[107px] h-5 rounded-full" />

  return (
    <>
      {typeof inRange === 'boolean' && (
        <Chip
          variant={'outline'}
          className={classNames(
            inRange
              ? 'bg-green/20 text-green hover:bg-green/40'
              : 'bg-red/20 text-red hover:bg-red/[0.35]',
          )}
        >
          <div className="inline-flex space-x-1.5 items-center">
            <div
              className={classNames(
                inRange ? 'bg-green' : 'bg-red',
                'w-2 h-2 rounded-full',
              )}
            />
            <span>{inRange ? 'In' : 'Out of'} Range</span>
          </div>
        </Chip>
      )}
    </>
  )
}
