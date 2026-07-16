const hre = require("hardhat");

async function main() {
  console.log("Deploying DebtProofRegistry...");

  const DebtProofRegistry = await hre.ethers.getContractFactory("DebtProofRegistry");
  const registry = await DebtProofRegistry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`DebtProofRegistry deployed to: ${address}`);
  console.log("Deploy verification check complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
