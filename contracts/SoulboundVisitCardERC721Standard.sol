// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundVisitCardERC721 is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Throw the error if someone will try to transfer the soulbound token (SBT)
    error SoulboundTokenIsNonTransferable();

    constructor() ERC721("StudentVisitCard", "SVC") Ownable(msg.sender) {}

    // create a card token
    // to: my address (from config)
    // uri: link from pinata ipfs
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // Soulbound Logic

    // Calls on every transfer try (including minting and burning)
    function _update(address to, uint256 tokenId, address auth)
    internal
    override(ERC721)
    returns (address)
    {
        // Get current owner
        address from = _ownerOf(tokenId);

        // from != 0 (token already exists) И to != 0 (token don't burn) then it's transfer and it should be blocked
        if (from != address(0) && to != address(0)) {
            revert SoulboundTokenIsNonTransferable();
        }

        return super._update(to, tokenId, auth);
    }

    // I had to override methods below because ERC721 and ERC721URIStorage have tokenURI supportsInterface
    // Solidity requires to explicitly specify which one to use

    function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}