import { classNames } from '@sushiswap/ui'
import { Badge } from '@sushiswap/ui/components/badge'
import { Currency } from '@sushiswap/ui/components/currency'
import { NetworkIcon } from '@sushiswap/ui/components/icons'
import { ConcentratedLiquidityPositionWithV3Pool } from '@sushiswap/wagmi'
import { Row } from '@tanstack/react-table'
import { FC, useMemo } from 'react'
import { unwrapToken } from 'src/lib/functions'
import { ChainId } from 'sushi/chain'
import { Type } from 'sushi/currency'
import { formatNumber } from 'sushi/format'

export const PoolNameCellV3: FC<Row<ConcentratedLiquidityPositionWithV3Pool>> =
  ({ original }) => {
    const [_token0, _token1]: Type[] = useMemo(
      () => [
        unwrapToken(original.pool.token0),
        unwrapToken(original.pool.token1),
      ],
      [original],
    )
    return (
      <div className="flex items-center gap-5">
        <div className="hidden sm:flex">
          {_token0 && _token1 && (
            <Badge
              className="border-2 border-slate-900 rounded-full z-[11]"
              position="bottom-right"
              badgeContent={
                <NetworkIcon
                  chainId={original.chainId as ChainId}
                  width={14}
                  height={14}
                />
              }
            >
              <Currency.IconList iconWidth={26} iconHeight={26}>
                <Currency.Icon disableLink currency={_token0} />
                <Currency.Icon disableLink currency={_token1} />
              </Currency.IconList>
            </Badge>
          )}
        </div>
        <div className="flex sm:hidden" />
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm flex items-center gap-1 text-gray-900 dark:text-slate-50">
            {_token0?.symbol}{' '}
            <span className="font-normal text-gray-900 dark:text-slate-500">
              /
            </span>{' '}
            {_token1?.symbol}{' '}
            <div
              className={classNames(
                'text-[10px] bg-gray-200 dark:bg-slate-700 rounded-lg px-1 ml-1',
              )}
            />
          </span>
          <div className="flex gap-1">
            <div className="bg-blue/20 text-blue text-[10px] px-2 rounded-full">
              V3
            </div>
            <div className="bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] px-2 rounded-full">
              {formatNumber(original.fee / 10000)}%
            </div>
          </div>
        </div>
      </div>
    )
  }
