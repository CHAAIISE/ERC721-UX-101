<script setup lang="ts">
import { renderSVG } from 'uqr'
import { sepolia } from 'viem/chains'

const { $client, $mainnetClient } = useNuxtApp()
const route = useRoute()
const wallet = useWallet()
const { address, chainId, walletConnectUri, error } = wallet
const { tx } = useTx()
const ensName = ref<string | null>(null)

const links = [
  { to: '/', label: 'Home' },
  { to: '/chain-info', label: 'Chain info' },
  { to: '/fakeBayc', label: 'FakeBAYC' },
  { to: '/fakeNefturians', label: 'FakeNefturians' },
  { to: '/fakeMeebits', label: 'FakeMeebits' }
]

wallet.init()

// Primary name on mainnet first (real ENS), then on Sepolia (free to set up for testing)
watch(address, async (account) => {
  ensName.value = null
  if (!account) return
  const name = await $mainnetClient.getEnsName({ address: account }).catch(() => null)
    ?? await $client.getEnsName({ address: account }).catch(() => null)
  if (account === address.value) ensName.value = name
}, { immediate: true })

watch([address, chainId, () => route.path], ([account, id, path]) => {
  const wrongNetwork = !!account && id !== sepolia.id
  if (wrongNetwork && path !== '/wrong-network') navigateTo('/wrong-network')
  else if (!wrongNetwork && path === '/wrong-network') navigateTo('/')
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b border-neutral-800">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <nav class="flex flex-wrap gap-4 text-sm text-neutral-400">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="hover:text-white" exact-active-class="text-white">
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="ml-auto flex flex-wrap items-center gap-2 text-sm">
          <template v-if="address">
            <span class="font-mono" :title="address">{{ ensName ?? shortAddress(address) }}</span>
            <button v-if="chainId !== sepolia.id" class="btn" @click="wallet.switchToSepolia">Switch to Sepolia</button>
            <button class="btn" @click="wallet.disconnect">Disconnect</button>
          </template>
          <template v-else>
            <button class="btn" @click="wallet.connectBrowserWallet">Browser wallet</button>
            <button class="btn" @click="wallet.connectWalletConnect">WalletConnect</button>
          </template>
        </div>
      </div>
      <p v-if="error" class="mx-auto max-w-5xl px-4 pb-3 text-sm text-red-400">{{ error }}</p>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <NuxtPage />
    </main>

    <div v-if="walletConnectUri" class="fixed inset-0 grid place-items-center bg-black/70 p-4">
      <div class="card w-full max-w-xs space-y-4 text-center">
        <p class="text-sm">Scan with your mobile wallet</p>
        <div class="rounded-lg bg-white p-2 [&>svg]:h-auto [&>svg]:w-full" v-html="renderSVG(walletConnectUri)" />
        <button class="btn" @click="wallet.cancelWalletConnect">Cancel</button>
      </div>
    </div>

    <div v-if="tx" class="card fixed bottom-4 right-4 w-80 space-y-1 text-sm">
      <div class="flex items-center justify-between gap-2">
        <p class="font-medium">{{ tx.label }}</p>
        <button class="text-neutral-500 hover:text-white" aria-label="Dismiss" @click="tx = null">✕</button>
      </div>
      <p v-if="tx.status === 'wallet'" class="text-amber-400">Confirm in your wallet…</p>
      <p v-else-if="tx.status === 'pending'" class="text-amber-400">Pending…</p>
      <p v-else-if="tx.status === 'success'" class="text-emerald-400">Confirmed</p>
      <p v-else class="text-red-400">{{ tx.error }}</p>
      <a v-if="tx.hash" :href="`${sepolia.blockExplorers.default.url}/tx/${tx.hash}`" target="_blank" class="text-neutral-400 underline hover:text-white">
        View on Etherscan
      </a>
    </div>
  </div>
</template>
