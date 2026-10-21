export function optimizeImageUrl(baseUrl, options = {}) {
  // Si la URL ya tiene formato webp y compresión, usarla directamente
  if (baseUrl.includes('format=webp') && baseUrl.includes('compress')) {
    return baseUrl;
  }

  // Valores por defecto
  const defaults = {
    width: 1920,
    height: null,
    quality: 80,
    format: 'jpg', // Usar jpg en lugar de webp para mayor compatibilidad
    crop: null,
    fit: null,
    dpr: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  };

  // Combinar opciones
  const settings = { ...defaults, ...options };

  try {
    // Crear una nueva URL para manipularla más fácilmente
    const url = new URL(baseUrl);

    // Limpiar parámetros existentes conflictivos
    url.searchParams.delete('w');
    url.searchParams.delete('h');
    url.searchParams.delete('q');
    url.searchParams.delete('fm');
    url.searchParams.delete('fit');
    url.searchParams.delete('crop');
    url.searchParams.delete('auto');

    // Añadir parámetros nuevos
    url.searchParams.set('w', settings.width.toString());
    url.searchParams.set('q', settings.quality.toString());

    // Añadir altura si está especificada
    if (settings.height) {
      url.searchParams.set('h', settings.height.toString());
    }

    // Añadir formato específico en lugar de auto
    url.searchParams.set('fm', settings.format);

    // Fit y crop si están especificados
    if (settings.fit) {
      url.searchParams.set('fit', settings.fit);
    }

    if (settings.crop) {
      url.searchParams.set('crop', settings.crop);
    }

    // DPR para pantallas de alta densidad
    if (settings.dpr > 1) {
      url.searchParams.set('dpr', Math.min(settings.dpr, 2).toString());
    }

    return url.toString();
  } catch {
    const separator = baseUrl.includes('?') ? '&' : '?';
    const settings = { ...defaults, ...options };
    return `${baseUrl}${separator}w=${settings.width}&q=${settings.quality}&fm=${settings.format}`;
  }
}

export function verifyImageLoads(imageUrl, timeout = 10000) {
  return new Promise((resolve) => {
    const img = new Image();

    const cleanup = () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeout);

    // Configurar eventos
    img.onload = () => {
      cleanup();
      resolve(true);
    };

    img.onerror = () => {
      cleanup();
      resolve(false);
    };

    // Iniciar carga
    img.src = imageUrl;
  });
}

export function generateFallbackUrls(originalUrl) {
  try {
    const url = new URL(originalUrl);
    const alternativeUrls = [];

    // Alternativa 1: Cambiar webp por jpg
    if (url.searchParams.get('fm') === 'webp') {
      const jpgUrl = new URL(originalUrl);
      jpgUrl.searchParams.set('fm', 'jpg');
      alternativeUrls.push(jpgUrl.toString());
    }

    // Alternativa 2: Quitar parámetros de compresión
    const simpleUrl = new URL(originalUrl);
    simpleUrl.searchParams.delete('auto');
    simpleUrl.searchParams.set('fm', 'jpg');
    alternativeUrls.push(simpleUrl.toString());

    // Alternativa 3: Versión más simple solo con ancho y formato
    const minimalUrl = new URL(originalUrl);
    // Limpiar todos los parámetros
    Array.from(minimalUrl.searchParams.keys()).forEach((key) => {
      minimalUrl.searchParams.delete(key);
    });
    // Añadir solo los parámetros esenciales
    minimalUrl.searchParams.set('w', '1920');
    minimalUrl.searchParams.set('fm', 'jpg');
    alternativeUrls.push(minimalUrl.toString());

    return alternativeUrls;
  } catch {
    return [];
  }
}

export async function preloadImageWithFallbacks(primaryUrl) {
  // Intentar la URL primaria primero
  const primaryWorks = await verifyImageLoads(primaryUrl);
  if (primaryWorks) return primaryUrl;

  // Si falla, generar y probar alternativas
  const alternativeUrls = generateFallbackUrls(primaryUrl);

  // Probar cada alternativa secuencialmente
  for (const url of alternativeUrls) {
    const works = await verifyImageLoads(url);
    if (works) return url;
  }

  // Si todo falla, lanzar error
  throw new Error('No se pudo cargar la imagen con ninguna URL alternativa');
}
