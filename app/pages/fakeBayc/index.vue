<script setup lang="ts">
const { $client } = useNuxtApp()
const { address } = useWallet()
const { send } = useTx()
const tokenId = ref('')

const { data, refresh } = useLazyAsyncData('fakeBayc', async () => {
  const [name, total] = await $client.multicall({
    allowFailure: false,
    contracts: [
      { address: FAKE_BAYC, abi: erc721EnumerableAbi, functionName: 'name' },
      { address: FAKE_BAYC, abi: erc721EnumerableAbi, functionName: 'totalSupply' }
    ]
  })
  return { name, total }
})

async function claim() {
  if (await send('Claim FakeBAYC', { address: FAKE_BAYC, abi: fakeBaycAbi, functionName: 'claimAToken' })) await refresh()
}

const validate = () => send('Validate ex1', { address: EVALUATOR, abi: evaluatorAbi, functionName: 'ex1_claimedFakeBAYC' })
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">{{ data?.name ?? 'FakeBAYC' }}</h1>
      <p class="text-sm text-neutral-400">{{ data ? `${data.total} tokens minted` : 'Loading…' }}</p>
    </div>
    <div class="card flex flex-wrap gap-2">
      <button class="btn" @click="claim">Claim a token</button>
      <button class="btn" @click="validate">Validate ex1</button>
      <NuxtLink v-if="address" :to="`/fakeBayc/gallery/${address}`" class="btn">My gallery</NuxtLink>
    </div>
    <form class="card flex gap-2" @submit.prevent="navigateTo(`/fakeBayc/${tokenId}`)">
      <input v-model.trim="tokenId" required placeholder="Token id" inputmode="numeric" class="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm">
      <button class="btn">View token</button>
    </form>
  </div>
</template>
