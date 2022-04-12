const BptVesting9Ecosystem = artifacts.require("BptVesting9Ecosystem");

async function main() {
  const bptVesting = await BptVesting9Ecosystem.new(
    process.env["TOKEN_CONTRACT"],
    process.env["MERCLE_ROOT"],
    process.env["TGE_TIMESTAMP"],
  );
  await BptVesting9Ecosystem.setAsDeployed(bptVesting);

  console.log("contract deployed: ", bptVesting.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });