import '@nomiclabs/hardhat-truffle5'
import "@nomiclabs/hardhat-web3";
import '@typechain/hardhat'
import { HardhatUserConfig } from 'hardhat/types'
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import { config as dotEnvConfig } from "dotenv";
import "hardhat-gas-reporter"
import "solidity-coverage";
import '@openzeppelin/hardhat-upgrades'

dotEnvConfig();

const NO_PRIVATE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const RINKEBY_TESTNET_RPC_URL = process.env.RINKEBY_TESTNET_RPC_URL || "";
const AVALANCHE_RPC_URL = process.env.AVALANCHE_RPC_URL || "";
const AVALANCHE_TESTNET_RPC_URL = process.env.AVALANCHE_TESTNET_RPC_URL || "";
const BSC_RPC_URL = process.env.BSC_RPC_URL || "";
const BSC_TESTNET_RPC_URL = process.env.BSC_TESTNET_RPC_URL || "";
const YAY_CHAIN_MVPNET_RPC_URL = process.env.YAY_CHAIN_MVPNET_RPC_URL || "";

const EXPLORER_API_KEY = process.env.EXPLORER_API_KEY || "";

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || NO_PRIVATE;

task("accounts", "Prints accounts", async (_, { web3 }) => {
  console.log(await web3.eth.getAccounts());
});

const config: HardhatUserConfig = {
  networks: {
    hardhat: {},
    rinkeby: {
      url: RINKEBY_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    bsc: {
      url: BSC_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    bscTestnet: {
      url: BSC_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    avax: {
      url: AVALANCHE_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
      gasPrice: 40000000000
    },
    avaxTestnet: {
      url: AVALANCHE_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    yayMvpnet: {
      url: YAY_CHAIN_MVPNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    }
  },
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    }
  },
  etherscan: {
    apiKey: EXPLORER_API_KEY
  },
  typechain: {
    target: 'truffle-v5',
  },
};

export default config
