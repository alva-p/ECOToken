// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ECOToken } from "../src/ECOToken.sol";

contract ECOTokenTest is Test {
    ECOToken private ecoToken;

    address private admin = address(0xA11CE);
    address private minter = address(0xB0B);
    address private user = address(0xCAFE);
    address private attacker = address(0xBAD);

    uint256 private constant CAP = 1_000_000 ether;

    function setUp() public {
        ecoToken = new ECOToken(CAP, admin, minter);
    }

    function testConstructorSetsNameSymbolAndCap() public view {
        assertEq(ecoToken.name(), "EcoToken");
        assertEq(ecoToken.symbol(), "ECO");
        assertEq(ecoToken.cap(), CAP);
    }

    function testConstructorGrantsAdminRole() public view {
        assertTrue(ecoToken.hasRole(ecoToken.DEFAULT_ADMIN_ROLE(), admin));
    }

    function testConstructorGrantsMinterRole() public view {
        assertTrue(ecoToken.hasRole(ecoToken.MINTER_ROLE(), minter));
    }

    function testMinterCanMint() public {
        uint256 amount = 100 ether;

        vm.prank(minter);
        ecoToken.mint(user, amount, "plastico", 10);

        assertEq(ecoToken.balanceOf(user), amount);
        assertEq(ecoToken.totalSupply(), amount);
    }

    function testMintUpdatesBalance() public {
        uint256 firstMint = 50 ether;
        uint256 secondMint = 25 ether;

        vm.startPrank(minter);
        ecoToken.mint(user, firstMint, "plastico", 10);
        ecoToken.mint(user, secondMint, "plastico", 10);
        vm.stopPrank();

        assertEq(ecoToken.balanceOf(user), firstMint + secondMint);
        assertEq(ecoToken.totalSupply(), firstMint + secondMint);
    }

    function testCannotMintOverCap() public {
        vm.startPrank(minter);

        ecoToken.mint(user, CAP, "plastico", 10);

        vm.expectRevert();
        ecoToken.mint(user, 1, "plastico", 10);

        vm.stopPrank();
    }

    function testNonMinterCannotMint() public {
        uint256 amount = 100 ether;
        bytes32 minterRole = ecoToken.MINTER_ROLE();

        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, attacker, minterRole
            )
        );

        vm.prank(attacker);
        ecoToken.mint(user, amount, "plastico", 10);
    }

    function testCannotDeployWithZeroAdmin() public {
        vm.expectRevert(ECOToken.ECOToken__ZeroAddress.selector);
        new ECOToken(CAP, address(0), minter);
    }

    function testCannotDeployWithZeroMinter() public {
        vm.expectRevert(ECOToken.ECOToken__ZeroAddress.selector);
        new ECOToken(CAP, admin, address(0));
    }

    function testCannotMintToZeroAddress() public {
        vm.prank(minter);
        vm.expectRevert(ECOToken.ECOToken__ZeroAddress.selector);

        ecoToken.mint(address(0), 100 ether, "plastico", 10);
    }

    /*//////////////////////////////////////////////////////////////
                        E2-HU02: MINT CON TRAZABILIDAD
    //////////////////////////////////////////////////////////////*/

    event Minted(address indexed empresa, uint256 amount, string material, uint256 peso);

    function testMintEmitsMintedEvent() public {
        vm.expectEmit(true, false, false, true);
        emit Minted(user, 100 ether, "vidrio", 25);

        vm.prank(minter);
        ecoToken.mint(user, 100 ether, "vidrio", 25);
    }

    function testFuzzMintRespectsCap(uint256 amount, uint256 peso) public {
        amount = bound(amount, 1, CAP);

        vm.prank(minter);
        ecoToken.mint(user, amount, "carton", peso);
        assertEq(ecoToken.totalSupply(), amount);

        vm.expectRevert();
        vm.prank(minter);
        ecoToken.mint(user, CAP - amount + 1, "carton", peso);
    }

    /*//////////////////////////////////////////////////////////////
                        E2-HU05: PAUSA + EMERGENCY BURN
    //////////////////////////////////////////////////////////////*/

    event EmergencyBurn(address indexed target, uint256 amount, string reason);
    event Paused(address account);
    event Unpaused(address account);

    function testAdminRoleAliasesDefaultAdminRole() public view {
        assertEq(ecoToken.ADMIN_ROLE(), ecoToken.DEFAULT_ADMIN_ROLE());
        assertTrue(ecoToken.hasRole(ecoToken.ADMIN_ROLE(), admin));
    }

    function testPauseAndUnpauseEmitEvents() public {
        vm.expectEmit(false, false, false, true);
        emit Paused(admin);
        vm.prank(admin);
        ecoToken.pause();

        vm.expectEmit(false, false, false, true);
        emit Unpaused(admin);
        vm.prank(admin);
        ecoToken.unpause();
    }

    function testNonAdminCannotUnpause() public {
        vm.prank(admin);
        ecoToken.pause();

        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                attacker,
                ecoToken.ADMIN_ROLE()
            )
        );

        vm.prank(attacker);
        ecoToken.unpause();
    }

    function testConstructorGrantsEmergencyRoleToAdmin() public view {
        assertTrue(ecoToken.hasRole(ecoToken.EMERGENCY_ROLE(), admin));
    }

    function testAdminCanPauseAndUnpause() public {
        vm.prank(admin);
        ecoToken.pause();
        assertTrue(ecoToken.paused());

        vm.prank(admin);
        ecoToken.unpause();
        assertFalse(ecoToken.paused());
    }

    function testNonAdminCannotPause() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                attacker,
                ecoToken.DEFAULT_ADMIN_ROLE()
            )
        );

        vm.prank(attacker);
        ecoToken.pause();
    }

    function testCannotMintOrTransferWhilePaused() public {
        vm.prank(minter);
        ecoToken.mint(user, 100 ether, "plastico", 10);

        vm.prank(admin);
        ecoToken.pause();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(minter);
        ecoToken.mint(user, 1 ether, "plastico", 10);

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(user);
        ecoToken.transfer(attacker, 1 ether);
    }

    function testEmergencyBurnWhilePaused() public {
        vm.prank(minter);
        ecoToken.mint(user, 100 ether, "plastico", 10);

        vm.prank(admin);
        ecoToken.pause();

        vm.expectEmit(true, false, false, true);
        emit EmergencyBurn(user, 40 ether, "tokens fraudulentos");

        vm.prank(admin);
        ecoToken.emergencyBurn(user, 40 ether, "tokens fraudulentos");

        assertEq(ecoToken.balanceOf(user), 60 ether);
        assertEq(ecoToken.totalSupply(), 60 ether);
    }

    function testEmergencyBurnRevertsIfNotPaused() public {
        vm.prank(minter);
        ecoToken.mint(user, 100 ether, "plastico", 10);

        vm.expectRevert(Pausable.ExpectedPause.selector);
        vm.prank(admin);
        ecoToken.emergencyBurn(user, 100 ether, "no pausado");
    }

    function testNonEmergencyRoleCannotEmergencyBurn() public {
        vm.prank(minter);
        ecoToken.mint(user, 100 ether, "plastico", 10);

        vm.prank(admin);
        ecoToken.pause();

        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                attacker,
                ecoToken.EMERGENCY_ROLE()
            )
        );

        vm.prank(attacker);
        ecoToken.emergencyBurn(user, 100 ether, "sin rol");
    }

    function testFuzzEmergencyBurn(uint256 minted, uint256 burned) public {
        minted = bound(minted, 1, CAP);
        burned = bound(burned, 1, minted);

        vm.prank(minter);
        ecoToken.mint(user, minted, "plastico", 10);

        vm.startPrank(admin);
        ecoToken.pause();
        ecoToken.emergencyBurn(user, burned, "fuzz");
        vm.stopPrank();

        assertEq(ecoToken.balanceOf(user), minted - burned);
        assertEq(ecoToken.totalSupply(), minted - burned);
    }

    /*//////////////////////////////////////////////////////////////
                        E2-HU07: FUZZING DE PAUSA
    //////////////////////////////////////////////////////////////*/

    function testFuzzPauseBlocksMintAndTransferForAnyInput(address to, uint256 amount) public {
        vm.assume(to != address(0));
        amount = bound(amount, 1, CAP - 100 ether);

        vm.prank(minter);
        ecoToken.mint(user, 100 ether, "plastico", 10);

        vm.prank(admin);
        ecoToken.pause();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(minter);
        ecoToken.mint(to, amount, "plastico", 10);

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(user);
        ecoToken.transfer(to, 1 ether);
    }

    function testFuzzOnlyAdminCanPauseAndUnpause(address caller) public {
        vm.assume(caller != admin);
        bytes32 adminRole = ecoToken.ADMIN_ROLE();

        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, caller, adminRole
            )
        );
        vm.prank(caller);
        ecoToken.pause();

        vm.prank(admin);
        ecoToken.pause();

        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, caller, adminRole
            )
        );
        vm.prank(caller);
        ecoToken.unpause();
    }

    function testTransfersResumeAfterUnpause() public {
        vm.prank(minter);
        ecoToken.mint(user, 100 ether, "plastico", 10);

        vm.startPrank(admin);
        ecoToken.pause();
        ecoToken.unpause();
        vm.stopPrank();

        vm.prank(user);
        ecoToken.transfer(attacker, 10 ether);
        assertEq(ecoToken.balanceOf(attacker), 10 ether);
    }
}
