import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import {configVariable, defineConfig} from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

const CORE_RPC = process.env.CORE_RPC_URL || "https://rpc.test2.btcs.network";
const CORE_PRIVATE_KEY = process.env.CORE_PRIVATE_KEY || "";

export default defineConfig({
    plugins: [hardhatToolboxMochaEthersPlugin],
    solidity: {
        profiles: {
            default: {
                version: "0.8.28",
            },
            production: {
                version: "0.8.28",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        },
    },
    paths: {
        sources: "contracts",
        tests: "test"
    },
    networks: {
        core_testnet2: {
            url: CORE_RPC,
            chainId: 1114,
            accounts: CORE_PRIVATE_KEY ? [CORE_PRIVATE_KEY] : [],
            type: "http",
            gasPrice: "auto",
        },
        hardhatMainnet: {
            type: "edr-simulated",
            chainType: "l1",
        },
        hardhatOp: {
            type: "edr-simulated",
            chainType: "op",
        },
        sepolia: {
            type: "http",
            chainType: "l1",
            url: configVariable("SEPOLIA_RPC_URL"),
            accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
        },
    },
});
