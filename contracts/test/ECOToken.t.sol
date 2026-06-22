// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {ECOToken} from "../src/ECOToken.sol";

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
        ecoToken.mint(user, amount);

        assertEq(ecoToken.balanceOf(user), amount);
        assertEq(ecoToken.totalSupply(), amount);
    }

    function testMintUpdatesBalance() public {
        uint256 firstMint = 50 ether;
        uint256 secondMint = 25 ether;

        vm.startPrank(minter);
        ecoToken.mint(user, firstMint);
        ecoToken.mint(user, secondMint);
        vm.stopPrank();

        assertEq(ecoToken.balanceOf(user), firstMint + secondMint);
        assertEq(ecoToken.totalSupply(), firstMint + secondMint);
    }

    function testCannotMintOverCap() public {
        vm.startPrank(minter);

        ecoToken.mint(user, CAP);

        vm.expectRevert();
        ecoToken.mint(user, 1);

        vm.stopPrank();
    }

    function testNonMinterCannotMint() public {
        uint256 amount = 100 ether;
        bytes32 minterRole = ecoToken.MINTER_ROLE();

        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                attacker,
                minterRole
            )
        );

        vm.prank(attacker);
        ecoToken.mint(user, amount);
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

        ecoToken.mint(address(0), 100 ether);
    }
}
