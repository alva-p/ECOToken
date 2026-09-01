# Historias de Usuario priorizadas — EcoToken

Backlog completo reformulado según el formato de User Story:
**Frase Verbal** + *Como \<rol\> yo puedo \<actividad\> de forma tal que \<valor de negocio\>* + Criterios de aceptación + Complejidad / Esfuerzo / Incertidumbre + SP.

**User Story canónica: "Visualizar ranking público" (E7-HU03, SP: 3).** Solo visualización, sin login ni validaciones; las demás historias se estiman por comparación contra ella.

---

## E1 — Foundation técnica

### E1-HU01 — Crear monorepo

**Como** equipo **yo puedo** contar con un monorepo en GitHub con la estructura definida (/contracts, /backend, /frontend, /infra) **de forma tal que** tengamos un único repositorio de trabajo.

**Criterios de aceptación:**
- Debe estar creado el repositorio en GitHub.
- Debe respetar la estructura definida en el Doc 03.
- Debe incluir un README.md raíz con instrucciones mínimas.
- Debe incluir un .gitignore por tecnología.
- Debe tener branch protection en main y develop.

**Complejidad:** Baja. Es configuración de repositorio sin lógica.
**Esfuerzo:** Bajo. Tareas de setup acotadas y conocidas.
**Incertidumbre:** Baja. La estructura ya está definida en el Doc 03.
**Prio: Alta | SP: 3**

### E1-HU02 — Inicializar Foundry

**Como** equipo **yo puedo** tener Foundry inicializado en /contracts **de forma tal que** podamos desarrollar y testear smart contracts.

**Criterios de aceptación:**
- Debe estar ejecutado forge init.
- Debe compilar correctamente.
- Debe correr el test placeholder.
- Debe tener foundry.toml con Solidity ^0.8.x.
- Debe tener OpenZeppelin instalado.

**Complejidad:** Baja. Inicialización estándar de tooling.
**Esfuerzo:** Bajo. Comandos de setup con verificación de compilación y test.
**Incertidumbre:** Baja. Herramienta conocida con pasos documentados.
**Prio: Alta | SP: 3**

### E1-HU03 — Inicializar backend

**Como** equipo **yo puedo** tener NestJS + Prisma + PostgreSQL inicializados en /backend **de forma tal que** contemos con la base del API y la persistencia.

**Criterios de aceptación:**
- Debe estar ejecutado nest new backend.
- Debe tener Prisma con Postgres local vía Docker.
- Debe correr prisma migrate.
- Debe responder 200 el endpoint GET /health.

**Complejidad:** Media. Integra tres tecnologías (NestJS, Prisma, Postgres) que deben quedar conectadas.
**Esfuerzo:** Medio. Setup más verificación de migraciones y endpoint de salud.
**Incertidumbre:** Baja. Stack estándar con documentación oficial.
**Prio: Alta | SP: 5**

### E1-HU04 — Inicializar frontend

**Como** equipo **yo puedo** tener React + Vite + Tailwind inicializados en /frontend **de forma tal que** contemos con la base de la UI.

**Criterios de aceptación:**
- Debe estar creado el proyecto con Vite + React + TS.
- Debe estar configurado Tailwind.
- Debe renderizar el layout base.
- Debe tener ESLint + Prettier configurados.

**Complejidad:** Baja. Inicialización estándar de proyecto frontend.
**Esfuerzo:** Bajo. Setup de tooling con verificación de render.
**Incertidumbre:** Baja. Stack conocido sin dudas técnicas.
**Prio: Alta | SP: 3**

### E1-HU05 — Configurar CI básico

**Como** equipo **yo puedo** contar con un CI básico en GitHub Actions que valide cada PR **de forma tal que** se eviten regresiones tempranas.

**Criterios de aceptación:**
- Debe correr el workflow en cada PR.
- Debe ejecutar lint + tests del paquete tocado.
- Debe bloquear el PR si falla.

