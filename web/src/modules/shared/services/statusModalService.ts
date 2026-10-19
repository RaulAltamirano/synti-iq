import { reactive, createApp, h } from 'vue';
import StatusModal from '../components/StatusModal/StatusModal.vue';

export const statusModalService = {
  // Estado reactivo para múltiples modales
  modals: reactive([]),

  // Contador para IDs únicos
  counter: 0,

  // Método para mostrar una modal
  show(options = {}) {
    const id = options.id || `modal-${++this.counter}`;

    // Validar el tipo
    const validTypes = ['success', 'error', 'warning', 'info'];
    const type = validTypes.includes(options.type) ? options.type : 'info';

    // Crear configuración de la modal
    const modalConfig = {
      id,
      type,
      isVisible: true,
      title: options.title || null,
      message: options.message || null,
      details: options.details || {},
      additionalInfo: options.additionalInfo || null,
      actionText: options.actionText || null,
      actionAriaLabel: options.actionAriaLabel || 'Continuar',
      showEffects: options.showEffects !== false,
      timestamp: Date.now(),
    };

    // Buscar si ya existe una modal con el mismo ID
    const existingModalIndex = this.modals.findIndex((modal) => modal.id === id);
    if (existingModalIndex >= 0) {
      // Actualizar modal existente
      Object.assign(this.modals[existingModalIndex], modalConfig);
    } else {
      // Agregar nueva modal
      this.modals.push(modalConfig);
    }

    return id;
  },

  // Métodos específicos para cada tipo
  success(options = {}) {
    return this.show({ ...options, type: 'success' });
  },

  error(options = {}) {
    return this.show({ ...options, type: 'error' });
  },

  warning(options = {}) {
    return this.show({ ...options, type: 'warning' });
  },

  info(options = {}) {
    return this.show({ ...options, type: 'info' });
  },

  // Cerrar una modal específica
  close(id) {
    const modalIndex = this.modals.findIndex((modal) => modal.id === id);
    if (modalIndex >= 0) {
      this.modals.splice(modalIndex, 1);
    }
  },

  // Cerrar todas las modales
  closeAll() {
    this.modals.splice(0, this.modals.length);
  },
};

export const StatusModalPlugin = {
  install(app) {
    // Crear componente raíz para las modales
    const mountPoint = document.createElement('div');
    mountPoint.id = 'status-modal-container';
    document.body.appendChild(mountPoint);

    // Crear una aplicación Vue dedicada para las modales
    const modalApp = createApp({
      name: 'StatusModalContainer',
      setup() {
        return () =>
          statusModalService.modals.map((modal) =>
            h(StatusModal, {
              key: `${modal.id}-${modal.timestamp}`,
              ...modal,
              onAction: () => {
                if (modal.onAction) modal.onAction();
                statusModalService.close(modal.id);
              },
              onClose: () => statusModalService.close(modal.id),
            })
          );
      },
    });

    modalApp.component('StatusModal', StatusModal);
    modalApp.mount(mountPoint);

    // Exponer el servicio a nivel global
    app.config.globalProperties.$statusModal = statusModalService;
  },
};

export default StatusModalPlugin;
