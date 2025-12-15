// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

import "@openzeppelin/contracts/access/Ownable.sol";


contract MyToken is ERC20, ERC20Permit, Ownable {
    constructor(uint256 initialSupply)
    ERC20("MyToken", "MTK")
    ERC20Permit("MyToken")
    Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