**Complejidad:** Baja. Workflow simple de lint y tests.
**Esfuerzo:** Bajo. Configuración acotada de GitHub Actions.
**Incertidumbre:** Baja. Patrón de CI conocido.
**Prio: Alta | SP: 2**

### E1-HU06 — Crear Vault Address en Sepolia

**Como** equipo **yo puedo** contar con una Vault Address en Sepolia con saldo de faucet **de forma tal que** podamos operar como ADMIN_ROLE y financiar las cuentas operadoras.

**Criterios de aceptación:**
- Debe estar generada y resguardada la Vault Address.
- Debe tener saldo Sepolia disponible.
- Debe estar documentado el procedimiento en /contracts/README.md.

**Complejidad:** Baja. Generación y resguardo de una cuenta.
**Esfuerzo:** Bajo. Obtener fondos de faucet y documentar el procedimiento.
**Incertidumbre:** Media. La disponibilidad de faucets de Sepolia puede variar.
**Prio: Alta | SP: 3**

### E1-HU07 — Configurar Docker Compose

**Como** equipo **yo puedo** levantar Postgres + servicios locales con un comando mediante Docker Compose **de forma tal que** se acelere el onboarding.

**Criterios de aceptación:**
- Debe levantar Postgres y los servicios mínimos con docker compose up.
- Debe tener las variables documentadas en .env.example.

**Complejidad:** Baja. Composición de servicios estándar.
**Esfuerzo:** Bajo. Un archivo compose y su documentación.
**Incertidumbre:** Baja. Servicios conocidos.
**Prio: Media | SP: 3**

---

## E2 — Smart contract ECO

### E2-HU01 — Crear contrato ERC-20 base

**Como** equipo **yo puedo** contar con un contrato ERC-20 base ECOToken con AccessControl y ERC20Capped **de forma tal que** tengamos la primitiva del sistema de puntos.

**Criterios de aceptación:**
- Debe implementar el estándar ERC-20 de OZ.
- Debe heredar AccessControl y ERC20Capped.
- Debe tener el cap configurable en el constructor.
- Debe tener tests que cubran mint, balance y cap.

**Complejidad:** Media. Combina extensiones de OpenZeppelin con control de roles y límite de emisión.
**Esfuerzo:** Medio. Contrato base más su suite de tests.
**Incertidumbre:** Baja. Estándares maduros con implementación de referencia.
**Prio: Alta | SP: 5**

### E2-HU02 — Acuñar tokens

**Como** MINTER_ROLE **yo puedo** acuñar tokens hacia la dirección de una empresa adherida en función del peso de material **de forma tal que** se acredite el aporte.

**Criterios de aceptación:**
- Debe restringir mint(address, uint256) a MINTER_ROLE.
- Debe emitir Minted(empresa, amount, material, peso).
- Debe revertir si supera el cap.

**Complejidad:** Media. Función restringida por rol con evento y control de cap.
**Esfuerzo:** Medio. Implementación y tests de los casos de éxito y reversión.
**Incertidumbre:** Baja. Requerimiento claro con parámetros definidos.
**Prio: Alta | SP: 5**

### E2-HU03 — Quemar tokens con firma

**Como** BURNER_ROLE **yo puedo** ejecutar la quema de tokens de una empresa previa firma off-chain válida del titular **de forma tal que** se soporten beneficios opcionales.

**Criterios de aceptación:**
- Debe restringir burn() a BURNER_ROLE.
- Debe validar la firma EIP-712 antes de quemar.
- Debe emitir Burned.

**Complejidad:** Alta. La validación de firmas EIP-712 agrega criptografía y casos de borde (firma inválida, replay).
**Esfuerzo:** Alto. Implementación de la verificación de firma más tests exhaustivos.
**Incertidumbre:** Media. Hay dudas técnicas sobre el armado y validación del typed data EIP-712.
**Prio: Media | SP: 8**

### E2-HU04 — Pausar el contrato

**Como** ADMIN_ROLE **yo puedo** pausar y despausar el contrato **de forma tal que** podamos responder ante incidentes.

