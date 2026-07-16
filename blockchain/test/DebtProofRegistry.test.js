const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DebtProofRegistry", function () {
  let DebtProofRegistry;
  let registry;
  let owner;
  let addr1;
  let addr2;

  const proofId = "d87a99f1-fa1a-4f51-b847-505e608a0d4c";
  const receiptHash = ethers.keccak256(ethers.toUtf8Bytes("receipt-document-content-hash-1"));
  const duplicateProofId = "d87a99f1-fa1a-4f51-b847-505e608a0d4d";
  const otherHash = ethers.keccak256(ethers.toUtf8Bytes("receipt-document-content-hash-2"));

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    DebtProofRegistry = await ethers.getContractFactory("DebtProofRegistry");
    registry = await DebtProofRegistry.deploy();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await registry.getAddress()).to.properAddress;
    });
  });

  describe("Store Proof", function () {
    it("Should store proof and emit ProofStored event", async function () {
      await expect(registry.connect(addr1).storeProof(proofId, receiptHash))
        .to.emit(registry, "ProofStored")
        .withArgs(proofId, receiptHash, addr1.address, anyTimestamp => anyTimestamp > 0);
    });

    it("Should fail with empty inputs", async function () {
      await expect(registry.storeProof("", receiptHash)).to.be.revertedWithCustomError(
        registry,
        "InvalidInput"
      );
      await expect(registry.storeProof(proofId, ethers.ZeroHash)).to.be.revertedWithCustomError(
        registry,
        "InvalidInput"
      );
    });

    it("Should prevent duplicate proof registrations with same hash", async function () {
      await registry.connect(addr1).storeProof(proofId, receiptHash);
      
      await expect(
        registry.connect(addr2).storeProof(duplicateProofId, receiptHash)
      ).to.be.revertedWithCustomError(registry, "ProofAlreadyExists").withArgs(receiptHash);
    });

    it("Should prevent duplicate proof registrations with same ID", async function () {
      await registry.connect(addr1).storeProof(proofId, receiptHash);
      
      await expect(
        registry.connect(addr2).storeProof(proofId, otherHash)
      ).to.be.revertedWithCustomError(registry, "ProofIdAlreadyExists").withArgs(proofId);
    });
  });

  describe("Verify Proof", function () {
    it("Should verify existing proof, emit ProofVerified event, and return correct metadata", async function () {
      await registry.connect(addr1).storeProof(proofId, receiptHash);

      await expect(registry.connect(addr2).verifyProof(receiptHash))
        .to.emit(registry, "ProofVerified")
        .withArgs(receiptHash, addr2.address, anyTimestamp => anyTimestamp > 0);

      const verifyTx = await registry.verifyProof.staticCall(receiptHash);
      expect(verifyTx[0]).to.equal(proofId);
      expect(verifyTx[2]).to.equal(addr1.address);
    });

    it("Should revert verification for non-existent proof", async function () {
      await expect(registry.verifyProof(receiptHash)).to.be.revertedWithCustomError(
        registry,
        "ProofNotFound"
      );
    });
  });

  describe("Get Proof Status", function () {
    it("Should retrieve proof by ID", async function () {
      await registry.connect(addr1).storeProof(proofId, receiptHash);

      const [retrievedHash, timestamp, wallet] = await registry.getProof(proofId);
      expect(retrievedHash).to.equal(receiptHash);
      expect(wallet).to.equal(addr1.address);
      expect(timestamp).to.be.gt(0);
    });

    it("Should revert if proof ID does not exist", async function () {
      await expect(registry.getProof("non-existent-id")).to.be.revertedWithCustomError(
        registry,
        "ProofIdNotFound"
      );
    });

    it("Should retrieve proof by hash using view function", async function () {
      await registry.connect(addr1).storeProof(proofId, receiptHash);

      const [retrievedId, timestamp, wallet] = await registry.getProofByHash(receiptHash);
      expect(retrievedId).to.equal(proofId);
      expect(wallet).to.equal(addr1.address);
      expect(timestamp).to.be.gt(0);
    });
  });
});
