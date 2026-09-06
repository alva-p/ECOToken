# ECOToken — Diagrama de Componentes

Vista de componentes por capas (presentación, lógica de negocio persistente y no
persistente, persistencia) y su integración on-chain en Sepolia. Modelo custodial:
el frontend nunca gestiona claves.

> Las **entidades** (Empresa, Usuario, IngresoMaterial, etc.) no se incluyen acá:
> son datos y están en el **diagrama de clases**. Este diagrama muestra solo
> componentes (gestores y servicios).

```mermaid
flowchart TB
  subgraph PRES["Capa de Presentación (SPA React + Vite)"]
    direction TB
    AuthPresWeb["AuthPresWeb"]:::pres
    EmpresaPresWeb["EmpresaPresWeb"]:::pres
    CooperativaPresWeb["CooperativaPresWeb"]:::pres
    AdminPresWeb["AdminPresWeb"]:::pres
    MunicipioPresWeb["MunicipioPresWeb"]:::pres
    ControlAcceso["ControlAccesoWeb<br/>(ProtectedRoute · AuthContext · RBAC)"]:::serv
    ClienteApi["ClienteApiWeb<br/>(REST + JWT)"]:::serv
    ClienteWs["ClienteWsWeb<br/>(WebSocket)"]:::serv
    ExploradorLinks["ExploradorLinksWeb"]:::serv
  end

  subgraph NP["Capa Lógica de Negocio Persistente (NestJS)"]
    direction TB
    GAuth["GestorAutenticacion<br/>+ EstrategiaJWT · GuardaRoles"]:::serv
    GUsu["GestorUsuarios"]:::serv
    GEmp["GestorEmpresas"]:::serv
    GCoop["GestorCooperativas"]:::serv
    GMuni["GestorMunicipalidades"]:::serv
    GIng["GestorIngresos"]:::serv
    GTok["GestorTokens"]:::serv
    GCert["GestorCertificados"]:::serv
    GRank["GestorRanking"]:::serv
  end

  subgraph NNP["Capa Lógica de Negocio No Persistente"]
    direction TB
    GRep["GeneradorReportes<br/>· GeneradorEstadisticas"]:::serv
    SBc["ServicioBlockchain<br/>(firma mint/burn)"]:::serv
    SEv["EscuchaEventos<br/>(sync on-chain → DB)"]:::serv
    SBil["ServicioBilletera<br/>(claves cifradas)"]:::serv
  end

  subgraph SPers["Administración de Persistencia"]
    Pers["Persistencia<br/>(PrismaService)"]:::serv
    DB["«dataBase» BaseDeDatos<br/>(PostgreSQL 16)"]:::ent
    Pers -->|"SQL"| DB
  end

  subgraph EXT["Nivel On-chain — Sepolia (testnet)"]
    RPC["«externo» NodoRPC<br/>(Infura / Alchemy)"]:::ext
    Contrato["«artifact» ContratoECOToken"]:::ext
    Etherscan["«externo» ExploradorEtherscan"]:::ext
    RPC --> Contrato
  end

  %% Presentación
  AuthPresWeb -.->|"IAutenticacion"| ClienteApi
  EmpresaPresWeb & CooperativaPresWeb & AdminPresWeb & MunicipioPresWeb --> ControlAcceso
  ControlAcceso --> ClienteApi
  EmpresaPresWeb --> ClienteWs
  MunicipioPresWeb --> ExploradorLinks
  ExploradorLinks -.->|"ILinksVerificacion"| Etherscan

  %% Cliente API → Gestores
  ClienteApi ==>|"IAutenticacion"| GAuth
  ClienteApi ==>|"IGestionEmpresas"| GEmp
  ClienteApi ==>|"IGestionCooperativas"| GCoop
  ClienteApi ==>|"IRegistroIngresos"| GIng
  ClienteApi ==>|"ISaldosTokens"| GTok
  ClienteApi ==>|"IConsultaCertificados"| GCert
  ClienteApi ==>|"IConsultaRanking"| GRank
  ClienteApi ==>|"IReportes"| GRep
  ClienteWs ==>|"IRankingTiempoReal"| GRank

  %% Negocio interno
  GAuth -->|"IValidacionUsuarios"| GUsu
  GEmp -->|"IValidacionUsuarios"| GAuth
  GIng -->|"IValidacionUsuarios"| GAuth
  GIng -->|"IDatosEmpresa"| GEmp
  GIng ==>|"IAcuñarTokens (mint)"| SBc
  GCert ==>|"IEmitirCertificado"| SBc
  GCert -->|"IDatosEmpresa"| GEmp
  GRank -->|"IMovimientosToken"| GTok
  GRep -->|"IConsolidadoEmpresas"| GEmp
  GRep -->|"IConsolidadoRanking"| GRank
  SBc -->|"ISincronizacionOnChain"| GTok
  SBc -->|"ISincronizacionOnChain"| GRank
  SBc -->|"IFirmaCustodial"| SBil

  %% Persistencia (colapsada)
  NP ==>|"IMaterializar / IDesmaterializar"| Pers

  %% On-chain
  SBc ==>|"IJsonRpc (ethers)"| RPC
  Contrato -.->|"IEventosContrato"| SEv

  classDef pres fill:#d6f5d6,stroke:#4a4,color:#111;
  classDef serv fill:#e9e9e9,stroke:#999,color:#111;
  classDef ent  fill:#f8d0d8,stroke:#c69,color:#111;
  classDef ext  fill:#f6c9a4,stroke:#d80,color:#111;
```
