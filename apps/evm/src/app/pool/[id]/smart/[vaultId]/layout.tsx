import { getPool, getSteerVault } from '@sushiswap/client'
import { Breadcrumb, Container, LinkInternal } from '@sushiswap/ui'
import { unstable_cache } from 'next/cache'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'
import { unsanitize } from 'sushi/format'
import { PoolHeader } from '../../../../../ui/pool/PoolHeader'

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string; vaultId: string }
}) {
  const poolId = unsanitize(params.id)
  const pool = await unstable_cache(
    async () => getPool(poolId),
    ['pool', poolId],
    {
      revalidate: 60 * 15,
    },
  )()

  const vaultId = unsanitize(params.vaultId)

  const vault = await unstable_cache(
    () => getSteerVault(vaultId),
    ['steer-vault', vaultId],
    { revalidate: 60 * 15 },
  )()

  if (!pool) {
    notFound()
  }

  const headersList = headers()
  const referer = headersList.get('referer')

  return (
    <>
      <Container maxWidth="5xl" className="px-4">
        <Breadcrumb />
      </Container>
      <Container maxWidth="5xl" className="px-4 pt-10">
        <PoolHeader
          backUrl={referer?.includes('/pool?') ? referer.toString() : '/pool'}
          address={pool.address}
          pool={pool}
          apy={{
            rewards: pool?.incentiveApr,
            fees: pool?.feeApr1d,
            vault: vault.apr1d,
          }}
        />
      </Container>
      <section className="flex flex-col flex-1 mt-4">
        <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-accent pt-10 pb-20 h-full">
          {' '}
          <div className="flex flex-col gap-4">
            <Container maxWidth="5xl" className="px-2 sm:px-4">
              {vault.isDeprecated && (
                <div className="text-center text-red dark:text-red-600 w-full">
                  <div className=" font-medium">This vault is deprecated.</div>
                  <div className="text-sm">
                    {"It will not accrue any fees and won't be readjusted."}
                  </div>
                </div>
              )}
              <LinkInternal
                href={`/pool/${params.id}/smart`}
                className="text-sm text-blue hover:underline"
              >
                ← Strategies
              </LinkInternal>
            </Container>
            <Container maxWidth="screen-3xl" className="px-2 sm:px-4">
              {children}
            </Container>
          </div>
        </div>
      </section>
    </>
  )
}
