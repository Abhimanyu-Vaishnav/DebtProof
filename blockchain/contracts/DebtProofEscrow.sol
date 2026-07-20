// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DebtProofEscrow
 * @dev Decentralized escrow for P2P lending on DebtProof.
 * Handles locking, disbursing, and repaying loans using native MON.
 */
contract DebtProofEscrow {
    enum LoanState {
        PENDING,    // Borrower requested, waiting for lender
        FUNDED,     // Lender funded, waiting for borrower to withdraw
        ACTIVE,     // Borrower withdrew funds, waiting for repayment
        REPAID,     // Borrower fully repaid, waiting for lender to claim or already claimed
        CANCELLED   // Cancelled before funding
    }

    struct EscrowLoan {
        string loanId;          // UUID matching backend
        address borrower;       // Borrower's wallet address
        address lender;         // Lender's wallet address (set upon funding)
        uint256 principal;      // Principal amount requested in wei (MON)
        uint256 totalRepaid;    // Total amount repaid so far by borrower
        uint256 claimable;      // Amount waiting for lender to claim
        LoanState state;        // Current state of the escrow
    }

    mapping(string => EscrowLoan) public loans;

    // Events
    event EscrowCreated(string indexed loanId, address indexed borrower, uint256 principal);
    event EscrowFunded(string indexed loanId, address indexed lender, uint256 amount);
    event PrincipalWithdrawn(string indexed loanId, address indexed borrower, uint256 amount);
    event LoanRepaid(string indexed loanId, address indexed borrower, uint256 amount);
    event RepaymentClaimed(string indexed loanId, address indexed lender, uint256 amount);
    event EscrowCancelled(string indexed loanId, address indexed borrower);

    // Custom errors
    error InvalidAmount();
    error LoanNotFound();
    error LoanAlreadyExists();
    error InvalidState(LoanState current, LoanState expected);
    error Unauthorized();
    error TransferFailed();

    /**
     * @notice Borrower creates a new loan request.
     * @param loanId UUID from backend
     * @param principal Amount of MON requested
     */
    function createLoanRequest(string calldata loanId, uint256 principal) external {
        if (principal == 0) revert InvalidAmount();
        if (loans[loanId].borrower != address(0)) revert LoanAlreadyExists();

        loans[loanId] = EscrowLoan({
            loanId: loanId,
            borrower: msg.sender,
            lender: address(0),
            principal: principal,
            totalRepaid: 0,
            claimable: 0,
            state: LoanState.PENDING
        });

        emit EscrowCreated(loanId, msg.sender, principal);
    }

    /**
     * @notice Borrower cancels the loan request before it is funded.
     * @param loanId UUID of the loan
     */
    function cancelLoanRequest(string calldata loanId) external {
        EscrowLoan storage loan = loans[loanId];
        if (loan.borrower == address(0)) revert LoanNotFound();
        if (loan.borrower != msg.sender) revert Unauthorized();
        if (loan.state != LoanState.PENDING) revert InvalidState(loan.state, LoanState.PENDING);

        loan.state = LoanState.CANCELLED;
        emit EscrowCancelled(loanId, msg.sender);
    }

    /**
     * @notice Lender funds the loan request.
     * @param loanId UUID of the loan
     */
    function fundLoan(string calldata loanId) external payable {
        EscrowLoan storage loan = loans[loanId];
        if (loan.borrower == address(0)) revert LoanNotFound();
        if (loan.state != LoanState.PENDING) revert InvalidState(loan.state, LoanState.PENDING);
        if (msg.value != loan.principal) revert InvalidAmount();
        if (msg.sender == loan.borrower) revert Unauthorized(); // Cannot fund own loan

        loan.lender = msg.sender;
        loan.state = LoanState.FUNDED;

        emit EscrowFunded(loanId, msg.sender, msg.value);
    }

    /**
     * @notice Borrower withdraws the funded principal.
     * @param loanId UUID of the loan
     */
    function withdrawPrincipal(string calldata loanId) external {
        EscrowLoan storage loan = loans[loanId];
        if (loan.borrower == address(0)) revert LoanNotFound();
        if (loan.borrower != msg.sender) revert Unauthorized();
        if (loan.state != LoanState.FUNDED) revert InvalidState(loan.state, LoanState.FUNDED);

        loan.state = LoanState.ACTIVE;
        
        (bool success, ) = loan.borrower.call{value: loan.principal}("");
        if (!success) revert TransferFailed();

        emit PrincipalWithdrawn(loanId, msg.sender, loan.principal);
    }

    /**
     * @notice Borrower makes a repayment. Can be called multiple times.
     * @param loanId UUID of the loan
     */
    function repayLoan(string calldata loanId) external payable {
        EscrowLoan storage loan = loans[loanId];
        if (loan.borrower == address(0)) revert LoanNotFound();
        if (loan.state != LoanState.ACTIVE && loan.state != LoanState.REPAID) {
            revert InvalidState(loan.state, LoanState.ACTIVE);
        }
        if (msg.value == 0) revert InvalidAmount();

        loan.totalRepaid += msg.value;
        loan.claimable += msg.value;
        
        if (loan.totalRepaid >= loan.principal && loan.state == LoanState.ACTIVE) {
            loan.state = LoanState.REPAID;
        }

        emit LoanRepaid(loanId, msg.sender, msg.value);
    }

    /**
     * @notice Lender claims the available repayment funds.
     * @param loanId UUID of the loan
     */
    function claimRepayment(string calldata loanId) external {
        EscrowLoan storage loan = loans[loanId];
        if (loan.borrower == address(0)) revert LoanNotFound();
        if (loan.lender != msg.sender) revert Unauthorized();
        
        uint256 amountToClaim = loan.claimable;
        if (amountToClaim == 0) revert InvalidAmount();
        
        loan.claimable = 0;

        (bool success, ) = loan.lender.call{value: amountToClaim}("");
        if (!success) revert TransferFailed();

        emit RepaymentClaimed(loanId, msg.sender, amountToClaim);
    }
}
