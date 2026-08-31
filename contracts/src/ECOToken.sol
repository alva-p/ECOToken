// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {
    UUPSUpgradeable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {
    AccessControlUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {
    ERC20CappedUpgradeable
} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import {
    PausableUpgradeable
} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {
    EIP712Upgradeable
} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ECOToken is
    Initializable,
    ERC20CappedUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    EIP712Upgradeable
{
    // Alias del DEFAULT_ADMIN_ROLE de AccessControl: un solo rol administra roles
    // (RN-18, Vault Address) y pausa (RN-19), sin duplicar jerarquia.
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // E2-HU03: EIP-712 typed data que el titular firma off-chain para autorizar
    // la quema de sus tokens (beneficios opcionales). El nonce vive en `_nonces`
    // y evita el replay de una misma firma.
    bytes32 private constant BURN_AUTHORIZATION_TYPEHASH = keccak256(
        "BurnAuthorization(address titular,uint256 amount,uint256 nonce,uint256 deadline)"
    );

    mapping(address titular => uint256 nonce) private _nonces;

    error ECOToken__ZeroAddress();
    error ECOToken__FirmaExpirada();
    error ECOToken__FirmaInvalida();

    event EmergencyBurn(address indexed target, uint256 amount, string reason);
    // peso en kg del material validado por la cooperativa; la conversion kg->tokens
    // la calcula el backend (RN-06/RN-07), aqui solo queda registrada la trazabilidad.
    event Minted(address indexed empresa, uint256 amount, string material, uint256 peso);
    event Burned(address indexed titular, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // E2-HU06: reemplaza al constructor bajo el patron UUPS; se ejecuta una unica vez
    // via delegatecall desde el proxy (ERC1967Proxy) en el deploy.
    function initialize(uint256 cap_, address admin_, address minter_) external initializer {
        if (admin_ == address(0) || minter_ == address(0)) {
            revert ECOToken__ZeroAddress();
        }

        __ERC20_init("EcoToken", "ECO");
        __ERC20Capped_init(cap_);
        __Pausable_init();
        __AccessControl_init();
        __EIP712_init("EcoToken", "1");

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

    // RN-XX: quema tokens del titular con su autorizacion firmada off-chain
    // (EIP-712), para beneficios opcionales. Restringido a BURNER_ROLE; el
    // nonce consumido evita reusar la misma firma dos veces.
    function burn(address titular, uint256 amount, uint256 deadline, bytes calldata signature)
        external
        onlyRole(BURNER_ROLE)
    {
        if (block.timestamp > deadline) {
            revert ECOToken__FirmaExpirada();
        }

        uint256 nonce = _nonces[titular]++;
        bytes32 structHash =
            keccak256(abi.encode(BURN_AUTHORIZATION_TYPEHASH, titular, amount, nonce, deadline));
        address signer = ECDSA.recover(_hashTypedDataV4(structHash), signature);
        if (signer != titular) {
            revert ECOToken__FirmaInvalida();
        }

        _burn(titular, amount);
        emit Burned(titular, amount);
    }

    /// @notice Nonce actual del titular, necesario para armar la proxima firma EIP-712.
    function nonces(address titular) external view returns (uint256) {
        return _nonces[titular];
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

    // RN-29: upgrades del proxy UUPS exclusivos del ADMIN (Vault Address).
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) { }

    // La pausa congela mints y transferencias (evita fugar tokens fraudulentos antes
    // del burn); la unica operacion permitida en pausa es el emergencyBurn.
    function _update(address from, address to, uint256 value) internal override {
        if (paused() && !(to == address(0) && hasRole(EMERGENCY_ROLE, _msgSender()))) {
            revert EnforcedPause();
        }

        super._update(from, to, value);
    }
}
