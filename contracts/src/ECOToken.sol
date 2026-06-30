// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Capped } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract ECOToken is ERC20Capped, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    error ECOToken__ZeroAddress();

    constructor(uint256 cap_, address admin_, address minter_)
        ERC20("EcoToken", "ECO")
        ERC20Capped(cap_)
    {
        if (admin_ == address(0) || minter_ == address(0)) {
            revert ECOToken__ZeroAddress();
        }

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(MINTER_ROLE, minter_);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (to == address(0)) {
            revert ECOToken__ZeroAddress();
        }

        _mint(to, amount);
    }
}
