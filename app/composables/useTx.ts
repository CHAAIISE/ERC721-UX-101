import type { Abi, Address, Hash } from 'viem'

export interface ContractWrite {
  address: Address
  abi: Abi
  functionName: string
  args?: readonly unknown[]
  value?: bigint
}

interface TxState {
  label: string
  status: 'wallet' | 'pending' | 'success' | 'error'
  hash?: Hash
  error?: string
}

export function useTx() {
  const { $client } = useNuxtApp()
  const { walletClient } = useWallet()
  const tx = useState<TxState | null>('tx', () => null)

  // Every write of the dApp goes through here: simulate (decodes revert reasons), sign, wait for the receipt
  async function send(label: string, call: ContractWrite) {
    tx.value = { label, status: 'wallet' }
    try {
      const wallet = walletClient()
      const { request } = await $client.simulateContract({ ...call, account: wallet.account })
      const hash = await wallet.writeContract(request)
      tx.value = { label, status: 'pending', hash }
      const { status } = await $client.waitForTransactionReceipt({ hash })
      if (status === 'reverted') throw new Error('Transaction reverted')
      tx.value = { label, status: 'success', hash }
      return true
    } catch (err) {
      tx.value = { label, status: 'error', hash: tx.value?.hash, error: errorMessage(err) }
      return false
    }
  }

  return { tx, send }
}
