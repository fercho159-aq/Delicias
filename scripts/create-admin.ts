import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    const email = process.argv[2] || 'admin@lasdeliciasdelcampo.com';
    const password = process.argv[3] || 'Admin123!';

    console.log('🔐 Creando usuario administrador...\n');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email }
    });

    if (existingAdmin) {
        console.log(`⚠️  El usuario ${email} ya existe.`);

        // Update to admin if not already
        if (existingAdmin.role !== 'ADMIN' && existingAdmin.role !== 'SUPER_ADMIN') {
            await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' }
            });
            console.log('✅ Rol actualizado a ADMIN');
        }

        // Update password
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.update({
            where: { email },
            data: { passwordHash: hashedPassword }
        });
        console.log('✅ Contraseña actualizada');

    } else {
        // Create new admin
        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                firstName: 'Admin',
                lastName: 'Principal',
                role: 'ADMIN'
            }
        });

        console.log('✅ Usuario administrador creado exitosamente');
    }

    console.log('\n📋 Credenciales:');
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password}`);
    console.log('\n🌐 Accede a: http://localhost:3000/admin/login');

    await prisma.$disconnect();
}

createAdmin().catch(console.error);
