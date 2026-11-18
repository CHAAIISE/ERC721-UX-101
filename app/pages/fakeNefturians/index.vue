<script setup lang="ts">
import { formatEther } from 'viem'

const { $client } = useNuxtApp()
const { address } = useWallet()
const { send } = useTx()

const { data, refresh } = useLazyAsyncData('fakeNefturians', async () => {
  const [price, total] = await $client.multicall({
    allowFailure: false,
    contracts: [
      { address: FAKE_NEFTURIANS, abi: fakeNefturiansAbi, functionName: 'tokenPrice' },
      { address: FAKE_NEFTURIANS, abi: erc721EnumerableAbi, functionName: 'totalSupply' }
    ]
  })
  return { price, total }
})

async function buy() {
  if (!data.value) return
  const bought = await send('Buy FakeNefturians', {
    address: FAKE_NEFTURIANS,
    abi: fakeNefturiansAbi,
    functionName: 'buyAToken',
    value: data.value.price
  })
  if (bought) await refresh()
}

const validate = () => send('Validate ex2', { address: EVALUATOR, abi: evaluatorAbi, functionName: 'ex2_boughtFakeNefturians' })
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">FakeNefturians</h1>
      <p class="text-sm text-neutral-400">{{ data ? `${data.total} tokens minted` : 'Loading…' }}</p>
    </div>
    <div class="card space-y-3">
      <p class="text-sm">Price: <span class="font-mono">{{ data ? `${formatEther(data.price)} ETH` : '…' }}</span></p>
      <div class="flex flex-wrap gap-2">
        <button class="btn" :disabled="!data" @click="buy">Buy a token</button>
        <button class="btn" @click="validate">Validate ex2</button>
        <NuxtLink v-if="address" :to="`/fakeNefturians/${address}`" class="btn">My tokens</NuxtLink>
      </div>
    </div>
  </div>
</template>
