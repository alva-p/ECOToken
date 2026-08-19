// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console } from "forge-std/Script.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { ECOToken } from "../src/ECOToken.sol";

// Deploy a Sepolia (E2-HU08) detras de un proxy UUPS (E2-HU06). ADMIN_ADDRESS /
// MINTER_ADDRESS por env sobreescriben los defaults. Ojo: no usar msg.sender como
// default, fuera del broadcast resuelve al default sender interno de Foundry.
contract DeployECOToken is Script {
    uint256 constant CAP = 1_000_000 ether;
    address constant ADMIN = 0xE7136d34f62C3c8375a1d3Fe04ec4B2e99F9629E;

    function run() external returns (ECOToken) {
        address admin = vm.envOr("ADMIN_ADDRESS", ADMIN);
        address minter = vm.envOr("MINTER_ADDRESS", ADMIN);

        vm.startBroadcast();
        ECOToken implementation = new ECOToken();
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation), abi.encodeCall(ECOToken.initialize, (CAP, admin, minter))
        );
        vm.stopBroadcast();

        console.log("ECOToken (proxy):", address(proxy));
        console.log("ECOToken (implementation):", address(implementation));
        console.log("Admin:", admin);
        console.log("Minter:", minter);
        return ECOToken(address(proxy));
    }
}