**Criterios de aceptación:**
- Debe restringir pause() y unpause() a ADMIN_ROLE.
- Debe revertir mint y burn mientras el contrato esté pausado.
- Debe emitir Paused/Unpaused.

**Complejidad:** Baja. Patrón Pausable estándar de OpenZeppelin.
**Esfuerzo:** Bajo. Herencia del patrón más tests de reversión en pausa.
**Incertidumbre:** Baja. Patrón conocido y probado.
**Prio: Alta | SP: 3**

### E2-HU05 — Quema de emergencia

**Como** EMERGENCY_ROLE **yo puedo** ejecutar emergencyBurn(address, uint256) con el contrato pausado **de forma tal que** se mitiguen tokens fraudulentos.

**Criterios de aceptación:**
- Debe estar restringido a EMERGENCY_ROLE.
- Debe revertir si el contrato no está pausado.
- Debe emitir EmergencyBurn(target, amount, reason).

**Complejidad:** Media. Función crítica con doble condición (rol + estado pausado).
**Esfuerzo:** Medio. Implementación acotada más tests de las condiciones de reversión.
**Incertidumbre:** Baja. Comportamiento especificado con precisión.
**Prio: Alta | SP: 5**

### E2-HU06 — Desplegar con patrón UUPS

**Como** equipo **yo puedo** desplegar el contrato con patrón UUPS (EIP-1822) **de forma tal que** podamos hacer upgrades sin perder estado.

**Criterios de aceptación:**
- Debe usar UUPSUpgradeable de OZ.
- Debe restringir _authorizeUpgrade a ADMIN_ROLE.
- Debe tener un test de upgrade end-to-end.

**Complejidad:** Alta. La upgradeabilidad introduce restricciones de storage layout, inicializadores y riesgos propios del patrón proxy.
**Esfuerzo:** Alto. Adaptar el contrato al patrón y probar el upgrade completo.
**Incertidumbre:** Media. Hay dudas técnicas sobre la migración del contrato existente al patrón upgradeable.
**Prio: Alta | SP: 8**

### E2-HU07 — Suite de tests y fuzzing

**Como** equipo **yo puedo** contar con una suite de tests unitarios + fuzzing en Foundry **de forma tal que** tengamos confianza en el contrato.

**Criterios de aceptación:**
- Debe alcanzar una cobertura mínima del 90% de las funciones del contrato.
- Debe incluir tests de fuzzing sobre mint, burn y pause.
- Debe ejecutar forge test en el CI.

**Complejidad:** Media. El fuzzing requiere definir propiedades e invariantes correctos.
**Esfuerzo:** Medio. Alcanzar la cobertura mínima sobre todas las funciones.
**Incertidumbre:** Baja. Foundry ya está configurado y las funciones a cubrir están definidas.
**Prio: Alta | SP: 5**

### E2-HU08 — Desplegar y verificar en Sepolia

**Como** equipo **yo puedo** tener el contrato desplegado y verificado en Sepolia (Etherscan) **de forma tal que** podamos empezar a integrarlo desde el backend.

**Criterios de aceptación:**
- Debe estar desplegado el contrato en Sepolia.
- Debe estar verificado en Etherscan.
- Debe estar documentada la dirección en /contracts/README.md.

**Complejidad:** Baja. Proceso de deploy y verificación con tooling existente.
**Esfuerzo:** Bajo. Ejecución de scripts de despliegue y documentación.
**Incertidumbre:** Baja. Procedimiento estándar sobre red de prueba.
**Prio: Alta | SP: 3**

---

## E3 — Registro de empresa adherida

### E3-HU01 — Registrar empresa

**Como** representante de empresa **yo puedo** registrarme con razón social, CUIT, domicilio, datos del representante legal y email **de forma tal que** mi empresa participe del ecosistema.

**Criterios de aceptación:**
- Debe tener un formulario con campos obligatorios.
- Debe validar formato y dígito verificador de CUIT.
- Debe ser único el email.
- Debe quedar persistido en BD.

