const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DebtProofEscrow", function () {
  let Escrow, escrow;
  let owner, borrower, lender, otherAccount;

  beforeEach(async function () {
    [owner, borrower, lender, otherAccount] = await ethers.getSigners();
    Escrow = await ethers.getContractFactory("DebtProofEscrow");
    escrow = await Escrow.deploy();
  });

  describe("Loan Creation & Funding", function () {
    const loanId = "loan-123";
    const principal = ethers.parseEther("1.0"); // 1 MON

    it("should create a loan request", async function () {
      await expect(escrow.connect(borrower).createLoanRequest(loanId, principal))
        .to.emit(escrow, "EscrowCreated")
        .withArgs(loanId, borrower.address, principal);

      const loan = await escrow.loans(loanId);
      expect(loan.borrower).to.equal(borrower.address);
      expect(loan.principal).to.equal(principal);
      expect(loan.state).to.equal(0); // PENDING
    });

    it("should allow a lender to fund the loan", async function () {
      await escrow.connect(borrower).createLoanRequest(loanId, principal);

      await expect(escrow.connect(lender).fundLoan(loanId, { value: principal }))
        .to.emit(escrow, "EscrowFunded")
        .withArgs(loanId, lender.address, principal);

      const loan = await escrow.loans(loanId);
      expect(loan.lender).to.equal(lender.address);
      expect(loan.state).to.equal(1); // FUNDED
    });
  });

  describe("Withdrawal & Repayment", function () {
    const loanId = "loan-456";
    const principal = ethers.parseEther("2.0");

    beforeEach(async function () {
      await escrow.connect(borrower).createLoanRequest(loanId, principal);
      await escrow.connect(lender).fundLoan(loanId, { value: principal });
    });

    it("should allow borrower to withdraw principal", async function () {
      const initialBalance = await ethers.provider.getBalance(borrower.address);
      
      const tx = await escrow.connect(borrower).withdrawPrincipal(loanId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(borrower.address);
      expect(finalBalance).to.equal(initialBalance + principal - gasUsed);

      const loan = await escrow.loans(loanId);
      expect(loan.state).to.equal(2); // ACTIVE
    });

    it("should allow borrower to repay and lender to claim", async function () {
      await escrow.connect(borrower).withdrawPrincipal(loanId);

      const repayment = ethers.parseEther("1.0");

      // Repay part 1
      await expect(escrow.connect(borrower).repayLoan(loanId, { value: repayment }))
        .to.emit(escrow, "LoanRepaid")
        .withArgs(loanId, borrower.address, repayment);

      let loan = await escrow.loans(loanId);
      expect(loan.totalRepaid).to.equal(repayment);
      expect(loan.claimable).to.equal(repayment);
      expect(loan.state).to.equal(2); // ACTIVE

      // Lender claims part 1
      const initialLenderBalance = await ethers.provider.getBalance(lender.address);
      const tx = await escrow.connect(lender).claimRepayment(loanId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalLenderBalance = await ethers.provider.getBalance(lender.address);
      expect(finalLenderBalance).to.equal(initialLenderBalance + repayment - gasUsed);

      loan = await escrow.loans(loanId);
      expect(loan.totalRepaid).to.equal(repayment);
      expect(loan.claimable).to.equal(0); // Reset after claim

      // Repay part 2
      await escrow.connect(borrower).repayLoan(loanId, { value: repayment });
      loan = await escrow.loans(loanId);
      expect(loan.state).to.equal(3); // REPAID
    });
  });
});
