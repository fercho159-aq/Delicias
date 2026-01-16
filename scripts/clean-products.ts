import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanProducts() {
    console.log('🔍 Buscando categorías...\n');

    // Get all categories
    const categories = await prisma.category.findMany({
        include: {
            _count: { select: { products: true } }
        }
    });

    console.log('📂 Categorías encontradas:');
    categories.forEach(cat => {
        console.log(`  - ${cat.name} (slug: ${cat.slug}) - ${cat._count.products} productos`);
    });

    // Categories to keep (by slug)
    const categoriesToKeep = ['cajas-de-regalo', 'paquetes', 'canasta'];

    // Find categories to keep
    const keepCategories = await prisma.category.findMany({
        where: {
            slug: { in: categoriesToKeep }
        }
    });

    const keepCategoryIds = keepCategories.map(c => c.id);

    console.log('\n✅ Categorías a mantener:');
    keepCategories.forEach(cat => {
        console.log(`  - ${cat.name} (ID: ${cat.id})`);
    });

    // Count products before deletion
    const productsToDelete = await prisma.product.count({
        where: {
            OR: [
                { categoryId: { notIn: keepCategoryIds } },
                { categoryId: null }
            ]
        }
    });

    const productsToKeep = await prisma.product.count({
        where: {
            categoryId: { in: keepCategoryIds }
        }
    });

    console.log(`\n📊 Resumen:`);
    console.log(`  - Productos a eliminar: ${productsToDelete}`);
    console.log(`  - Productos a mantener: ${productsToKeep}`);

    // Confirm deletion
    console.log('\n⚠️  Eliminando productos...');

    // Delete related data first (order matters due to foreign keys)
    // 1. Delete order items for products being deleted
    await prisma.orderItem.deleteMany({
        where: {
            variant: {
                product: {
                    OR: [
                        { categoryId: { notIn: keepCategoryIds } },
                        { categoryId: null }
                    ]
                }
            }
        }
    });

    // 2. Delete cart items for variants of products being deleted
    await prisma.cartItem.deleteMany({
        where: {
            variant: {
                product: {
                    OR: [
                        { categoryId: { notIn: keepCategoryIds } },
                        { categoryId: null }
                    ]
                }
            }
        }
    });

    // 3. Delete product variants
    await prisma.productVariant.deleteMany({
        where: {
            product: {
                OR: [
                    { categoryId: { notIn: keepCategoryIds } },
                    { categoryId: null }
                ]
            }
        }
    });

    // 4. Delete product images
    await prisma.productImage.deleteMany({
        where: {
            product: {
                OR: [
                    { categoryId: { notIn: keepCategoryIds } },
                    { categoryId: null }
                ]
            }
        }
    });

    // 5. Delete products
    const deleted = await prisma.product.deleteMany({
        where: {
            OR: [
                { categoryId: { notIn: keepCategoryIds } },
                { categoryId: null }
            ]
        }
    });

    console.log(`\n✅ ${deleted.count} productos eliminados exitosamente.`);

    // Final count
    const finalCount = await prisma.product.count();
    console.log(`\n📦 Total de productos restantes: ${finalCount}`);

    // Delete empty categories
    const emptyCategories = await prisma.category.findMany({
        where: {
            products: { none: {} },
            slug: { notIn: categoriesToKeep }
        }
    });

    if (emptyCategories.length > 0) {
        console.log('\n🗑️  Eliminando categorías vacías:');
        emptyCategories.forEach(cat => console.log(`  - ${cat.name}`));

        await prisma.category.deleteMany({
            where: {
                id: { in: emptyCategories.map(c => c.id) }
            }
        });
    }

    await prisma.$disconnect();
    console.log('\n✨ Limpieza completada!');
}

cleanProducts().catch(console.error);
