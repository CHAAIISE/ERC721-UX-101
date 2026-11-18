<script setup lang="ts">
import { erc20Abi, formatUnits } from 'viem'

const { $client } = useNuxtApp()
const { address } = useWallet()
const { send } = useTx()

const { data, refresh } = useLazyAsyncData('evaluator', async () => {
  if (!address.value) return null
  const [submitted, points] = await $client.multicall({
    allowFailure: false,
    contracts: [
      { address: EVALUATOR, abi: evaluatorAbi, functionName: 'hasSubmitted', args: [address.value] },
      { address: POINTS_TOKEN, abi: erc20Abi, functionName: 'balanceOf', args: [address.value] }
    ]
  })
  return { submitted, points: formatUnits(points, 18) }
}, { watch: [address] })

async function submit() {
  if (await send('Submit exercise', { address: EVALUATOR, abi: evaluatorAbi, functionName: 'submitExercise' })) await refresh()
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">ERC721 UX 101</h1>
      <p class="text-sm text-neutral-400">Register once, then get a token on each collection page and validate its exercise.</p>
    </div>
    <div class="card space-y-3">
      <p v-if="!address" class="text-sm text-neutral-400">Connect your wallet to register.</p>
      <template v-else-if="data">
        <p class="text-sm">TD points: <span class="font-mono">{{ data.points }}</span></p>
        <button class="btn" :disabled="data.submitted" @click="submit">
          {{ data.submitted ? 'Registered' : 'Register (submitExercise)' }}
        </button>
      </template>
    </div>
  </div>
</template>
