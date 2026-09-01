# Historias de Usuario — Frontend EcoToken (Sprint 3 en adelante)

Reformulación de las HUs con trabajo de frontend según el formato de User Story:
**Frase Verbal** + *Como \<rol\> yo puedo \<actividad\> de forma tal que \<valor de negocio\>* + Criterios de aceptación + Complejidad / Esfuerzo / Incertidumbre + SP.

**User Story canónica: "Visualizar ranking público" (E7-HU03).** Se toma como referencia de estimación (SP: 3) porque es solo visualización: no requiere login, validaciones ni interacción con el contrato. Las demás historias se estiman por comparación contra ella.

---

## HU habilitadora

### E11-HU03 — Activar base del frontend

**Como** equipo de desarrollo **yo puedo** activar la base funcional del frontend (rutas por rol, layouts por actor, autenticación conectada y componentes de interfaz comunes) **de forma tal que** las pantallas de cada panel se construyan sobre una base común y las HUs de interfaz se estimen solo por su contenido.

**Criterios de aceptación:**
- Cada actor (empresa, cooperativa, municipalidad, administrador) accede únicamente a su propia sección; un usuario sin sesión o con otro rol es redirigido.
- Existen las secciones públicas de ranking y de verificación de certificados, accesibles sin login.
- Cada panel tiene un layout propio con encabezado, navegación y cierre de sesión, tomando como referencia visual los prototipos.
- La sesión iniciada persiste al recargar la página y expira de forma controlada.
- Los componentes comunes (botón, campo con error, tabla, modal de confirmación, tarjeta, estados de carga/vacío) se reutilizan en al menos dos pantallas.
- Cada panel muestra una página inicial navegable que sirve de demo para la ronda de feedback con los actores.

**Complejidad:** Media. No hay lógica de negocio, pero define la navegación por rol y el manejo de sesión que condiciona a todas las demás historias.
**Esfuerzo:** Medio. El esqueleto del proyecto ya existe; el trabajo es conectar autenticación, rutas y layouts.
**Incertidumbre:** Baja. Los requerimientos son claros y la estructura ya está definida en el repositorio.
**SP: 5**

### E11-HU04 — Publicar landing page pública

**Como** equipo de desarrollo **yo puedo** publicar la landing page pública de EcoToken (propuesta de valor, cómo funciona el sistema, acceso al ranking y llamado a iniciar sesión) **de forma tal que** el proyecto tenga una puerta de entrada visible y demostrable a los actores antes de tener todos los paneles terminados.

**Criterios de aceptación:**
- La página es accesible en la raíz del dominio, sin login.
- Comunica la propuesta de valor y cómo funciona el sistema (secciones de contenido, sin datos dinámicos).
- Tiene un acceso a "Iniciar sesión" visible en el encabezado y un llamado a la acción equivalente al final de la página, ambos hacia `/login`.
- Incluye una vista previa del ranking (resumen + podio top 3) con datos de ejemplo, reutilizando el diseño del mockup de referencia (`ranking-landing.jsx`), construida como componente reutilizable para que E7-HU03 la conecte a datos reales sin reconstruirla.
- Enlaza a la sección pública de ranking completo (E7-HU03).
- Es usable desde dispositivos móviles y de escritorio.

**Complejidad:** Baja. Es una página de contenido estático, sin lógica de negocio ni datos dinámicos.
**Esfuerzo:** Bajo. Una página con secciones de contenido y dos enlaces.
**Incertidumbre:** Media. Falta definir el diseño visual y el copy final con el equipo.
**SP: 3**

---

## E3 — Registro de empresa adherida

### E3-HU01 — Registrar empresa

**Como** representante de empresa **yo puedo** completar un formulario web de registro con razón social, CUIT, domicilio, datos del representante legal y email **de forma tal que** mi empresa solicite su participación en el ecosistema.

**Criterios de aceptación:**
- El formulario es de acceso público y todos los campos son obligatorios.
- El CUIT se valida en formato y dígito verificador antes de enviar; el email se valida en formato.
- Cada campo con error muestra su mensaje junto al campo; no se puede enviar el formulario con errores.
- Si el email ya está registrado, se informa con un mensaje claro.
- Al enviar se muestra el estado del proceso (enviando, éxito, error).
- Los datos quedan persistidos y al confirmar se informa que el registro queda pendiente de aprobación.

