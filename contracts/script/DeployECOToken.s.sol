// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console } from "forge-std/Script.sol";
import { ECOToken } from "../src/ECOToken.sol";

// STUB de deploy (E2-HU01). El deploy productivo a Sepolia se implementa en una HU posterior.
contract DeployECOToken is Script {
    uint256 constant CAP = 1_000_000 ether;

    function run() external returns (ECOToken) {
        address admin =
            vm.envOr("ADMIN_ADDRESS", address(0xE7136d34f62C3c8375a1d3Fe04ec4B2e99F9629E));
        address minter = vm.envOr("MINTER_ADDRESS", msg.sender);

        vm.startBroadcast();
        ECOToken token = new ECOToken(CAP, admin, minter);
        vm.stopBroadcast();

        console.log("ECOToken:", address(token));
        console.log("Admin:", admin);
        console.log("Minter:", minter);
        return token;
    }
}
