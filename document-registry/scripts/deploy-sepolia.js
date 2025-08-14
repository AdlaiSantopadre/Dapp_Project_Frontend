async function main() {
  const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
  const contract = await DocumentRegistry.deploy();
  await contract.deployed();
  console.log("✅ Deploy completato su:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Per eseguire il deploy su Sepolia:
// npx hardhat run scripts/deploy-sepolia.js --network sepolia