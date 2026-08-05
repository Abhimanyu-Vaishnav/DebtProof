// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DebtProofCreditScore
 * @dev Dynamic On-Chain Repayment Reliability & Credit Score Registry on Monad Testnet
 */
contract DebtProofCreditScore {
    address public owner;

    struct ScoreRecord {
        uint256 creditScore;       // 300 to 900
        uint256 totalOnTimePayments;
        uint256 totalDefaults;
        uint256 lastUpdatedBlock;
        string verificationHash;
        bool isVerified;
    }

    mapping(address => ScoreRecord) public userScores;
    mapping(address => bool) public authorizedVerifiers;

    event ScoreUpdated(address indexed user, uint256 newScore, string verificationHash);
    event VerifierUpdated(address indexed verifier, bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner authorized");
        _;
    }

    modifier onlyVerifier() {
        require(msg.sender == owner || authorizedVerifiers[msg.sender], "Not authorized verifier");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedVerifiers[msg.sender] = true;
    }

    function setVerifier(address verifier, bool status) external onlyOwner {
        authorizedVerifiers[verifier] = status;
        emit VerifierUpdated(verifier, status);
    }

    function recordPayment(address user, bool onTime, string memory proofHash) external onlyVerifier {
        ScoreRecord storage record = userScores[user];

        if (record.creditScore == 0) {
            record.creditScore = 700; // Base score for new profile
        }

        if (onTime) {
            record.totalOnTimePayments += 1;
            if (record.creditScore + 15 <= 900) {
                record.creditScore += 15;
            } else {
                record.creditScore = 900;
            }
        } else {
            record.totalDefaults += 1;
            if (record.creditScore >= 340) {
                record.creditScore -= 40;
            } else {
                record.creditScore = 300;
            }
        }

        record.lastUpdatedBlock = block.number;
        record.verificationHash = proofHash;
        record.isVerified = true;

        emit ScoreUpdated(user, record.creditScore, proofHash);
    }

    function getCreditScore(address user) external view returns (
        uint256 creditScore,
        uint256 totalOnTimePayments,
        uint256 totalDefaults,
        uint256 lastUpdatedBlock,
        string memory verificationHash,
        bool isVerified
    ) {
        ScoreRecord memory record = userScores[user];
        if (record.creditScore == 0) {
            return (700, 0, 0, 0, "", false);
        }
        return (
            record.creditScore,
            record.totalOnTimePayments,
            record.totalDefaults,
            record.lastUpdatedBlock,
            record.verificationHash,
            record.isVerified
        );
    }
}
