import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    take: 5,
    include: {
      images: true
    }
  });

  console.log('--- Revisión de Imágenes de Productos ---');
  products.forEach(p => {
    console.log(`Producto: ${p.name}`);
    console.log('Imágenes:', p.images);
    console.log('---');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
