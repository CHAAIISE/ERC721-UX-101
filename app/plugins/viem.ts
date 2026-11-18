import { createPublicClient, http } from 'viem'
import { mainnet, sepolia } from 'viem/chains'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public
  return {
    provide: {
      client: createPublicClient({ chain: sepolia, transport: http(config.sepoliaRpcUrl), batch: { multicall: true } }),
      mainnetClient: createPublicClient({ chain: mainnet, transport: http(config.mainnetRpcUrl) })
    }
  }
})
