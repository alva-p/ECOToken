// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ECOToken} from "../src/ECOToken.sol";

/// @dev STUB de deploy (Sprint 0). El deploy productivo del proxy UUPS se hace con Hardhat
///      (@openzeppelin/hardhat-upgrades) en scripts/deploy.ts. Este script despliega la lógica.
contract DeployECOToken is Script {
    function run() external returns (ECOToken) {
        address admin = vm.envOr("ADMIN_ADDRESS", msg.sender);

        vm.startBroadcast();
        ECOToken implementation = new ECOToken();
        vm.stopBroadcast();

        console.log("ECOToken implementation:", address(implementation));
        console.log("Admin previsto:", admin);
        return implementation;
    }
}