**Complejidad:** Media. Las validaciones de CUIT (dígito verificador) y unicidad de email requieren coordinación con el backend.
**Esfuerzo:** Alto. Es una pantalla nueva sin prototipo: hay que diseñarla, además de desarrollar el formulario completo con sus validaciones y estados.
**Incertidumbre:** Media. Falta definir el diseño visual y el detalle del flujo posterior al registro.
**SP: 8**

### E3-HU03 — Aceptar términos y condiciones

**Como** representante legal **yo puedo** leer y aceptar los términos y condiciones dentro del flujo de registro **de forma tal que** quede constancia formal de mi aceptación antes de operar.

**Criterios de aceptación:**
- El registro no puede enviarse sin marcar la aceptación de T&C.
- El texto de los T&C es accesible desde el mismo flujo y muestra su versión.
- La aceptación queda persistida con fecha/hora y versión del documento aceptado.

**Complejidad:** Baja. Es un control dentro de un formulario existente con persistencia simple.
**Esfuerzo:** Bajo. Se apoya en la pantalla de registro ya desarrollada.
**Incertidumbre:** Baja. El requerimiento es claro y no tiene dudas técnicas.
**SP: 2**

### E3-HU04 — Gestionar empresas adheridas

**Como** administrador **yo puedo** consultar, aprobar, editar y dar de baja empresas adheridas desde mi panel **de forma tal que** mantenga actualizado y seguro el padrón de participantes.

**Criterios de aceptación:**
- El panel de administración lista todas las empresas con sus datos principales, estado y actividad.
- El listado se puede buscar por razón social, CUIT o email.
- Las acciones de aprobar y rechazar requieren confirmación y muestran el resultado de la operación.
- Se pueden editar razón social, CUIT, email, domicilio y representante legal con las mismas validaciones de alta.
- La baja requiere confirmación, conserva el historial y desactiva el acceso del usuario.
- Una empresa solo puede operar en el sistema si fue aprobada y está activa.

**Complejidad:** Media. Incluye la primera pantalla del panel de administración y el cambio de estado con sus efectos sobre el resto del sistema.
**Esfuerzo:** Medio. Tabla, acciones con confirmación y conexión con el backend; sin prototipo previo.
**Incertidumbre:** Media. No hay prototipo del panel admin y falta definir si el rechazo notifica a la empresa.
**SP: 5**

---

## E4 — Registro y operación de cooperativa

### E4-HU01 — Gestionar cooperativas

**Como** administrador **yo puedo** dar de alta, consultar, editar y dar de baja una cooperativa desde mi panel **de forma tal que** controle qué entidades están autorizadas a validar ingresos de material.

**Criterios de aceptación:**
- El formulario de alta valida los campos antes de enviar.
- Durante el alta se muestra el progreso de la operación (creación de cuenta y otorgamiento del rol en el contrato); si falla, el error es visible y la operación puede reintentarse.
- La cooperativa queda activa y aparece en el listado del panel.
- El listado se puede buscar por razón social, CUIT o email.
- Se pueden editar razón social, CUIT, email, domicilio y representante legal.
- La baja requiere confirmación y revoca VALIDATOR_ROLE antes de desactivar la cooperativa.
- Si la revocación on-chain falla, la cooperativa continúa activa; su historial siempre se conserva.

**Complejidad:** Media. La pantalla es un formulario simple, pero el flujo involucra una transacción on-chain cuyo resultado hay que reflejar en la interfaz.
**Esfuerzo:** Medio. Formulario más manejo de estados de la transacción.
**Incertidumbre:** Media. Hay dudas técnicas sobre cómo informar el progreso y los fallos de la transacción on-chain.
**SP: 5**

### E4-HU02 — Iniciar sesión como cooperativa

**Como** cooperativa **yo puedo** iniciar sesión con email y contraseña en un panel propio **de forma tal que** acceda de forma segura a registrar mis ingresos de material.

**Criterios de aceptación:**
- La pantalla de login valida los campos y ante credenciales inválidas muestra un error genérico (sin revelar qué campo falló).
- Con la sesión iniciada se accede solo a la operación propia; las rutas del panel no son accesibles sin sesión.
- Existe una opción visible de cerrar sesión.

**Complejidad:** Baja. Reutiliza la autenticación y las rutas protegidas de la HU habilitadora.
**Esfuerzo:** Bajo. Una pantalla con dos campos y estados de error.
**Incertidumbre:** Baja. Flujo estándar de login sin dudas técnicas.
**SP: 3**

### E4-HU03 — Buscar empresa adherida

