// src/config/api.js

// Configuración centralizada de APIs
export const apiConfigUnsplash = {
  // En un entorno real, esto vendría de variables de entorno
  UNSPLASH_ACCESS_KEY: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'YOUR_FALLBACK_KEY',

  // Configuración por defecto para fetch
  defaultFetchOptions: {
    headers: {
      'Content-Type': 'application/json',
    },
    // Timeout por defecto
    timeout: 10000,
  },

  // Función para detectar errores de API
  isSuccessResponse(response) {
    return response && response.ok && response.status >= 200 && response.status < 300;
  },
};

// Configuración de cache para imágenes
export const imageConfig = {
  // Estrategia de cacheo
  cacheControl: 'public, max-age=86400', // 24 horas

  // Formatos preferidos
  preferredFormats: ['webp', 'avif', 'jpeg'],

  // Tamaños predefinidos
  sizes: {
    thumbnail: 300,
    small: 640,
    medium: 1024,
    large: 1920,
  },
};
