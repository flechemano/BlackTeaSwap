import { BENTOBOX_SUBGRAPH_NAME, SUBGRAPH_HOST } from '@sushiswap/graph-config'

import { Resolvers, StrategyKpi } from '../../.graphclient/index.js'

export const crossChainStrategyKpis: Resolvers['Query']['crossChainStrategyKpis'] =
  async (root, args, context, info) => {
    const supportedChainIds = args.chainIds.filter(
      (
        chainId,
      ): chainId is keyof typeof BENTOBOX_SUBGRAPH_NAME &
        keyof typeof SUBGRAPH_HOST => chainId in BENTOBOX_SUBGRAPH_NAME,
    )

    const kpis = await Promise.all(
      supportedChainIds.map((chainId) =>
        context.BentoBox.Query.strategyKpis({
          root,
          args,
          context: {
            ...context,
            chainId,
            name: BENTOBOX_SUBGRAPH_NAME[chainId],
            host: SUBGRAPH_HOST[chainId],
          },
          info,
        }).then((kpis: StrategyKpi[]) =>
          // We send chainId here so we can take it in the resolver above
          kpis.map((kpi) => ({
            ...kpi,
            chainId,
          })),
        ),
      ),
    )

    return kpis.flat()
  }
