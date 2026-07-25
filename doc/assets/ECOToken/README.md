# Pantallas de referencia de ECOToken

Este directorio contiene los mockups visuales acordados para orientar el
desarrollo. No es la aplicación productiva: usa React 18 y Babel en el
navegador, con datos de ejemplo hardcodeados.

## Cómo verlos

Desde este directorio ejecutar `python3 -m http.server 8000` y abrir
`http://localhost:8000/EcoToken.html`. Se necesita conexión a internet para las
dependencias CDN. El canvas permite recorrer, ampliar y abrir cada pantalla.

## Qué contiene cada archivo

| Archivo | Pantallas |
| --- | --- |
| `screens/org.jsx` | 01 Dashboard, 02 Canjear tokens, 03 Mis certificados |
| `screens/coop.jsx` | 04 Registrar pesaje, 05 Historial de retiros, 06 Cierre de mes |
| `screens/muni.jsx` | 07 Ranking mensual, 08 Gestión de beneficios, 09 Reporte ciudad |
| `screens/certificate.jsx` | 10 Certificado mensual de impacto, A4 horizontal |
| `screens/report.jsx` | 11 Reporte mensual de actividad, A4 vertical |
| `screens/ranking-landing.jsx` | 12 Ranking público, landing web |
| `screens/auth.jsx` | 13 Registro de empresa, 14 Registro pendiente, 15 Login multirol |
| `screens/mobile-web.jsx` | Versiones móviles de 13–15 y 22–24 |
| `screens/admin.jsx` | 16 Aprobación de empresas, 17 Confirmación, 18 Alta de cooperativa, 19 Conversión, 20 Roles, 21 Pausa |
| `screens/empresa.jsx` | 22 Historial de aportes, 23 Comprobante, 24 Posición en ranking |
| `screens/verify.jsx` | 25 Certificado válido, 26 Certificado no encontrado |

## Archivos de soporte

- `screens/shared.jsx` y `screens/web-shared.jsx`: estilos y componentes comunes.
- `assets/`: logos institucionales usados por las pantallas.
- `uploads/`: imágenes fuente conservadas como referencia.
- `design-canvas.jsx` e `ios-frame.jsx`: canvas de presentación y marco móvil.
- `EcoToken.html`: índice y orden canónico de todos los mockups.

Los valores, nombres y operaciones son ilustrativos. Para implementar una
historia de usuario, tomar de estos assets la estructura visual y validar el
comportamiento contra el backlog y el modelo vigente.
