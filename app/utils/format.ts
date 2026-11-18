import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from 'viem'
import type { Address } from 'viem'

export const shortAddress = (address: Address) => `${address.slice(0, 6)}…${address.slice(-4)}`

export function errorMessage(error: unknown): string {
  let err = error
  // useAsyncData wraps thrown errors: unwrap down to the original one
  while (err instanceof Error && !(err instanceof BaseError) && err.cause) err = err.cause
  if (err instanceof BaseError) {
    if (err.walk((e) => e instanceof UserRejectedRequestError)) return 'Rejected in wallet'
    const revert = err.walk((e) => e instanceof ContractFunctionRevertedError)
    return (revert instanceof ContractFunctionRevertedError && revert.reason) || err.shortMessage
  }
  // Raw EIP-1193 errors (window.ethereum.request) are { code, message } objects
  const { code, message } = (err ?? {}) as { code?: number, message?: string }
  if (code === 4001) return 'Rejected in wallet'
  return message ?? String(err)
}
