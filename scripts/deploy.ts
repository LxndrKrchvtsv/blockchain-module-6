import hre from "hardhat";

async function main() {
    const connection = await hre.network.connect();
    const {ethers} = connection;
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contract with account:", deployer.address);

    const MyToken = await ethers.getContractFactory("MyToken", deployer);

    const initialSupply = ethers.parseEther("1000000");

    const myToken = await MyToken.deploy(initialSupply)
    await myToken.waitForDeployment();

    console.log("MyToken deployed to:", await myToken.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});