# ERC721 UX 101

Frontend for the [ERC721 UX 101 workshop](https://github.com/Elli610/Blockchain-101/tree/main/workshops/solidity/erc721-ux-101), built with Nuxt 4, Tailwind and viem. No connector library: the browser wallet is driven through `window.ethereum` (EIP-1193), and WalletConnect through `@walletconnect/ethereum-provider` with an in-app QR code.

Evaluated address: `0xe07abF7Ef148D0ECF04906239dEB2b1B54e9AA55`

## Setup

```bash
pnpm install
cp .env.example .env   # RPC URLs and WalletConnect project id
pnpm dev
```

## Pages

| Route | Content |
| --- | --- |
| `/` | Registration (`submitExercise`) and TD points |
| `/chain-info` | Chain id, latest block, connected address |
| `/wrong-network` | Shown whenever the connected wallet is not on Sepolia |
| `/fakeBayc` | Name, minted count, claim, `ex1` |
| `/fakeBayc/[tokenId]` | Image and attributes from the token metadata |
| `/fakeBayc/gallery/[address]` | FakeBAYC owned by an address, lazy-loaded images |
| `/fakeNefturians` | Price, buy, `ex2` |
| `/fakeNefturians/[address]` | FakeNefturians owned by an address |
| `/fakeMeebits` | Unclaimed ids, signature-based claim, `ex3` |

Every write goes through `useTx`: simulation (decoded revert reason), wallet confirmation, pending state, then success with an Etherscan link. The header shows the ENS primary name of the connected address when one is set.
