# 10. Blockchain Documentation

This document describes the smart contract details and integration properties for the Monad Testnet blockchain anchoring layer in DebtProof.

## Monad Testnet Configuration

| Property | Value |
| :--- | :--- |
| **Network Name** | Monad Testnet |
| **Chain ID** | `10143` (Hex: `0x279f`) |
| **RPC Endpoint** | `https://testnet-rpc.monad.xyz/` |
| **Block Explorer** | `https://testnet.monadscan.com/` |
| **Contract Address** | `0x316dF00a399d655734CeaeFfEE0A7DD432e1DB5f` |

---

## Smart Contract ABI
The contract exposes two main functions for storing and validating tamper-proof hashes:

```json
[
  {
    "inputs": [
      { "internalType": "string", "name": "_proofId", "type": "string" },
      { "internalType": "string", "name": "_receiptHash", "type": "string" }
    ],
    "name": "storeProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_proofId", "type": "string" }
    ],
    "name": "verifyProof",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
```

---

## Wallet Integration Workflow

1. **Wallet Connection**:
   - Web uses MetaMask / WalletConnect browser injection.
   - Mobile uses local key generation or WalletConnect provider integration.
2. **Executing `storeProof`**:
   - The user signs the nonpayable transaction executing `storeProof(proofId, receiptHash)`.
   - The contract anchors this receipt hash globally, linking it to the uuid `proofId`.
   - The signing wallet address and transaction block number are logged directly in the transaction event log.
