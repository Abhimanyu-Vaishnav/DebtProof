// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DebtProofSoulbound
 * @dev Non-transferable (Soulbound Token) certificate for loan payoffs on Monad Blockchain.
 */
contract DebtProofSoulbound {
    string public name = "DebtProof Financial Freedom NFT";
    string public symbol = "DEBTFREE";

    struct Certificate {
        uint256 tokenId;
        address recipient;
        string loanId;
        string loanName;
        uint256 principalAmount;
        uint256 paidTimestamp;
        string ipfsMetadataUri;
    }

    uint256 private _tokenIdCounter;
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) private _userTokens;
    mapping(string => bool) public loanHasCertificate;

    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string loanId,
        string loanName,
        uint256 principalAmount,
        uint256 timestamp
    );

    error LoanAlreadyMinted(string loanId);
    error InvalidRecipient();

    /**
     * @notice Mint a Soulbound Certificate upon full loan payoff
     */
    function mintCertificate(
        string calldata loanId,
        string calldata loanName,
        uint256 principalAmount,
        string calldata metadataUri
    ) external returns (uint256) {
        if (msg.sender == address(0)) revert InvalidRecipient();
        if (loanHasCertificate[loanId]) revert LoanAlreadyMinted(loanId);

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        certificates[newTokenId] = Certificate({
            tokenId: newTokenId,
            recipient: msg.sender,
            loanId: loanId,
            loanName: loanName,
            principalAmount: principalAmount,
            paidTimestamp: block.timestamp,
            ipfsMetadataUri: metadataUri
        });

        _userTokens[msg.sender].push(newTokenId);
        loanHasCertificate[loanId] = true;

        emit CertificateMinted(
            newTokenId,
            msg.sender,
            loanId,
            loanName,
            principalAmount,
            block.timestamp
        );

        return newTokenId;
    }

    /**
     * @notice Get all certificate Token IDs owned by a wallet address
     */
    function getUserCertificates(address user) external view returns (uint256[] memory) {
        return _userTokens[user];
    }

    /**
     * @notice Soulbound token transfer prevention (Transfers are disabled)
     */
    function transferFrom(address, address, uint256) external pure {
        revert("SoulboundToken: Transfers are prohibited for Financial Freedom Certificates");
    }
}
