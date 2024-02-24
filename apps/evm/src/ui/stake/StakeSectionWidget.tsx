'use client'

import { ArrowDownIcon } from '@heroicons/react/20/solid'
import {
  Widget,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetTitle,
} from '@sushiswap/ui'
import { Web3Input } from '@sushiswap/wagmi'
import { ReactNode, useMemo } from 'react'
import { ChainId } from 'sushi/chain'
import { Amount, SUSHI, Type, XSUSHI } from 'sushi/currency'
import { useSushiBar } from './SushiBarProvider'
import { XSushiPrice } from './XSushiPrice'

interface StakeSectionWidgetProps {
  input: string
  parsedInput: Amount<Type> | undefined
  onInput(value: string): void
  children: ReactNode
}

export const StakeSectionWidget = ({
  input,
  parsedInput,
  onInput,
  children,
}: StakeSectionWidgetProps) => {
  const { totalSupply, sushiBalance } = useSushiBar()

  const xSushiAmount = useMemo(
    () =>
      parsedInput && totalSupply && sushiBalance
        ? parsedInput.multiply(totalSupply).divide(sushiBalance).toExact()
        : '',
    [parsedInput, totalSupply, sushiBalance],
  )

  return (
    <Widget id="stakeSushi" variant="empty">
      <WidgetHeader>
        <WidgetTitle>Stake</WidgetTitle>
        <WidgetDescription>
          <XSushiPrice totalSupply={totalSupply} sushiBalance={sushiBalance} />
        </WidgetDescription>
      </WidgetHeader>
      <div className="flex flex-col gap-4">
        <Web3Input.Currency
          type="INPUT"
          className="border border-accent px-3 py-1.5 !rounded-xl"
          loading={false}
          value={input}
          onChange={onInput}
          currency={SUSHI[ChainId.ETHEREUM]}
          chainId={ChainId.ETHEREUM}
        />
        <div className="flex items-center justify-center mt-[-24px] mb-[-24px] z-10">
          <div className="p-1 bg-white dark:bg-slate-900 border border-accent rounded-full">
            <ArrowDownIcon
              width={16}
              height={16}
              className="text-muted-foreground"
            />
          </div>
        </div>
        <Web3Input.Currency
          type="INPUT"
          className="border border-accent px-3 py-1.5 !rounded-xl"
          value={xSushiAmount}
          currency={XSUSHI[ChainId.ETHEREUM]}
          chainId={ChainId.ETHEREUM}
          disabled
          disableInsufficientBalanceError
        />
      </div>
      <WidgetFooter>{children}</WidgetFooter>
    </Widget>
  )
}
