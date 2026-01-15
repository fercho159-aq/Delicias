# 🥜 Las Delicias del Campo - E-commerce

E-commerce moderno para una tienda de nueces, semillas y frutos secos premium.

## 🛠️ Stack Tecnológico

- **Runtime:** Bun.js
- **Framework:** Next.js 16 (App Router)
- **Estilos:** Tailwind CSS + CSS Custom Properties
- **Base de datos:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Iconos:** Lucide React

## 🚀 Inicio Rápido

### 1. Instalación

```bash
bun install
```

### 2. Configuración de Base de Datos (Neon)

1. Crea una cuenta en [Neon.tech](https://neon.tech)
2. Crea un nuevo proyecto y copia la connection string
3. Configura tu archivo `.env`:

```env
DATABASE_URL="postgresql://username:password@host.neon.tech/database?sslmode=require"
```

### 3. Inicializar Base de Datos

**Opción A: Usando Prisma (recomendado)**

```bash
# Generar cliente de Prisma
bun run db:generate

# Sincronizar esquema con la base de datos
bun run db:push

# Poblar con datos del CSV
bun run db:seed
```

**Opción B: SQL Directo**

Ejecuta el contenido de `scripts/create-tables.sql` en la consola SQL de Neon.

### 4. Descargar Imágenes de Productos

```bash
# Descargar imágenes desde WordPress/WooCommerce
bun run images:download

# (Opcional) Renombrar imágenes con IDs correctos
bun run images:rename
```

### 5. Ejecutar en Desarrollo

```bash
bun run dev
```

Visita [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
delicias-ecommerce/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Homepage
│   └── globals.css         # Estilos globales + Design System
├── components/
│   └── layout/
│       ├── Header.tsx      # Navegación y logo
│       └── Footer.tsx      # Pie de página
├── prisma/
│   └── schema.prisma       # Esquema de base de datos
├── scripts/
│   ├── download-images.ts  # Descarga imágenes de WooCommerce
│   ├── seed-products.ts    # Inserta productos en DB
│   └── create-tables.sql   # SQL alternativo para crear tablas
├── public/
│   ├── logo.png            # Logo de la empresa
│   ├── hero-nuts.png       # Imagen hero
│   └── products/           # Imágenes de productos (descargadas)
└── productos de wordpress.csv  # Export de WooCommerce
```

## 📊 Modelos de Base de Datos

### Categorías
- Semillas, Dulces, Nueces, Frutos Secos, Cacahuates, Mixes, Verduras Deshidratadas, Cajas de Regalo, etc.

### Productos
- Productos padre con variantes (variable/simple)
- SKU, nombre, descripción, categoría
- Imágenes múltiples

### Variantes
- Diferentes presentaciones (200g, 1kg, etc.)
- Precio normal y de oferta
- Control de inventario

### Usuarios y Pedidos
- Sistema de usuarios con roles
- Carrito de compras
- Órdenes con estados
- Historial de pedidos

## 🎨 Design System

El proyecto usa CSS Custom Properties para mantener consistencia:

```css
--color-primary-*    /* Verdes (marca principal) */
--color-secondary-*  /* Dorados/tierra */
--color-accent-*     /* Acentos */
--color-neutral-*    /* Grises */
--font-heading       /* Outfit */
--font-body          /* Inter */
```

## 📦 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Servidor de desarrollo |
| `bun run build` | Build de producción |
| `bun run db:generate` | Generar cliente Prisma |
| `bun run db:push` | Sincronizar esquema |
| `bun run db:seed` | Poblar base de datos |
| `bun run db:studio` | Abrir Prisma Studio |
| `bun run images:download` | Descargar imágenes |

## 🔜 Próximos Pasos

- [ ] Páginas de producto
- [ ] Carrito de compras funcional
- [ ] Integración con Stripe
- [ ] Panel de administración
- [ ] Sistema de búsqueda
- [ ] Filtros por categoría

## 📄 Licencia

Proyecto privado - Las Delicias del Campo © 2025
