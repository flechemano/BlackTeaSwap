import { Request, Response } from 'express'
import { ADDITIONAL_BASES, BASES_TO_CHECK_TRADES_AGAINST } from 'sushi/config'
import { Token } from 'sushi/currency'
import { serializePoolCodesJSON } from 'sushi/serializer'
import { Address } from 'viem'
import { CHAIN_ID } from '../../config'
import extractor from '../../extractor'

async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 's-maxage=60')
  // console.log('HTTP: GET /pools-for-token/:chainId/:address')
  const _chainId = req.params['chainId']
  if (_chainId === undefined || Number(_chainId) !== CHAIN_ID)
    return res.status(422).send(`Unsupported network ${_chainId}`)
  const address = req.params['address'] as Address
  const tokenManager = extractor.tokenManager
  let token = tokenManager.getKnownToken(address as Address)
  if (token === undefined) {
    token = await tokenManager.findToken(address as Address)
    if (token) tokenManager.addToken(token)
  }
  if (token) {
    const common: Token[] = BASES_TO_CHECK_TRADES_AGAINST[CHAIN_ID] ?? []
    const additional: Token[] =
      ADDITIONAL_BASES[CHAIN_ID]?.[token.wrapped.address] ?? []
    const tokens = Array.from(new Set([...common, ...additional]))
    const pools = await extractor.getPoolCodesBetweenTokenSets(tokens, [token])
    return res.json(serializePoolCodesJSON(pools))
  } else return res.status(422).send(`Unknown token ${address}`)
}

export default handler
