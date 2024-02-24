'use client'

import { FC, ReactNode, createContext, useContext, useMemo } from 'react'
import { useBarData } from 'src/lib/stake'
import { ChainId } from 'sushi/chain'
import { Amount, SUSHI, Type, XSUSHI, tryParseAmount } from 'sushi/currency'

interface SushiBarContext {
  totalSupply: Amount<Type> | undefined
  sushiBalance: Amount<Type> | undefined
  apy: number | undefined
  isLoading: boolean
  isError: boolean
}

const Context = createContext<SushiBarContext | undefined>(undefined)

export const SushiBarProvider: FC<{
  children: ReactNode
  watch?: boolean
}> = ({ children }) => {
  const { data, isLoading, isError } = useBarData()

  const [sushiBalance, totalSupply, apy] = useMemo(
    () => [
      tryParseAmount(data?.xsushi?.sushiSupply, SUSHI[ChainId.ETHEREUM]),
      tryParseAmount(data?.xsushi?.xSushiSupply, XSUSHI[ChainId.ETHEREUM]),
      data?.xsushi?.apr1m ? data.xsushi.apr1m * 12 : undefined,
    ],
    [data],
  )

  return (
    <Context.Provider
      value={useMemo(
        () => ({
          totalSupply,
          sushiBalance,
          apy,
          isLoading,
          isError,
        }),
        [sushiBalance, totalSupply, apy, isError, isLoading],
      )}
    >
      {children}
    </Context.Provider>
  )
}

export const useSushiBar = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('Hook can only be used inside SushiBar Context')
  }

  return context
}