**Como** cooperativa **yo puedo** buscar una empresa adherida por razón social o CUIT con autocompletado **de forma tal que** asocie correctamente cada ingreso de material a la empresa que corresponde.

**Criterios de aceptación:**
- El buscador sugiere resultados a medida que se escribe (a partir de un mínimo de caracteres).
- Solo aparecen empresas aprobadas.
- Si no hay coincidencias se informa claramente.
- Al seleccionar un resultado, la empresa queda asociada al formulario de ingreso.

**Complejidad:** Media. Requiere búsqueda en tiempo real contra el backend y manejo de la selección.
**Esfuerzo:** Bajo. Es un componente acotado que se integra al formulario de ingreso.
**Incertidumbre:** Baja. Patrón conocido de autocompletado.
**SP: 3**

---

## E5 — Captura de material y emisión de tokens

### E5-HU01 — Registrar ingreso de material

**Como** cooperativa **yo puedo** registrar un ingreso de material indicando empresa, tipo, peso y fecha desde mi panel **de forma tal que** se acuñen automáticamente los tokens que le corresponden a la empresa.

**Criterios de aceptación:**
- El formulario usa el buscador de empresas y valida tipo, peso y fecha antes de enviar.
- Antes de confirmar se muestra un resumen con los tokens estimados a acuñar.
- El registro muestra su estado: pendiente de acuñación, confirmado o con error.
- Solo una cooperativa con rol validador activo puede registrar ingresos.
- El ingreso queda persistido y dispara la acuñación en el contrato.

**Complejidad:** Alta. Combina validaciones, cálculo estimado, estados asincrónicos de la transacción on-chain y control de rol.
**Esfuerzo:** Alto. Es el flujo central del sistema y atraviesa frontend, backend y contrato.
**Incertidumbre:** Media. El contrato ya existe, pero hay dudas sobre los tiempos de confirmación y cómo reflejarlos en la interfaz.
**SP: 8**

### E5-HU02 — Configurar tabla de conversión

**Como** administrador **yo puedo** ver y editar la tabla de conversión peso → tokens por tipo de material desde mi panel **de forma tal que** el cálculo de tokens sea configurable sin intervención técnica.

**Criterios de aceptación:**
- El panel muestra el listado de tipos de material con su factor vigente.
- La edición de un factor requiere confirmación.
- Solo el administrador puede ver y editar esta configuración.
- Se puede consultar el historial de cambios de cada factor.

**Complejidad:** Media. Edición con versionado histórico y control de permisos.
**Esfuerzo:** Medio. Vista de administración con listado, edición e historial.
**Incertidumbre:** Baja. Requerimiento claro con reglas simples.
**SP: 5**

### E5-HU03 — Ver comprobante de aporte

**Como** empresa **yo puedo** visualizar un comprobante digital por cada aporte con fecha, cooperativa, material, peso y tokens **de forma tal que** tenga respaldo verificable de cada contribución.

**Criterios de aceptación:**
- El comprobante se genera al confirmarse el ingreso y es accesible desde el historial del panel de empresa.
- El detalle muestra todos los datos del aporte.
- Incluye un enlace a la transacción de acuñación en el explorador de la red.

**Complejidad:** Baja. Es una vista de detalle con datos ya persistidos.
**Esfuerzo:** Bajo. Pantalla de solo lectura con un enlace externo.
**Incertidumbre:** Baja. Los datos ya existen al momento de mostrar el comprobante.
**SP: 3**

---

## E6 — Dashboard de empresa

### E6-HU01 — Ver saldo de tokens

**Como** empresa **yo puedo** ver mi saldo actual de tokens ECO en la vista principal de mi panel **de forma tal que** conozca mi reputación acumulada en todo momento.

**Criterios de aceptación:**
- La vista principal muestra el saldo total de forma destacada.
- El saldo se actualiza en cuasi tiempo real sin recargar la página.
- Se muestran estados de carga y de error de conexión.

**Complejidad:** Media. La actualización en cuasi tiempo real requiere una conexión persistente o consultas periódicas.
**Esfuerzo:** Bajo. Una tarjeta de saldo sobre el layout ya existente.
**Incertidumbre:** Media. Falta decidir el mecanismo de actualización (WebSocket o polling).
**SP: 3**

### E6-HU02 — Ver historial de aportes

**Como** empresa **yo puedo** consultar el historial cronológico de mis aportes con cooperativa, material, peso y tokens **de forma tal que** pueda realizar auditoría interna de mi actividad.

