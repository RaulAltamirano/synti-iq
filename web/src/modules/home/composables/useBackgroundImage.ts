import { ref } from 'vue';
import { preloadImageWithFallbacks } from '../utils/optimizeImageUrl';
import { useUnsplashService } from './useUnsplashService';

export function useBackgroundImage() {
  // Estado
  const unsplashService = useUnsplashService();
  const currentBackground = ref({
    url: '',
    description: '',
    photographer: '',
    creditUrl: '',
    color: '#e2e8f0',
  });
  const nextBackground = ref(null);
  const backgroundLoaded = ref(false);
  const loadingError = ref(false);

  // Cargar imagen aleatoria con manejo de errores mejorado
  const fetchRandomImage = async (options = {}) => {
    try {
      // Restablecer estado
      backgroundLoaded.value = false;
      loadingError.value = false;

      // Obtener datos de imagen
      const imageData = await unsplashService.getRandomImage(options);

      // Si hay imagen precargada, usarla primero
      if (nextBackground.value) {
        currentBackground.value = nextBackground.value;
        backgroundLoaded.value = true;
      }

      // Si no hay imagen actual o es la primera carga, usar la nueva directamente
      if (!currentBackground.value.url) {
        currentBackground.value = imageData;
      } else {
        // Precargar para la próxima vez
        nextBackground.value = imageData;

        // Si esta es la primera carga, marcar como cargada
        if (!backgroundLoaded.value) {
          currentBackground.value = imageData;
          backgroundLoaded.value = true;
        }
      }

      // Verificar que la URL sea válida y accesible
      validateImageUrl(currentBackground.value.url)
        .then((isValid) => {
          if (!isValid) {
            // Si la URL no es válida, intentar con formatos alternativos
            return preloadImageWithFallbacks(currentBackground.value.url)
              .then((validUrl) => {
                // Actualizar URL con una que funcione
                currentBackground.value.url = validUrl;
                backgroundLoaded.value = true;
              })
              .catch(() => {
                loadingError.value = true;
              });
          }
        })
        .catch(() => {
          // Si hay error en la validación, intentar con URL fallback
          tryUseFallbackImage();
        });

      return currentBackground.value;
    } catch (err) {
      loadingError.value = true;
      tryUseFallbackImage();
      throw err;
    }
  };

  // Validar URL de imagen
  const validateImageUrl = async (url) => {
    if (!url) return false;

    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        resolve(true);
      };

      img.onerror = () => {
        resolve(false);
      };

      // Añadir parámetros para evitar caché y problemas CORS
      img.crossOrigin = 'anonymous';
      img.src = url.includes('?') ? `${url}&_=${Date.now()}` : `${url}?_=${Date.now()}`;
    });
  };

  // Usar imagen de respaldo si todo falla
  const tryUseFallbackImage = async () => {
    try {
      const fallback = await unsplashService.getFallbackImage();
      currentBackground.value = fallback;
      backgroundLoaded.value = true;
      loadingError.value = false;
    } catch {
      loadingError.value = true;
    }
  };

  // Manejadores de eventos
  const handleImageLoad = () => {
    backgroundLoaded.value = true;
    loadingError.value = false;
  };

  const handleImageError = () => {
    backgroundLoaded.value = false;

    // Intentar con URL alternativa o fallback
    preloadImageWithFallbacks(currentBackground.value.url)
      .then((validUrl) => {
        currentBackground.value.url = validUrl;
        backgroundLoaded.value = true;
      })
      .catch(() => {
        loadingError.value = true;
        tryUseFallbackImage();
      });
  };

  return {
    currentBackground,
    nextBackground,
    backgroundLoaded,
    loadingError,
    fetchRandomImage,
    handleImageLoad,
    handleImageError,
  };
}
