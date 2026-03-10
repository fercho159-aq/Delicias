import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const paquetes = [
  { slug: 'paquete-individual', imageFolder: 'paquete individual' },
  { slug: 'combo-chocolate-lover', imageFolder: 'Combo Chocolate Lover' },
  { slug: 'combo-enchilado-power', imageFolder: 'Combo Enchilado Power' },
  { slug: 'combo-fit-natural', imageFolder: 'Combo Fit Natural' },
  { slug: 'combo-energia-del-campo', imageFolder: 'Combo Energía del Campo' },
  { slug: 'combo-familiar-grande', imageFolder: 'Combo Familiar Grande' },
  { slug: 'combo-fiesta', imageFolder: 'Combo fiesta' },
];

function copyImages(imageFolder: string, slug: string): string[] {
  const srcDir = path.join(process.cwd(), 'public', 'paquetes', imageFolder);
  const destDir = path.join(process.cwd(), 'public', 'images', 'paquetes', slug);

  if (!fs.existsSync(srcDir)) {
    console.log(`  No image folder found: ${srcDir}`);
    return [];
  }

  // Clean destination
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
  }
  fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  files.sort();

  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const ext = path.extname(files[i]).toLowerCase();
    const newName = `${slug}-${i + 1}${ext}`;
    fs.copyFileSync(path.join(srcDir, files[i]), path.join(destDir, newName));
    urls.push(`/images/paquetes/${slug}/${newName}`);
  }

  return urls;
}

async function main() {
  for (const paq of paquetes) {
    console.log(`\nUpdating images for: ${paq.slug}...`);

    const product = await prisma.product.findUnique({
      where: { slug: paq.slug },
      include: { images: true },
    });

    if (!product) {
      console.log(`  Product not found, skipping.`);
      continue;
    }

    // Copy new images
    const imageUrls = copyImages(paq.imageFolder, paq.slug);
    console.log(`  Copied ${imageUrls.length} images.`);

    // Delete old images from DB
    await prisma.productImage.deleteMany({
      where: { productId: product.id },
    });
    console.log(`  Deleted ${product.images.length} old image records.`);

    // Create new image records
    await prisma.productImage.createMany({
      data: imageUrls.map((url, i) => ({
        productId: product.id,
        url,
        alt: `${product.name} - imagen ${i + 1}`,
        position: i,
      })),
    });
    console.log(`  Created ${imageUrls.length} new image records.`);
  }

  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
