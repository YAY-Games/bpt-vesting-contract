const BptVesting2Strategic = artifacts.require("BptVesting2Strategic");

async function main() {
  const bptVesting = await BptVesting2Strategic.new(
    process.env["TOKEN_CONTRACT"],
    process.env["MERCLE_ROOT"],
    process.env["TGE_TIMESTAMP"],
  );
  await BptVesting2Strategic.setAsDeployed(bptVesting);

  console.log("contract deployed: ", bptVesting.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });