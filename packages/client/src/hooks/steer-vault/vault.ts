import useSWR from 'swr'

import {
  type GetSteerVaultArgs,
  type SteerVault,
  getSteerVaultUrl,
} from '../../pure/steer-vault/vault/vault'
import { type SWRHookConfig } from '../../types'

export const useSteerVault = ({
  args,
  shouldFetch,
}: SWRHookConfig<GetSteerVaultArgs>) => {
  return useSWR<SteerVault>(
    shouldFetch !== false ? getSteerVaultUrl(args) : null,
    async (url) => fetch(url).then((data) => data.json()),
  )
}