**Complejidad:** Media. La validación de CUIT (dígito verificador) y la unicidad de email requieren coordinación entre formulario y backend.
**Esfuerzo:** Medio. Formulario completo con validaciones y persistencia.
**Incertidumbre:** Baja. Campos y validaciones definidos.
**Prio: Alta | SP: 5**

### E3-HU02 — Generar billetera custodial

**Como** sistema **yo puedo** generar automáticamente una billetera EVM custodial al registrar a una empresa **de forma tal que** la empresa no gestione claves.

**Criterios de aceptación:**
- Debe generar el par de claves.
- Debe cifrar la clave privada en BD (AES-256).
- Debe ser visible la dirección pública.
- Debe estar documentado el backup.

**Complejidad:** Alta. Manejo de claves privadas con cifrado: un error compromete los fondos y la seguridad del sistema.
**Esfuerzo:** Alto. Generación, cifrado, resguardo y procedimiento de backup.
**Incertidumbre:** Media. Hay decisiones técnicas de custodia y cifrado por cerrar.
**Prio: Alta | SP: 8**

### E3-HU03 — Aceptar términos y condiciones

**Como** representante legal **yo puedo** aceptar los T&C antes de operar **de forma tal que** quede constancia formal de mi aceptación.

**Criterios de aceptación:**
- Debe tener un checkbox obligatorio.
- Debe persistirse con timestamp y versión del T&C.
- Debe tener trazabilidad en BD.

**Complejidad:** Baja. Un control obligatorio con persistencia simple.
**Esfuerzo:** Bajo. Se integra al flujo de registro existente.
**Incertidumbre:** Baja. Requerimiento claro.
**Prio: Alta | SP: 2**

### E3-HU04 — Gestionar empresas adheridas

**Como** administrador **yo puedo** consultar, aprobar, editar y dar de baja empresas adheridas **de forma tal que** mantenga actualizado y seguro el padrón de participantes.

**Criterios de aceptación:**
- Debe quedar en estado pendiente tras el alta.
- Debe listar todas las empresas y mostrar su estado y actividad en el panel admin.
- El listado debe poder buscarse por razón social, CUIT o email.
- Debe permitir aprobar/rechazar.
- Debe permitir editar razón social, CUIT, email, domicilio y representante legal.
- La baja debe ser lógica, conservar el historial y desactivar el acceso del usuario.
- Debe poder operar solo si está aprobada y activa.

**Complejidad:** Media. Flujo de estados que condiciona la operación del resto del sistema.
**Esfuerzo:** Medio. Listado en panel admin con acciones y cambio de estado.
**Incertidumbre:** Baja. Estados y acciones definidos.
**Prio: Media | SP: 3**

---

## E4 — Registro y operación de cooperativa

### E4-HU01 — Gestionar cooperativas

**Como** administrador **yo puedo** dar de alta, consultar, editar y dar de baja una cooperativa **de forma tal que** controle qué entidades están autorizadas a validar ingresos.

**Criterios de aceptación:**
- Debe tener un formulario de alta de cooperativa.
- Debe generar el sistema la cuenta operadora y otorgar VALIDATOR_ROLE on-chain.
- Debe quedar activa y aparecer en el listado del panel.
- El listado debe poder buscarse por razón social, CUIT o email.
- Debe permitir editar razón social, CUIT, email, domicilio y representante legal.
- La baja debe revocar VALIDATOR_ROLE antes de desactivar la cooperativa; si la transacción falla, debe continuar activa.
- La baja debe conservar su historial y desactivar el acceso del usuario.

**Complejidad:** Media. El alta combina persistencia off-chain con una transacción on-chain de otorgamiento de rol.
**Esfuerzo:** Medio. Formulario más generación de cuenta y grant on-chain.
**Incertidumbre:** Media. Hay dudas técnicas sobre el manejo de fallos de la transacción on-chain durante el alta.
**Prio: Alta | SP: 5**

### E4-HU02 — Iniciar sesión como cooperativa

