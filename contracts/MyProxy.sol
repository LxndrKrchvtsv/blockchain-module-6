// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// ERC1967 proxy, Why ERC1967?
// This is a modern standard for avoiding storage conflicts in upgradeable contracts.
// It defines specific storage slots for implementation and admin addresses,
// ensuring that these do not interfere with the storage layout of the implementation contract.
// This makes it safer and more reliable for upgradeable contract patterns.
// OpenZeppelin's implementation of ERC1967Proxy is widely used and trusted in the Ethereum community.

// UUPS - Universal Upgradeable Proxy Standard, this is the architecture approach used here.

// Alternatives?
// Transparent Proxy Pattern, but for today its deprecated in favor of UUPS and ERC1967 proxies.
// EIP-2535 (Diamond Standard), but its more complex and not necessary for simple upgradeable contracts.

contract MyProxy is ERC1967Proxy {
    constructor(address implementation, bytes memory _data)
    ERC1967Proxy(implementation, _data)
    {}
}