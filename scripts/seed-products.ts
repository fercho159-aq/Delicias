/**
 * Script to seed the database with products from WooCommerce CSV export
 * 
 * Run with: bun run scripts/seed-products.ts
 */

import { parse } from 'csv-parse/sync';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CSV_PATH = join(process.cwd(), 'productos de wordpress.csv');
const IMAGE_MAPPING_PATH = join(process.cwd(), 'scripts', 'image-mapping.json');

interface WooProduct {
    [key: string]: string; // Allow any column name
}

interface ImageMapping {
    originalUrl: string;
    localPath: string;
    productId: string;
    productName: string;
}

// Helper to get product ID from record (first column may have different names)
function getProductId(record: WooProduct): number {
    const id = record['ID'] || record['id'] || Object.values(record)[0];
    return parseInt(id) || 0;
}

function getField(record: WooProduct, ...names: string[]): string {
    for (const name of names) {
        if (record[name]) return record[name];
    }
    return '';
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function parseWeight(weightStr: string): { display: string; grams: number } | null {
    if (!weightStr) return null;

    const normalized = weightStr.toLowerCase().trim();

    // Parse various formats: "200 gramos", "1 kg", "200 gr", "800 gr", etc.
    const kgMatch = normalized.match(/(\d+(?:\.\d+)?)\s*kg/);
    if (kgMatch) {
        const kg = parseFloat(kgMatch[1]);
        return { display: weightStr, grams: kg * 1000 };
    }

    const grMatch = normalized.match(/(\d+)\s*(?:gramos?|gr)/);
    if (grMatch) {
        return { display: weightStr, grams: parseInt(grMatch[1]) };
    }

    return null;
}

function cleanPrice(priceStr: string): number | null {
    if (!priceStr || priceStr.trim() === '') return null;
    const cleaned = priceStr.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
}

async function main() {
    console.log('🌱 Las Delicias del Campo - Database Seeder\n');

    // Read CSV
    console.log('📄 Reading CSV file...');
    const csvContent = readFileSync(CSV_PATH, 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true
    }) as WooProduct[];

    console.log(`   Found ${records.length} records\n`);

    // Load image mapping if exists
    let imageMapping: ImageMapping[] = [];
    if (existsSync(IMAGE_MAPPING_PATH)) {
        imageMapping = JSON.parse(readFileSync(IMAGE_MAPPING_PATH, 'utf-8'));
        console.log(`📷 Loaded ${imageMapping.length} image mappings\n`);
    }

    // Create image lookup
    const imagesByProductId = new Map<string, string[]>();
    for (const mapping of imageMapping) {
        const existing = imagesByProductId.get(mapping.productId) || [];
        existing.push(mapping.localPath);
        imagesByProductId.set(mapping.productId, existing);
    }

    // Extract unique categories
    const categoriesSet = new Set<string>();
    for (const record of records) {
        const categories = getField(record, 'Categorías', 'Categories');
        if (categories) {
            categories.split(',').forEach(cat => {
                const trimmed = cat.trim();
                if (trimmed) categoriesSet.add(trimmed);
            });
        }
    }

    console.log('📂 Creating categories...');
    const categoryMap = new Map<string, number>();

    for (const categoryName of categoriesSet) {
        const slug = slugify(categoryName);
        const existing = await prisma.category.findUnique({ where: { slug } });

        if (existing) {
            categoryMap.set(categoryName, existing.id);
            console.log(`   ⏭️  Category exists: ${categoryName}`);
        } else {
            const created = await prisma.category.create({
                data: {
                    name: categoryName,
                    slug
                }
            });
            categoryMap.set(categoryName, created.id);
            console.log(`   ✅ Created category: ${categoryName}`);
        }
    }

    console.log(`\n   Total categories: ${categoryMap.size}\n`);

    // Separate parent products and variations
    const parentProducts = records.filter(r => {
        const tipo = getField(r, 'Tipo', 'Type');
        return tipo === 'variable' || tipo === 'simple';
    });
    const variations = records.filter(r => {
        const tipo = getField(r, 'Tipo', 'Type');
        return tipo === 'variation';
    });

    console.log(`📦 Processing ${parentProducts.length} parent products...\n`);

    let productsCreated = 0;
    let productsSkipped = 0;
    let variantsCreated = 0;

    for (const parent of parentProducts) {
        const wooId = getProductId(parent);
        const nombre = getField(parent, 'Nombre', 'Name');

        if (!wooId || !nombre) {
            console.log(`   ⚠️  Skipping invalid product: ID=${wooId}, Name=${nombre}`);
            continue;
        }

        // Check if already exists
        const existing = await prisma.product.findUnique({ where: { wooId } });
        if (existing) {
            console.log(`⏭️  Skipping (exists): ${nombre}`);
            productsSkipped++;
            continue;
        }

        // Get category
        const categoriesStr = getField(parent, 'Categorías', 'Categories');
        const categoryName = categoriesStr?.split(',')[0]?.trim();
        const categoryId = categoryName ? categoryMap.get(categoryName) : null;

        // Get images for this product
        const productImages = imagesByProductId.get(String(wooId)) || [];

        // Create product
        const tipo = getField(parent, 'Tipo', 'Type');
        const slug = slugify(nombre) + '-' + wooId;

        const product = await prisma.product.create({
            data: {
                wooId,
                sku: getField(parent, 'SKU') || null,
                name: nombre,
                slug,
                description: getField(parent, 'Descripción', 'Description') || null,
                shortDescription: getField(parent, 'Descripción corta') || null,
                type: tipo === 'variable' ? 'VARIABLE' : 'SIMPLE',
                status: getField(parent, 'Publicado') === '1' ? 'ACTIVE' : 'INACTIVE',
                featured: getField(parent, '¿Está destacado?') === '1',
                categoryId,
                position: parseInt(getField(parent, 'Posición', 'Position')) || 0,
                images: {
                    create: productImages.map((path, index) => ({
                        url: path,
                        localPath: path,
                        position: index
                    }))
                }
            }
        });

        console.log(`✅ Created: ${nombre}`);
        productsCreated++;

        // If it's a simple product, create a default variant
        if (tipo === 'simple') {
            const price = cleanPrice(getField(parent, 'Precio normal')) || 0;
            const salePrice = cleanPrice(getField(parent, 'Precio rebajado'));

            await prisma.productVariant.create({
                data: {
                    productId: product.id,
                    wooId: wooId,
                    sku: getField(parent, 'SKU') || null,
                    name: nombre,
                    price,
                    salePrice,
                    stock: parseInt(getField(parent, 'Inventario', 'Stock')) || 0,
                    manageStock: getField(parent, '¿En inventario?') === '1',
                    inStock: parseInt(getField(parent, 'Inventario', 'Stock')) > 0
                }
            });
            variantsCreated++;
        }

        // Create attributes if exist
        const attrName = getField(parent, 'Nombre del atributo 1');
        const attrValues = getField(parent, 'Valor(es) del atributo 1');
        if (attrName && attrValues) {
            const values = attrValues
                .split(',')
                .map(v => v.trim())
                .filter(v => v);

            await prisma.productAttribute.create({
                data: {
                    productId: product.id,
                    name: attrName,
                    values,
                    visible: true,
                    variation: true
                }
            });
        }
    }

    console.log(`\n📦 Processing ${variations.length} variations...\n`);

    for (const variation of variations) {
        const wooId = getProductId(variation);
        const nombre = getField(variation, 'Nombre', 'Name');

        if (!wooId) continue;

        // Check if already exists
        const existing = await prisma.productVariant.findUnique({ where: { wooId } });
        if (existing) {
            continue;
        }

        // Find parent product
        const parentRef = getField(variation, 'Superior', 'Parent'); // Format: "id:446"
        const parentWooId = parseInt(parentRef?.replace('id:', '') || '0');

        if (!parentWooId) {
            console.log(`   ⚠️  No parent for: ${nombre}`);
            continue;
        }

        const parentProduct = await prisma.product.findUnique({
            where: { wooId: parentWooId }
        });

        if (!parentProduct) {
            console.log(`   ⚠️  Parent not found for: ${nombre} (parent: ${parentWooId})`);
            continue;
        }

        // Parse weight from name or attribute
        const weightStr = getField(variation, 'Valor(es) del atributo 1') || '';
        const weight = parseWeight(weightStr);

        const price = cleanPrice(getField(variation, 'Precio normal')) || 0;
        const salePrice = cleanPrice(getField(variation, 'Precio rebajado'));

        await prisma.productVariant.create({
            data: {
                productId: parentProduct.id,
                wooId,
                sku: getField(variation, 'SKU') || null,
                name: nombre,
                price,
                salePrice,
                weight: weight?.display || null,
                weightValue: weight?.grams || null,
                stock: parseInt(getField(variation, 'Inventario', 'Stock')) || 0,
                manageStock: getField(variation, '¿En inventario?') === '1',
                inStock: parseInt(getField(variation, 'Inventario', 'Stock')) > 0,
                position: parseInt(getField(variation, 'Posición', 'Position')) || 0
            }
        });

        variantsCreated++;
    }


    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`   📂 Categories: ${categoryMap.size}`);
    console.log(`   ✅ Products created: ${productsCreated}`);
    console.log(`   ⏭️  Products skipped: ${productsSkipped}`);
    console.log(`   📦 Variants created: ${variantsCreated}`);
    console.log('='.repeat(50));
    console.log('\n✨ Seeding complete!\n');

    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