**Como** cooperativa **yo puedo** ingresar a un panel propio con credenciales **de forma tal que** pueda registrar ingresos de material.

**Criterios de aceptación:**
- Debe tener login con email + contraseña.
- Debe manejar la sesión con JWT.
- Debe permitir acceso solo a su propia operación.

**Complejidad:** Baja. Autenticación estándar con control de acceso por rol.
**Esfuerzo:** Bajo. Flujo de login conocido.
**Incertidumbre:** Baja. Sin dudas técnicas.
**Prio: Alta | SP: 3**

### E4-HU03 — Buscar empresa adherida

**Como** cooperativa **yo puedo** buscar una empresa adherida por razón social o CUIT **de forma tal que** pueda asociarle un ingreso.

**Criterios de aceptación:**
- Debe tener un buscador con autocompletado.
- Debe listar solo empresas aprobadas.

**Complejidad:** Media. Búsqueda en tiempo real filtrando por estado de aprobación.
**Esfuerzo:** Bajo. Componente acotado sobre un endpoint de búsqueda.
**Incertidumbre:** Baja. Patrón de autocompletado conocido.
**Prio: Alta | SP: 3**

---

## E5 — Captura de material y emisión de tokens

### E5-HU01 — Registrar ingreso de material

**Como** cooperativa **yo puedo** registrar un ingreso de material con empresa, tipo, peso y fecha **de forma tal que** se acuñen los tokens correspondientes.

**Criterios de aceptación:**
- Debe tener el formulario en el panel de cooperativa.
- Debe validar el backend que el VALIDATOR_ROLE esté activo.
- Debe persistir el ingreso off-chain.
- Debe disparar el mint on-chain.

**Complejidad:** Alta. Es el flujo central: atraviesa formulario, validación de rol, persistencia y transacción on-chain.
**Esfuerzo:** Alto. Coordina frontend, backend y contrato con manejo de fallos.
**Incertidumbre:** Media. Hay dudas sobre los tiempos de confirmación del mint y su reflejo en el sistema.
**Prio: Alta | SP: 8**

### E5-HU02 — Calcular tokens por conversión

**Como** sistema **yo puedo** calcular tokens usando una tabla de conversión peso → tokens configurable por tipo de material **de forma tal que** la acuñación responda a reglas ajustables.

**Criterios de aceptación:**
- Debe existir la tabla en BD con (tipo, factor).
- Debe ser editable solo por ADMIN_ROLE.
- Debe calcular tokens = peso × factor.
- Debe mantener un historial versionado.

**Complejidad:** Media. Cálculo simple pero con versionado histórico y control de permisos.
**Esfuerzo:** Medio. Modelo de datos, edición restringida e historial.
**Incertidumbre:** Baja. Regla de cálculo definida con precisión.
**Prio: Alta | SP: 3**

### E5-HU03 — Recibir comprobante de aporte

**Como** empresa **yo puedo** recibir un comprobante digital por cada aporte con fecha, cooperativa, material, peso y tokens **de forma tal que** tenga respaldo de cada contribución.

**Criterios de aceptación:**
- Debe generarse el comprobante al confirmar el ingreso.
- Debe ser visible en el panel de empresa.
- Debe incluir el link al tx hash del mint on-chain.

**Complejidad:** Baja. Vista de detalle con datos ya persistidos y un enlace externo.
**Esfuerzo:** Bajo. Generación y visualización del comprobante.
**Incertidumbre:** Baja. Los datos existen al momento de generar el comprobante.
**Prio: Alta | SP: 3**

### E5-HU04 — Sincronizar eventos Minted

**Como** sistema **yo puedo** escuchar eventos Minted del contrato y sincronizarlos en PostgreSQL **de forma tal que** se mantenga la consistencia entre on-chain y off-chain.

**Criterios de aceptación:**
- Debe estar corriendo el listener.
- Debe reintentar ante caída del RPC.
- Debe ser idempotente: no duplicar si el evento llega dos veces.

