// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title IECOToken — Interfaz pública del token ECO
/// @dev STUB inicial. Declarar aquí las funciones consumidas por el backend (mint/burn/eventos).
interface IECOToken {
    event MaterialRegistrado(
        address indexed empresa,
        address indexed cooperativa,
        string tipoMaterial,
        uint256 pesoGramos,
        uint256 tokensAcunados
    );

    // TODO(sprint): function mint(address empresa, string calldata tipoMaterial, uint256 pesoGramos) external;
    // TODO(sprint): function emergencyBurn(address from, uint256 amount) external;
}
