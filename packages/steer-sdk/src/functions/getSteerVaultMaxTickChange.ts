import { getChainIdAddressFromId } from 'sushi/format'
import type { PublicClient } from 'viem'

import { steerMultiPositionManager } from '../abi/steerMultiPositionManager.js'

interface GetSteerVaultsMaxTickChanges {
  client: PublicClient
  vaultIds: string[]
}

async function getSteerVaultsMaxTickChanges({
  client,
  vaultIds,
}: GetSteerVaultsMaxTickChanges) {
  const result = await client.multicall({
    allowFailure: true,
    contracts: vaultIds.map((id) => {
      const { chainId, address } = getChainIdAddressFromId(id)

      return {
        abi: steerMultiPositionManager,
        chainId,
        address,
        functionName: 'maxTickChange' as const,
      }
    }),
  })

  return result.map((r) => (r.result ? BigInt(r.result) : null))
}

interface GetSteerVaultMaxTickChange {
  client: PublicClient
  vaultId: string
}

async function getSteerVaultMaxTickChange({
  client,
  vaultId,
}: GetSteerVaultMaxTickChange) {
  return (
    await getSteerVaultsMaxTickChanges({ client, vaultIds: [vaultId] })
  )[0]
}

export { getSteerVaultMaxTickChange, getSteerVaultsMaxTickChanges }