**Complejidad:** Alta. Proceso de sincronización con reintentos e idempotencia ante fallos de red.
**Esfuerzo:** Medio. Listener más lógica de reintento y deduplicación.
**Incertidumbre:** Media. El comportamiento del RPC ante caídas introduce casos difíciles de reproducir.
**Prio: Alta | SP: 5**

---

## E6 — Dashboard de empresa

### E6-HU01 — Ver saldo de tokens

**Como** empresa **yo puedo** ver mi saldo actual de tokens ECO **de forma tal que** conozca mi reputación acumulada.

**Criterios de aceptación:**
- Debe mostrar el saldo total en la vista principal.
- Debe actualizarse en cuasi tiempo real (WebSocket o polling 30s).

**Complejidad:** Media. La actualización en cuasi tiempo real requiere conexión persistente o consultas periódicas.
**Esfuerzo:** Bajo. Una vista de saldo sobre el panel existente.
**Incertidumbre:** Media. Falta decidir el mecanismo (WebSocket o polling).
**Prio: Alta | SP: 3**

### E6-HU02 — Ver historial de aportes

**Como** empresa **yo puedo** ver el historial cronológico de mis aportes (cooperativa, material, peso, tokens) **de forma tal que** pueda realizar auditoría interna.

**Criterios de aceptación:**
- Debe mostrar una tabla paginada.
- Debe permitir filtros por fecha y tipo.
- Debe ser exportable a CSV.

**Complejidad:** Baja. Tabla con filtros y exportación estándar.
**Esfuerzo:** Medio. Paginación, filtros combinados y exportación.
**Incertidumbre:** Baja. Patrones conocidos.
**Prio: Media | SP: 3**

### E6-HU03 — Ver posición en el ranking

**Como** empresa **yo puedo** ver mi posición en el ranking del mes en curso y los anteriores **de forma tal que** conozca mi desempeño.

**Criterios de aceptación:**
- Debe mostrar la vista de ranking con la posición propia destacada.
- Debe incluir el histórico de los últimos 6 meses.

**Complejidad:** Media. Combina el mes en curso con el histórico cerrado.
**Esfuerzo:** Medio. Vista con navegación por meses.
**Incertidumbre:** Media. Depende de la disponibilidad del cálculo de ranking (E7) vía API.
**Prio: Alta | SP: 5**

### E6-HU04 — Descargar certificados mensuales

**Como** empresa **yo puedo** descargar mis certificados mensuales emitidos **de forma tal que** los use en RSE, licitaciones y comunicación.

**Criterios de aceptación:**
- Debe listar los certificados con fecha y posición.
- Debe permitir la descarga en PDF + link verificable público.

**Complejidad:** Media. Integra descarga de PDF y enlace público de verificación.
**Esfuerzo:** Medio. Listado más integración con el servicio de certificados.
**Incertidumbre:** Media. Depende de la emisión de certificados (E8).
**Prio: Alta | SP: 5**

---

## E7 — Ranking mensual

### E7-HU01 — Calcular ranking del mes

**Como** sistema **yo puedo** calcular el ranking del mes en curso ordenando empresas por tokens acuñados durante el mes **de forma tal que** el desempeño esté disponible para consulta.

**Criterios de aceptación:**
- Debe consultar el job los eventos Minted del mes y sumar por empresa.
- Debe estar disponible el resultado vía API.

**Complejidad:** Media. Agregación sobre eventos on-chain con exposición vía API.
**Esfuerzo:** Medio. Job de cálculo más endpoint de consulta.
**Incertidumbre:** Baja. La fuente de datos (eventos Minted) ya está sincronizada.
**Prio: Alta | SP: 5**

### E7-HU02 — Cerrar ranking mensual

**Como** sistema **yo puedo** cerrar el ranking al final de cada mes y registrar un snapshot auditable **de forma tal que** el resultado quede inmutable y verificable.

**Criterios de aceptación:**
- Debe generar el job mensual un snapshot con hash y bloque de referencia.
- Debe persistirse en BD y opcionalmente on-chain.

