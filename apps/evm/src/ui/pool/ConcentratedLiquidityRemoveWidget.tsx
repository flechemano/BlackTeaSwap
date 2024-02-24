'use client'

import { CogIcon } from '@heroicons/react/24/outline'
import { useDebounce } from '@sushiswap/hooks'
import {
  Card,
  CardContent,
  CardCurrencyAmountItem,
  CardFooter,
  CardGroup,
  CardLabel,
  Currency,
  DialogConfirm,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogProvider,
  DialogReview,
  DialogTitle,
  DialogTrigger,
  Dots,
  IconButton,
  List,
  SettingsModule,
  SettingsOverlay,
  classNames,
} from '@sushiswap/ui'
import { Button } from '@sushiswap/ui/components/button'
import { createErrorToast, createToast } from '@sushiswap/ui/components/toast'
import {
  ConcentratedLiquidityPosition,
  getV3NonFungiblePositionManagerConractConfig,
  useNetwork,
  usePrepareSendTransaction,
  useSendTransaction,
  useTransactionDeadline,
  useWaitForTransaction,
} from '@sushiswap/wagmi'
import {
  SendTransactionResult,
  waitForTransaction,
} from '@sushiswap/wagmi/actions'
import { UsePrepareSendTransactionConfig } from '@sushiswap/wagmi/hooks/useSendTransaction'
import { Checker } from '@sushiswap/wagmi/systems'
import React, { FC, useCallback, useMemo, useState } from 'react'
import { unwrapToken } from 'src/lib/functions'
import { useSlippageTolerance } from 'src/lib/hooks/useSlippageTolerance'
import { Chain } from 'sushi/chain'
import { SushiSwapV3ChainId, isSushiSwapV3ChainId } from 'sushi/config'
import { Amount, Type } from 'sushi/currency'
import { Percent, ZERO } from 'sushi/math'
import { NonfungiblePositionManager, Position } from 'sushi/pool'
import { Hex, UserRejectedRequestError } from 'viem'
import { useTokenAmountDollarValues } from '../../lib/hooks'

interface ConcentratedLiquidityRemoveWidget {
  token0: Type | undefined
  token1: Type | undefined
  account: string | undefined
  chainId: SushiSwapV3ChainId
  positionDetails: ConcentratedLiquidityPosition | undefined
  position: Position | undefined
  onChange?(val: string): void
}

export const ConcentratedLiquidityRemoveWidget: FC<
  ConcentratedLiquidityRemoveWidget
