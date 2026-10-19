import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import NavbarCheckoutBox from '../../components/NavbarCheckoutBox/NavbarCheckoutBox.vue';
import { useTheme } from '../../composables/useTheme';

const LG_MIN_PX = 1024;

function isMobileViewport(): boolean {
  return globalThis.window?.innerWidth < LG_MIN_PX;
}

function syncBodyScrollLock(sidebarOpen: boolean): void {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = sidebarOpen && isMobileViewport() ? 'hidden' : '';
}

export default {
  name: 'CheckoutBoxLayout',
  components: {
    NavbarCheckoutBox,
  },
  setup() {
    const { isDark } = useTheme();
    const route = useRoute();
    const sidebarOpen = ref(false);

    const closeSidebar = (): void => {
      sidebarOpen.value = false;
    };

    const toggleSidebar = (): void => {
      sidebarOpen.value = !sidebarOpen.value;
    };

    watch(sidebarOpen, (open) => {
      syncBodyScrollLock(open);
    });

    watch(
      () => route.fullPath,
      () => {
        closeSidebar();
      }
    );

    const onResize = (): void => {
      syncBodyScrollLock(sidebarOpen.value);
      if (globalThis.window.innerWidth >= LG_MIN_PX) {
        closeSidebar();
      }
    };

    const onKeydown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && sidebarOpen.value) {
        closeSidebar();
      }
    };

    onMounted(() => {
      globalThis.window?.addEventListener('resize', onResize);
      globalThis.window?.addEventListener('keydown', onKeydown);
    });

    onUnmounted(() => {
      globalThis.window?.removeEventListener('resize', onResize);
      globalThis.window?.removeEventListener('keydown', onKeydown);
      syncBodyScrollLock(false);
    });

    return {
      isDark,
      sidebarOpen,
      closeSidebar,
      toggleSidebar,
    };
  },
};
