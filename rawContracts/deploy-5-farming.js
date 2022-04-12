const BptVesting5Farming = artifacts.require("BptVesting5Farming");

async function main() {
  const bptVesting = await BptVesting5Farming.new(
    process.env["TOKEN_CONTRACT"],
    process.env["MERCLE_ROOT"],
    process.env["TGE_TIMESTAMP"],
  );
  await BptVesting5Farming.setAsDeployed(bptVesting);

  console.log("contract deployed: ", bptVesting.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });