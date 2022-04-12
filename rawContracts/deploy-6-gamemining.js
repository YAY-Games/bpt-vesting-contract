const BptVesting6GameMining = artifacts.require("BptVesting6GameMining");

async function main() {
  const bptVesting = await BptVesting6GameMining.new(
    process.env["TOKEN_CONTRACT"],
    process.env["MERCLE_ROOT"],
    process.env["TGE_TIMESTAMP"],
  );
  await BptVesting6GameMining.setAsDeployed(bptVesting);

  console.log("contract deployed: ", bptVesting.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });