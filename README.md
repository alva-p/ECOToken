# EcoToken

EcoToken es una plataforma orientada a registrar, medir y visibilizar el reciclaje realizado por organizaciones, empresas e instituciones, utilizando puntos ECO internos, rankings, certificados ambientales y una capa de trazabilidad blockchain.

## Estado del proyecto

El repositorio se encuentra en etapa de Sprint 0.  
Durante esta etapa se define la estructura inicial del monorepo, la estrategia de ramas, los acuerdos de trabajo y la preparación técnica mínima para iniciar el desarrollo en los próximos sprints.

## Estructura del monorepo

- `/contracts`: futura implementación de smart contracts con Solidity y Foundry.
- `/backend`: futura API con NestJS, Prisma y PostgreSQL.
- `/frontend`: futura interfaz web con React, Vite y Tailwind.
- `/infra`: futura configuración de Docker y scripts de despliegue.
- `.github/workflows`: configuración inicial de GitHub Actions.

## Estrategia de ramas

- `main`: rama estable.
- `develop`: rama de integración.
- `feature/*`: ramas para nuevas funcionalidades.
- `fix/*`: ramas para correcciones.
- `release/*`: ramas para preparación de entregas.
