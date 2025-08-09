// contracts/scripts/deploy-sepolia.js
async function main() {
  const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
  const contract = await DocumentRegistry.deploy();
  await contract.deployed();
  console.log("✅ Deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
