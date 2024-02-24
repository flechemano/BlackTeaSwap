import {
  MarketId,
  getChainIdAuctioneerMarketFromMarketId,
} from '@sushiswap/bonds-sdk'
import { Breadcrumb, Container } from '@sushiswap/ui'
import { unsanitize } from 'sushi/format'
import { BondsMarketPageHeader } from '../../../ui/bonds/bonds-market-page-header/bonds-market-page-header'

export const metadata = {
  title: 'Bonds 📝',
}

export default async function Layout({
  children,
  params: { id },
}: { children: React.ReactNode; params: { id: MarketId } }) {
  const marketId = unsanitize(id) as MarketId

  // Will throw an error if the market id is invalid
  getChainIdAuctioneerMarketFromMarketId(marketId)

  return (
    <>
      <Container maxWidth="5xl" className="px-4">
        <Breadcrumb />
      </Container>
      <Container maxWidth="5xl" className="pt-10 px-4">
        <BondsMarketPageHeader id={marketId} />
      </Container>
      <section className="flex flex-col flex-1 mt-4">
        <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-accent pt-10 pb-20 h-full">
          {children}
        </div>
      </section>
    </>
  )
}
