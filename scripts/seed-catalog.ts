import prisma from '../lib/prisma';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface VariantDef {
  name: string;
  price: number;
  weight: string;
}

interface ProductDef {
  name: string;
  variants: VariantDef[];
  images: string[];
}

interface CategoryDef {
  name: string;
  slug: string;
  products: ProductDef[];
}

const catalog: CategoryDef[] = [
  {
    name: 'Cacahuates',
    slug: 'cacahuates',
    products: [
      {
        name: 'Cacahuate Español',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['511-cacahuate-espanol-1.png', '511-cacahuate-espanol-2.png'],
      },
      {
        name: 'Cacahuate Español con Ajo',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['518-cacahuate-espanol-con-ajo-1.png', '518-cacahuate-espanol-con-ajo-2.png'],
      },
      {
        name: 'Cacahuate Salado',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['563-cacahuate-salado-1.png', '563-cacahuate-salado-2.png'],
      },
      {
        name: 'Cacahuate Enchilado',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['504-cacahuate-enchilado-1.png', '504-cacahuate-enchilado-2.png'],
      },
      {
        name: 'Cacahuate Garapiñado',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['569-cacahuate-garapinado-1.png', '569-cacahuate-garapinado-2.png'],
      },
      {
        name: 'Cacahuate Japonés',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['532-cacahuate-japones-1.png', '532-cacahuate-japones-2.png'],
      },
      {
        name: 'Cacahuate Holandés (Hot Nut)',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['525-cacahuate-holandes-hot-nut-1.png', '525-cacahuate-holandes-hot-nut-2.png'],
      },
      {
        name: 'Cacahuate Garapiñado c/Ajonjolí',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['576-cacahuate-garap-ajonjoli-1.png', '576-cacahuate-garap-ajonjoli-2.png'],
      },
      {
        name: 'Japonés Sabor Habanero',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['2043-japones-sabor-habanero-1.png'],
      },
      {
        name: 'Cacahuate Japonés c/Queso',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['544-cacahuate-japones-c-queso-chedar-1.png'],
      },
      {
        name: 'Cacahuate Japonés con Chipotle',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['535-cacahuate-japones-con-chipotle-1.png', '535-cacahuate-japones-con-chipotle-2.png'],
      },
      {
        name: 'Cacahuate Japonés Sabor Mango',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['551-cacahuate-japones-sabor-mango-1.png', '551-cacahuate-japones-sabor-mango-2.png'],
      },
      {
        name: 'Cacahuate Japonés Sabor Esquite',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['1881-cacahuate-holandes-sabor-esquite-1.png', '1881-cacahuate-holandes-sabor-esquite-2.png'],
      },
    ],
  },
  {
    name: 'Chocolate',
    slug: 'chocolate',
    products: [
      {
        name: 'Pretzel Cubierto de Chocolate',
        variants: [
          { name: '250 Gr', price: 65, weight: '250g' },
          { name: '1 KG', price: 250, weight: '1kg' },
        ],
        images: ['1885-pretzel-cubierto-de-chocolate-1.png', '1885-pretzel-cubierto-de-chocolate-2.png'],
      },
      {
        name: 'Almendra Confitada',
        variants: [
          { name: '250 Gr', price: 35, weight: '250g' },
          { name: '1 KG', price: 122, weight: '1kg' },
        ],
        images: ['454-almendra-confitada-1.png', '454-almendra-confitada-2.png'],
      },
      {
        name: 'Almendra con Chocolate',
        variants: [
          { name: '200 Gr', price: 50, weight: '200g' },
          { name: '1 KG', price: 250, weight: '1kg' },
        ],
        images: ['1660-almendra-con-chocolate-nueva-presentacion-1.png', '1660-almendra-con-chocolate-nueva-presentacion-2.png'],
      },
      {
        name: 'Pasa Cubierta de Chocolate',
        variants: [
          { name: '200 Gr', price: 28, weight: '200g' },
          { name: '1 KG', price: 130, weight: '1kg' },
        ],
        images: ['1524-pasas-cubiertas-de-chocolate-1.png'],
      },
      {
        name: 'Arándano Cubierto de Chocolate',
        variants: [
          { name: '250 Gr', price: 50, weight: '250g' },
          { name: '1 KG', price: 250, weight: '1kg' },
        ],
        images: ['1901-arandano-cubierto-de-chocolate-1.png'],
      },
      {
        name: 'Bombón de Chocolate',
        variants: [
          { name: '100 Gr', price: 30, weight: '100g' },
          { name: '1 KG', price: 300, weight: '1kg' },
        ],
        images: ['497-bombon-de-chocolate-1.png', '497-bombon-de-chocolate-2.png'],
      },
      {
        name: 'Galleta Cubierta de Chocolate Blanco',
        variants: [
          { name: '250 Gr', price: 30, weight: '250g' },
          { name: '1 KG', price: 150, weight: '1kg' },
        ],
        images: ['galleta-cubierta-de-chocolate-blanco-1.jpeg'],
      },
      {
        name: 'Galleta de Chocolate (Suspiros)',
        variants: [
          { name: '200 Gr', price: 28, weight: '200g' },
          { name: '1 KG', price: 130, weight: '1kg' },
        ],
        images: ['640-galleta-de-chocolate-suspiros-1.png', '640-galleta-de-chocolate-suspiros-2.png'],
      },
      {
        name: 'Café Entero Cubierto de Chocolate',
        variants: [
          { name: '250 Gr', price: 45, weight: '250g' },
          { name: '1 KG', price: 200, weight: '1kg' },
        ],
        images: ['1895-cafe-entero-cubierto-de-chocolate-1.png', '1895-cafe-entero-cubierto-de-chocolate-2.png'],
      },
      {
        name: 'Nuez de Chocolate',
        variants: [
          { name: '200 Gr', price: 60, weight: '200g' },
          { name: '1 KG', price: 280, weight: '1kg' },
        ],
        images: ['703-nuez-con-chocolate-1.png', '703-nuez-con-chocolate-2.png'],
      },
    ],
  },
  {
    name: 'Dulces',
    slug: 'dulces',
    products: [
      {
        name: 'Goma Aro Durazno',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['1334-goma-aro-durazno-1.png'],
      },
      {
        name: 'Goma Aro Manzana',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['1338-goma-aro-manzana-1.png'],
      },
      {
        name: 'Goma Acidita (Frutitas)',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['655-goma-acidita-frutitas-1.png', '655-goma-acidita-frutitas-2.png'],
      },
      {
        name: 'Goma de Chile c/Chamoy',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['658-goma-de-chile-con-chamoy-1.png', '658-goma-de-chile-con-chamoy-2.png'],
      },
      {
        name: 'Goma Jelly Beans',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['673-goma-jelly-beans-1.png', '673-goma-jelly-beans-2.png'],
      },
      {
        name: 'Goma de Dulce',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['661-goma-de-dulce-1.png', '661-goma-de-dulce-2.png'],
      },
      {
        name: 'Goma de Lombriz',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 100, weight: '1kg' },
        ],
        images: ['1684-goma-de-lombriz-nueva-presentacion-1.png', '1684-goma-de-lombriz-nueva-presentacion-2.png'],
      },
      {
        name: 'Tarugos',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['1197-tarugos-1.png', '1197-tarugos-2.png'],
      },
      {
        name: 'Lombriz Acidita',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['1676-lombriz-acidita-nueva-presentacion-1.png', '1676-lombriz-acidita-nueva-presentacion-2.png'],
      },
      {
        name: 'Goma Mangomita',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['670-goma-mangomita-1.png', '670-goma-mangomita-2.png'],
      },
      {
        name: 'Goma Moritas',
        variants: [
          { name: '200 Gr', price: 30, weight: '200g' },
          { name: '1 KG', price: 130, weight: '1kg' },
        ],
        images: ['664-goma-moritas-1.png', '664-goma-moritas-2.png'],
      },
      {
        name: 'Goma Mangomita / Tajín',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['1330-goma-mangomita-tajin-1.png'],
      },
      {
        name: 'Goma de Osito',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['1728-goma-de-oso-nueva-presentacion-1.png', '1728-goma-de-oso-nueva-presentacion-2.png'],
      },
      {
        name: 'Goma de Oso Enchilado',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['1688-goma-de-oso-enchilado-nueva-presentacion-1.png', '1688-goma-de-oso-enchilado-nueva-presentacion-2.png'],
      },
      {
        name: 'Goma de Tiburón',
        variants: [
          { name: '200 Gr', price: 30, weight: '200g' },
          { name: '1 KG', price: 180, weight: '1kg' },
        ],
        images: ['1680-goma-de-tiburon-nueva-presentacion-1.png', '1680-goma-de-tiburon-nueva-presentacion-2.png'],
      },
      {
        name: 'Tamachu (Bolitas de Tamarindo)',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['751-tamachu-bolitas-de-tamarindo-1.png', '751-tamachu-bolitas-de-tamarindo-2.png'],
      },
    ],
  },
  {
    name: 'Frutos Secos',
    slug: 'frutos-secos',
    products: [
      {
        name: 'Arándano Enchilado',
        variants: [
          { name: '200 Gr', price: 35, weight: '200g' },
          { name: '1 KG', price: 170, weight: '1kg' },
        ],
        images: ['490-arandano-enchilado-1.png', '490-arandano-enchilado-2.png'],
      },
      {
        name: 'Arándano Natural',
        variants: [
          { name: '200 Gr', price: 35, weight: '200g' },
          { name: '1 KG', price: 170, weight: '1kg' },
        ],
        images: ['475-arandano-natural-1.png', '475-arandano-natural-2.png'],
      },
      {
        name: 'Chabacano Deshidratado',
        variants: [
          { name: '200 Gr', price: 50, weight: '200g' },
          { name: '1 KG', price: 250, weight: '1kg' },
        ],
        images: ['590-chabacano-deshidratado-1.png', '590-chabacano-deshidratado-2.png'],
      },
      {
        name: 'Ciruela Sin Hueso',
        variants: [
          { name: '200 Gr', price: 30, weight: '200g' },
          { name: '1 KG', price: 140, weight: '1kg' },
        ],
        images: ['1201-ciruela-sin-hues-1.png', '1201-ciruela-sin-hues-2.png'],
      },
      {
        name: 'Fruta Mix Deshidratada (Mezcla) Cubos',
        variants: [
          { name: '200 Gr', price: 35, weight: '200g' },
          { name: '1 KG', price: 175, weight: '1kg' },
        ],
        images: ['637-fruta-mix-deshidratada-mezcla-cubos-1.png', '637-fruta-mix-deshidratada-mezcla-cubos-2.png'],
      },
      {
        name: 'Ciruela con Hueso',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 120, weight: '1kg' },
        ],
        images: ['1326-ciruela-con-hueso-1.png', '1326-ciruela-con-hueso-2.png'],
      },
      {
        name: 'Mango Enchilado',
        variants: [
          { name: '200 Gr', price: 50, weight: '200g' },
          { name: '1 KG', price: 200, weight: '1kg' },
        ],
        images: ['694-mango-enchilado-1.png', '694-mango-enchilado-2.png'],
      },
      {
        name: 'Orejón de Manzana Deshidratada',
        variants: [
          { name: '200 Gr', price: 35, weight: '200g' },
          { name: '1 KG', price: 170, weight: '1kg' },
        ],
        images: ['718-orejon-de-manzana-deshidratada-1.png', '718-orejon-de-manzana-deshidratada-2.png'],
      },
      {
        name: 'Fruta Mix Deshidratada (Mezcla)',
        variants: [
          { name: '200 Gr', price: 35, weight: '200g' },
          { name: '1 KG', price: 170, weight: '1kg' },
        ],
        images: ['1193-fruta-mix-deshidratada-mezcla-1.png', '1193-fruta-mix-deshidratada-mezcla-2.png'],
      },
      {
        name: 'Pasa Negra (Jumbo)',
        variants: [
          { name: '200 Gr', price: 20, weight: '200g' },
          { name: '1 KG', price: 90, weight: '1kg' },
        ],
        images: ['724-pasa-negra-jumbo-1.png'],
      },
      {
        name: 'Piña Enchilada',
        variants: [
          { name: '200 Gr', price: 60, weight: '200g' },
          { name: '1 KG', price: 300, weight: '1kg' },
        ],
        images: ['733-pina-enchilada-1.png', '733-pina-enchilada-2.png'],
      },
      {
        name: 'Plátano Enchilado Horneado',
        variants: [
          { name: '40 Gr', price: 39, weight: '40g' },
          { name: '1 KG', price: 200, weight: '1kg' },
        ],
        images: ['742-platano-enchilado-horneado-1.png', '742-platano-enchilado-horneado-2.png'],
      },
    ],
  },
  {
    name: 'Semillas',
    slug: 'semillas',
    products: [
      {
        name: 'Ajonjolí Garapiñado',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 120, weight: '1kg' },
        ],
        images: ['446-ajonjoli-garapinado-1.png', '446-ajonjoli-garapinado-2.png'],
      },
      {
        name: 'Garbanzo Enchilado',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 110, weight: '1kg' },
        ],
        images: ['643-garbanzo-enchilado-1.png', '643-garbanzo-enchilado-2.png'],
      },
      {
        name: 'Habas Enchiladas',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '900 Gr', price: 110, weight: '900g' },
        ],
        images: ['679-habas-enchiladas-1.png', '679-habas-enchiladas-2.png'],
      },
      {
        name: 'Habas Enchiladas en Hojuelas',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '1 KG', price: 150, weight: '1kg' },
        ],
        images: ['1347-habas-enchiladas-en-hojuelas-1.png'],
      },
      {
        name: 'Pepita Criolla c/Cáscara',
        variants: [
          { name: '200 Gr', price: 45, weight: '200g' },
          { name: '1 KG', price: 200, weight: '1kg' },
        ],
        images: ['727-pepita-criolla-con-cascara-1.png', '727-pepita-criolla-con-cascara-2.png'],
      },
      {
        name: 'Pepita Verde Horneada',
        variants: [
          { name: '200 Gr', price: 55, weight: '200g' },
          { name: '1 KG', price: 200, weight: '1kg' },
        ],
        images: ['1343-pepita-verde-frita-1.png', '1343-pepita-verde-frita-2.png'],
      },
    ],
  },
  {
    name: 'Nueces',
    slug: 'nueces',
    products: [
      {
        name: 'Almendra Entera',
        variants: [
          { name: '200 Gr', price: 55, weight: '200g' },
          { name: '1 KG', price: 250, weight: '1kg' },
        ],
        images: ['461-almendra-entera-1.png', '461-almendra-entera-2.png'],
      },
      {
        name: 'Almendra Fileteada',
        variants: [
          { name: '200 Gr', price: 65, weight: '200g' },
          { name: '1 KG', price: 260, weight: '1kg' },
        ],
        images: ['468-almendra-fileteada-1.png'],
      },
      {
        name: 'Nuez Entera',
        variants: [
          { name: '200 Gr', price: 70, weight: '200g' },
          { name: '1 KG', price: 330, weight: '1kg' },
        ],
        images: ['nuez-entera-1.jpeg'],
      },
      {
        name: 'Nuez en Pedazo',
        variants: [
          { name: '200 Gr', price: 60, weight: '200g' },
          { name: '1 KG', price: 285, weight: '1kg' },
        ],
        images: ['712-nuez-en-pedazo-1.png', '712-nuez-en-pedazo-2.png'],
      },
      {
        name: 'Nuez Garapiñada',
        variants: [
          { name: '200 Gr', price: 50, weight: '200g' },
          { name: '1 KG', price: 200, weight: '1kg' },
        ],
        images: ['700-nuez-garapinada-1.png', '700-nuez-garapinada-2.png'],
      },
      {
        name: 'Nuez de la India Horneada',
        variants: [
          { name: '200 Gr', price: 65, weight: '200g' },
          { name: '1 KG', price: 330, weight: '1kg' },
        ],
        images: ['706-nuez-de-la-india-horneada-sin-sal-1.png', '706-nuez-de-la-india-horneada-sin-sal-2.png'],
      },
      {
        name: 'Pistache Enchilado c/Ajo',
        variants: [
          { name: '200 Gr', price: 65, weight: '200g' },
          { name: '1 KG', price: 350, weight: '1kg' },
        ],
        images: ['739-pistache-enchilado-o-con-ajo-1.png', '739-pistache-enchilado-o-con-ajo-2.png'],
      },
      {
        name: 'Nuez Mixta (Mezcla de Nueces)',
        variants: [
          { name: '200 Gr', price: 50, weight: '200g' },
          { name: '1 KG', price: 200, weight: '1kg' },
        ],
        images: ['715-nuez-mixta-mezcla-de-nueces-1.png', '715-nuez-mixta-mezcla-de-nueces-2.png'],
      },
      {
        name: 'Almendra Enchilada',
        variants: [
          { name: '200 Gr', price: 65, weight: '200g' },
          { name: '1 KG', price: 260, weight: '1kg' },
        ],
        images: ['1723-almendra-enchilada-nueva-presentacion-1.png', '1723-almendra-enchilada-nueva-presentacion-2.png'],
      },
      {
        name: 'Pistache Natural',
        variants: [
          { name: '200 Gr', price: 70, weight: '200g' },
          { name: '1 KG', price: 330, weight: '1kg' },
        ],
        images: ['736-pistache-natural-1.png', '736-pistache-natural-2.png'],
      },
    ],
  },
  {
    name: 'Verduras Deshidratadas',
    slug: 'verduras-deshidratadas',
    products: [
      {
        name: 'Betabel Enchilado',
        variants: [
          { name: '60 Gr', price: 25, weight: '60g' },
          { name: '1 KG', price: 220, weight: '1kg' },
        ],
        images: ['760-betabel-enchilado-1.png'],
      },
      {
        name: 'Betabel Natural',
        variants: [
          { name: '60 Gr', price: 22, weight: '60g' },
          { name: '1 KG', price: 210, weight: '1kg' },
        ],
        images: ['757-betabel-natural-1.png'],
      },
      {
        name: 'Camote Enchilado',
        variants: [
          { name: '100 Gr', price: 20, weight: '100g' },
          { name: '1 KG', price: 210, weight: '1kg' },
        ],
        images: ['766-camote-enchilado-1.png'],
      },
      {
        name: 'Jícama Enchilada',
        variants: [
          { name: '60 Gr', price: 20, weight: '60g' },
          { name: '1 KG', price: 210, weight: '1kg' },
        ],
        images: ['772-jicama-enchilada-1.png'],
      },
      {
        name: 'Jícama Natural',
        variants: [
          { name: '60 Gr', price: 20, weight: '60g' },
          { name: '1 KG', price: 210, weight: '1kg' },
        ],
        images: ['769-jicama-natural-1.png'],
      },
      {
        name: 'Camote Natural',
        variants: [
          { name: '60 Gr', price: 20, weight: '60g' },
          { name: '1 KG', price: 210, weight: '1kg' },
        ],
        images: ['763-camote-natural-1.png'],
      },
      {
        name: 'Zanahoria Enchilada',
        variants: [
          { name: '60 Gr', price: 20, weight: '60g' },
          { name: '1 KG', price: 210, weight: '1kg' },
        ],
        images: ['778-zanahoria-enchilada-1.png'],
      },
      {
        name: 'Malanga Natural',
        variants: [
          { name: '60 Gr', price: 20, weight: '60g' },
          { name: '1 KG', price: 210, weight: '1kg' },
        ],
        images: ['781-malanga-natural-1.png'],
      },
      {
        name: 'Zanahoria Natural',
        variants: [
          { name: '60 Gr', price: 20, weight: '60g' },
          { name: '1 KG', price: 210, weight: '1kg' },
        ],
        images: ['775-zanahoria-natural-1.png'],
      },
      {
        name: 'Malanga Enchilada',
        variants: [
          { name: '60 Gr', price: 20, weight: '60g' },
          { name: '1 KG', price: 210, weight: '1kg' },
        ],
        images: ['784-malanga-enchilada-1.png'],
      },
      {
        name: 'Plátano Natural Horneado',
        variants: [
          { name: '200 Gr', price: 40, weight: '200g' },
          { name: '1 KG', price: 200, weight: '1kg' },
        ],
        images: ['745-platano-natural-horneado-1.png', '745-platano-natural-horneado-2.png'],
      },
      {
        name: 'Pepino Deshidratado Natural',
        variants: [
          { name: '60 Gr', price: 20, weight: '60g' },
          { name: '1 KG', price: 210, weight: '1kg' },
        ],
        images: ['pepino-deshidratado-natural-1.jpeg'],
      },
      {
        name: 'Pepino Deshidratado Limón y Sal',
        variants: [
          { name: '60 Gr', price: 20, weight: '60g' },
          { name: '1 KG', price: 210, weight: '1kg' },
        ],
        images: ['pepino-deshidratado-limon-y-sal-1.jpeg'],
      },
      {
        name: 'Pepino Deshidratado Enchilado',
        variants: [
          { name: '60 Gr', price: 60, weight: '60g' },
          { name: '1 KG', price: 210, weight: '1kg' },
        ],
        images: ['pepino-deshidratado-enchilado-1.jpeg'],
      },
    ],
  },
  {
    name: 'Mixes',
    slug: 'mixes',
    products: [
      {
        name: 'Churro Ajonjolí c/Chile',
        variants: [
          { name: '150 Gr', price: 20, weight: '150g' },
          { name: '800 Gr', price: 120, weight: '800g' },
        ],
        images: ['628-churro-amaranto-ajonjoli-chile-1.png'],
      },
      {
        name: 'Churro Ajonjolí Natural',
        variants: [
          { name: '200 Gr', price: 33, weight: '200g' },
          { name: '800 Gr', price: 110, weight: '800g' },
        ],
        images: ['624-churro-amaranto-ajonjoli-nat-1.png'],
      },
      {
        name: 'Churro Chipotle',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '800 Gr', price: 110, weight: '800g' },
        ],
        images: ['631-churro-chipotle-1.png', '631-churro-chipotle-2.png'],
      },
      {
        name: 'Cacahuate Mix',
        variants: [
          { name: '200 Gr', price: 35, weight: '200g' },
          { name: '1 KG', price: 170, weight: '1kg' },
        ],
        images: ['557-cacahuate-mix-1.png'],
      },
      {
        name: 'Churro Mix Natural (Mezcla)',
        variants: [
          { name: '200 Gr', price: 35, weight: '200g' },
          { name: '1 KG', price: 170, weight: '1kg' },
        ],
        images: ['617-churro-mix-nat-mezcla-1.png', '617-churro-mix-nat-mezcla-2.png'],
      },
      {
        name: 'Churro Mix Chile (Mezcla)',
        variants: [
          { name: '200 Gr', price: 35, weight: '200g' },
          { name: '1 KG', price: 170, weight: '1kg' },
        ],
        images: ['611-churro-mix-chile-mezcla-1.png', '611-churro-mix-chile-mezcla-2.png'],
      },
      {
        name: 'Churro Piquín',
        variants: [
          { name: '200 Gr', price: 25, weight: '200g' },
          { name: '800 Gr', price: 110, weight: '800g' },
        ],
        images: ['1497-churro-piquin-1.png'],
      },
      {
        name: 'Maíz Pozolero Enchilado',
        variants: [
          { name: '200 Gr', price: 40, weight: '200g' },
          { name: '1 KG', price: 190, weight: '1kg' },
        ],
        images: ['682-maiz-pozolero-enchilado-1.png', '682-maiz-pozolero-enchilado-2.png'],
      },
      {
        name: 'Maíz Pozolero c/Queso Chedar',
        variants: [
          { name: '200 Gr', price: 35, weight: '200g' },
          { name: '1 KG', price: 170, weight: '1kg' },
        ],
        images: ['688-maiz-pozolero-con-queso-chedar-1.png', '688-maiz-pozolero-con-queso-chedar-2.png'],
      },
      {
        name: 'Maíz Pozolero Saladito',
        variants: [
          { name: '200 Gr', price: 35, weight: '200g' },
          { name: '1 KG', price: 170, weight: '1kg' },
        ],
        images: ['691-maiz-pozolero-saladito-1.png', '691-maiz-pozolero-saladito-2.png'],
      },
    ],
  },
];

async function main() {
  console.log('Seeding catalog products...\n');

  let totalProducts = 0;
  let totalVariants = 0;

  for (const cat of catalog) {
    // Upsert category
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    console.log(`Category: ${category.name} (id: ${category.id})`);

    for (const prod of cat.products) {
      const slug = generateSlug(prod.name);

      // Check if product already exists
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) {
        console.log(`  SKIP (exists): ${prod.name}`);
        continue;
      }

      const product = await prisma.product.create({
        data: {
          name: prod.name,
          slug,
          type: 'VARIABLE',
          status: 'ACTIVE',
          categoryId: category.id,
          variants: {
            create: prod.variants.map((v, i) => ({
              name: v.name,
              price: v.price,
              weight: v.weight,
              stock: 100,
              position: i,
            })),
          },
          images: {
            create: prod.images.map((img, i) => ({
              url: `/products/${img}`,
              alt: prod.name,
              position: i,
            })),
          },
        },
      });

      totalProducts++;
      totalVariants += prod.variants.length;
      console.log(`  + ${prod.name} (id: ${product.id}, ${prod.variants.length} variants, ${prod.images.length} images)`);
    }
  }

  console.log(`\nDone! Created ${totalProducts} products with ${totalVariants} variants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
