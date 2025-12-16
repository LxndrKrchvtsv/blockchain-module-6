# Module 8: Multi-Signature Wallet Implementation Report

## 1. Introduction
This project implements a secure, decentralized **Multi-Signature (Multi-Sig) Wallet** smart contract using Solidity. Unlike standard Externally Owned Accounts (EOAs), this wallet requires a predefined number of approvals (M-of-N) from designated owners to execute any transaction. This architecture eliminates single points of failure and makes the wallet suitable for collective asset management and DAO treasuries.

## 2. Architecture and Design Decisions

### 2.1. Core Data Structures
To ensure gas efficiency and logical clarity, the following structures were chosen:

*   **Transaction Struct:** Stores the destination address, ETH value, data payload (for arbitrary contract interactions), execution status, and current confirmation count.
*   **Confirmations Mapping:**
    ```solidity
    mapping(uint256 => mapping(address => bool)) public isConfirmed;
    ```
    **Design Decision:** Instead of storing an array of confirmers, a nested mapping was used. This allows checking if a specific owner has confirmed a transaction with **O(1)** complexity, significantly reducing gas costs compared to iterating through arrays.

### 2.2. Modifiers
Custom modifiers (`onlyOwner`, `txExists`, `notExecuted`, `notConfirmed`) are used to abstract validation logic, adhering to the "Fail Early" principle.

## 3. Security Analysis

Security is paramount for a wallet holding shared funds. The following measures were implemented:

### 3.1. Reentrancy Protection
The contract strictly follows the **Checks-Effects-Interactions** pattern. In the `executeTransaction` function, the state variable `transaction.executed` is set to `true` **before** the external low-level call is made. This prevents a malicious contract from recursively calling back into the wallet to drain funds.

### 3.2. Secure Ether Transfer
The contract uses `call{value: ...}` instead of `.transfer()` or `.send()`.
*   **Reasoning:** `.transfer()` has a hard gas limit of 2300, which is often insufficient for receiving contracts (e.g., smart contract wallets or proxies). `.call` forwards all available gas, preventing legitimate transactions from failing, while the Reentrancy guard ensures safety.

### 3.3. Replay Attack Prevention
The `notExecuted` modifier ensures that a transaction ID can only be processed once. Even if the threshold is met again, the contract will revert execution.

### 3.4. Owner Validation
The constructor enforces strict rules: the owners array cannot be empty, the threshold must be valid, and all owner addresses must be unique and non-zero.

## 4. Deployment Details

The contract was successfully deployed to the **Core Blockchain Testnet 2**.

*   **Network:** Core Chain TestNet 2 (Chain ID: 1114)
*   **Contract Address:** `0xA477bF13c7bC67FA92F0A79DAEfF920B19952f4B`
*   **Explorer Link:** [View on Core Scan](https://scan.test2.btcs.network/address/0xA477bF13c7bC67FA92F0A79DAEfF920B19952f4B)

## 5. Testing Strategy

An automated test suite (`test/MultiSigWallet.ts`) was developed using **Hardhat** and **Ethers.js**. The tests cover 100% of the contract functionality:

1.  **Deployment:** Verifies correct setting of owners and confirmation threshold.
2.  **Deposits:** Ensures the contract can receive ETH.
3.  **Workflow:** Tests the full lifecycle: `Submit` -> `Confirm` -> `Execute`.
4.  **Access Control:** Verifies that non-owners cannot submit or confirm transactions.
5.  **Logic Enforcement:** Ensures transactions fail if the confirmation threshold is not met.
6.  **Revocation:** Verifies that owners can retract their confirmation before execution.

## 6. Bonus: Frontend DApp Implementation

To demonstrate real-world usability, a React-based frontend application was built.

**Features:**
*   **Wallet Connection:** Connects via MetaMask (auto-switches to Core Testnet 2).
*   **Dashboard:** Displays contract balance, list of owners, and required confirmations.
*   **Transaction Management:** Interface to propose new transactions and a table to view, confirm, and execute pending transactions.
*   **Live Updates:** The UI updates in real-time as different owners interact with the smart contract.

**Interface Screenshot:**

![DApp Interface Screenshot](./public/Screenshot%202025-12-16%20234126.png)
*(Note: Replace "path/to/your/screenshot.png" with the actual file path or image URL)*

## 7. Conclusion
This assignment demonstrated the implementation of a secure, upgrade-resistant Multi-Signature Wallet. By combining a robust Solidity backend with comprehensive tests and a user-friendly React frontend, the project simulates a production-ready DeFi application for shared asset management.