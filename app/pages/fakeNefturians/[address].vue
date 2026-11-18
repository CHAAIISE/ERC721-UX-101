<script setup lang="ts">
import { isAddress } from 'viem'

const { $client } = useNuxtApp()
const owner = String(useRoute().params.address)

const { data, status, error } = useLazyAsyncData(`fakeNefturians-${owner}`, async () => {
  if (!isAddress(owner)) throw new Error(`"${owner}" is not a valid address`)
  return ownedTokenIds($client, FAKE_NEFTURIANS, owner)
})
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/fakeNefturians" class="text-sm text-neutral-400 hover:text-white">← FakeNefturians</NuxtLink>
    <div>
      <h1 class="text-2xl font-semibold">Owned FakeNefturians</h1>
      <p class="break-all font-mono text-sm text-neutral-400">{{ owner }}</p>
    </div>
    <p v-if="status === 'pending'" class="text-neutral-400">Loading…</p>
    <p v-else-if="error" class="text-red-400">{{ errorMessage(error) }}</p>
    <p v-else-if="!data?.length" class="text-neutral-400">No FakeNefturians owned.</p>
    <ul v-else class="flex flex-wrap gap-2">
      <li v-for="id in data" :key="String(id)" class="card px-3 py-1.5 font-mono text-sm">#{{ id }}</li>
    </ul>
  </div>
</template>
