// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {ECOToken} from "../src/ECOToken.sol";

/// @dev STUB inicial de tests (Sprint 0). Ampliar con roles, mint, pausa, emergencia y fuzzing.
contract ECOTokenTest is Test {
    ECOToken internal token;
    address internal admin = address(0xA11CE);

    function setUp() public {
        token = new ECOToken();
        token.initialize(admin);
    }

    function test_Metadata() public view {
        assertEq(token.name(), "ECOToken");
        assertEq(token.symbol(), "ECO");
    }

    function test_AdminRoleGranted() public view {
        assertTrue(token.hasRole(token.ADMIN_ROLE(), admin));
    }

    // TODO(sprint): test_Mint_OnlyMinter, test_Pause_BlocksMint, test_EmergencyBurn_OnlyWhenPaused...
}
