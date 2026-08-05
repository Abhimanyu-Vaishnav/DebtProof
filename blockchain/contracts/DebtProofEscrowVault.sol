// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DebtProofEscrowVault
 * @dev Automated Scheduled EMI Escrow Vault on Monad Testnet
 */
contract DebtProofEscrowVault {
    struct EscrowDeposit {
        uint256 id;
        address borrower;
        address lender;
        uint256 amount;
        uint256 unlockTimestamp;
        bool isDisbursed;
        bool isRefunded;
        string loanReference;
    }

    uint256 public nextDepositId = 1;
    mapping(uint256 => EscrowDeposit) public deposits;
    mapping(address => uint256[]) public borrowerDepositIds;

    event FundsLocked(uint256 indexed depositId, address indexed borrower, address indexed lender, uint256 amount, uint256 unlockTimestamp);
    event FundsDisbursed(uint256 indexed depositId, address indexed lender, uint256 amount);
    event FundsRefunded(uint256 indexed depositId, address indexed borrower, uint256 amount);

    function lockEMIFunds(address lender, uint256 releaseDelaySeconds, string memory loanRef) external payable returns (uint256) {
        require(msg.value > 0, "Deposit amount must be > 0");
        require(lender != address(0), "Invalid lender address");

        uint256 id = nextDepositId++;
        uint256 unlockTime = block.timestamp + releaseDelaySeconds;

        deposits[id] = EscrowDeposit({
            id: id,
            borrower: msg.sender,
            lender: lender,
            amount: msg.value,
            unlockTimestamp: unlockTime,
            isDisbursed: false,
            isRefunded: false,
            loanReference: loanRef
        });

        borrowerDepositIds[msg.sender].push(id);

        emit FundsLocked(id, msg.sender, lender, msg.value, unlockTime);
        return id;
    }

    function disburseToLender(uint256 depositId) external {
        EscrowDeposit storage dep = deposits[depositId];
        require(!dep.isDisbursed && !dep.isRefunded, "Already processed");
        require(msg.sender == dep.borrower || msg.sender == dep.lender, "Unauthorized caller");

        dep.isDisbursed = true;
        payable(dep.lender).transfer(dep.amount);

        emit FundsDisbursed(depositId, dep.lender, dep.amount);
    }

    function refundBorrower(uint256 depositId) external {
        EscrowDeposit storage dep = deposits[depositId];
        require(!dep.isDisbursed && !dep.isRefunded, "Already processed");
        require(msg.sender == dep.lender, "Only lender can grant refund");

        dep.isRefunded = true;
        payable(dep.borrower).transfer(dep.amount);

        emit FundsRefunded(depositId, dep.borrower, dep.amount);
    }

    function getBorrowerDeposits(address borrower) external view returns (uint256[] memory) {
        return borrowerDepositIds[borrower];
    }
}
