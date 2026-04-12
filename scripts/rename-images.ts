/**
 * Script to rename downloaded images using product names
 * and generate a proper mapping file
 * 
 * Run with: bun run scripts/rename-images.ts
 */

import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync, existsSync, renameSync, readdirSync } from 'fs';
import { join, basename, extname } from 'path';

const CSV_PATH = join(process.cwd(), 'productos de wordpress.csv');
const OUTPUT_DIR = join(process.cwd(), 'public', 'products');
const MAPPING_FILE = join(process.cwd(), 'scripts', 'image-mapping-fixed.json');

interface ProductRecord {
    [key: string]: string;
}

interface ImageMapping {
    productId: number;
    productName: string;
    originalUrl: string;
    localPath: string;
    category: string;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 60);
}

async function main() {
    console.log('🔄 Las Delicias del Campo - Image Renamer\n');

    // Read CSV
    console.log('📄 Reading CSV file...');
    const csvContent = readFileSync(CSV_PATH, 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true
    }) as ProductRecord[];

    console.log(`   Found ${records.length} records\n`);

    // Get products with images
    const productsWithImages = records.filter(r => {
        const images = r['Imágenes'] || r['Imagenes'] || '';
        const type = r['Tipo'] || r['Type'] || '';
        return images.trim() && (type === 'variable' || type === 'simple');
    });

    console.log(`📦 Products with images: ${productsWithImages.length}\n`);

    // Get existing files
    const existingFiles = readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    console.log(`📁 Existing files: ${existingFiles.length}\n`);

    const imageMapping: ImageMapping[] = [];
    let renamedCount = 0;

    for (const product of productsWithImages) {
        // Get product ID from first column (may have different names)
        const id = parseInt(Object.values(product)[0]) || 0;
        const name = product['Nombre'] || product['Name'] || '';
        const images = product['Imágenes'] || product['Imagenes'] || '';
        const category = product['Categorías'] || product['Categories'] || '';

        if (!name || !images) continue;

        const slug = slugify(name);
        const imageUrls = images.split(',').map(u => u.trim()).filter(u => u.startsWith('http'));

        console.log(`🔸 ${id}: ${name}`);

        for (let i = 0; i < imageUrls.length; i++) {
            const url = imageUrls[i];
            const originalName = basename(url).split('?')[0];
            const ext = extname(originalName) || '.png';

            // Generate new filename
            const newFileName = `${id}-${slug}-${i + 1}${ext}`;
            const newPath = join(OUTPUT_DIR, newFileName);
            const localPath = `/products/${newFileName}`;

            // Find matching old file with 'undefined' prefix
            const oldFileName = existingFiles.find(f => {
                const urlBasename = basename(url).split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
                return f.includes(`undefined-${i + 1}-`) && f.includes(urlBasename.substring(0, 20));
            });

            if (oldFileName) {
                const oldPath = join(OUTPUT_DIR, oldFileName);
                if (!existsSync(newPath)) {
                    renameSync(oldPath, newPath);
                    console.log(`   ✅ Renamed: ${oldFileName} → ${newFileName}`);
                    renamedCount++;
                } else {
                    console.log(`   ⏭️ Already exists: ${newFileName}`);
                }
            }

            imageMapping.push({
                productId: id,
                productName: name,
                originalUrl: url,
                localPath,
                category
            });
        }
    }

    // Save mapping
    console.log('\n💾 Saving image mapping...');
    writeFileSync(MAPPING_FILE, JSON.stringify(imageMapping, null, 2));
    console.log(`   Saved to: ${MAPPING_FILE}`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`   🔄 Renamed: ${renamedCount}`);
    console.log(`   📁 Total mappings: ${imageMapping.length}`);
    console.log('='.repeat(50));
    console.log('\n✨ Done!\n');
}

main().catch(console.error);
