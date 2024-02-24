'use client'

import { Pool } from '@sushiswap/client'
import { useAccount } from '@sushiswap/wagmi'
import { useBalanceWeb3 } from '@sushiswap/wagmi'
import { FC, ReactNode, createContext, useContext, useMemo } from 'react'
import {
  useGraphPool,
  useTokenAmountDollarValues,
  useUnderlyingTokenBalanceFromPool,
} from 'src/lib/hooks'
import { ChainId } from 'sushi/chain'
import { Amount, Type } from 'sushi/currency'

interface PoolPositionContext {
  balance: Amount<Type> | null | undefined
  value0: number
  value1: number
  underlying0: Amount<Type> | undefined
  underlying1: Amount<Type> | undefined
  isLoading: boolean
  isError: boolean
}

const Context = createContext<PoolPositionContext | undefined>(undefined)

export const PoolPositionProvider: FC<{
  pool: Pool
  children: ReactNode
  watch?: boolean
}> = ({ pool, children }) => {
  const { address: account } = useAccount()

  const {
    data: { reserve0, reserve1, totalSupply, liquidityToken },
  } = useGraphPool(pool)

  const {
    data: balance,
    isLoading,
    isError,
  } = useBalanceWeb3({
    chainId: pool.chainId as ChainId,
    currency: liquidityToken,
    account,
  })

  const underlying = useUnderlyingTokenBalanceFromPool({
    reserve0,
    reserve1,
    totalSupply,
    balance,
  })

  const [underlying0, underlying1] = underlying
  const [value0, value1] = useTokenAmountDollarValues({
    chainId: pool.chainId,
    amounts: underlying,
  })

  return (
    <Context.Provider
      value={useMemo(
        () => ({
          balance,
          value0,
          value1,
          underlying0,
          underlying1,
          isLoading,
          isError,
        }),
        [balance, isError, isLoading, underlying0, underlying1, value0, value1],
      )}
    >
      {children}
    </Context.Provider>
  )
}

export const usePoolPosition = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('Hook can only be used inside Pool Position Context')
  }

  return context
}
