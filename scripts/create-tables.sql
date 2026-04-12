-- Las Delicias del Campo - Database Schema for Neon PostgreSQL
-- Run this SQL in your Neon console to create all tables

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(500),
    parent_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Types
CREATE TYPE product_type AS ENUM ('SIMPLE', 'VARIABLE');
CREATE TYPE product_status AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- Products (parent products)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    woo_id INTEGER UNIQUE,
    sku VARCHAR(100),
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    type product_type DEFAULT 'SIMPLE',
    status product_status DEFAULT 'ACTIVE',
    featured BOOLEAN DEFAULT FALSE,
    category_id INTEGER REFERENCES categories(id),
    tags TEXT[],
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    woo_id INTEGER UNIQUE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100),
    name VARCHAR(500) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    weight VARCHAR(50),
    weight_value INTEGER,
    stock INTEGER DEFAULT 0,
    low_stock_qty INTEGER,
    manage_stock BOOLEAN DEFAULT TRUE,
    in_stock BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    local_path VARCHAR(500),
    alt VARCHAR(500),
    position INTEGER DEFAULT 0
);

-- Product Attributes
CREATE TABLE IF NOT EXISTS product_attributes (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    values TEXT[] NOT NULL,
    visible BOOLEAN DEFAULT TRUE,
    variation BOOLEAN DEFAULT TRUE
);

-- User Roles
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');

-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role user_role DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Address Types
CREATE TYPE address_type AS ENUM ('SHIPPING', 'BILLING');

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type address_type DEFAULT 'SHIPPING',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    street VARCHAR(500) NOT NULL,
    colony VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'México',
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE
);

-- Shopping Carts
CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    variant_id INTEGER NOT NULL REFERENCES product_variants(id),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(cart_id, variant_id)
);

-- Order Status
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    address_id INTEGER REFERENCES addresses(id),
    status order_status DEFAULT 'PENDING',
    payment_status payment_status DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id INTEGER NOT NULL REFERENCES product_variants(id),
    name VARCHAR(500) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total DECIMAL(10,2) NOT NULL
);

-- Site Configuration
CREATE TABLE IF NOT EXISTS site_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Discount Types
CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FIXED', 'FREE_SHIPPING');

-- Discounts
CREATE TABLE IF NOT EXISTS discounts (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type discount_type NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    min_purchase DECIMAL(10,2),
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Insert default categories from WooCommerce
INSERT INTO categories (name, slug) VALUES
    ('Semillas', 'semillas'),
    ('Dulces', 'dulces'),
    ('Nueces', 'nueces'),
    ('Frutos secos', 'frutos-secos'),
    ('Cacahuates', 'cacahuates'),
    ('Mixes', 'mixes'),
    ('Verduras Deshidratadas', 'verduras-deshidratadas'),
    ('Cajas de regalo', 'cajas-de-regalo'),
    ('Canasta', 'canasta'),
    ('Paquetes', 'paquetes'),
    ('Veganos', 'veganos'),
    ('Chocolates', 'chocolates')
ON CONFLICT (slug) DO NOTHING;

-- Insert some site configuration
INSERT INTO site_config (key, value, type) VALUES
    ('site_name', 'Las Delicias del Campo', 'text'),
    ('site_description', 'Nueces, semillas y frutos secos premium. Del campo a tu mesa.', 'text'),
    ('whatsapp_number', '5215519915154', 'text'),
    ('free_shipping_threshold', '500', 'text'),
    ('about_title', '¿Quiénes Somos?', 'text'),
    ('about_text', 'Empresa familiar dedicada a la comercialización de nueces, semillas y frutos secos seleccionados, a través del más alto estándar de calidad e innovación.', 'html')
ON CONFLICT (key) DO NOTHING;