**Complejidad:** Alta. El snapshot auditable con hash y bloque de referencia exige garantías de consistencia e inmutabilidad.
**Esfuerzo:** Alto. Job programado, generación del snapshot y su persistencia.
**Incertidumbre:** Media. La persistencia on-chain opcional está abierta a definición.
**Prio: Alta | SP: 8**

### E7-HU03 — Visualizar ranking público *(User Story canónica)*

**Como** usuario público **yo puedo** ver el ranking mensual cerrado de los últimos meses **de forma tal que** conozca las empresas reconocidas.

**Criterios de aceptación:**
- Debe ser una página pública con tabla de ranking por mes.
- Debe accederse sin login.

**Complejidad:** Baja. Solo visualización de datos cerrados, sin sesión ni validaciones.
**Esfuerzo:** Bajo. Una página con una tabla por mes.
**Incertidumbre:** Baja. Los datos provienen de snapshots ya cerrados.
**Prio: Media | SP: 3**

---

## E8 — Certificado digital mensual

### E8-HU01 — Emitir certificados Top X

**Como** sistema **yo puedo** emitir un certificado digital a las empresas Top X del ranking del mes cerrado **de forma tal que** se reconozca formalmente su esfuerzo.

**Criterios de aceptación:**
- Debe identificar el Top X al cierre del mes (X configurable).
- Debe generar una credencial verificable firmada.
- Debe emitir un evento on-chain.

**Complejidad:** Alta. Combina cierre de ranking, firma de credenciales verificables y emisión on-chain.
**Esfuerzo:** Alto. Proceso automático con generación y firma de credenciales.
**Incertidumbre:** Media. El formato de la credencial verificable firmada está por definir.
**Prio: Alta | SP: 8**

### E8-HU02 — Visualizar y descargar certificado

**Como** empresa **yo puedo** visualizar y descargar mi certificado mensual como PDF **de forma tal que** lo use en comunicación.

**Criterios de aceptación:**
- Debe generar un PDF con datos de empresa, mes, posición, hash de verificación y QR.

**Complejidad:** Media. La generación del PDF con QR y hash requiere fidelidad de diseño.
**Esfuerzo:** Medio. Vista y generación del documento.
**Incertidumbre:** Media. Falta definir el diseño final del certificado.
**Prio: Alta | SP: 5**

### E8-HU03 — Verificar certificado

**Como** verificador externo **yo puedo** validar la autenticidad de un certificado por QR o hash **de forma tal que** confirme que es real.

**Criterios de aceptación:**
- Debe devolver datos y estado el endpoint público /verify/:hash.
- Debe existir una página pública de validación.

**Complejidad:** Media. Debe cubrir los caminos de entrada (QR y hash manual) y los casos de hash inválido.
**Esfuerzo:** Bajo. Endpoint de consulta más página pública.
**Incertidumbre:** Baja. El contrato de verificación es simple: hash → datos y estado.
**Prio: Alta | SP: 5**

---

## E9 — Reportes para municipalidad

### E9-HU01 — Iniciar sesión como autoridad municipal

**Como** autoridad municipal **yo puedo** acceder con credenciales propias **de forma tal que** consulte reportes consolidados.

**Criterios de aceptación:**
- Debe tener login específico del rol municipal.
- Debe restringir el acceso a reportes (sin operación).

**Complejidad:** Baja. Login estándar con restricción por rol.
**Esfuerzo:** Bajo. Reutiliza la autenticación existente.
**Incertidumbre:** Baja. Sin dudas técnicas.
**Prio: Media | SP: 3**

### E9-HU02 — Consultar volumen reciclado

**Como** autoridad municipal **yo puedo** ver el volumen reciclado por canal empresarial en un período **de forma tal que** evalúe el impacto.

**Criterios de aceptación:**
- Debe permitir filtros por período (mes/trimestre/año).
- Debe mostrar tabla y gráfico.
- Debe ser exportable a PDF/CSV.

