import prisma from '@/lib/prisma';

// Default values used as fallbacks
const DEFAULTS: Record<string, string> = {
    'whatsapp_number': '5215519915154',
    'shipping_cost': '150',
    'free_shipping_threshold': '999',
    'store_name': 'Las Delicias del Campo',
};

export async function getConfig(key: string): Promise<string> {
    const config = await prisma.siteConfig.findUnique({ where: { key } });
    return config?.value ?? DEFAULTS[key] ?? '';
}

export async function getConfigs(keys: string[]): Promise<Record<string, string>> {
    const configs = await prisma.siteConfig.findMany({
        where: { key: { in: keys } }
    });
    const result: Record<string, string> = {};
    for (const key of keys) {
        const found = configs.find(c => c.key === key);
        result[key] = found?.value ?? DEFAULTS[key] ?? '';
    }
    return result;
}
