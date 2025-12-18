# Module 9: Web3 Concept & NFT Contract Report

## 1. Project Overview
This project demonstrates the implementation of two distinct NFT standards on the Core Blockchain Testnet:
1.  **ERC-721 Soulbound Token:** A unique, non-transferable identity token representing a Student Visit Card.
2.  **ERC-1155 Game Collection:** A multi-token contract managing a collection of game characters with batch operations support.

The goal is to understand the architectural differences between standards, handle off-chain metadata via IPFS, and implement security patterns like "Soulbound" behavior.

## 2. Theoretical Concepts & Design Decisions

### 2.1. ERC-721 vs. ERC-1155
*   **ERC-721 (The Visit Card):** Chosen for the identity token because it treats each token as a distinct, unique asset (`1 Token ID = 1 Object`). This fits the concept of a personal ID card perfectly.
*   **ERC-1155 (The Game Collection):** Chosen for game assets because it supports "Semi-Fungibility". It allows managing multiple token types (Warrior, Mage, Rogue) within a single contract. Its key feature, **Batch Operations**, allows minting or transferring 10 different items in a single transaction, saving significant gas fees compared to ERC-721.

### 2.2. Soulbound Implementation
To make the Visit Card "Soulbound" (non-transferable), I overrode the `_update` function (OpenZeppelin v5 standard).
*   **Logic:** The contract checks if the `from` address and `to` address are non-zero.
*   **Result:** Minting (`from == 0`) and Burning (`to == 0`) are allowed, but standard transfers between users are reverted with a custom error `SoulboundTokenIsNonTransferable`.

### 2.3. Metadata Storage (IPFS)
Metadata is stored off-chain on **IPFS** using **Pinata** for pinning and a **Dedicated Gateway** for fast retrieval.
*   **ERC-721 Strategy:** Uses a direct link to a specific JSON file.
*   **ERC-1155 Strategy:** The smart contract automatically replaces `{id}` with the token ID (e.g., `0`, `1`) to fetch the correct metadata for each character.

## 3. Implementation Details

### Contract 1: SoulboundVisitCardERC721.sol
*   **Standard:** OpenZeppelin ERC721, ERC721URIStorage, Ownable.
*   **Key Function:** `safeMint(address to, string memory uri)` - Mints the token and sets the specific IPFS URI.
*   **Security:** `onlyOwner` restricts minting to the admin. `_update` restricts transfers.

### Contract 2: GameCharacterCollectionERC1155.sol
*   **Standard:** OpenZeppelin ERC1155, Ownable.
*   **Key Function:** `mintBatch(address to, uint256[] ids, uint256[] amounts, ...)` - Mints 10 different characters in one transaction.
*   **Metadata:** Base URI is set to the IPFS directory.

## 4. Deployment & Proof of Work

The contracts were deployed to **Core Blockchain Testnet 2**.

### 4.1. Deployment Data

| Contract Type | Contract Address | Transaction Hash (Mint) |
| :--- | :--- | :--- |
| **ERC-721 (Visit Card)** | `0x914d9875F05651a20fcbB143f84f3467dB499A37` | `0x1653380bd043b9dc7c541e25a3e88dd1a2f5b149ac306ffb0192b57083cb45b4` |
| **ERC-1155 (Collection)**| `0xA0A7729bD5BfBFA5C93622D1E3Fe667CF3DD05FC` | `0x3b9776f189b96697280da8ed779c212c5e0d2a7fd319a15ec9f3239edc180aec` |

| Contract Type | Contract Link                                |
| :--- |:---------------------------------------------|
| **ERC-721 (Visit Card)** | `https://scan.test2.btcs.network/address/0x914d9875F05651a20fcbB143f84f3467dB499A37` |
| **ERC-1155 (Collection)**| `https://scan.test2.btcs.network/address/0xA0A7729bD5BfBFA5C93622D1E3Fe667CF3DD05FC` |

### 4.2. Verification Screenshots

**1. Soulbound NFT in Explorer (Mint Transaction):**
> *[INSERT SCREENSHOT OF ERC-721 MINT TX HERE]*
    
**2. Game Collection Batch Mint in Explorer:**
> *[INSERT SCREENSHOT OF ERC-1155 BATCH MINT TX HERE]*

**3. NFT Metadata (JSON) in Browser:**
> *[INSERT SCREENSHOT OF OPENED JSON FILE FROM BROWSER HERE]*

## 5. How to Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Configure Environment:**
    Set `CORE_PRIVATE_KEY` and `CORE_RPC_URL` in `.env` file.
3.  **Deploy Script:**
    The script `scripts/deploy.ts` handles deploying both contracts and minting tokens immediately.
    ```bash
    npx hardhat run scripts/deploy.ts --network core_testnet2
    ```

## 6. Conclusion
This assignment successfully demonstrated the creation of digital identity (Soulbound) and digital assets (Game Collection). By utilizing a dedicated IPFS gateway, we ensured reliable metadata rendering, and by using ERC-1155, we optimized the distribution of game assets.