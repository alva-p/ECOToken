**PROJECT CHARTER**

**ECOToken**

Plataforma de incentivos al reciclaje empresarial

Universidad Tecnológica Nacional - Facultad Regional Villa María

Carrera: Ingeniería en Sistemas de Información

Cátedra: Proyecto Final - Ciclo Lectivo 2026

Equipo: ClusterPA

**Integrantes**

Alves, Rodrigo

Martínez, Mateo

Rojas Pessuto, Tobías

Pineda, Álvaro

Versión 2 - Mayo 2026

# Versiones del documento

| **Versión** | **Autor**        | **Fecha**  | **Observaciones**                               |
| ----------- | ---------------- | ---------- | ----------------------------------------------- |
| 2.0         | Equipo ClusterPA | 08/06/2026 | Se agregó bibliografía, versionado de documento |
| ---         | ---              | ---        | ---                                             |

[**Versiones del documento 2**](#_heading=h.qktm0gpa43rv)

[1\. Nombre del proyecto 4](#_heading=)

[2\. Justificación del proyecto 4](#_heading=)

[3\. Objetivos del proyecto 4](#_heading=)

[4\. Fechas / plazos del proyecto 4](#_heading=)

[5\. Director del proyecto 4](#_heading=)

[6\. Criterios de éxito generales 5](#_heading=)

[7\. Requerimientos de alto nivel 5](#_heading=)

[8\. Presupuesto general 5](#_heading=)

[9\. Riesgos generales 5](#_heading=)

[10\. Hitos principales 6](#_heading=)

[11\. Supuestos y restricciones 6](#_heading=)

[Supuestos 6](#_heading=)

[Restricciones 6](#_heading=)

## 1\. Nombre del proyecto

ECOToken es una plataforma tecnológica orientada a incentivar el reciclaje en el ámbito empresarial mediante un sistema de puntos digitales no transferibles, respaldado por tecnología blockchain. El sistema permite registrar la entrega de materiales reciclables por parte de empresas adheridas, asignar puntos en función del volumen reciclado y reconocer públicamente su esfuerzo ambiental mediante un ranking mensual y un certificado digital verificable. Las cooperativas de reciclaje participan como validadoras operativas del material entregado, y la municipalidad como autoridad institucional que respalda el reconocimiento.

## 2\. Justificación del proyecto

La gestión de residuos sólidos urbanos presenta deficiencias en la participación del sector empresarial, en la trazabilidad de los materiales reciclables y en la falta de incentivos concretos para que las empresas acrediten formalmente su esfuerzo ambiental. Las empresas no cuentan hoy con un canal estandarizado y verificable para demostrar y comunicar su comportamiento de reciclaje, y las cooperativas y municipios carecen de instrumentos auditables que permitan validar y reconocer ese esfuerzo.

ECOToken surge como una solución que busca mejorar este escenario mediante la implementación de un sistema de incentivos basado en puntos digitales, acompañado de una infraestructura tecnológica que garantice transparencia, trazabilidad y confianza entre empresas adheridas, cooperativas validadoras y autoridad municipal.

## 3\. Objetivos del proyecto

Diseñar, desarrollar y validar un sistema de incentivos al reciclaje empresarial que permita registrar la entrega de materiales reciclables por parte de empresas adheridas, asignarles puntos digitales respaldados por blockchain, y reconocer su esfuerzo mediante un ranking mensual y la emisión de un certificado digital verificable, garantizando la trazabilidad e integridad de la información a lo largo del proceso.

## 4\. Fechas / plazos del proyecto

- Inicio del proyecto: Marzo 2026 (Semana 1 del cronograma de cátedra).
- Aprobación del Project Charter: 27-04-2026 (Semana 6).
- Cierre del primer cuatrimestre: Semana 16, línea base del proyecto consolidada.
- Regularización de la materia: Semana 32 (tercera exposición formal, cierre de cursada).
- Defensa final y aprobación: Ciclo lectivo 2027 (presentación ante tribunal, según reglamento de Proyecto Final).

## 5\. Director del proyecto

Director del proyecto: Álvaro Pineda.

## 6\. Criterios de éxito generales

- Implementación funcional del sistema de registro de reciclaje y asignación de puntos.
- Desarrollo de una aplicación usable para los actores del sistema (empresas adheridas, cooperativas validadoras y administradores).
- Integración básica entre frontend, backend y smart contracts.
- Validación del modelo mediante entrevistas o interacción con actores reales (empresas adheridas, cooperativas, municipio).
- Documentación completa del sistema y su arquitectura.
- Demostración funcional (MVP) del flujo principal del sistema.

## 7\. Requerimientos de alto nivel

- El sistema debe permitir registrar entregas de materiales reciclables (peso y tipo) realizadas por empresas adheridas, con la validación operativa de una cooperativa adherida.
- Debe asignar puntos digitales a las empresas adheridas en función del volumen y tipo de material reciclado.
- Los puntos deben ser no transferibles y utilizables únicamente dentro del sistema.
- Debe permitir el reconocimiento del esfuerzo ambiental de las empresas mediante un ranking mensual y la emisión de un certificado digital verificable. De forma complementaria, podrá contemplar canje de puntos por beneficios opcionales (a definir en versiones posteriores).
- Debe garantizar la trazabilidad e inmutabilidad de las operaciones mediante blockchain.
- Debe contemplar roles diferenciados: empresa adherida, cooperativa validadora, autoridad municipal, operador del sistema y administrador.
- Debe estar diseñado para extender funcionalidades a actores secundarios (por ejemplo, ciudadanos individuales) en versiones posteriores.

## 8\. Presupuesto general

- Infraestructura frontend (Vercel).
- Infraestructura backend y base de datos (capas gratuitas de Render y PostgreSQL gestionado o VPS de bajo costo).
- Operación sobre red de prueba Sepolia (sin costos reales de gas).
- Costos de desarrollo: absorbidos por el equipo en el marco del Proyecto Final.

## 9\. Riesgos generales

- Dependencia de actores externos: baja participación de empresas, cooperativas o instituciones puede limitar la validación del sistema.
- Adopción empresarial: dificultad para conseguir las primeras empresas piloto, lo cual debilita la validez del ranking en sus primeras ediciones (problema del huevo y la gallina).
- Respaldo institucional del municipio: si el municipio no acompaña el ranking y el certificado con reconocimiento real, el valor reputacional del certificado se debilita.
- Riesgo positivo: interés de instituciones reales (cooperativas, empresas o municipios) que permita validar el sistema en un entorno real.

## 10\. Hitos principales

**Semana 4**: Finalización del Acta de Constitución del Proyecto y primera definición del alcance.

**Semana 5**: Definición formal del alcance del proyecto y elaboración de la Estructura de Desglose del Trabajo (EDT).

**Semana 8**: Desarrollo de la primera versión del cronograma del proyecto y planificación de actividades.

**Semana 12**: Presentación de los primeros prototipos del sistema y elaboración inicial del plan de gestión de riesgos.

**Semana 15**: Primera exposición formal del proyecto y consolidación de la línea base (alcance, cronograma, riesgos y comunicaciones).

**Semana 24:** Segunda exposición formal del proyecto con avances en análisis, diseño, implementación y testing.

**Semana 32**: Exposición final, entrega completa del proyecto y cierre académico.

## 11\. Supuestos y restricciones

### Supuestos

- Existencia de interés del sector empresarial, las cooperativas y el municipio en mejorar la gestión del reciclaje.
- Disponibilidad de las herramientas tecnológicas necesarias para el desarrollo.
- Posibilidad de acceso a información relevante mediante entrevistas con actores reales.
- Viabilidad técnica del uso de blockchain en el contexto del proyecto.

### Restricciones

- Tiempo limitado para el desarrollo (calendario académico).
- Recursos económicos reducidos.
- Dependencia parcial de validación externa (empresas adheridas, cooperativas, municipio).

# Bibliografía

- Project Management Institute. (2017). Guía de los Fundamentos para la Dirección de Proyectos (PMBOK® Guide) - Sexta edición. Project Management Institute.
- Project Management Institute. (2021). Guía del PMBOK® - Séptima edición. Project Management Institute.
- Villafañe, C. (2026). 01 PFISI 2026 - Exp Project Charter o Acta de Constitución. Universidad Tecnológica Nacional - Facultad Regional Villa María.
- Villafañe, C. (2026). 02 PFISI 2026 - Actividad Project Charter. Universidad Tecnológica Nacional - Facultad Regional Villa María.
- Villafañe, C. (2026). PFISI - PMBOK v6 - Gestión de la Integración v1.2. Universidad Tecnológica Nacional - Facultad Regional Villa María.
- Universidad Tecnológica Nacional - Facultad Regional Villa María. (2026). Ejemplo de Project Charter - Reconvertir sucursales del Banco Aurora. Cátedra Proyecto Final, Ingeniería en Sistemas de Información.
- Universidad Tecnológica Nacional - Facultad Regional Villa María. (2026). Ejemplo de Project Charter v1.2. Cátedra Proyecto Final, Ingeniería en Sistemas de Información.
- Universidad Tecnológica Nacional - Facultad Regional Villa María. (2026). Ejemplo - Acta de Constitución. Cátedra Proyecto Final, Ingeniería en Sistemas de Información.
- Universidad Tecnológica Nacional - Facultad Regional Villa María. (2026). Plantilla Acta de Constitución a. Cátedra Proyecto Final, Ingeniería en Sistemas de Información.
- Universidad Tecnológica Nacional - Facultad Regional Villa María. (2026). Plantilla Acta de Constitución b. Cátedra Proyecto Final, Ingeniería en Sistemas de Información.
- Universidad Tecnológica Nacional - Facultad Regional Villa María. (2026). Plantilla Acta de Constitución c. Cátedra Proyecto Final, Ingeniería en Sistemas de Información.
- Universidad Tecnológica Nacional - Facultad Regional Villa María. (2026). Los desafíos de la gestión de proyectos. Cátedra Proyecto Final, Ingeniería en Sistemas de Información.