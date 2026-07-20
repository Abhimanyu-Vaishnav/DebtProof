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

export const DEBT_PROOF_REGISTRY_ADDRESS = '0x316dF00a399d655734CeaeFfEE0A7DD432e1DB5f';

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

export const DEBT_PROOF_ESCROW_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'; // Placeholder, update after deployment

export const DEBT_PROOF_ESCROW_ABI = [{"inputs": [], "name": "InvalidAmount", "type": "error"}, {"inputs": [{"internalType": "enum DebtProofEscrow.LoanState", "name": "current", "type": "uint8"}, {"internalType": "enum DebtProofEscrow.LoanState", "name": "expected", "type": "uint8"}], "name": "InvalidState", "type": "error"}, {"inputs": [], "name": "LoanAlreadyExists", "type": "error"}, {"inputs": [], "name": "LoanNotFound", "type": "error"}, {"inputs": [], "name": "TransferFailed", "type": "error"}, {"inputs": [], "name": "Unauthorized", "type": "error"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "string", "name": "loanId", "type": "string"}, {"indexed": true, "internalType": "address", "name": "borrower", "type": "address"}], "name": "EscrowCancelled", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "string", "name": "loanId", "type": "string"}, {"indexed": true, "internalType": "address", "name": "borrower", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "principal", "type": "uint256"}], "name": "EscrowCreated", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "string", "name": "loanId", "type": "string"}, {"indexed": true, "internalType": "address", "name": "lender", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "EscrowFunded", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "string", "name": "loanId", "type": "string"}, {"indexed": true, "internalType": "address", "name": "borrower", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "LoanRepaid", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "string", "name": "loanId", "type": "string"}, {"indexed": true, "internalType": "address", "name": "borrower", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "PrincipalWithdrawn", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "string", "name": "loanId", "type": "string"}, {"indexed": true, "internalType": "address", "name": "lender", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "RepaymentClaimed", "type": "event"}, {"inputs": [{"internalType": "string", "name": "loanId", "type": "string"}], "name": "cancelLoanRequest", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "string", "name": "loanId", "type": "string"}], "name": "claimRepayment", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "string", "name": "loanId", "type": "string"}, {"internalType": "uint256", "name": "principal", "type": "uint256"}], "name": "createLoanRequest", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "string", "name": "loanId", "type": "string"}], "name": "fundLoan", "outputs": [], "stateMutability": "payable", "type": "function"}, {"inputs": [{"internalType": "string", "name": "", "type": "string"}], "name": "loans", "outputs": [{"internalType": "string", "name": "loanId", "type": "string"}, {"internalType": "address", "name": "borrower", "type": "address"}, {"internalType": "address", "name": "lender", "type": "address"}, {"internalType": "uint256", "name": "principal", "type": "uint256"}, {"internalType": "uint256", "name": "totalRepaid", "type": "uint256"}, {"internalType": "uint256", "name": "claimable", "type": "uint256"}, {"internalType": "enum DebtProofEscrow.LoanState", "name": "state", "type": "uint8"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "string", "name": "loanId", "type": "string"}], "name": "repayLoan", "outputs": [], "stateMutability": "payable", "type": "function"}, {"inputs": [{"internalType": "string", "name": "loanId", "type": "string"}], "name": "withdrawPrincipal", "outputs": [], "stateMutability": "nonpayable", "type": "function"}];
