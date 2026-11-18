<script setup lang="ts">
import { isAddress } from 'viem'

const { $client } = useNuxtApp()
const owner = String(useRoute().params.address)

const { data, status, error } = useLazyAsyncData(`fakeBayc-gallery-${owner}`, async () => {
  if (!isAddress(owner)) throw new Error(`"${owner}" is not a valid address`)
  return ownedTokenIds($client, FAKE_BAYC, owner)
})
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/fakeBayc" class="text-sm text-neutral-400 hover:text-white">← FakeBAYC</NuxtLink>
    <div>
      <h1 class="text-2xl font-semibold">FakeBAYC gallery</h1>
      <p class="break-all font-mono text-sm text-neutral-400">{{ owner }}</p>
    </div>
    <p v-if="status === 'pending'" class="text-neutral-400">Loading…</p>
    <p v-else-if="error" class="text-red-400">{{ errorMessage(error) }}</p>
    <p v-else-if="!data?.length" class="text-neutral-400">No FakeBAYC owned.</p>
    <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      <BaycCard v-for="id in data" :key="String(id)" :token-id="id" />
    </div>
  </div>
</template>
