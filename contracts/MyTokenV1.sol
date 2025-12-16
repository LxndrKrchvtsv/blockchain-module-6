// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MyTokenV1 is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 initialSupply) public initializer {
        __ERC20_init("MyToken", "MTK");
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        _mint(msg.sender, initialSupply);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}