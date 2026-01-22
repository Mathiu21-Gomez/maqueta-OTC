---
description: Especificación detallada del diseño del sidebar para el sistema OTC
---

# 📐 Especificación del Sidebar - Sistema OTC

## Dimensiones
- **Desktop**: `280px` fijo
- **Tablet**: `260px`
- **Mobile**: Full width con overlay

## Estructura Visual

```
┌─────────────────────────────────┐
│  [Logo] OTC 360 ERP             │  ← Header
├─────────────────────────────────┤
│  Label de Sección               │
│  🔘 Item de menú                │
│  🔘 Item activo (fondo negro)   │
│  🔘 Item con badge [Test]       │
│  🔘 Item con chevron >          │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│  ← Separador
│  Otra sección...                │
└─────────────────────────────────┘
```

## Paleta de Colores

```css
/* Backgrounds */
--sidebar-bg: #FFFFFF;
--sidebar-item-hover: #F3F4F6;
--sidebar-item-active: #1F2937;
--sidebar-item-active-hover: #374151;

/* Textos */
--sidebar-text-default: #374151;
--sidebar-text-hover: #111827;
--sidebar-text-active: #FFFFFF;
--sidebar-label: #9CA3AF;

/* Iconos */
--sidebar-icon-default: #6B7280;
--sidebar-icon-hover: #374151;
--sidebar-icon-active: #FFFFFF;

/* Bordes */
--sidebar-border: #E5E7EB;

/* Badge */
--badge-bg: #FEF3C7;
--badge-text: #92400E;
```

## Estilos de Componentes

### Header
- Logo 40x40px + título en dos líneas
- "OTC" bold 18px negro, "360 ERP" medium 13px gris
- Border-bottom gris claro

### Labels de Sección
- Font-size: 11px, uppercase
- Color: #9CA3AF
- Padding: 20px 20px 8px 20px

### Items de Menú
- Padding: 10px 20px
- Margin: 2px 12px
- Border-radius: 8px
- Gap icono-texto: 12px
- Icono: 20x20px

### Estados
1. **Normal**: Fondo transparente, texto #374151, icono #6B7280
2. **Hover**: Fondo #F3F4F6 (MUY sutil), texto #111827
3. **Activo**: Fondo #1F2937 (negro), texto/icono blanco
4. **Focus**: Outline azul 2px

### Badge "Test"
- Background: #FEF3C7
- Color: #92400E
- Font-size: 10px, uppercase
- Padding: 2px 8px
- Border-radius: 4px

### Separadores
- Height: 1px
- Background: #E5E7EB
- Margin: 12px 20px

## Comportamiento Mobile
- Oculto por defecto
- Slide-in desde izquierda
- Overlay oscuro detrás
- Cerrar con click en overlay o ESC

## Notas Importantes
- Hover DEBE ser muy sutil
- Transiciones: 150ms ease
- Solo un item activo a la vez
- Scroll interno si contenido excede altura
