// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Capped } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

contract ECOToken is ERC20Capped, Pausable, AccessControl {
    // Alias del DEFAULT_ADMIN_ROLE de AccessControl: un solo rol administra roles
    // (RN-18, Vault Address) y pausa (RN-19), sin duplicar jerarquia.
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    error ECOToken__ZeroAddress();

    event EmergencyBurn(address indexed target, uint256 amount, string reason);
    // peso en kg del material validado por la cooperativa; la conversion kg->tokens
    // la calcula el backend (RN-06/RN-07), aqui solo queda registrada la trazabilidad.
    event Minted(address indexed empresa, uint256 amount, string material, uint256 peso);

    constructor(uint256 cap_, address admin_, address minter_)
        ERC20("EcoToken", "ECO")
        ERC20Capped(cap_)
    {
        if (admin_ == address(0) || minter_ == address(0)) {
            revert ECOToken__ZeroAddress();
        }

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(MINTER_ROLE, minter_);
        // Sub-rol de emergencia del administrador; reasignable via grantRole (RN-18).
        _grantRole(EMERGENCY_ROLE, admin_);
    }

    // RN-06/RN-11: acuna bajo demanda hacia la empresa adherida; revierte sobre el cap
    // (ERC20Capped) y en pausa (RN-19).
    function mint(address empresa, uint256 amount, string calldata material, uint256 peso)
        external
        onlyRole(MINTER_ROLE)
    {
        if (empresa == address(0)) {
            revert ECOToken__ZeroAddress();
        }

        _mint(empresa, amount);
        emit Minted(empresa, amount, material, peso);
    }

    // RN-19: pausa exclusiva del ADMIN. Emite Paused/Unpaused (OZ Pausable).
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // RN-28: quema de tokens fraudulentos, solo con el contrato pausado.
    function emergencyBurn(address target, uint256 amount, string calldata reason)
        external
        onlyRole(EMERGENCY_ROLE)
        whenPaused
    {
        _burn(target, amount);
        emit EmergencyBurn(target, amount, reason);
    }

    // La pausa congela mints y transferencias (evita fugar tokens fraudulentos antes
    // del burn); la unica operacion permitida en pausa es el emergencyBurn.
    function _update(address from, address to, uint256 value) internal override {
        if (paused() && !(to == address(0) && hasRole(EMERGENCY_ROLE, _msgSender()))) {
            revert EnforcedPause();
        }

        super._update(from, to, value);
    }
}
