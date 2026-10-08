# Changelog

Todos los cambios notables del proyecto se documentan en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/);
el proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added
- Ranking público completo (tendencia, certificados, estadísticas, perfil del líder) y "Tu posición" en el panel de empresa; frontend responsive.
- Reporte mensual de actividad en PDF (congelado al cierre junto al certificado), sección "Certificados y Reportes" y aportes que respaldan cada certificado en la verificación pública.
- Acuñación en segundo plano con cola de envíos del MINTER; links a transacciones que abren la pestaña Logs de Etherscan.
- Cambio de contraseña obligatorio con la clave temporal; buscador de empresas tolerante (acentos, nombre, CUIT con o sin guiones); empresas pendientes primero en el panel de admin.
- Backend de `develop` 24/7 en el homelab (`infra/deploy/homelab`) y sincronización automática `develop` → `main` (`.github/workflows/sync-main.yml`).
- Scripts para acuñar en Sepolia los aportes sin transacción real y para cargar aportes reales entre empresas y cooperativas.
- Estructura inicial del monorepo (contracts / backend / frontend / infra) — Sprint 0.
- Documentación técnica de estructura y estándares (`doc/ESTRUCTURA-PROYECTO.md`).
- Archivos base de cada paquete: README, configuración, `.env.example` y stubs.