**Complejidad:** Media. Combina filtros de período, visualización gráfica y exportación en dos formatos.
**Esfuerzo:** Medio. Vista de reportes con gráfico y exportaciones.
**Incertidumbre:** Baja. Los datos provienen de agregaciones definidas.
**Prio: Media | SP: 5**

### E9-HU03 — Ver empresas reconocidas

**Como** autoridad municipal **yo puedo** ver el listado de empresas reconocidas por mes con sus certificados **de forma tal que** las acompañe institucionalmente.

**Criterios de aceptación:**
- Debe mostrar una tabla por mes con el Top X y links a la verificación pública.

**Complejidad:** Baja. Visualización de datos cerrados con enlaces.
**Esfuerzo:** Bajo. Una tabla con selector de mes.
**Incertidumbre:** Baja. Comparable a la User canónica, con login de por medio.
**Prio: Media | SP: 3**

---

## E10 — Administración y gobernanza

### E10-HU01 — Gestionar roles del contrato

**Como** ADMIN_ROLE **yo puedo** otorgar y revocar roles (MINTER, BURNER, VALIDATOR, EMERGENCY) desde un panel de admin **de forma tal que** gobierne el contrato sin herramientas técnicas.

**Criterios de aceptación:**
- Debe listar el panel las cuentas y su rol.
- Debe invocar los botones la función on-chain.
- Debe pedir confirmación por modal.

**Complejidad:** Alta. Cada acción es una transacción on-chain irreversible que la interfaz debe presentar sin ambigüedad.
**Esfuerzo:** Medio. Listado, acciones con confirmación y estados de transacción.
**Incertidumbre:** Media. Hay dudas sobre el manejo de errores de red y la firma de las transacciones del administrador.
**Prio: Media | SP: 5**

### E10-HU02 — Pausar contrato con motivo

**Como** ADMIN_ROLE **yo puedo** pausar y despausar el contrato desde el panel de admin con un motivo registrado **de forma tal que** gestione incidentes con trazabilidad.

**Criterios de aceptación:**
- Debe ser visible el botón solo para el admin.
- Debe solicitar un motivo (texto).
- Debe persistirse off-chain con timestamp.

**Complejidad:** Media. Acción crítica on-chain con registro off-chain asociado.
**Esfuerzo:** Bajo. Un botón con modal y persistencia del motivo.
**Incertidumbre:** Baja. La función del contrato ya existe y el flujo es acotado.
**Prio: Media | SP: 3**

---

## E11 — Calidad y entrega

### E11-HU01 — Tests end-to-end en CI

**Como** equipo **yo puedo** contar con tests de integración end-to-end (registro empresa → ingreso material → mint → ver saldo) ejecutándose en CI **de forma tal que** el flujo completo quede validado en cada cambio.

**Criterios de aceptación:**
- Debe existir la suite e2e con Playwright + ambiente Docker.
- Debe correr el CI la suite en cada PR a develop.

**Complejidad:** Alta. El flujo atraviesa frontend, backend, base de datos y contrato en un ambiente reproducible.
**Esfuerzo:** Alto. Montar el ambiente Docker de e2e y la suite completa en CI.
**Incertidumbre:** Media. La estabilidad del ambiente e2e con componente on-chain puede traer flakiness.
**Prio: Media | SP: 8**

### E11-HU02 — Documentar despliegue

**Como** equipo **yo puedo** contar con documentación de despliegue del backend, frontend y contratos **de forma tal que** se puedan replicar ambientes.

**Criterios de aceptación:**
- Debe existir /infra/README.md con los pasos completos.
- Debe estar probado por al menos otro integrante distinto al autor.

**Complejidad:** Baja. Documentación de procedimientos existentes.
**Esfuerzo:** Bajo. Redacción y validación cruzada por otro integrante.
**Incertidumbre:** Baja. Los pasos ya se ejecutaron durante el desarrollo.
**Prio: Media | SP: 3**

---

*Criterios de aceptación redactados en formato "Debe...", manteniendo el contenido del backlog original sin agregados. SP = puntos originales.*
