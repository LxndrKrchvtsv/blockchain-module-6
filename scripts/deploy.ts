import hre from "hardhat";

const VISIT_CARD_URI = "https://white-select-raccoon-375.mypinata.cloud/ipfs/bafkreibyglllvsotbg3js6qzfhynqlm5ay56ad7dqbqk5xiww6htwe455q";
const COLLECTION_URI = "https://white-select-raccoon-375.mypinata.cloud/ipfs/bafybeihbnjeuvk6urhjqmyfbigu35367isnboxwspduza3zubtatw7iwvi";

async function main() {
    const connection = await hre.network.connect();
    const { ethers } = connection;

    const [deployer] = await ethers.getSigners();
    console.log("--- START NFT DEPLOYMENT ---");
    console.log("Deploying with account:", deployer.address);

    // ERC-721 SOULBOUND VISIT CARD
    console.log("--- 1. DEPLOYING ERC-721 (VISIT CARD) ---");
    const VisitCard = await ethers.getContractFactory("SoulboundVisitCardERC721", deployer);
    const visitCardContract = await VisitCard.deploy() as any;
    await visitCardContract.waitForDeployment();
    const visitCardAddress = await visitCardContract.getAddress();
    console.log("SoulboundVisitCard deployed to:", visitCardAddress);

    // creating of SBT NFT (card)
    console.log("Minting Soulbound NFT to deployer...");

    const tx721 = await visitCardContract.safeMint(deployer.address, VISIT_CARD_URI);
    console.log("Mint Transaction Hash:", tx721.hash);
    await tx721.wait();
    console.log("Visit Card minted successfully!");

    // ERC-1155 GAME CHARACTERS
    console.log("\n--- 2. DEPLOYING ERC-1155 (GAME COLLECTION) ---");
    const GameCollection = await ethers.getContractFactory("GameCharacterCollectionERC1155", deployer);
    const gameContract = await GameCollection.deploy(COLLECTION_URI) as any;
    await gameContract.waitForDeployment();
    const gameAddress = await gameContract.getAddress();
    console.log("GameCharacterCollection deployed to:", gameAddress);

    // Creating of collection (minting) (BATCH MINT)
    const ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const amounts = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    console.log("Batch minting 10 characters...");
    const tx1155 = await gameContract.mintBatch(deployer.address, ids, amounts, "0x");
    console.log("Batch Mint Transaction Hash:", tx1155.hash);
    await tx1155.wait();
    console.log("Game Characters minted successfully!");

    console.log("\n--- SUMMARY ---");
    console.log("ERC-721 Address:", visitCardAddress);
    console.log("ERC-1155 Address:", gameAddress);
    console.log("Check them on Explorer!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
