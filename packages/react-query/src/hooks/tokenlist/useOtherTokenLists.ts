import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { ChainId } from 'sushi/chain'
import { Token } from 'sushi/currency'
import { getAddress, isAddress } from 'viem'

import { isPromiseFulfilled } from 'sushi'
import { BLACKLIST_TOKEN_IDS, DEFAULT_LIST_OF_LISTS } from 'sushi/token-list'
import { useTokens } from '../tokens'
import { otherTokenListValidator } from './validator'

interface UseOtherTokenListsParams {
  chainId: ChainId
  query: string | undefined
}

export const useOtherTokenListsQuery = ({
  chainId,
  query,
}: UseOtherTokenListsParams) => {
  const { data: defaultTokenList } = useTokens({ chainId })
  const tokenListQuery = useQuery({
    queryKey: ['otherTokenLists', { chainId }],
    queryFn: async () => {
      const res = await Promise.allSettled(
        DEFAULT_LIST_OF_LISTS.map((el) => fetch(el).then((res) => res.json())),
      ).then((res) => {
        return res.filter(isPromiseFulfilled).map((el) => el.value)
      })
      return res
        .map((el) => otherTokenListValidator.parse(el))
        .flatMap((el) => el.tokens)
    },
    keepPreviousData: true,
    staleTime: 900000, // 15 mins
    cacheTime: 86400000, // 24hs
    enabled: Boolean(defaultTokenList && query && chainId && query.length > 2),
    refetchOnWindowFocus: true,
  })

  const blacklisted = useMemo(() => {
    return BLACKLIST_TOKEN_IDS.map((el) => el.toLowerCase())
  }, [])

  return useMemo(() => {
    const _query = query?.toLowerCase()
    if (!defaultTokenList || !tokenListQuery.data) return {}

    const _data = tokenListQuery.data.reduce<Record<string, Token>>(
      (acc, { chainId: _chainId, name, symbol, address, decimals }) => {
        if (!_query || chainId !== _chainId || !isAddress(address)) return acc
        // Filter out dupes
        if (defaultTokenList[`${_chainId}:${getAddress(address)}`]) return acc
        if (blacklisted.includes(address.toLowerCase())) return acc

        if (
          symbol.toLowerCase().includes(_query) ||
          address.toLowerCase().toLowerCase() === _query
        ) {
          acc[`${_chainId}:${getAddress(address)}`] = new Token({
            chainId: _chainId,
            name,
            symbol,
            decimals,
            address,
          })
        }

        return acc
      },
      {},
    )

    return {
      ...tokenListQuery,
      data: _data,
    }
  }, [
    chainId,
    query,
    defaultTokenList,
    tokenListQuery,
    blacklisted,
  ]) as typeof tokenListQuery & {
    data: Record<string, Token>
  }
}
