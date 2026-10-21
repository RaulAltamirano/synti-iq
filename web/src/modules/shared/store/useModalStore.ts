// stores/useModalStore.ts
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * Enumeración de nombres de modales disponibles en el sistema de caja
 * @description Define todos los posibles modales del sistema para un tipado seguro
 */
export enum ModalName {
  SETTINGS = 'settingsModal',
  PROFILE = 'profileModal',
  DELETE_CONFIRM = 'deleteConfirmModal',
  OPEN_CASH_DRAWER = 'openCashDrawerModal',
  CLOSE_CASH_DRAWER = 'closeCashDrawerModal',
  CHECK_PRICE = 'checkPriceModal',
  PROCESS_PAYMENT = 'processPaymentModal',
  SHARE_CART = 'shareCartModal',
}

// Creamos un tipo basado en los valores de la enumeración para mayor seguridad
export type ModalNameType = `${ModalName}`;

/**
 * Interfaz para el historial de modales
 */
interface ModalHistoryEntry {
  name: ModalNameType;
  timestamp: number;
  data?: Record<string, unknown>;
}

/**
 * Interfaz para definir los modales activos y su configuración
 */
interface ModalState {
  activeModals: Record<ModalNameType, boolean>;
  modalData: Record<ModalNameType, Record<string, unknown> | null>;
  history: ModalHistoryEntry[];
  historyLimit: number;
}

/**
 * Store para gestionar modales con Pinia
 * @returns Métodos y estado para controlar los modales de la aplicación
 */
export const useModalStore = defineStore('modal', () => {
  // Estado principal usando ref para mejor rendimiento con objetos grandes
  const state = ref<ModalState>({
    activeModals: Object.values(ModalName).reduce(
      (acc, modal) => {
        acc[modal as ModalNameType] = false;
        return acc;
      },
      {} as Record<ModalNameType, boolean>
    ),
    modalData: Object.values(ModalName).reduce(
      (acc, modal) => {
        acc[modal as ModalNameType] = null;
        return acc;
      },
      {} as Record<ModalNameType, Record<string, unknown> | null>
    ),
    history: [],
    historyLimit: 10,
  });

  /**
   * Verifica si un modal está abierto
   * @param name Nombre del modal a verificar
   * @returns true si el modal está abierto, false en caso contrario
   */
  const isOpen = computed(() => (name: ModalNameType): boolean => {
    return state.value.activeModals[name] || false;
  });

  /**
   * Obtiene los datos asociados a un modal específico
   * @param name Nombre del modal
   * @returns Datos asociados al modal o null si no hay datos
   */
  const getModalData = computed(() => (name: ModalNameType): Record<string, unknown> | null => {
    return state.value.modalData[name] || null;
  });

  /**
   * Lista todos los modales actualmente abiertos
   * @returns Array con los nombres de los modales abiertos
   */
  const openModals = computed((): ModalNameType[] => {
    return Object.entries(state.value.activeModals)
      .filter(([_, isOpen]) => isOpen)
      .map(([name]) => name as ModalNameType);
  });

  /**
   * Registra un cambio de estado en el historial
   * @param name Nombre del modal
   * @param data Datos opcionales asociados al evento
   */
  const addToHistory = (name: ModalNameType, data?: Record<string, unknown>): void => {
    state.value.history.unshift({
      name,
      timestamp: Date.now(),
      data,
    });

    // Mantener el historial dentro del límite configurado
    if (state.value.history.length > state.value.historyLimit) {
      state.value.history = state.value.history.slice(0, state.value.historyLimit);
    }
  };

  const open = (name: ModalNameType, data?: Record<string, unknown>): void => {
    try {
      if (!Object.values(ModalName).includes(name as ModalName)) {
        return;
      }

      state.value.activeModals[name] = true;

      if (data) {
        state.value.modalData[name] = data;
      }

      addToHistory(name, data);
    } catch {
      /* modal state update failed */
    }
  };

  /**
   * Cierra un modal específico
   * @param name Nombre del modal a cerrar
   */
  const close = (name: ModalNameType): void => {
    try {
      if (!Object.values(ModalName).includes(name as ModalName)) {
        return;
      }

      state.value.activeModals[name] = false;
      addToHistory(name);

      state.value.modalData[name] = null;
    } catch {
      /* modal state update failed */
    }
  };

  const toggle = (name: ModalNameType, data?: Record<string, unknown>): void => {
    if (state.value.activeModals[name]) {
      close(name);
    } else {
      open(name, data);
    }
  };

  const closeAll = (): void => {
    try {
      // Capturamos los modales que estaban abiertos para el historial
      const modalsClosed = openModals.value;

      // Cerramos todos los modales
      Object.keys(state.value.activeModals).forEach((modalName) => {
        state.value.activeModals[modalName as ModalNameType] = false;
        state.value.modalData[modalName as ModalNameType] = null;
      });

      // Registramos en el historial
      if (modalsClosed.length > 0) {
        addToHistory('closeAll' as ModalNameType, { closed: modalsClosed });
      }
    } catch {
      /* modal state update failed */
    }
  };

  const reset = (): void => {
    closeAll();
    state.value.history = [];
  };

  return {
    // Estado
    state,

    // Getters computados
    isOpen,
    getModalData,
    openModals,

    // Acciones
    open,
    close,
    toggle,
    closeAll,
    reset,
  };
});

// Exportamos un helper para fácil acceso a la verificación de estado de modales
export const useModalStatus = () => {
  const modalStore = useModalStore();

  /**
   * Verifica si un modal está abierto
   * @param name Nombre del modal a verificar
   */
  const isModalOpen = (name: ModalNameType): boolean => {
    return modalStore.isOpen(name);
  };

  return {
    isModalOpen,
  };
};
