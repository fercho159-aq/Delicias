/**
 * Script to download product images from WooCommerce export
 * and save them locally in public/products directory
 * 
 * Run with: bun run scripts/download-images.ts
 */

import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

const CSV_PATH = join(process.cwd(), 'productos de wordpress.csv');
const OUTPUT_DIR = join(process.cwd(), 'public', 'products');
const MAPPING_FILE = join(process.cwd(), 'scripts', 'image-mapping.json');

interface WooProduct {
    ID: string;
    Tipo: string;
    Nombre: string;
    Imágenes: string;
    Categorías: string;
}

interface ImageMapping {
    originalUrl: string;
    localPath: string;
    productId: string;
    productName: string;
}

async function downloadImage(url: string, outputPath: string): Promise<boolean> {
    try {
        console.log(`  Downloading: ${basename(url)}`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            console.error(`    Failed to download: ${response.status} ${response.statusText}`);
            return false;
        }

        const buffer = await response.arrayBuffer();
        writeFileSync(outputPath, Buffer.from(buffer));
        console.log(`    Saved to: ${outputPath}`);
        return true;
    } catch (error) {
        console.error(`    Error downloading ${url}:`, error);
        return false;
    }
}

function sanitizeFileName(url: string, productId: string, index: number): string {
    const extension = url.split('.').pop()?.split('?')[0] || 'png';
    const name = basename(url).split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${productId}-${index}-${name.substring(0, 50)}.${extension}`;
}

async function main() {
    console.log('🖼️  Las Delicias del Campo - Image Downloader\n');

    // Ensure output directory exists
    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`📁 Created directory: ${OUTPUT_DIR}\n`);
    }

    // Read and parse CSV
    console.log('📄 Reading CSV file...');
    const csvContent = readFileSync(CSV_PATH, 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true
    }) as WooProduct[];

    console.log(`   Found ${records.length} records\n`);

    // Filter products with images (variable and simple types only, not variations)
    const productsWithImages = records.filter(
        r => r.Imágenes && r.Imágenes.trim() && (r.Tipo === 'variable' || r.Tipo === 'simple')
    );

    console.log(`📦 Products with images: ${productsWithImages.length}\n`);

    const imageMapping: ImageMapping[] = [];
    let downloadedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const product of productsWithImages) {
        console.log(`\n🔸 ${product.ID}: ${product.Nombre}`);

        // Parse image URLs (comma-separated)
        const imageUrls = product.Imágenes
            .split(',')
            .map(url => url.trim())
            .filter(url => url.startsWith('http'));

        for (let i = 0; i < imageUrls.length; i++) {
            const url = imageUrls[i];
            const fileName = sanitizeFileName(url, product.ID, i + 1);
            const outputPath = join(OUTPUT_DIR, fileName);
            const localPath = `/products/${fileName}`;

            // Check if file already exists
            if (existsSync(outputPath)) {
                console.log(`  ⏭️  Skipping (exists): ${fileName}`);
                skippedCount++;
                imageMapping.push({
                    originalUrl: url,
                    localPath,
                    productId: product.ID,
                    productName: product.Nombre
                });
                continue;
            }

            // Download image
            const success = await downloadImage(url, outputPath);

            if (success) {
                downloadedCount++;
                imageMapping.push({
                    originalUrl: url,
                    localPath,
                    productId: product.ID,
                    productName: product.Nombre
                });
            } else {
                failedCount++;
            }

            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Save image mapping
    console.log('\n\n💾 Saving image mapping...');
    writeFileSync(MAPPING_FILE, JSON.stringify(imageMapping, null, 2));
    console.log(`   Saved to: ${MAPPING_FILE}`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`   ✅ Downloaded: ${downloadedCount}`);
    console.log(`   ⏭️  Skipped (existing): ${skippedCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log(`   📁 Total in mapping: ${imageMapping.length}`);
    console.log('='.repeat(50));
    console.log('\n✨ Done!\n');
}

main().catch(console.error);
