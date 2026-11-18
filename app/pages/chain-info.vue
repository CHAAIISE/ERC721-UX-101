<script setup lang="ts">
const { $client } = useNuxtApp()
const { address, chainId } = useWallet()
const blockNumber = ref<bigint>()

onUnmounted($client.watchBlockNumber({ emitOnBegin: true, onBlockNumber: (block) => (blockNumber.value = block) }))
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Chain info</h1>
    <dl class="card grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
      <dt class="text-neutral-400">Chain ID</dt>
      <dd class="font-mono">{{ chainId ?? 'Not connected' }}</dd>
      <dt class="text-neutral-400">Latest block</dt>
      <dd class="font-mono">{{ blockNumber ?? 'Loading…' }}</dd>
      <dt class="text-neutral-400">Address</dt>
      <dd class="break-all font-mono">{{ address ?? 'Not connected' }}</dd>
    </dl>
  </div>
</template>
