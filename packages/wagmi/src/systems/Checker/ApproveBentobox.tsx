'use client'

import { InformationCircleIcon } from '@heroicons/react/24/solid'
import {
  CardDescription,
  CardHeader,
  CardTitle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  LinkExternal,
} from '@sushiswap/ui'
import { Button, ButtonProps } from '@sushiswap/ui/components/button'
import { FC } from 'react'
import { BentoBoxChainId } from 'sushi/config'
import { Address } from 'viem'

import { ApprovalState, useBentoBoxApproval } from '../../hooks'

interface ApproveBentoboxProps extends ButtonProps {
  chainId: BentoBoxChainId
  id: string
  masterContract: Address
  enabled?: boolean
  tag: string
}

const ApproveBentobox: FC<ApproveBentoboxProps> = ({
  id,
  chainId,
  masterContract,
  children,
  enabled = true,
  fullWidth = true,
  tag,
  size = 'xl',
  ...props
}) => {
  const [state, execute] = useBentoBoxApproval({
    enabled,
    chainId,
    masterContract,
    tag,
  })

  if (state === ApprovalState.APPROVED || !enabled) {
    return <>{children}</>
  }

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <Button
        disabled={!execute}
        loading={
          state === ApprovalState.LOADING ||
          state === ApprovalState.PENDING ||
          !execute
        }
        onClick={() => execute?.()}
        fullWidth={fullWidth}
        size={size}
        testId={id}
        {...props}
      >
        Approve BentoBox
        <HoverCardTrigger>
          <InformationCircleIcon width={16} height={16} />
        </HoverCardTrigger>
      </Button>
      <HoverCardContent className="!p-0 max-w-[320px]">
        <CardHeader>
          <CardTitle>Approve BentoBox</CardTitle>
          <CardDescription>
            We need your approval first to access your wallet using BentoBox;
            you will only have to approve this master contract once.{' '}
            <LinkExternal
              target="_blank"
              className="text-blue hover:underline"
              href="https://www.sushi.com/academy/articles/what-is-bentobox"
              rel="noreferrer"
            >
              Learn more
            </LinkExternal>
          </CardDescription>
        </CardHeader>
      </HoverCardContent>
    </HoverCard>
  )
}

export { ApproveBentobox, type ApproveBentoboxProps }
