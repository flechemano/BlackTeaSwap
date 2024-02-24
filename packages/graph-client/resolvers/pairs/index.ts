import { Resolvers } from '../../.graphclient/index.js'
import { pairById } from './pairById.js'
import { pairsByChainId } from './pairsByChainId.js'
import { pairsByChainIds } from './pairsByChainIds.js'
import { pairsByIds } from './pairsByIds.js'

export const resolvers: Resolvers = {
  Pair: {
    chainId: (root, args, context, info) =>
      Number(root.chainId || context.chainId || 1),
    // address: (root, args, context, info) => String(root.address || context.address),
  },
  Query: {
    pairById,
    pairsByIds,
    pairsByChainId,
    pairsByChainIds,
  },
}
