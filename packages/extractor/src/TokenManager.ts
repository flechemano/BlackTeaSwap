import { erc20Abi, erc20Abi_bytes32 } from 'sushi/abi'
import { ChainId } from 'sushi/chain'
import { Token } from 'sushi/currency'
import { Address, Hex, hexToString, trim } from 'viem'
import { MultiCallAggregator } from './MulticallAggregator'
import { PermanentCache } from './PermanentCache'
import { warnLog } from './WarnLog'

interface TokenCacheRecord {
  address: Address
  name: string
  symbol: string
  decimals: number
}

// For some tokens that are not 100% ERC-20:
const SpecialTokens: Record<
  typeof ChainId.ETHEREUM,
  Record<string, Omit<TokenCacheRecord, 'address'>>
> = {
  [ChainId.ETHEREUM]: {
    // '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A': {
    //   name: 'Maker Token',
    //   symbol: 'MKR',
    //   decimals: 18,
    // },
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': {
      name: 'DGD',
      symbol: 'DGD',
      decimals: 9,
    },
  },
}

export class TokenManager {
  client: MultiCallAggregator
  tokens: Map<Address, Token> = new Map()
  tokenPermanentCache: PermanentCache<TokenCacheRecord>

  constructor(client: MultiCallAggregator, ...paths: string[]) {
    this.client = client
    this.tokenPermanentCache = new PermanentCache(...paths)
  }

  async addCachedTokens() {
    const cachedRecords = await this.tokenPermanentCache.getAllRecords()
    cachedRecords.forEach((r) => {
      this.addToken(
        new Token({
          ...r,
          chainId: this.client.client.chain?.id as ChainId,
        }),
        false,
      )
    })
  }

  addToken(token: Token, addToCache = true) {
    const addr = token.address.toLowerCase() as Address
    if (!this.tokens.has(addr)) {
      this.tokens.set(addr, token)
      if (addToCache) {
        // no await - don't wait it
        this.tokenPermanentCache.add({
          address: token.address as Address,
          name: token.name as string,
          symbol: token.symbol as string,
          decimals: token.decimals,
        })
      }
    }
  }
  addTokens(tokens: Token[]) {
    tokens.forEach((t) => this.addToken(t))
  }

  async findToken(address: Address): Promise<Token | undefined> {
    const addr = address.toLowerCase() as Address
    const cached = this.tokens.get(addr)
    if (cached !== undefined) return cached
    const special =
      SpecialTokens?.[this.client.chainId as keyof typeof SpecialTokens]?.[addr]
    if (special) {
      const newToken = new Token({
        chainId: this.client.client.chain?.id as ChainId,
        address: address,
        decimals: special.decimals,
        symbol: special.symbol,
        name: special.name,
      })
      this.addToken(newToken)
      return newToken
    }

    // try {
    //   return await fetchToken_({ abi: erc20ABI })
    // } catch (err) {
    //   // In the chance that there is an error upon decoding the contract result,
    //   // it could be likely that the contract data is represented as bytes32 instead
    //   // of a string.
    //   if (err instanceof ContractFunctionExecutionError) {
    //     const { name, symbol, ...rest } = await fetchToken_({
    //       abi: erc20ABI_bytes32,
    //     })
    //     return {
    //       name: hexToString(trim(name as Hex, { dir: 'right' })),
    //       symbol: hexToString(trim(symbol as Hex, { dir: 'right' })),
    //       ...rest,
    //     }
    //   }
    //   throw err
    // }

    try {
      const [decimals, symbol, name] = await Promise.all([
        this.client.callValue(address, erc20Abi, 'decimals'),
        this.client.callValue(address, erc20Abi, 'symbol'),
        this.client.callValue(address, erc20Abi, 'name'),
      ])

      const newToken = new Token({
        chainId: this.client.client.chain?.id as ChainId,
        address: address,
        decimals: Number(decimals as bigint),
        symbol: symbol as string,
        name: name as string,
      })
      this.addToken(newToken)
      return newToken
    } catch (_e) {
      warnLog(
        this.client.client.chain?.id,
        `Token downloading error ${address} ${_e}`,
      )

      // In the chance that there is an error upon decoding the contract result,
      // it could be likely that the contract data is represented as bytes32 instead
      // of a string.
      try {
        const [decimals, symbol, name] = await Promise.all([
          this.client.callValue(address, erc20Abi_bytes32, 'decimals'),
          this.client.callValue(address, erc20Abi_bytes32, 'symbol'),
          this.client.callValue(address, erc20Abi_bytes32, 'name'),
        ])

        const newToken = new Token({
          chainId: this.client.client.chain?.id as ChainId,
          address: address,
          decimals: Number(decimals as bigint),
          name: hexToString(trim(name as Hex, { dir: 'right' })),
          symbol: hexToString(trim(symbol as Hex, { dir: 'right' })),
        })
        this.addToken(newToken)
        return newToken
      } catch (_e) {
        warnLog(
          this.client.client.chain?.id,
          `Token bytes32 downloading error ${address} ${_e}`,
        )
      }

      return undefined
    }
  }

  getKnownToken(addr: Address): Token | undefined {
    return this.tokens.get(addr.toLowerCase() as Address)
  }
}
