# ECOToken — Diagrama de Despliegue

Distribución física del sistema: cliente web, hosting estático del frontend
(Vercel/CDN), servidor de aplicaciones (Render, NestJS), base de datos gestionada
(PostgreSQL) y la capa on-chain en la red Ethereum Sepolia (testnet).

```mermaid
flowchart TB

  subgraph CLIENTE["«device» Cliente Web"]
    Explorador["«externo» Explorador (Navegador)"]:::ext
    SPA["«artifact» SPA React (bundle Vite)<br/>Capa de Presentación"]:::pres
  end

  subgraph VERCEL["Servidor de Presentación — Vercel (CDN)"]
    HostingEstatico["«subsystem» Capa de Presentación<br/>(frontend/dist servido como estático)"]:::pres
  end

  subgraph RENDER["Servidor de Aplicaciones — Render"]
    direction TB
    WebServer["«externo» Runtime Node.js 22 (NestJS · REST + WebSocket)"]:::serv
    SAuth["«subsystem» Autenticación y Autorización"]:::serv
    SNegP["«subsystem» CapaLogicaNegocioPersistente<br/>Empresas · Cooperativas · Municipalidades · Ingresos ·<br/>Tokens · Certificados · Ranking · Usuarios"]:::serv
    SNegNP["«subsystem» CapaLogicaNegocioNoPersistente<br/>Reportes · Integración Blockchain / Custodia"]:::serv
    Persistencia["Persistencia (PrismaService)"]:::serv
  end

  subgraph DBHOST["Servidor de Base de Datos — PostgreSQL gestionado / VPS"]
    BaseDeDatos["«dataBase» BaseDeDatos (PostgreSQL 16)<br/>«artifact» esquema Prisma (migrations)"]:::ent
  end

  subgraph SEPOLIA["«externo» Red Ethereum Sepolia (testnet)"]
    NodoRPC["«externo» Nodo RPC (Infura / Alchemy)"]:::ext
    ContratoECO["«artifact» ContratoECOToken desplegado<br/>0xa649Fe3F…52765"]:::ext
    Etherscan["«externo» Explorador Etherscan"]:::ext
    NodoRPC --> ContratoECO
  end

  Explorador -->|"descarga del SPA"| HostingEstatico
  SPA -->|"IAutenticacion · IGestion* (REST)"| WebServer
  SPA -->|"IRankingTiempoReal (WebSocket)"| WebServer
  SPA -.->|"ILinksVerificacion"| Etherscan
  WebServer --- SAuth
  WebServer --- SNegP
  WebServer --- SNegNP
  SNegP -->|"IMaterializar / IDesmaterializar"| Persistencia
  Persistencia -->|"SQL"| BaseDeDatos
  SNegNP -->|"IJsonRpc (ethers)"| NodoRPC
  ContratoECO -.->|"IEventosContrato"| SNegNP

  classDef pres fill:#d6f5d6,stroke:#4a4,color:#111;
  classDef serv fill:#e9e9e9,stroke:#999,color:#111;
  classDef ent  fill:#f8d0d8,stroke:#c69,color:#111;
  classDef ext  fill:#f6c9a4,stroke:#d80,color:#111;
```