**Criterios de aceptación:**
- La tabla es paginada y permite filtrar por rango de fechas y tipo de material.
- El historial puede exportarse a CSV.
- Si no hay aportes se muestra un estado vacío claro.

**Complejidad:** Baja. Tabla con filtros y exportación estándar.
**Esfuerzo:** Medio. Paginación, filtros combinados y exportación suman trabajo de detalle.
**Incertidumbre:** Baja. Requerimiento claro con patrones conocidos.
**SP: 3**

### E6-HU03 — Ver posición en el ranking

**Como** empresa **yo puedo** ver mi posición en el ranking del mes en curso y de los meses anteriores **de forma tal que** conozca mi desempeño frente a las demás empresas.

**Criterios de aceptación:**
- El ranking destaca visualmente la fila de la empresa que consulta.
- Se puede navegar el histórico de los últimos 6 meses.
- Si el ranking del mes aún no cerró, se indica que es provisorio.

**Complejidad:** Media. Combina datos del mes en curso (provisorios) con snapshots cerrados.
**Esfuerzo:** Medio. Vista con selector de mes y estados diferenciados.
**Incertidumbre:** Media. Depende de que el cálculo y cierre de ranking (E7) estén disponibles vía API.
**SP: 5**

### E6-HU04 — Descargar certificados mensuales

**Como** empresa **yo puedo** ver el listado de mis certificados mensuales y descargarlos **de forma tal que** los use en RSE, licitaciones y comunicación institucional.

**Criterios de aceptación:**
- El listado muestra cada certificado con su mes y la posición obtenida.
- Cada certificado puede descargarse en PDF.
- El enlace público de verificación de cada certificado es visible y copiable.

**Complejidad:** Media. Integra la generación/descarga de PDF y el enlace de verificación.
**Esfuerzo:** Medio. Listado más integración con el servicio de certificados.
**Incertidumbre:** Media. Depende de la emisión de certificados (E8) y su formato final.
**SP: 5**

---

## E7 — Ranking mensual

### E7-HU03 — Visualizar ranking público *(User Story canónica)*

**Como** usuario público **yo puedo** ver el ranking mensual cerrado de los últimos meses sin necesidad de login **de forma tal que** conozca las empresas reconocidas por su aporte ambiental.

**Criterios de aceptación:**
- La página es pública, sin autenticación.
- Conecta el componente de ranking ya construido en E11-HU04 a los datos reales del backend, reemplazando los datos de ejemplo.
- Muestra el ranking completo en una tabla con selector de mes e histórico.
- Es usable desde dispositivos móviles (se comparte por redes y QR).

**Complejidad:** Baja. Solo visualización de datos ya calculados, sin validaciones ni sesión.
**Esfuerzo:** Bajo. La UI ya existe (E11-HU04); el trabajo es conectar la fuente de datos real y sumar el selector de mes/histórico.
**Incertidumbre:** Baja. Los datos provienen de snapshots ya cerrados.
**SP: 3**

---

## E8 — Certificado digital mensual

### E8-HU02 — Visualizar y descargar certificado

**Como** empresa **yo puedo** visualizar mi certificado mensual en pantalla y descargarlo como PDF **de forma tal que** lo utilice en mi comunicación institucional.

**Criterios de aceptación:**
- La vista muestra los datos de la empresa, mes, posición, hash de verificación y código QR.
- El certificado puede descargarse en PDF y el archivo replica el diseño de la vista.

**Complejidad:** Media. El diseño del certificado y su equivalencia exacta en PDF requieren cuidado.
**Esfuerzo:** Medio. Vista más generación/descarga del documento.
**Incertidumbre:** Media. Falta definir el diseño final del certificado con los actores.
**SP: 5**

### E8-HU03 — Verificar certificado públicamente

**Como** verificador externo **yo puedo** validar la autenticidad de un certificado escaneando su QR o ingresando su hash en una página pública **de forma tal que** confirme que el certificado es real.

**Criterios de aceptación:**
- La página es pública y acepta el hash tanto por URL (destino del QR) como por ingreso manual.
- Muestra los datos del certificado y su estado (válido o inválido) de forma inequívoca.
- Es usable desde el móvil, que es el medio principal de escaneo del QR.

**Complejidad:** Media. Debe cubrir los dos caminos de entrada y los casos de hash inexistente o inválido.
**Esfuerzo:** Bajo. Una página de consulta contra un endpoint público.
**Incertidumbre:** Baja. El contrato de verificación es simple: hash → datos y estado.
**SP: 5**

