/* eslint-disable react-hooks/rules-of-hooks */

import { bondFixedTermTellerAbi } from '@sushiswap/bonds-sdk/abi'
import { BondPosition } from '@sushiswap/client'
import { useIsMounted } from '@sushiswap/hooks'
import {
  Badge,
  Button,
  Currency,
  Dots,
  NetworkIcon,
  SkeletonText,
  classNames,
  createErrorToast,
  createToast,
} from '@sushiswap/ui'
import {
  Checker,
  SendTransactionResult,
  useAccount,
  useNetwork,
  usePrepareSendTransaction,
  useSendTransaction,
  waitForTransaction,
} from '@sushiswap/wagmi'
import { UsePrepareSendTransactionConfig } from '@sushiswap/wagmi/hooks/useSendTransaction'
import { ColumnDef } from '@tanstack/react-table'
import format from 'date-fns/format'
import formatDistance from 'date-fns/formatDistance'
import { useCallback, useMemo, useState } from 'react'
import { Amount, Token } from 'sushi/currency'
import { formatUSD } from 'sushi/format'
import { UserRejectedRequestError, encodeFunctionData } from 'viem'

export const PAYOUT_ASSET_COLUMN: ColumnDef<BondPosition, unknown> = {
  id: 'payout-asset',
  header: 'Payout Asset',
  cell: (props) => {
    const token = new Token(props.row.original.payoutToken)

    return (
      <div className="flex items-center gap-5">
        <div className="flex">
          <Badge
            className="border-2 border-slate-900 rounded-full z-[11]"
            position="bottom-right"
            badgeContent={
              <NetworkIcon
                chainId={props.row.original.chainId}
                width={14}
                height={14}
              />
            }
          >
            <Currency.IconList iconWidth={26} iconHeight={26}>
              <Currency.Icon disableLink currency={token} />
            </Currency.IconList>
          </Badge>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
            {token.symbol}
            <div
              className={classNames(
                'text-[10px] bg-gray-200 dark:bg-slate-700 rounded-lg px-1 ml-1',
              )}
            />
          </span>
        </div>
      </div>
    )
  },
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
    headerDescription:
      'Purchased bonds awaiting for you to claim when the bond matures',
  },
}

export const PAYOUT_AMOUNT_COLUMN: ColumnDef<BondPosition, unknown> = {
  id: 'payout-amount',
  header: 'Payout Amount',
  accessorFn: (row) => row.balanceUSD,
  cell: (props) => {
    const position = props.row.original

    const token = new Token(position.payoutToken)
    const balance = Amount.fromRawAmount(token, props.row.original.balance)

    return (
      <div className="flex flex-col">
        <span className="font-medium text-sm">
          {balance.toSignificant(6)} {token.symbol}
        </span>
        <span className="text-gray-500 text-xs">
          {formatUSD(position.balanceUSD)}
        </span>
      </div>
    )
  },
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
    headerDescription:
      'Purchased bond amount available for you to claim when the bond matures',
  },
}

export const MATURITY_COLUMN: ColumnDef<BondPosition, unknown> = {
  id: 'maturity',
  header: 'Maturity',
  accessorFn: (row) => row.maturity,
  cell: (props) => {
    const isMounted = useIsMounted()

    const position = props.row.original

    return (
      <div className="flex flex-col">
        <span>{format(position.maturity * 1000, 'MMM dd, yyyy HH:mm')}</span>
        <span className="text-gray-500 text-xs">
          {isMounted
            ? formatDistance(position.maturity * 1000, new Date(), {
                addSuffix: true,
              })
            : ''}
        </span>
      </div>
    )
  },
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
    headerDescription: 'The fully vested date at which you can claim your bond',
  },
}

const CLAIM_CELL = ({ position }: { position: BondPosition }) => {
  const isMounted = useIsMounted()

  const [claimed, setClaimed] = useState(BigInt(position.balance) === 0n)
  const notMature = position.maturity * 1000 > Date.now()
  const claimable = !claimed && !notMature

  const token = new Token(position.payoutToken)
  const balance = Amount.fromRawAmount(token, position.balance)

  const { chain } = useNetwork()

  const { address } = useAccount()

  const onSettled = useCallback(
    (data: SendTransactionResult | undefined, error: Error | null) => {
      if (error instanceof UserRejectedRequestError) {
        createErrorToast(error?.message, true)
      }
      if (!data) return

      const ts = new Date().getTime()
      void createToast({
        account: address,
        type: 'mint',
        chainId: position.chainId,
        txHash: data.hash,
        promise: waitForTransaction({ hash: data.hash }),
        summary: {
          pending: `Claiming bond (${balance.toSignificant(6)} ${
            balance.currency.symbol
          })`,
          completed: `Claimed bond (${balance.toSignificant(6)} ${
            balance.currency.symbol
          })`,
          failed: `Failed to claim bond (${balance.toSignificant(6)} ${
            balance.currency.symbol
          })`,
        },
        timestamp: ts,
        groupTimestamp: ts,
      })
    },
    [address, balance, position.chainId],
  )

  const prepare = useMemo<UsePrepareSendTransactionConfig>(() => {
    if (!address || chain?.id !== position.chainId || !claimable) return {}

    return {
      to: position.tellerAddress,
      data: encodeFunctionData({
        abi: bondFixedTermTellerAbi,
        functionName: 'redeem',
        args: [BigInt(position.bondTokenId), BigInt(position.balance)],
      }),
    }
  }, [
    address,
    chain?.id,
    position.balance,
    position.bondTokenId,
    position.chainId,
    position.tellerAddress,
    claimable,
  ])

  const { config, isError } = usePrepareSendTransaction({
    ...prepare,
    chainId: position.chainId,
    enabled: Boolean(address && chain?.id === position.chainId && claimable),
  })

  const { sendTransactionAsync, isLoading: isWritePending } =
    useSendTransaction({
      ...config,
      gas: config?.gas ? (config.gas * 105n) / 100n : undefined,
      chainId: position.chainId,
      onSettled,
      onSuccess: () => setClaimed(true),
    })

  return (
    <div className="w-full flex justify-center">
      {isMounted ? (
        <Checker.Guard
          guardWhen={claimed}
          guardText="Already Claimed"
          size="sm"
          variant="ghost"
          className="text-xs"
        >
          <Checker.Guard
            guardWhen={notMature}
            guardText="Not Mature"
            size="sm"
            variant="ghost"
            className="text-xs"
          >
            <Checker.Network
              chainId={position.chainId}
              size="sm"
              variant="secondary"
              className="text-xs whitespace-pre-line"
            >
              <Button
                size="sm"
                variant="secondary"
                className="text-xs"
                fullWidth
                loading={!sendTransactionAsync || isWritePending || !claimable}
                onClick={() => sendTransactionAsync?.().then(() => confirm())}
              >
                {isError ? (
                  'Shoot! Something went wrong :('
                ) : isWritePending ? (
                  <Dots>Claiming</Dots>
                ) : (
                  <>Claim</>
                )}
              </Button>
            </Checker.Network>
          </Checker.Guard>
        </Checker.Guard>
      ) : (
        <Button size="sm" variant="secondary" className="text-xs" fullWidth>
          Claim
        </Button>
      )}
    </div>
  )
}

export const CLAIM_COLUMN: ColumnDef<BondPosition, unknown> = {
  id: 'claim',
  header: 'Claim',
  size: 130,
  cell: (props) => (
    <CLAIM_CELL
      position={props.row.original}
      key={props.row.original.bondTokenId}
    />
  ),
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}
