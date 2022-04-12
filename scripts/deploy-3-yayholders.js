const BptVesting3YayHolders = artifacts.require("BptVesting3YayHolders");

async function main() {
  const bptVesting = await BptVesting3YayHolders.new(
    process.env["TOKEN_CONTRACT"],
    process.env["MERCLE_ROOT"],
    process.env["TGE_TIMESTAMP"],
  );
  await BptVesting3YayHolders.setAsDeployed(bptVesting);

  console.log("contract deployed: ", bptVesting.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });