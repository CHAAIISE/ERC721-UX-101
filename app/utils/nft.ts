import type { Address, PublicClient } from 'viem'
import { FAKE_BAYC, erc721EnumerableAbi } from './contracts'

export interface NftMetadata {
  image: string
  attributes: { trait_type: string, value: string | number }[]
}

// The tokenURI points to Pinata, which is slow for images: Filebase serves the same CIDs faster
export const ipfsToHttp = (uri: string) => uri.replace('ipfs://', 'https://ipfs.filebase.io/ipfs/')

export async function fakeBaycMetadata(client: PublicClient, tokenId: bigint): Promise<NftMetadata> {
  const uri = await client.readContract({ address: FAKE_BAYC, abi: erc721EnumerableAbi, functionName: 'tokenURI', args: [tokenId] })
  const metadata = await $fetch<NftMetadata>(ipfsToHttp(uri))
  return { ...metadata, image: ipfsToHttp(metadata.image) }
}

export async function ownedTokenIds(client: PublicClient, nft: Address, owner: Address) {
  const balance = await client.readContract({ address: nft, abi: erc721EnumerableAbi, functionName: 'balanceOf', args: [owner] })
  return client.multicall({
    allowFailure: false,
    contracts: Array.from({ length: Number(balance) }, (_, index) => ({
      address: nft,
      abi: erc721EnumerableAbi,
      functionName: 'tokenOfOwnerByIndex',
      args: [owner, BigInt(index)]
    }) as const)
  })
}
