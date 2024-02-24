import { useQuery } from '@tanstack/react-query'
import ms from 'ms'
import { Fraction } from 'sushi/math'
import { parseUnits } from 'viem'

interface UsePrice {
  chainId: number | undefined
  address: string | undefined
  enabled?: boolean
}

export const usePrice = ({ chainId, address, enabled = true }: UsePrice) => {
  return useQuery({
    queryKey: [`https://api.sushi.com/price/v1/${chainId}/${address}`],
    queryFn: async () => {
      const data = await fetch(
        `https://api.sushi.com/price/v1/${chainId}/${address}`,
      ).then((response) => response.json())
      return new Fraction(
        parseUnits(data.toFixed(18), 18).toString(),
        parseUnits('1', 18).toString(),
      )
    },
    enabled: Boolean(chainId && address && enabled),
    staleTime: ms('15s'),
    cacheTime: ms('1m'),
    refetchOnWindowFocus: false,
  })
}
