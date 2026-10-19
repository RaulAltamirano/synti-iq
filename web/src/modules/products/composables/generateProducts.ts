interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  description: string;
  image: string[];
  isNew?: boolean;
  discount?: number;
  features?: string[];
}

// Array de imágenes de ejemplo
const sampleImages = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f',
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
  'https://images.unsplash.com/photo-1503602642458-232111445657',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  'https://images.unsplash.com/photo-1560393464-5c69a73c5770',
];

// Array de características de ejemplo
const sampleFeatures = [
  'Envío gratis',
  'Garantía de 2 años',
  'Producto ecológico',
  'Material premium',
  'Fabricación local',
  'Diseño exclusivo',
  'Resistente al agua',
  'Bajo consumo energético',
];

// Array de nombres de productos
const productNames = [
  'Auriculares Bluetooth',
  'Smartwatch Pro',
  'Cámara Digital',
  'Altavoz Portátil',
  'Mochila Táctica',
  'Zapatillas Deportivas',
  'Botella Térmica',
  'Lámpara LED',
  'Teclado Mecánico',
  'Mouse Gaming',
];

// Función para generar productos
export const generateProducts = (count: number = 50): Product[] => {
  return Array.from({ length: count }, (_, i) => {
    // Generar precio base
    const basePrice = parseFloat((Math.random() * 100 + 20).toFixed(2));

    // Decidir si el producto tiene descuento (30% de probabilidad)
    const hasDiscount = Math.random() < 0.3;
    const discount = hasDiscount ? Math.floor(Math.random() * 30 + 10) : undefined;

    // Calcular precio antiguo si hay descuento
    const oldPrice = hasDiscount ? basePrice : undefined;
    const price = hasDiscount
      ? parseFloat((basePrice * (1 - discount! / 100)).toFixed(2))
      : basePrice;

    // Seleccionar imágenes aleatorias (2-3 imágenes por producto)
    const numImages = Math.floor(Math.random() * 2) + 2;
    const shuffledImages = [...sampleImages].sort(() => Math.random() - 0.5);
    const images = shuffledImages.slice(0, numImages);

    // Generar características aleatorias (2-4 características)
    const numFeatures = Math.floor(Math.random() * 3) + 2;
    const features = [...sampleFeatures].sort(() => Math.random() - 0.5).slice(0, numFeatures);

    // Seleccionar nombre aleatorio
    const productName = productNames[Math.floor(Math.random() * productNames.length)];

    return {
      id: i + 1,
      name: `${productName} ${i + 1}`,
      price,
      oldPrice,
      rating: Math.round(Math.random() * 5),
      reviews: Math.floor(Math.random() * 500),
      description: `${productName} de alta calidad. Este producto ofrece una excelente relación calidad-precio y está diseñado para satisfacer las necesidades más exigentes.`,
      image: images,
      isNew: Math.random() < 0.2,
      discount,
      features,
    };
  });
};

// Ejemplo de uso:
// const products = generateProducts(50); // Genera 50 productos
// const products = generateProducts(100); // Genera 100 productos
export default generateProducts;
