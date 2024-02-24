import { Resolvers } from '../../.graphclient/index.js'
import { liquidityPositionsByChainIds } from './liquidityPositionsByChainIds.js'

export const resolvers: Resolvers = {
  LiquidityPosition: {
    chainId: (root, args, context, info) =>
      Number(root.chainId || context.chainId || 1),
  },
  Query: {
    liquidityPositionsByChainIds,
  },
}