> = ({
  token0,
  token1,
  account,
  onChange,
  chainId,
  position,
  positionDetails,
}) => {
  const { chain } = useNetwork()
  const [value, setValue] = useState<string>('0')
  const [slippageTolerance] = useSlippageTolerance('removeLiquidity')
  const { data: deadline } = useTransactionDeadline({ chainId })
  const debouncedValue = useDebounce(value, 300)

  const _onChange = useCallback(
    (val: string) => {
      setValue(val)
      if (onChange) {
        onChange(val)
      }
    },
    [onChange],
  )

  const onSettled = useCallback(
    (data: SendTransactionResult | undefined, error: Error | null) => {
      if (error instanceof UserRejectedRequestError) {
        createErrorToast(error?.message, true)
      }
      if (!data || !position) return

      const ts = new Date().getTime()
      void createToast({
        account,
        type: 'burn',
        chainId,
        txHash: data.hash,
        promise: waitForTransaction({ hash: data.hash }),
        summary: {
          pending: `Removing liquidity from the ${position.amount0.currency.symbol}/${position.amount1.currency.symbol} pair`,
          completed: `Successfully removed liquidity from the ${position.amount0.currency.symbol}/${position.amount1.currency.symbol} pair`,
          failed: 'Something went wrong when removing liquidity',
        },
        timestamp: ts,
        groupTimestamp: ts,
      })
    },
    [position, account, chainId],
  )

  const [feeValue0, feeValue1] = useMemo(() => {
    if (positionDetails && token0 && token1) {
      const feeValue0 = positionDetails.fees
        ? Amount.fromRawAmount(token0, positionDetails.fees[0])
        : undefined
      const feeValue1 = positionDetails.fees
        ? Amount.fromRawAmount(token1, positionDetails.fees[1])
        : undefined

      return [feeValue0, feeValue1]
    }

    return [undefined, undefined]
  }, [positionDetails, token0, token1])

  const prepare = useMemo<UsePrepareSendTransactionConfig>(() => {
    const liquidityPercentage = new Percent(debouncedValue, 100)
    const discountedAmount0 = position
      ? liquidityPercentage.multiply(position.amount0.quotient).quotient
      : undefined
    const discountedAmount1 = position
      ? liquidityPercentage.multiply(position.amount1.quotient).quotient
      : undefined

    const liquidityValue0 =
      token0 && typeof discountedAmount0 === 'bigint'
        ? Amount.fromRawAmount(unwrapToken(token0), discountedAmount0)
        : undefined
    const liquidityValue1 =
      token1 && typeof discountedAmount1 === 'bigint'
        ? Amount.fromRawAmount(unwrapToken(token1), discountedAmount1)
        : undefined

    if (
      token0 &&
      token1 &&
      position &&
      account &&
      positionDetails &&
      deadline &&
      liquidityValue0 &&
      liquidityValue1 &&
      liquidityPercentage.greaterThan(ZERO) &&
      isSushiSwapV3ChainId(chainId)
    ) {
      const { calldata, value: _value } =
        NonfungiblePositionManager.removeCallParameters(position, {
          tokenId: positionDetails.tokenId.toString(),
          liquidityPercentage,
          slippageTolerance,
          deadline: deadline.toString(),
          collectOptions: {
            expectedCurrencyOwed0:
              feeValue0 ?? Amount.fromRawAmount(liquidityValue0.currency, 0),
            expectedCurrencyOwed1:
              feeValue1 ?? Amount.fromRawAmount(liquidityValue1.currency, 0),
            recipient: account,
          },
        })

      console.debug({
        tokenId: positionDetails.tokenId.toString(),
        liquidityPercentage,
        slippageTolerance,
        deadline: deadline.toString(),
        collectOptions: {
          expectedCurrencyOwed0:
            feeValue0 ?? Amount.fromRawAmount(liquidityValue0.currency, 0),
          expectedCurrencyOwed1:
            feeValue1 ?? Amount.fromRawAmount(liquidityValue1.currency, 0),
          recipient: account,
        },
      })

      return {
        to: getV3NonFungiblePositionManagerConractConfig(chainId).address,
        data: calldata as Hex,
        value: BigInt(_value),
      }
    }
  }, [
    account,
    chainId,
    deadline,
    feeValue0,
    feeValue1,
    position,
    positionDetails,
    slippageTolerance,
    token0,
    token1,
    debouncedValue,
  ])

  const { config, isError } = usePrepareSendTransaction({
    ...prepare,
    chainId,
    enabled: +value > 0 && chainId === chain?.id,
  })

  const {
    sendTransactionAsync,
    isLoading: isWritePending,
    data,
  } = useSendTransaction({
    ...config,
    onSettled,
    onSuccess: () => {
      setValue('0')
    },
  })

  const { status } = useWaitForTransaction({
    chainId: chainId,
    hash: data?.hash,
  })

  const positionClosed = !position || position.liquidity === 0n

  const positionPlusFees = useMemo(() => {
    return [
      position?.amount0
        .add(
          Amount.fromRawAmount(
            position.amount0.currency,
            feeValue0 ? feeValue0.quotient.toString() : '0',
          ),
        )
        .multiply(value)
        .divide(100),
      position?.amount1
        .add(
          Amount.fromRawAmount(
            position.amount1.currency,
            feeValue1 ? feeValue1.quotient.toString() : '0',
          ),
        )
        .multiply(value)
        .divide(100),
    ]
  }, [feeValue0, feeValue1, position, value])

  const fiatAmountsAsNumber = useTokenAmountDollarValues({
    chainId,
    amounts: positionPlusFees,
  })

  return (
    <DialogProvider>
      <DialogReview>
        {({ confirm }) => (
          <>
            <div
              className={classNames(
                positionClosed && 'opacity-40 pointer-events-none',
              )}
            >
              <CardContent>
                <CardGroup>
                  <div className="p-3 pb-2 space-y-2 overflow-hidden bg-white rounded-xl dark:bg-secondary border border-accent">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h1 className="py-1 text-3xl text-gray-900 dark:text-slate-50">
                          {value}%
                        </h1>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={value === '25' ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => _onChange('25')}
                          testId="liquidity-25"
                        >
                          25%
                        </Button>
                        <Button
                          variant={value === '50' ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => _onChange('50')}
                          testId="liquidity-50"
                        >
                          50%
                        </Button>
                        <Button
                          variant={value === '75' ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => _onChange('75')}
                          testId="liquidity-75"
                        >
                          75%
                        </Button>
                        <Button
                          variant={value === '100' ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => _onChange('100')}
                          testId="liquidity-max"
                        >
                          Max
                        </Button>
                        <SettingsOverlay
                          options={{
                            slippageTolerance: {
                              storageKey: 'removeLiquidity',
                              defaultValue: '0.5',
                              title: 'Remove Liquidity Slippage',
                            },
                          }}
                          modules={[SettingsModule.SlippageTolerance]}
                        >
                          <IconButton
                            size="sm"
                            name="Settings"
                            icon={CogIcon}
                            variant="secondary"
                            className="!rounded-xl"
                          />
                        </SettingsOverlay>
                      </div>
                    </div>
                    <div className="px-1 pt-2 pb-3">
                      <input
                        value={value}
                        onChange={(e) => _onChange(e.target.value)}
                        type="range"
                        min="1"
                        max="100"
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </CardGroup>
                <Card variant="outline" className="space-y-6 p-6">
                  <CardGroup>
                    <CardLabel>{"You'll"} receive</CardLabel>
                    <CardCurrencyAmountItem
                      amount={position?.amount0.multiply(value).divide(100)}
                    />
                    <CardCurrencyAmountItem
                      amount={position?.amount1.multiply(value).divide(100)}
                    />
                  </CardGroup>
                  <CardGroup>
                    <CardLabel>{"You'll"} receive collected fees</CardLabel>
                    <CardCurrencyAmountItem
                      amount={feeValue0?.multiply(value).divide(100)}
                    />
                    <CardCurrencyAmountItem
                      amount={feeValue1?.multiply(value).divide(100)}
                    />
                  </CardGroup>
                </Card>
              </CardContent>
              <CardFooter>
                <Checker.Guard
                  guardWhen={positionClosed}
                  guardText="Position already closed"
                >
                  <Checker.Connect fullWidth variant="outline" size="xl">
                    <Checker.Network
                      fullWidth
                      variant="outline"
                      size="xl"
                      chainId={chainId}
                    >
                      <DialogTrigger asChild>
                        <Button
                          fullWidth
                          size="xl"
                          disabled={+value === 0}
                          testId="remove-or-add-liquidity"
                        >
                          {+value === 0 ? 'Enter Amount' : 'Remove'}
                        </Button>
                      </DialogTrigger>
                    </Checker.Network>
                  </Checker.Connect>
                </Checker.Guard>
              </CardFooter>
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {token0?.symbol}/{token1?.symbol}
                </DialogTitle>
                <DialogDescription>Remove Liquidity</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <List className="!pt-0">
                  <List.Control>
                    <List.KeyValue flex title="Network">
                      {Chain.from(chainId)?.name}
                    </List.KeyValue>
                    <List.KeyValue flex title="Slippage">
                      {slippageTolerance?.toSignificant(2)}%
                    </List.KeyValue>
                  </List.Control>
                </List>
                <List className="!pt-0">
                  <List.Control>
                    {position?.amount0 && (
                      <List.KeyValue
                        flex
                        title={`${position?.amount0?.currency.symbol}`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Currency.Icon
                              currency={position?.amount0.currency}
                              width={18}
                              height={18}
                            />
                            {position?.amount0
                              .add(
                                Amount.fromRawAmount(
                                  position.amount0.currency,
                                  feeValue0
                                    ? feeValue0.quotient.toString()
                                    : '0',
                                ),
                              )
                              .multiply(value)
                              .divide(100)
                              ?.toSignificant(6)}{' '}
                            {position?.amount0?.currency.symbol}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            ${fiatAmountsAsNumber[0].toFixed(2)}
                          </span>
                        </div>
                      </List.KeyValue>
                    )}
                    {position?.amount1 && (
                      <List.KeyValue
                        flex
                        title={`${position?.amount1?.currency.symbol}`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Currency.Icon
                              currency={position?.amount1.currency}
                              width={18}
                              height={18}
                            />
                            {position?.amount1
                              .add(
                                Amount.fromRawAmount(
                                  position.amount1.currency,
                                  feeValue1
                                    ? feeValue1.quotient.toString()
                                    : '0',
                                ),
                              )
                              .multiply(value)
                              .divide(100)
                              ?.toSignificant(6)}{' '}
                            {position?.amount1?.currency.symbol}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            ${fiatAmountsAsNumber[1].toFixed(2)}
                          </span>
                        </div>
                      </List.KeyValue>
                    )}
                  </List.Control>
                </List>
              </div>
              <DialogFooter>
                <Button
                  size="xl"
                  fullWidth
                  loading={!sendTransactionAsync || isWritePending}
                  onClick={() => sendTransactionAsync?.().then(() => confirm())}
                  disabled={isError}
                  testId="confirm-remove-liquidity"
                  type="button"
                >
                  {isError ? (
                    'Shoot! Something went wrong :('
                  ) : isWritePending ? (
                    <Dots>Confirm Remove</Dots>
                  ) : (
                    'Remove Liquidity'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </>
        )}
      </DialogReview>
      <DialogConfirm
        chainId={chainId}
        status={status}
        testId="make-another-swap"
        buttonText="Make another swap"
        txHash={data?.hash}
        successMessage={`You successfully removed liquidity from your ${position?.amount0.currency.symbol}/${position?.amount1.currency.symbol} position`}
      />
    </DialogProvider>
  )
}
