import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const paquetes = [
  {
    name: 'Paquete Individual',
    slug: 'paquete-individual',
    price: 250,
    description: 'Combo antojo clásico: Cacahuate (200gr x2), Ajonjolí garapiñado (200gr), Arándano enchilado (200gr), Cacahuate mix (200gr).',
    items: [
      'Cacahuate x2 (200 gr)',
      'Ajonjolí garapiñado (200 gr)',
      'Arándano enchilado (200 gr)',
      'Cacahuate mix (200 gr)',
    ],
    imageFolder: 'paquete individual',
  },
  {
    name: 'Combo Chocolate Lover',
    slug: 'combo-chocolate-lover',
    price: 379,
    description: 'Para los amantes del chocolate: Almendra con chocolate (250g), Arándano con chocolate (250g), Bombón cubierto de chocolate (250g), Mix dulce especial Choco Oreo (250g), Cacahuate japonés (250g).',
    items: [
      'Almendra con chocolate (250g)',
      'Arándano con chocolate (250g)',
      'Bombón cubierto de chocolate (250g)',
      'Mix dulce especial - Choco Oreo (250g)',
      'Cacahuate japonés (250g)',
    ],
    imageFolder: 'Combo Chocolate Lover',
  },
  {
    name: 'Combo Enchilado Power',
    slug: 'combo-enchilado-power',
    price: 299,
    description: 'Para los que les gusta el picante: Cacahuate con Ajo (200gr), Cacahuate Adobado (200gr), Betabel Enchilado (200gr), Arándano enchilado (200gr), Almendra enchilada (200gr).',
    items: [
      'Cacahuate con Ajo (200 gr)',
      'Cacahuate Adobado (200 gr)',
      'Betabel Enchilado (200 gr)',
      'Arándano enchilado (200 gr)',
      'Almendra enchilada (200 gr)',
    ],
    imageFolder: 'Combo Enchilado Power',
  },
  {
    name: 'Combo Fit Natural',
    slug: 'combo-fit-natural',
    price: 329,
    description: 'Snacks naturales y saludables: Betabel natural (250gr), Plátano horneado (250gr), Mix semillas natural - Nuez Mixta (250gr), Arándano natural (250gr), Ajonjolí natural (250gr).',
    items: [
      'Betabel natural (250 gr)',
      'Plátano horneado (250 gr)',
      'Mix semillas natural - Nuez Mixta (250 gr)',
      'Arándano natural (250 gr)',
      'Ajonjolí natural (250 gr)',
    ],
    imageFolder: 'Combo Fit Natural',
  },
  {
    name: 'Combo Energía del Campo',
    slug: 'combo-energia-del-campo',
    price: 359,
    description: 'Energía premium: Almendra natural (250gr), Nuez mixta (250gr), Pistache (250gr), Arándano natural (250gr), Plátano horneado (250gr).',
    items: [
      'Almendra natural (250 gr)',
      'Nuez mixta (250 gr)',
      'Pistache (250 gr)',
      'Arándano natural (250 gr)',
      'Plátano horneado (250 gr)',
    ],
    imageFolder: 'Combo Energía del Campo',
  },
  {
    name: 'Combo Familiar Grande',
    slug: 'combo-familiar-grande',
    price: 649,
    description: 'Paquete familiar con 8 productos en presentación de 500gr: Cacahuate Japonés, Cacahuate Español, Cacahuate con Ajo, Cacahuate Garapiñado, Almendra chocolate, Arándano enchilado, Mix botana grande (papa), Producto sorpresa del mes (patatina).',
    items: [
      'Cacahuate Japonés (500 gr)',
      'Cacahuate Español (500 gr)',
      'Cacahuate español con Ajo (500 gr)',
      'Cacahuate Garapiñado (500 gr)',
      'Almendra chocolate (500 gr)',
      'Arándano enchilado (500 gr)',
      'Mix botana grande - papa (500 gr)',
      'Producto sorpresa del mes - patatina (500 gr)',
    ],
    imageFolder: 'Combo Familiar Grande',
  },
  {
    name: 'Combo Fiesta',
    slug: 'combo-fiesta',
    price: 799,
    description: 'El paquete más grande para fiestas y reuniones: Cacahuate Japonés, Español, con Ajo, Garapiñado, Queso y Esquite (500gr c/u), Cheto de Queso (1kg), Fritura Natural (1kg), Almendra chocolate (500gr), Ajonjolí garapiñado (500gr), Arándano enchilado (500gr).',
    items: [
      'Cacahuate Japonés (500 gr)',
      'Cacahuate Español (500 gr)',
      'Cacahuate español con Ajo (500 gr)',
      'Cacahuate Garapiñado (500 gr)',
      'Cacahuate Queso (500 gr)',
      'Cacahuate Esquite (500 gr)',
      'Cheto de Queso (1 kg)',
      'Fritura Natural (1 kg)',
      'Almendra chocolate (500 gr)',
      'Ajonjolí garapiñado (500 gr)',
      'Arándano enchilado (500 gr)',
    ],
    imageFolder: 'Combo fiesta',
  },
];

async function copyImages(imageFolder: string, slug: string): Promise<string[]> {
  const srcDir = path.join(process.cwd(), 'public', 'paquetes', imageFolder);
  const destDir = path.join(process.cwd(), 'public', 'images', 'paquetes', slug);

  if (!fs.existsSync(srcDir)) {
    console.log(`  No image folder found: ${srcDir}`);
    return [];
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
  console.log('Creating/finding category "Paquetes y Combos"...');

  let category = await prisma.category.findUnique({
    where: { slug: 'paquetes-y-combos' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Paquetes y Combos',
        slug: 'paquetes-y-combos',
        description: 'Combos y paquetes armados con los mejores productos de Las Delicias del Campo.',
      },
    });
    console.log('  Category created:', category.id);
  } else {
    console.log('  Category exists:', category.id);
  }

  for (const paq of paquetes) {
    console.log(`\nProcessing: ${paq.name}...`);

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { slug: paq.slug },
    });

    if (existing) {
      console.log(`  Already exists (id: ${existing.id}), skipping.`);
      continue;
    }

    // Copy images
    let imageUrls: string[] = [];
    if (paq.imageFolder) {
      imageUrls = await copyImages(paq.imageFolder, paq.slug);
      console.log(`  Copied ${imageUrls.length} images.`);
    }

    // Build short description from items
    const shortDesc = paq.items.join(' | ');

    // Create product with variant and images
    const product = await prisma.product.create({
      data: {
        name: paq.name,
        slug: paq.slug,
        description: paq.description,
        shortDescription: shortDesc,
        type: 'SIMPLE',
        status: 'ACTIVE',
        featured: true,
        categoryId: category.id,
        tags: ['paquete', 'combo'],
        variants: {
          create: {
            name: paq.name,
            price: paq.price,
            stock: 50,
            manageStock: true,
            sku: paq.slug,
          },
        },
        images: {
          create: imageUrls.map((url, i) => ({
            url,
            alt: `${paq.name} - imagen ${i + 1}`,
            position: i,
          })),
        },
      },
    });

    console.log(`  Created product id: ${product.id}`);
  }

  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
