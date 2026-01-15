
import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();
const MAPPING_FILE = join(process.cwd(), 'scripts', 'image-mapping-fixed.json');

async function main() {
    console.log('🔄 Updating Product Images in Database...\n');

    if (!existsSync(MAPPING_FILE)) {
        console.error('❌ Mapping file not found!');
        process.exit(1);
    }

    const mapping = JSON.parse(readFileSync(MAPPING_FILE, 'utf-8'));
    console.log(`📄 Loaded ${mapping.length} image mappings`);

    // Group images by productId
    const imagesByProduct = new Map<number, typeof mapping>();
    for (const item of mapping) {
        const list = imagesByProduct.get(item.productId) || [];
        list.push(item);
        imagesByProduct.set(item.productId, list);
    }

    console.log(`📦 Found images for ${imagesByProduct.size} products\n`);

    let updatedCount = 0;

    for (const [wooId, images] of imagesByProduct.entries()) {
        const product = await prisma.product.findUnique({
            where: { wooId }
        });

        if (!product) {
            console.log(`⚠️  Product not found: ${wooId}`);
            continue;
        }

        // Delete existing images
        await prisma.productImage.deleteMany({
            where: { productId: product.id }
        });

        // Insert new images
        await prisma.productImage.createMany({
            data: images.map((img: any, index: number) => ({
                productId: product.id,
                url: img.localPath,
                localPath: img.localPath,
                position: index
            }))
        });

        console.log(`✅ Updated images for: ${product.name} (${images.length} images)`);
        updatedCount++;
    }

    console.log(`\n✨ Successfully updated images for ${updatedCount} products!`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
