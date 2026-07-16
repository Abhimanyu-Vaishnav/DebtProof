// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DebtProofRegistry
 * @dev Stores and verifies cryptographic receipt hashes on-chain for DebtProof.
 */
contract DebtProofRegistry {
    struct Proof {
        string proofId;
        bytes32 receiptHash;
        uint256 timestamp;
        address walletAddress;
    }

    // Mapping from receipt hash to Proof details
    mapping(bytes32 => Proof) private _proofsByHash;
    
    // Mapping from proof ID to receipt hash
    mapping(string => bytes32) private _hashById;

    // Custom errors
    error ProofAlreadyExists(bytes32 receiptHash);
    error ProofIdAlreadyExists(string proofId);
    error ProofNotFound(bytes32 receiptHash);
    error ProofIdNotFound(string proofId);
    error InvalidInput();

    // Events
    event ProofStored(string indexed proofId, bytes32 indexed receiptHash, address indexed walletAddress, uint256 timestamp);
    event ProofVerified(bytes32 indexed receiptHash, address indexed verifier, uint256 timestamp);

    /**
     * @notice Stores the cryptographic proof of a receipt on-chain.
     * @param proofId The UUID of the proof.
     * @param receiptHash The SHA-256 hash of the receipt file.
     */
    function storeProof(string calldata proofId, bytes32 receiptHash) external {
        if (bytes(proofId).length == 0 || receiptHash == bytes32(0)) {
            revert InvalidInput();
        }
        if (_proofsByHash[receiptHash].timestamp != 0) {
            revert ProofAlreadyExists(receiptHash);
        }
        if (_hashById[proofId] != bytes32(0)) {
            revert ProofIdAlreadyExists(proofId);
        }

        _proofsByHash[receiptHash] = Proof({
            proofId: proofId,
            receiptHash: receiptHash,
            timestamp: block.timestamp,
            walletAddress: msg.sender
        });

        _hashById[proofId] = receiptHash;

        emit ProofStored(proofId, receiptHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verifies a receipt hash against stored proofs. Emits a verification event.
     * @param receiptHash The SHA-256 hash of the receipt file.
     */
    function verifyProof(bytes32 receiptHash) external returns (
        string memory proofId,
        uint256 timestamp,
        address walletAddress
    ) {
        Proof memory proof = _proofsByHash[receiptHash];
        if (proof.timestamp == 0) {
            revert ProofNotFound(receiptHash);
        }

        emit ProofVerified(receiptHash, msg.sender, block.timestamp);

        return (proof.proofId, proof.timestamp, proof.walletAddress);
    }

    /**
     * @notice Retrieves proof details by Proof ID.
     * @param proofId The UUID of the proof.
     */
    function getProof(string calldata proofId) external view returns (
        bytes32 receiptHash,
        uint256 timestamp,
        address walletAddress
    ) {
        bytes32 rHash = _hashById[proofId];
        if (rHash == bytes32(0)) {
            revert ProofIdNotFound(proofId);
        }
        Proof memory proof = _proofsByHash[rHash];
        return (proof.receiptHash, proof.timestamp, proof.walletAddress);
    }

    /**
     * @notice Direct view function to check if a proof exists by hash without emitting an event.
     * @param receiptHash The SHA-256 hash of the receipt file.
     */
    function getProofByHash(bytes32 receiptHash) external view returns (
        string memory proofId,
        uint256 timestamp,
        address walletAddress
    ) {
        Proof memory proof = _proofsByHash[receiptHash];
        if (proof.timestamp == 0) {
            revert ProofNotFound(receiptHash);
        }
        return (proof.proofId, proof.timestamp, proof.walletAddress);
    }
}
