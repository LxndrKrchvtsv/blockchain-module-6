import hre from "hardhat";

async function main() {
    const connection = await hre.network.connect();
    const { ethers } = connection;
    const [deployer] = await ethers.getSigners();

    console.log("--- START DEPLOYMENT ---");
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

    const MyTokenV1 = await ethers.getContractFactory("MyTokenV1", deployer);
    console.log("Deploying Logic V1...");
    const logicV1 = await MyTokenV1.deploy();
    await logicV1.waitForDeployment();
    const logicV1Address = await logicV1.getAddress();
    console.log("Logic V1 deployed to:", logicV1Address);


    const initialSupply = ethers.parseEther("1000000");

    const initData = MyTokenV1.interface.encodeFunctionData("initialize", [initialSupply]);

    const MyProxy = await ethers.getContractFactory("MyProxy", deployer);
    const proxy = await MyProxy.deploy(logicV1Address, initData);
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();
    console.log("Proxy deployed to:", proxyAddress);

    let tokenV1 = MyTokenV1.attach(proxyAddress) as any;

    console.log("--- TESTING V1 ---");
    console.log("Token Name:", await tokenV1.name()); // Должен вернуть "MyToken"
    console.log("Balance of deployer:", ethers.formatEther(await tokenV1.balanceOf(deployer.address)));

    // const randomUser = ethers.Wallet.createRandom();

    const recipientAddress = "0x6a76c3f0c6798cbf841218fe0aee5ae8153c1822";
    console.log(`Transferring 100 tokens to random user (${recipientAddress})...`);
    const transferAmount = ethers.parseEther("100");

    const txTransfer = await tokenV1.transfer(recipientAddress, transferAmount);
    console.log("Transfer tx sent:", txTransfer.hash);
    await txTransfer.wait();

    const recipientBalanceV1 = await tokenV1.balanceOf(recipientAddress);
    console.log("Recipient Balance (V1):", ethers.formatEther(recipientBalanceV1));

    console.log("\n--- PREPARING UPGRADE ---");
    const MyTokenV2 = await ethers.getContractFactory("MyTokenV2", deployer);
    console.log("Deploying Logic V2...");
    const logicV2 = await MyTokenV2.deploy();
    await logicV2.waitForDeployment();
    const logicV2Address = await logicV2.getAddress();
    console.log("Logic V2 deployed to:", logicV2Address);

    console.log("Upgrading Proxy to V2...");
    const txUpgrade = await tokenV1.upgradeToAndCall(logicV2Address, "0x");
    console.log("Upgrade tx sent:", txUpgrade.hash);
    await txUpgrade.wait();
    console.log("Upgrade transaction confirmed.");

    const tokenV2 = MyTokenV2.attach(proxyAddress) as any;

    console.log("--- TESTING V2 ---");

    const recipientBalanceV2 = await tokenV2.balanceOf(recipientAddress);
    console.log("Recipient Balance after upgrade (V2):", ethers.formatEther(recipientBalanceV2));

    if (recipientBalanceV1 == recipientBalanceV2) {
        console.log("SUCCESS: User balances stayed intact!");
    } else {
        console.error("FAILURE: User balances changed!");
    }

    try {
        const version = await tokenV2.version();
        console.log("Version function returned:", version);
    } catch (e) {
        console.log("Version function failed!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});