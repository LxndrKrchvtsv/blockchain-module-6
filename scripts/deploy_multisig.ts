import hre from "hardhat";

async function main() {
    const connection = await hre.network.connect();
    const { ethers } = connection;

    // Get the deployer signer
    const [deployer] = await ethers.getSigners();

    console.log("Deploying MultiSigWallet with account:", deployer.address);

    // Define the list of owners.
    // In a real scenario, these would be the addresses of your team members.
    // Here we use the deployer and two example addresses.
    const owner1 = deployer.address;
    const owner2 = "0x6a76c3f0c6798cbf841218fe0aee5ae8153c1822";
    const owner3 = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0";

    const owners = [owner1, owner2, owner3];

    // Number of confirmations required to execute a transaction
    const requiredConfirmations = 2;

    console.log("Owners:", owners);
    console.log("Required Confirmations:", requiredConfirmations);

    // Get Contract Factory
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet", deployer);

    // Deploy contract passing arguments to the constructor
    const wallet = await MultiSigWallet.deploy(owners, requiredConfirmations);
    await wallet.waitForDeployment();

    console.log("MultiSigWallet deployed to:", await wallet.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});