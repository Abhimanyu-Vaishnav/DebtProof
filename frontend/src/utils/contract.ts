export const MONAD_TESTNET_PARAMS = {
  chainId: '0x279f', // 10143 in decimal
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz/'],
  blockExplorerUrls: ['https://testnet.monadscan.com/'],
};

export const DEBT_PROOF_REGISTRY_ADDRESS = '';

export const DEBT_PROOF_REGISTRY_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "proofId", "type": "string" },
      { "internalType": "bytes32", "name": "receiptHash", "type": "bytes32" }
    ],
    "name": "storeProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "receiptHash", "type": "bytes32" }
    ],
    "name": "verifyProof",
    "outputs": [
      { "internalType": "string", "name": "proofId", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "address", "name": "walletAddress", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "proofId", "type": "string" }
    ],
    "name": "getProof",
    "outputs": [
      { "internalType": "bytes32", "name": "receiptHash", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "address", "name": "walletAddress", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "receiptHash", "type": "bytes32" }
    ],
    "name": "getProofByHash",
    "outputs": [
      { "internalType": "string", "name": "proofId", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "address", "name": "walletAddress", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
