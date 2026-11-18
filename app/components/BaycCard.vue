<script setup lang="ts">
const { tokenId } = defineProps<{ tokenId: bigint }>()
const { $client } = useNuxtApp()
const { data } = useLazyAsyncData(`fakeBayc-card-${tokenId}`, () => fakeBaycMetadata($client, tokenId))
</script>

<template>
  <NuxtLink :to="`/fakeBayc/${tokenId}`" class="card block space-y-2 p-2 hover:border-neutral-600">
    <img v-if="data" :src="data.image" :alt="`FakeBAYC #${tokenId}`" loading="lazy" class="aspect-square w-full rounded-lg object-cover">
    <div v-else class="aspect-square w-full animate-pulse rounded-lg bg-neutral-800" />
    <p class="px-1 font-mono text-sm">#{{ tokenId }}</p>
  </NuxtLink>
</template>