---

## E9 — Reportes para municipalidad

### E9-HU01 — Iniciar sesión como autoridad municipal

**Como** autoridad municipal **yo puedo** iniciar sesión con credenciales propias **de forma tal que** consulte reportes consolidados sin capacidad de operación sobre el sistema.

**Criterios de aceptación:**
- El login municipal da acceso únicamente a la sección de reportes.
- El intento de acceder a secciones de otros roles es rechazado con un mensaje claro.

**Complejidad:** Baja. Reutiliza el login y las rutas protegidas ya existentes.
**Esfuerzo:** Bajo. Configuración de rol y navegación restringida.
**Incertidumbre:** Baja. Flujo estándar sin dudas técnicas.
**SP: 3**

### E9-HU02 — Consultar volumen reciclado

**Como** autoridad municipal **yo puedo** ver el volumen reciclado por canal empresarial filtrado por período **de forma tal que** evalúe el impacto del programa en la ciudad.

**Criterios de aceptación:**
- Los filtros permiten consultar por mes, trimestre o año.
- Los resultados se muestran en tabla y gráfico consistentes con el filtro aplicado.
- El reporte puede exportarse a PDF y CSV.
- Si no hay datos para el período se muestra un estado vacío claro.

**Complejidad:** Media. Combina filtros de período, visualización gráfica y exportación en dos formatos.
**Esfuerzo:** Medio. Vista de reportes completa con gráfico y exportaciones.
**Incertidumbre:** Baja. Existe prototipo de la pantalla y los datos provienen de agregaciones ya definidas.
**SP: 5**

### E9-HU03 — Ver empresas reconocidas

**Como** autoridad municipal **yo puedo** ver el listado mensual de empresas reconocidas con sus certificados **de forma tal que** acompañe institucionalmente el reconocimiento.

**Criterios de aceptación:**
- La tabla muestra por mes las empresas del Top X con su posición.
- Cada certificado enlaza a su página pública de verificación.

**Complejidad:** Baja. Visualización de datos ya cerrados con enlaces.
**Esfuerzo:** Bajo. Una tabla con selector de mes.
**Incertidumbre:** Baja. Comparable a la User canónica, con login de por medio.
**SP: 3**

---

## E10 — Administración y gobernanza

### E10-HU01 — Gestionar roles del contrato

**Como** administrador (ADMIN_ROLE) **yo puedo** otorgar y revocar roles (MINTER, BURNER, VALIDATOR, EMERGENCY) desde una vista de mi panel **de forma tal que** gobierne el contrato sin depender de herramientas técnicas.

**Criterios de aceptación:**
- La vista lista las cuentas con su rol actual.
- Otorgar o revocar un rol requiere confirmación explícita antes de ejecutar la operación en el contrato.
- Se muestra el progreso de la transacción y su resultado (éxito o error).

**Complejidad:** Alta. Cada acción es una transacción on-chain irreversible que la interfaz debe presentar sin ambigüedad.
**Esfuerzo:** Medio. Tabla, modales de confirmación y estados de transacción.
**Incertidumbre:** Media. Hay dudas sobre el manejo de errores de la red y la firma de transacciones del administrador.
**SP: 5**

### E10-HU02 — Pausar y despausar el contrato

**Como** administrador (ADMIN_ROLE) **yo puedo** pausar y despausar el contrato desde mi panel registrando un motivo **de forma tal que** gestione incidentes con trazabilidad formal.

**Criterios de aceptación:**
- La acción es visible solo para el administrador y el estado actual del contrato (activo/pausado) se muestra en el panel.
- No se puede ejecutar la acción sin ingresar un motivo.
- El motivo queda persistido con fecha y hora.

**Complejidad:** Media. Acción crítica on-chain con registro off-chain asociado.
**Esfuerzo:** Bajo. Un botón con modal y persistencia del motivo.
**Incertidumbre:** Baja. La función del contrato ya existe y el flujo es acotado.
**SP: 3**

---

## Historias sin trabajo de frontend (sin cambios)

E3-HU02 (billetera custodial), E5-HU04 (listener de eventos), E7-HU01 y E7-HU02 (cálculo y cierre de ranking), E8-HU01 (emisión de certificados) son de backend/sistema y mantienen su redacción original. E11-HU01 (e2e) ejercita el frontend pero como suite de pruebas, no como pantalla.
