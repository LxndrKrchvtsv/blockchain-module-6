import { expect } from "chai";
import hre from "hardhat";

describe("MultiSigWallet", async function () {
    let ethers: any;
    let wallet: any;
    let owner1: any;
    let owner2: any;
    let owner3: any;
    let nonOwner: any;

    const REQUIRED_CONFIRMATIONS = 2;

    before(async function () {
        // Manually connect to the network environment (as per your working setup)
        const connection = await hre.network.connect();
        ethers = connection.ethers;
    });

    beforeEach(async function () {
        const signers = await ethers.getSigners();
        owner1 = signers[0];
        owner2 = signers[1];
        owner3 = signers[2];
        nonOwner = signers[3];

        const owners = [owner1.address, owner2.address, owner3.address];

        // Get the factory using the first owner
        const MultiSigWalletFactory = await ethers.getContractFactory("MultiSigWallet", owner1);

        // Deploy with 3 owners and 2 required confirmations
        wallet = await MultiSigWalletFactory.deploy(owners, REQUIRED_CONFIRMATIONS);
        await wallet.waitForDeployment();
    });

    it("deploys with correct owners and confirmation requirement", async function () {
        expect(await wallet.numConfirmationsRequired()).to.equal(REQUIRED_CONFIRMATIONS);
        expect(await wallet.isOwner(owner1.address)).to.equal(true);
        expect(await wallet.isOwner(owner2.address)).to.equal(true);
        expect(await wallet.isOwner(owner3.address)).to.equal(true);
        expect(await wallet.isOwner(nonOwner.address)).to.equal(false);
    });

    it("allows contract to receive ETH", async function () {
        const amount = ethers.parseEther("1.0");

        // Send ETH directly to the contract address
        await owner1.sendTransaction({
            to: await wallet.getAddress(),
            value: amount
        });

        const balance = await ethers.provider.getBalance(await wallet.getAddress());
        expect(balance).to.equal(amount);
    });

    it("allows owner to submit a transaction", async function () {
        // Owner1 submits a transaction to send funds to nonOwner
        await wallet.connect(owner1).submitTransaction(nonOwner.address, 0, "0x");

        // Check the transaction struct
        const tx = await wallet.getTransaction(0);
        expect(tx.to).to.equal(nonOwner.address);
        expect(tx.numConfirmations).to.equal(0);
        expect(tx.executed).to.equal(false);
    });

    it("prevents non-owner from submitting transaction", async function () {
        await expect(
            wallet.connect(nonOwner).submitTransaction(nonOwner.address, 0, "0x")
        ).to.be.revertedWith("Not owner");
    });

    it("allows owners to confirm a transaction", async function () {
        // Submit tx
        await wallet.submitTransaction(nonOwner.address, 0, "0x");

        // Confirm by Owner 1
        await wallet.connect(owner1).confirmTransaction(0);

        let tx = await wallet.getTransaction(0);
        expect(tx.numConfirmations).to.equal(1);

        // Confirm by Owner 2
        await wallet.connect(owner2).confirmTransaction(0);

        tx = await wallet.getTransaction(0);
        expect(tx.numConfirmations).to.equal(2);
    });

    it("executes transaction only after required confirmations", async function () {
        const amountToSend = ethers.parseEther("1.0");

        // Fund the wallet
        await owner1.sendTransaction({
            to: await wallet.getAddress(),
            value: ethers.parseEther("5.0")
        });

        // Submit transaction 1 ETH
        await wallet.submitTransaction(nonOwner.address, amountToSend, "0x");

        // Try to execute immediately (there should be an error, 0 confirmations)
        await expect(
            wallet.executeTransaction(0)
        ).to.be.revertedWith("Cannot execute tx");

        // Confirmed by Owner 1
        await wallet.connect(owner1).confirmTransaction(0);

        // Try to execute again (error, 1 confirmation < 2)
        await expect(
            wallet.executeTransaction(0)
        ).to.be.revertedWith("Cannot execute tx");

        // Confirmed by Owner 2
        await wallet.connect(owner2).confirmTransaction(0);

        // Execute the transaction (it should work now)

        // --- REPLACEMENT OF THE PROBLEM BLOCK ---
        // Save the balances BEFORE
        const walletBalanceBefore = await ethers.provider.getBalance(await wallet.getAddress());
        const nonOwnerBalanceBefore = await ethers.provider.getBalance(nonOwner.address);

        // Execute
        const tx = await wallet.connect(owner1).executeTransaction(0);
        await tx.wait();

        // Save the balances AFTER
        const walletBalanceAfter = await ethers.provider.getBalance(await wallet.getAddress());
        const nonOwnerBalanceAfter = await ethers.provider.getBalance(nonOwner.address);

        // The wallet balance should decrease by exactly the amount of the transfer.
        expect(walletBalanceAfter).to.equal(walletBalanceBefore - amountToSend);

        // The recipient's balance must increase by exactly the amount of the transfer.
        expect(nonOwnerBalanceAfter).to.equal(nonOwnerBalanceBefore + amountToSend);

        // Check executed flag
        const txStruct = await wallet.getTransaction(0);
        expect(txStruct.executed).to.equal(true);
    });

    it("allows revoking a confirmation", async function () {
        await wallet.submitTransaction(nonOwner.address, 0, "0x");

        // Confirm
        await wallet.connect(owner1).confirmTransaction(0);
        let tx = await wallet.getTransaction(0);
        expect(tx.numConfirmations).to.equal(1);

        // Revoke
        await wallet.connect(owner1).revokeConfirmation(0);

        tx = await wallet.getTransaction(0);
        expect(tx.numConfirmations).to.equal(0);
    });
});