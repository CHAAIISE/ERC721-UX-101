<script setup lang="ts">
const { $client } = useNuxtApp()
const tokenId = String(useRoute().params.tokenId)

const { data, status, error } = useLazyAsyncData(`fakeBayc-token-${tokenId}`, async () => {
  if (!/^\d+$/.test(tokenId)) throw new Error(`"${tokenId}" is not a token id`)
  return fakeBaycMetadata($client, BigInt(tokenId))
})
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/fakeBayc" class="text-sm text-neutral-400 hover:text-white">← FakeBAYC</NuxtLink>
    <p v-if="status === 'pending'" class="text-neutral-400">Loading token #{{ tokenId }}…</p>
    <div v-else-if="error" class="card space-y-1">
      <h1 class="text-xl font-semibold">Token #{{ tokenId }} not found</h1>
      <p class="text-sm text-red-400">{{ errorMessage(error) }}</p>
    </div>
    <div v-else-if="data" class="grid gap-6 md:grid-cols-2">
      <img :src="data.image" :alt="`FakeBAYC #${tokenId}`" class="w-full rounded-xl">
      <div class="space-y-4">
        <h1 class="text-2xl font-semibold">FakeBAYC #{{ tokenId }}</h1>
        <dl class="grid grid-cols-2 gap-2">
          <div v-for="attribute in data.attributes" :key="attribute.trait_type" class="card py-2">
            <dt class="text-xs text-neutral-400">{{ attribute.trait_type }}</dt>
            <dd class="text-sm">{{ attribute.value }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
