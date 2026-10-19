import { statusModalService } from '../services/statusModalService';

export function useStatusModal() {
  // API para transacciones
  const transaction = {
    success(options = {}) {
      return statusModalService.success({
        title: options.title || '¡Pago Confirmado!',
        message: options.message || 'Tu transacción ha sido procesada con éxito.',
        details: {
          transactionId: options.id || '#TRX-' + Math.floor(10000 + Math.random() * 90000),
          time:
            options.time ||
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          amount: options.amount,
          ...options.additionalDetails,
        },
        additionalInfo: options.additionalInfo,
        actionText: options.actionText || 'Continuar',
        ...options,
      });
    },

    error(options = {}) {
      return statusModalService.error({
        title: options.title || 'Error en la Transacción',
        message: options.message || 'No se pudo completar tu transacción.',
        details: {
          transactionId: options.id || '#TRX-' + Math.floor(10000 + Math.random() * 90000),
          time:
            options.time ||
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...options.additionalDetails,
        },
        additionalInfo: options.additionalInfo || 'Fondos insuficientes',
        actionText: options.actionText || 'Reintentar',
        ...options,
      });
    },

    pending(options = {}) {
      return statusModalService.warning({
        title: options.title || 'Pago en Revisión',
        message: options.message || 'Tu pago está siendo verificado.',
        details: {
          transactionId: options.id || '#TRX-' + Math.floor(10000 + Math.random() * 90000),
          time:
            options.time ||
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...options.additionalDetails,
        },
        additionalInfo: options.additionalInfo || '24 horas de revisión',
        actionText: options.actionText || 'Entendido',
        ...options,
      });
    },
  };

  // API para notificaciones de sistema
  const system = {
    success(options = {}) {
      return statusModalService.success({
        title: options.title || '¡Operación Exitosa!',
        message: options.message || 'La operación se completó correctamente.',
        details: options.details || {},
        ...options,
      });
    },

    error(options = {}) {
      return statusModalService.error({
        title: options.title || 'Error del Sistema',
        message: options.message || 'No se pudo completar la operación solicitada.',
        details: options.details || {},
        ...options,
      });
    },

    warning(options = {}) {
      return statusModalService.warning({
        title: options.title || 'Advertencia del Sistema',
        message: options.message || 'Se requiere atención en la operación.',
        details: options.details || {},
        ...options,
      });
    },

    info(options = {}) {
      return statusModalService.info({
        title: options.title || 'Información del Sistema',
        message: options.message || 'Información importante sobre la operación.',
        details: options.details || {},
        ...options,
      });
    },
  };

  // API para feedback de usuario
  const user = {
    welcome(options = {}) {
      return statusModalService.info({
        title: options.title || '¡Bienvenido!',
        message: options.message || `Hola ${options.name || 'Usuario'}, nos alegra verte de nuevo.`,
        showEffects: true,
        actionText: options.actionText || 'Comenzar',
        ...options,
      });
    },

    achievement(options = {}) {
      return statusModalService.success({
        title: options.title || '¡Logro Desbloqueado!',
        message: options.message || `Has alcanzado ${options.achievement || 'un nuevo logro'}.`,
        showEffects: true,
        actionText: options.actionText || 'Continuar',
        ...options,
      });
    },
  };

  return {
    transaction,
    system,
    user,

    // Exponer la API básica también
    show: statusModalService.show.bind(statusModalService),
    success: statusModalService.success.bind(statusModalService),
    error: statusModalService.error.bind(statusModalService),
    warning: statusModalService.warning.bind(statusModalService),
    info: statusModalService.info.bind(statusModalService),
    close: statusModalService.close.bind(statusModalService),
    closeAll: statusModalService.closeAll.bind(statusModalService),
  };
}
