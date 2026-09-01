// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console } from "forge-std/Script.sol";
import { ECOToken } from "../src/ECOToken.sol";

// Sube una nueva implementacion al proxy UUPS ya deployado en Sepolia. Firma
// con la cuenta ADMIN_ROLE (Vault Address, unica autorizada por
// _authorizeUpgrade). El storage vive en el proxy: no se reinicializa nada.
contract UpgradeECOToken is Script {
    function run() external {
        address proxy = vm.envAddress("ECOTOKEN_PROXY_ADDRESS");

        vm.startBroadcast();
        ECOToken newImplementation = new ECOToken();
        ECOToken(proxy).upgradeToAndCall(address(newImplementation), "");
        vm.stopBroadcast();

        console.log("ECOToken (proxy):", proxy);
        console.log("ECOToken (nueva implementacion):", address(newImplementation));
    }
}
