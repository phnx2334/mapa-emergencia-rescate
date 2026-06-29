# ADR 0007 — Shell del panel admin con dos sidebars y rutas híbridas

> Estado: aceptada · Relacionado: `CONTEXT.md` (glosario admin) · Issue: #109

## Contexto

El panel `/admin` es hoy una **página monolítica** (`AdminDashboard.tsx`, ~1 500
líneas): autenticación, polling, métricas, sync, federación y siete áreas de
trabajo conmutadas por **pestañas en estado cliente** (sin URLs propias).

Eso limita:

- **Navegación** — no hay deep links ni historial del navegador por sección.
- **Escalabilidad del panel** — más secciones agrandan el mismo archivo.
- **Integraciones futuras** — WhatsApp, Telegram, SMS y email entrante no tienen
  un lugar visible en la UI.
- **Permisos futuros** — hoy todos los operadores ven todo (`ADMIN_PASSWORD`
  compartido); se necesitará ocultar admin sections sin reescribir el panel.
- **Consistencia visual** — el admin usa utilidades Tailwind `slate-*` mientras
  la app pública sigue `design/DESIGN.md` y tokens CSS (`--esurf`, `--etext`, …).

Se necesita un **admin shell** persistente: sidebar izquierdo (navegación),
contenido principal (admin section activa) y sidebar derecho (integraciones),
responsive en móvil y desktop.

## Decisión

### 1. Rutas híbridas (Overview + sub-rutas)

- **`/admin`** → admin section **Overview** (métricas, federación hub, sync).
- **Sub-rutas** por cada área de trabajo:
  `/admin/analytics`, `/admin/insumos`, `/admin/reportes`, `/admin/desaparecidas`,
  `/admin/chat`, `/admin/donaciones`, `/admin/contacto`.

Cada admin section es una ruta Next.js; el sidebar izquierdo navega con
`<Link>`, no con estado local de pestañas.

### 2. Admin shell de tres columnas

| Región        | Desktop (≥ ~1024 px) | Mobile (< ~1024 px) |
| ------------- | -------------------- | ------------------- |
| Nav izquierdo | Columna fija ~240 px | Drawer ☰           |
| Contenido     | Columna flexible     | Ancho completo      |
| Integraciones | Columna fija ~280 px | Drawer enchufe      |

Los drawers móviles son **mutuamente excluyentes**, cierran al navegar (nav),
con backdrop / Escape, scroll lock y focus trap.

### 3. Header operativo

Siempre: título «Panel de administración», «Ver sitio», «Salir», toggles móviles.
Timestamp de actualización y aviso de modo demo **solo en Overview**. OpenPanel
permanece **dentro de Analytics**, no en el header global.

### 4. Integrations panel (v1 placeholder)

Sidebar derecho con **estado vacío + roadmap** (sin tarjetas ni botones de
conexión). Fuentes planificadas: WhatsApp Business, Telegram, SMS, email
entrante. OpenPanel y sync **no** se mueven aquí — siguen en Overview.

### 5. Navegación izquierda

Lista plana con **separadores visuales** entre clusters (sin encabezados de
grupo):

1. Overview
2. Analytics
3. — Reportes · Desaparecidas · Chat
4. — Insumos · Donaciones · Contacto

**Badges** con conteos en vivo (reportes, desaparecidas, chat, donaciones,
contacto no leído) en desktop y drawer móvil.

### 6. Autenticación fuera del shell

Visitas no autenticadas a `/admin/*` muestran solo el formulario de login
(pantalla completa). Tras login, redirige a la URL solicitada o a `/admin`.

### 7. Datos compartidos entre secciones

Un **provider de sesión admin** envuelve el layout autenticado: polling
centralizado, badges vivos al cambiar de ruta sin remontar fetchers por página.

### 8. Sistema visual

El **shell** (header, sidebars, drawers, nav) usa design tokens de
`design/DESIGN.md`. El contenido interno de cada sección puede seguir en
`slate-*` temporalmente y migrar de forma incremental. Solo tema claro en v1.

### 9. Alcance explícitamente fuera

- Modelo de permisos / roles (solo preparar nav filtrable por config).
- Integraciones reales con mensajería externa.
- Migración completa de estilos internos a tokens.
- Tema oscuro del admin.

## Alternativas consideradas

| Alternativa                                                 | Por qué se descartó                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| SPA con pestañas (sin rutas)                                | No deep links; permisos y bookmarks más difíciles después     |
| Rutas planas sin Overview                                   | Pierde landing operativo; sync y métricas quedarían huérfanas |
| Shell solo en desktop; sin drawer de integraciones en móvil | El panel derecho sería inaccesible en móvil desde v1          |
| Tarjetas por fuente en integraciones                        | Implica flujos «Conectar» inexistentes                        |
| Login dentro del shell                                      | Filtra chrome admin antes de autenticar; más superficie de UI |

## Consecuencias

- ✅ Navegación clara, deep links y base para permisos por admin section.
- ✅ Lugar visible para integraciones futuras sin confundirlas con Overview.
- ✅ Descomposición del monolito en páginas y componentes de shell reutilizables.
- ✅ Badges y polling estables al navegar entre rutas (provider compartido).
- ⚠️ Refactor grande de `AdminDashboard.tsx`; riesgo de regresión en moderación
  (eliminar reportes, chat, desaparecidas, contacto, donaciones).
- ⚠️ El provider concentra estado — conviene extraer helpers puros testeables
  (conteos para badges, config de nav) para no acoplar lógica a React.
- ⚠️ Breakpoint ~1024 px es distinto al del mapa público (~760 px); documentado
  en `CONTEXT.md` para evitar asumir un único breakpoint global.
