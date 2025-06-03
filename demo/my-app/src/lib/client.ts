import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { anvil } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: anvil,
  transport: http()
})

export const walletClient = createWalletClient({
  chain: anvil,
  transport: custom(typeof window !== 'undefined' ? window.ethereum! : undefined)
})
