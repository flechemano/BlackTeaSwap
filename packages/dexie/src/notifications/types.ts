interface BaseNotification {
  account: string | `0x${string}` | undefined
  type:
    | 'send'
    | 'stargate'
    | 'swap'
    | 'mint'
    | 'burn'
    | 'approval'
    | 'enterBar'
    | 'leaveBar'
    | 'claimRewards'
    | 'withdrawStream'
    | 'cancelStream'
    | 'transferStream'
    | 'transferVesting'
    | 'updateStream'
    | 'withdrawVesting'
    | 'createStream'
    | 'createMultipleStream'
    | 'createVesting'
    | 'createMultipleVesting'
  chainId: number
  groupTimestamp: number
  timestamp: number
  href?: string
  txHash?: string | `0x${string}`
}

export interface PromiseNotification extends BaseNotification {
  promise: Promise<any>
  summary: {
    pending: string
    completed: string
    failed: string
    info?: string
  }
}

export type ResolvedNotification = BaseNotification & {
  summary: string
}

export type NotificationData = PromiseNotification | ResolvedNotification

export const isPromise = (
  data: PromiseNotification | ResolvedNotification,
): data is PromiseNotification => {
  return (data as PromiseNotification).summary?.pending !== undefined
}
