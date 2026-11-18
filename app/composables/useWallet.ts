import 'viem/window'
import { createWalletClient, custom, getAddress, numberToHex } from 'viem'
import type { Address, EIP1193Provider } from 'viem'
import { sepolia } from 'viem/chains'
import { EthereumProvider } from '@walletconnect/ethereum-provider'

// Providers stay outside Vue state: they are not serializable data
let provider: EIP1193Provider | null = null
let walletConnect: InstanceType<typeof EthereumProvider> | null = null
const listening = new WeakSet<EIP1193Provider>()
// WalletConnect cannot abort a pending pairing (abortPairingAttempt is a no-op upstream):
// a cancelled or superseded attempt keeps running, so its outcome is ignored
let pairingAttempt = 0

export function useWallet() {
  const config = useRuntimeConfig().public
  const address = useState<Address | null>('address', () => null)
  const chainId = useState<number | null>('chainId', () => null)
  const walletConnectUri = useState<string | null>('walletConnectUri', () => null)
  const error = useState<string | null>('walletError', () => null)

  function reset() {
    provider = null
    address.value = null
    chainId.value = null
  }

  async function attach(next: EIP1193Provider, accounts: readonly string[]) {
    provider = next
    if (!listening.has(next)) {
      listening.add(next)
      next.on('accountsChanged', (list) => {
        if (next !== provider) return
        if (list[0]) address.value = getAddress(list[0])
        else reset()
      })
      next.on('chainChanged', (id) => {
        if (next === provider) chainId.value = Number(id)
      })
      next.on('disconnect', () => {
        if (next === provider) reset()
      })
    }
    // Set both together: the network guard must never see an address without its chain
    const id = Number(await next.request({ method: 'eth_chainId' }))
    address.value = getAddress(accounts[0]!)
    chainId.value = id
  }

  // Reconnects without popup if the site is already authorized
  async function init() {
    const accounts = await window.ethereum?.request({ method: 'eth_accounts' })
    if (window.ethereum && accounts?.length) await attach(window.ethereum, accounts)
  }

  async function connectBrowserWallet() {
    if (!window.ethereum) throw new Error('No browser wallet found')
    await attach(window.ethereum, await window.ethereum.request({ method: 'eth_requestAccounts' }))
  }

  async function connectWalletConnect() {
    if (!config.walletConnectProjectId) throw new Error('Set NUXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in .env')
    if (!walletConnect) {
      walletConnect = await EthereumProvider.init({
        projectId: config.walletConnectProjectId,
        optionalChains: [sepolia.id],
        rpcMap: { [sepolia.id]: config.sepoliaRpcUrl },
        // The built-in QR modal is Reown AppKit (ex-Web3Modal), banned by the TD: the app renders the QR code itself
        showQrModal: false,
        metadata: { name: 'ERC721 UX 101', description: 'ERC721 UX 101 workshop', url: location.origin, icons: [] }
      })
      walletConnect.on('display_uri', (uri) => {
        walletConnectUri.value = uri
      })
    }
    const attempt = ++pairingAttempt
    try {
      const accounts = await walletConnect.enable()
      if (attempt === pairingAttempt) await attach(walletConnect as unknown as EIP1193Provider, accounts)
    } catch (err) {
      if (attempt === pairingAttempt) throw err
    } finally {
      if (attempt === pairingAttempt) walletConnectUri.value = null
    }
  }

  function cancelWalletConnect() {
    pairingAttempt++
    walletConnectUri.value = null
  }

  async function disconnect() {
    if (walletConnect?.session) await walletConnect.disconnect()
    reset()
  }

  async function switchToSepolia() {
    if (!provider) throw new Error('Connect a wallet first')
    const id = numberToHex(sepolia.id)
    try {
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: id }] })
    } catch (err) {
      // 4902: the wallet does not know this chain yet
      if ((err as { code?: number } | null)?.code !== 4902) throw err
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: id,
          chainName: sepolia.name,
          nativeCurrency: sepolia.nativeCurrency,
          rpcUrls: [...sepolia.rpcUrls.default.http],
          blockExplorerUrls: [sepolia.blockExplorers.default.url]
        }]
      })
    }
  }

  function walletClient() {
    if (!provider || !address.value) throw new Error('Connect a wallet first')
    return createWalletClient({ account: address.value, chain: sepolia, transport: custom(provider) })
  }

  // Shows wallet errors (rejected popup, missing wallet...) in the UI instead of throwing
  const guarded = (action: () => Promise<void>) => async () => {
    error.value = null
    try {
      await action()
    } catch (err) {
      error.value = errorMessage(err)
    }
  }

  return {
    address,
    chainId,
    walletConnectUri,
    error,
    init: guarded(init),
    connectBrowserWallet: guarded(connectBrowserWallet),
    connectWalletConnect: guarded(connectWalletConnect),
    cancelWalletConnect,
    disconnect: guarded(disconnect),
    switchToSepolia: guarded(switchToSepolia),
    walletClient
  }
}
