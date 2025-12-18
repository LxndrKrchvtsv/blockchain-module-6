// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameCharacterCollectionERC1155 is ERC1155, Ownable {
    // Constants for integration, for instance for game, for website (frontend) etc.
    uint256 public constant WARRIOR = 0;
    uint256 public constant MAGE = 1;
    uint256 public constant ROGUE = 2;

    // URL (ipfs, CID of resource) to metadata
    constructor(string memory url) ERC1155(url) Ownable(msg.sender) {}

    // Single mint
    function mint(address account, uint256 id, uint256 amount, bytes memory data)
    public
    onlyOwner
    {
        _mint(account, id, amount, data);
    }

    // Batch Mint
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
    public
    onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }
}