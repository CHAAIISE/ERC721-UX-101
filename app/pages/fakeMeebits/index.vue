<script setup lang="ts">
import type { Hex } from 'viem'
import signatures from '~~/signatures/output-sig.json'

const { $client } = useNuxtApp()
const { send } = useTx()
const selected = ref<number>()

// Only ids with a signature in output-sig.json can be claimed
const { data: unclaimed, refresh } = useLazyAsyncData('fakeMeebits', async () => {
  const claimed = await $client.multicall({
    allowFailure: false,
    contracts: signatures.map(({ tokenNumber }) => ({
      address: FAKE_MEEBITS_CLAIMER,
      abi: meebitsClaimerAbi,
      functionName: 'tokensThatWereClaimed',
      args: [BigInt(tokenNumber)]
    }) as const)
  })
  return signatures.filter((_, index) => !claimed[index])
})

watch(unclaimed, (list) => {
  if (!list?.some(({ tokenNumber }) => tokenNumber === selected.value)) selected.value = list?.[0]?.tokenNumber
})

const signature = computed(() => unclaimed.value?.find(({ tokenNumber }) => tokenNumber === selected.value)?.signature as Hex | undefined)

async function claim() {
  if (selected.value === undefined || !signature.value) return
  const claimed = await send(`Claim FakeMeebits #${selected.value}`, {
    address: FAKE_MEEBITS_CLAIMER,
    abi: meebitsClaimerAbi,
    functionName: 'claimAToken',
    args: [BigInt(selected.value), signature.value]
  })
  if (claimed) await refresh()
}

const validate = () => send('Validate ex3', { address: EVALUATOR, abi: evaluatorAbi, functionName: 'ex3_claimedFakeMeebits' })
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">FakeMeebits</h1>
      <p class="text-sm text-neutral-400">
        {{ unclaimed ? `${unclaimed.length} of ${signatures.length} signed tokens still unclaimed` : 'Loading…' }}
      </p>
    </div>
    <div class="card space-y-3">
      <label class="flex items-center gap-2 text-sm">
        Token id
        <select v-model="selected" class="rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1">
          <option v-for="{ tokenNumber } in unclaimed" :key="tokenNumber" :value="tokenNumber">#{{ tokenNumber }}</option>
        </select>
      </label>
      <p v-if="signature" class="break-all font-mono text-xs text-neutral-400">{{ signature }}</p>
      <div class="flex flex-wrap gap-2">
        <button class="btn" :disabled="!signature" @click="claim">Claim token</button>
        <button class="btn" @click="validate">Validate ex3</button>
      </div>
    </div>
  </div>
</template>
