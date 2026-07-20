const hre = require("hardhat");

async function main() {
  console.log("Deploying DebtProofRegistry...");

  const DebtProofRegistry = await hre.ethers.getContractFactory("DebtProofRegistry");
  const registry = await DebtProofRegistry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`DebtProofRegistry deployed to: ${address}`);

  console.log("Deploying DebtProofEscrow...");
  const DebtProofEscrow = await hre.ethers.getContractFactory("DebtProofEscrow");
  const escrow = await DebtProofEscrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log(`DebtProofEscrow deployed to: ${escrowAddress}`);

  console.log("Deploy verification check complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
