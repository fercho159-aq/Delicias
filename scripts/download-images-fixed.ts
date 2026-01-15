
import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename, extname } from 'path';

// Helper functions copied from seed-products.ts for consistency
interface WooProduct {
    [key: string]: string;
}

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
        .replace(/^-+|-+$/g, '')
        .substring(0, 60);
}

const CSV_PATH = join(process.cwd(), 'productos de wordpress.csv');
const OUTPUT_DIR = join(process.cwd(), 'public', 'products');
const MAPPING_FILE = join(process.cwd(), 'scripts', 'image-mapping-fixed.json');

async function downloadImage(url: string, outputPath: string): Promise<boolean> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        if (!response.ok) return false;

        const buffer = await response.arrayBuffer();
        writeFileSync(outputPath, Buffer.from(buffer));
        return true;
    } catch (error) {
        console.error(`Error downloading ${url}:`, error);
        return false;
    }
}

async function main() {
    console.log('🖼️  Las Delicias del Campo - Image Downloader (Fixed)\n');

    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('📄 Reading CSV file...');
    const csvContent = readFileSync(CSV_PATH, 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true
    }) as WooProduct[];

    const products = records.filter(r => {
        const type = getField(r, 'Tipo', 'Type');
        return type === 'variable' || type === 'simple';
    });

    console.log(`📦 Found ${products.length} products to process\n`);

    const imageMapping: Array<{
        productId: number;
        originalUrl: string;
        localPath: string;
        position: number;
    }> = [];

    let downloadedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
        const id = getProductId(product);
        const name = getField(product, 'Nombre', 'Name');
        const imagesStr = getField(product, 'Imágenes', 'Images', 'Imagenes');

        if (!id || !name || !imagesStr) continue;

        const slug = slugify(name);
        const urls = imagesStr.split(',').map(u => u.trim()).filter(u => u.startsWith('http'));

        console.log(`🔹 Processing: ${name} (ID: ${id})`);

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const ext = extname(new URL(url).pathname) || '.jpg';
            const filename = `${id}-${slug}-${i + 1}${ext}`;
            const localPath = `/products/${filename}`;
            const fullPath = join(OUTPUT_DIR, filename);

            if (existsSync(fullPath)) {
                console.log(`   ⏭️  Exists: ${filename}`);
                skippedCount++;
            } else {
                console.log(`   ⬇️  Downloading: ${filename}`);
                const success = await downloadImage(url, fullPath);
                if (success) {
                    downloadedCount++;
                } else {
                    console.error(`   ❌ Failed to download: ${url}`);
                    continue;
                }
                // Small delay to be nice
                await new Promise(r => setTimeout(r, 100));
            }

            imageMapping.push({
                productId: id,
                originalUrl: url,
                localPath,
                position: i
            });
        }
    }

    console.log('\n💾 Saving image mapping...');
    writeFileSync(MAPPING_FILE, JSON.stringify(imageMapping, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log('📊 DOWNLOAD SUMMARY');
    console.log('='.repeat(50));
    console.log(`   ✅ Downloaded: ${downloadedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   Mapped images: ${imageMapping.length}`);
    console.log('='.repeat(50));
}

main().catch(console.error);
