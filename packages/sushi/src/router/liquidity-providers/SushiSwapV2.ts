import { PublicClient } from 'viem'
import { ChainId } from '../../chain'
import {
  SUSHISWAP_V2_FACTORY_ADDRESS,
  SUSHISWAP_V2_INIT_CODE_HASH,
} from '../../config'
import { LiquidityProviders } from './LiquidityProvider'
import { UniswapV2BaseProvider } from './UniswapV2Base'

export class SushiSwapV2Provider extends UniswapV2BaseProvider {
  constructor(chainId: ChainId, web3Client: PublicClient) {
    const factory = SUSHISWAP_V2_FACTORY_ADDRESS
    super(chainId, web3Client, factory, SUSHISWAP_V2_INIT_CODE_HASH)
  }
  getType(): LiquidityProviders {
    return LiquidityProviders.SushiSwapV2
  }
  getPoolProviderName(): string {
    return 'SushiSwapV2'
  }
}
