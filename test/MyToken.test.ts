import { expect } from "chai";
import hre from "hardhat";

describe("MyToken", async function () {
    let ethers: any;
    let token: any;
    let owner: any;
    let user: any;

    const INITIAL_SUPPLY = BigInt("1000000000000000000000000"); // 1e6 * 1e18

    before(async function () {
        const connection = await hre.network.connect();
        ethers = connection.ethers;
    });

    beforeEach(async function () {
        const signers = await ethers.getSigners();
        owner = signers[0];
        user = signers[1];

        const MyTokenFactory = await ethers.getContractFactory("MyToken", owner);
        token = await MyTokenFactory.deploy(INITIAL_SUPPLY);
        await token.waitForDeployment();
    });
    it("deploys with correct initial supply minted to owner", async function () {
        const balance = await token.balanceOf(owner.address);
        expect(balance).to.equal(INITIAL_SUPPLY);
    });

    it("sets correct token name and symbol", async function () {
        expect(await token.name()).to.equal("MyToken");
        expect(await token.symbol()).to.equal("MTK");
    });

    it("allows owner to mint tokens", async function () {
        const mintAmount = ethers.parseEther("100");

        await token.mint(user.address, mintAmount);

        const userBalance = await token.balanceOf(user.address);
        expect(userBalance).to.equal(mintAmount);
    });

    it("prevents non-owner from minting", async function () {
        const mintAmount = ethers.parseEther("100");

        await expect(
            token.connect(user).mint(user.address, mintAmount)
        ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("totalSupply increases after mint", async function () {
        const mintAmount = ethers.parseEther("500");

        const totalBefore = await token.totalSupply();
        await token.mint(user.address, mintAmount);
        const totalAfter = await token.totalSupply();

        expect(totalAfter).to.equal(totalBefore + mintAmount);
    });

});