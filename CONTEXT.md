# Contexto del dominio — Panel de administración

Glosario de términos del panel `/admin`. Sin detalles de implementación.

## Admin panel

Área autenticada del sitio donde operadores revisan datos de crisis,
moderan contenido y ejecutan tareas operativas. Acceso actual: contraseña
compartida (`ADMIN_PASSWORD`).

## Overview

Sección de aterrizaje del admin en `/admin`. Agrupa la vista operativa
general: métricas agregadas, federación hub y controles de sincronización.
No es una pestaña secundaria; es la página principal del panel.

## Admin section

Unidad de navegación del sidebar izquierdo. Cada sección corresponde a
una ruta y a un área de trabajo del admin:

- **Overview** → `/admin`
- **Analytics** → `/admin/analytics`
- **Insumos hospitalarios** → `/admin/insumos`
- **Reportes** → `/admin/reportes`
- **Desaparecidas** → `/admin/desaparecidas`
- **Chat** → `/admin/chat`
- **Donaciones** → `/admin/donaciones`
- **Contacto** → `/admin/contacto`

## Admin shell

Marco persistente del panel: header, sidebar izquierdo (navegación),
contenido principal y sidebar derecho (integraciones). El shell envuelve
todas las admin sections.

### Comportamiento responsive

- **Desktop (≥ ~1024px):** tres columnas persistentes — nav izquierdo
  (~240px), contenido principal (flex), panel de integraciones (~280px).
- **Mobile (< ~1024px):** contenido a ancho completo; nav e integraciones
  en drawers independientes abiertos desde el header (☰ nav, icono de
  enchufe/plug integraciones).

## Integrations panel

Sidebar derecho del admin shell. Muestra conexiones a fuentes externas
(p. ej. WhatsApp, Telegram).

### Contenido v1

Estado vacío con roadmap: título, breve descripción del propósito y lista
de fuentes planificadas. Sin tarjetas por fuente, sin botones de conexión
ni flujos simulados. Las integraciones existentes del admin (OpenPanel,
sync) permanecen en Overview, no aquí.

**Fuentes en roadmap v1:** WhatsApp Business, Telegram, SMS, email entrante.

## Admin permissions (pendiente)

Capacidad futura de ocultar admin sections según el operador. Fuera de
alcance inicial; el shell debe permitir filtrar ítems de navegación sin
cambiar la estructura de rutas.

## Admin navigation

Lista lateral de admin sections en el sidebar izquierdo (y drawer móvil).

- **Estructura:** lista plana con separadores visuales entre clusters (sin
  encabezados de grupo).
- **Clusters:** (1) Overview · (2) Analytics · (3) Reportes, Desaparecidas,
  Chat · (4) Insumos, Donaciones, Contacto.
- **Badges:** conteos en vivo donde existen hoy (reportes, desaparecidas,
  chat, donaciones, no leídos en contacto). Visibles en desktop y drawer
  móvil.

## Admin header

Barra superior fija del admin shell.

- **Siempre visible:** título fijo «Panel de administración», enlaces
  «Ver sitio» y «Salir»; en móvil, toggles ☰ (nav) y enchufe (integraciones).
- **Solo en Overview:** subtítulo con timestamp de última actualización y
  aviso de modo demo.
- **Por sección:** el contenido principal muestra el título de la admin
  section activa (p. ej. «Contacto»).
- **OpenPanel:** solo dentro de la sección Analytics, no en el header global.

## Admin visual system

El admin shell usa los mismos design tokens que la app pública (`--esurf`,
`--etext`, `--eborder`, tipografía Space Grotesk / Stara según DESIGN.md).
El contenido interno de cada sección puede migrar a tokens de forma
incremental; el shell es token-native desde v1. Solo tema claro en v1.

## Admin authentication gate

Pantalla de login fuera del admin shell. Cualquier visita no autenticada a
`/admin/*` muestra solo el formulario de contraseña (pantalla completa).
Tras login, redirige a la URL solicitada o a `/admin` por defecto.

## Admin live counts

Conteos mostrados en badges de navegación (reportes, desaparecidas, chat,
donaciones, contacto no leído). Permanecen actualizados mientras el
operador navega entre admin sections en la misma sesión autenticada.

## Admin mobile drawers

En viewport móvil, nav e integraciones son drawers independientes.

- **Mutuamente excluyentes:** abrir uno cierra el otro.
- **Cierre al navegar:** elegir una admin section en el drawer de nav navega
  y cierra el drawer.
- **Cierre manual:** backdrop, botón cerrar o tecla Escape cierran el drawer
  activo.
- **Accesibilidad:** scroll del body bloqueado con drawer abierto; foco
  atrapado dentro del panel activo.
