// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Wallet-driven dApp: everything runs in the browser, next to window.ethereum
  ssr: false,
  app: { head: { title: 'ERC721 UX 101' } },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: {
    public: {
      sepoliaRpcUrl: '',
      mainnetRpcUrl: '',
      walletConnectProjectId: ''
    }
  }
})
