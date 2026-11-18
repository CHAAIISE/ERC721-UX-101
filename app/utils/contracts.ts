import { parseAbi } from 'viem'

export const EVALUATOR = '0xe446502701fA5808DB07D817B00B660fB5EA6bFB'
export const POINTS_TOKEN = '0x996BA4faE3a3c2d07aC780401B07E103553eAB92'
export const FAKE_BAYC = '0x262fc337408995376b35f950e98b7fB60CF691f5'
export const FAKE_NEFTURIANS = '0x4F4f92733eEEe8405764EaA6D2B7304B59642469'
export const FAKE_MEEBITS_CLAIMER = '0xA45C08F929dfEf9a2B3E9eB3A5f9728F594f215a'

export const evaluatorAbi = parseAbi([
  'function hasSubmitted(address student) view returns (bool)',
  'function submitExercise()',
  'function ex1_claimedFakeBAYC()',
  'function ex2_boughtFakeNefturians()',
  'function ex3_claimedFakeMeebits()'
])

// Reads shared by FakeBAYC and FakeNefturians, both ERC721Enumerable
export const erc721EnumerableAbi = parseAbi([
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)'
])

export const fakeBaycAbi = parseAbi(['function claimAToken()'])

export const fakeNefturiansAbi = parseAbi([
  'function tokenPrice() view returns (uint256)',
  'function buyAToken() payable'
])

export const meebitsClaimerAbi = parseAbi([
  'function tokensThatWereClaimed(uint256 tokenId) view returns (bool)',
  'function claimAToken(uint256 tokenId, bytes signature) payable'
])
