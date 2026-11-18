<script setup lang="ts">
const { chainId, switchToSepolia } = useWallet()
</script>

<template>
  <div class="card mx-auto max-w-md space-y-4 text-center">
    <h1 class="text-xl font-semibold">Wrong network</h1>
    <p class="text-sm text-neutral-400">Your wallet is on chain {{ chainId }}. This dApp only works on Sepolia.</p>
    <button class="btn" @click="switchToSepolia">Switch to Sepolia</button>
  </div>
</template>
