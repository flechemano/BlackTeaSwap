import { Request, Response } from 'express'
import { Type } from 'sushi/currency'
import { ExtractorClient } from '../../ExtractorClient'

function handler(client: ExtractorClient) {
  return async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 's-maxage=3600')
    // console.log('HTTP: GET /token/:chainId/:address')
    const address = req.params['address']
    if (address === undefined) return res.status(422).send('No address param')

    let token: Type | undefined | Promise<Type | undefined> =
      client.getToken(address)
    if (token instanceof Promise) token = await token
    if (token === undefined)
      return res.status(422).send(`Unknown token ${address}`)

    return res.json({
      chainId: token.chainId,
      address: token.isNative
        ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        : token.address,
      decimals: token.decimals,
      symbol: token.symbol,
      name: token.name,
    })
  }
}

export default handler
