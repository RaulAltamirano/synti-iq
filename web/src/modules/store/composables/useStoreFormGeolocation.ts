const GEOLOCATION_TIMEOUT_MS = 15000;
const GEOLOCATION_MAX_AGE_MS = 60000;

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

export type GeolocationErrorCode =
  'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';

export class GeolocationError extends Error {
  constructor(
    message: string,
    public readonly code: GeolocationErrorCode
  ) {
    super(message);
    this.name = 'GeolocationError';
  }
}

function mapErrorMessage(code: number): { message: string; code: GeolocationErrorCode } {
  switch (code) {
    case 1:
      return {
        message: 'Permiso de ubicación denegado',
        code: 'PERMISSION_DENIED',
      };
    case 2:
      return {
        message: 'Ubicación no disponible',
        code: 'POSITION_UNAVAILABLE',
      };
    case 3:
      return {
        message: 'Tiempo de espera agotado al obtener la ubicación',
        code: 'TIMEOUT',
      };
    default:
      return {
        message: 'No se pudo obtener la ubicación',
        code: 'POSITION_UNAVAILABLE',
      };
  }
}

/**
 * Composable that exposes a function to get the current device position.
 * Does not modify form state; the caller updates coordinates and map.
 */
export function useStoreFormGeolocation(): {
  getCurrentLocation: () => Promise<GeolocationCoords>;
} {
  function getCurrentLocation(): Promise<GeolocationCoords> {
    if (!navigator?.geolocation) {
      return Promise.reject(
        new GeolocationError(
          'La geolocalización no está soportada en este navegador',
          'NOT_SUPPORTED'
        )
      );
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err: GeolocationPositionError) => {
          const { message, code } = mapErrorMessage(err.code);
          reject(new GeolocationError(message, code));
        },
        {
          enableHighAccuracy: true,
          timeout: GEOLOCATION_TIMEOUT_MS,
          maximumAge: GEOLOCATION_MAX_AGE_MS,
        }
      );
    });
  }

  return { getCurrentLocation };
}
