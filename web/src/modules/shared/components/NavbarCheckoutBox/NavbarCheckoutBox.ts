import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

import CashClosingModal from '@/modules/checkoutBox/components/CashClosingModal/CashClosingModal.vue';
import { useAuthStore } from '@/modules/auth/stores/authStore';
import Avatar from '@/modules/ui/components/Avatar/Avatar.vue';
import { useTheme } from '../../composables/useTheme';
import { ModalName, useModalStore } from '../../store/useModalStore';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  cashier: 'Cajero',
  business_owner: 'Propietario',
  manager: 'Gerente',
};

function formatRoleLabel(role?: string): string {
  if (!role?.trim()) return 'Usuario';
  return ROLE_LABELS[role] ?? role.replace(/_/g, ' ');
}

type FaIcon = ['fas', string];

interface CheckoutNavItem {
  id: string;
  label: string;
  icon: FaIcon;
}

export default {
  name: 'NavbarCheckoutBox',
  emits: ['request-close'],
  components: {
    Avatar,
    CashClosingModal,
  },
  setup(_props, { emit }: { emit: (e: 'request-close') => void }) {
    const { isDark, themeStore } = useTheme();
    const modalStore = useModalStore();
    const { currentUser: authUser } = storeToRefs(useAuthStore());
    const route = useRoute();
    const router = useRouter();

    const isHovered = ref(false);

    const menuItems: CheckoutNavItem[] = [
      { id: 'cashier-dashboard', label: 'Inicio', icon: ['fas', 'house'] },
      { id: 'cashier-sales', label: 'Ventas', icon: ['fas', 'cash-register'] },
      { id: 'cashier-returns', label: 'Devoluciones', icon: ['fas', 'undo'] },
      { id: 'cashier-register', label: 'Caja', icon: ['fas', 'money-bill'] },
      { id: 'cashier-credits', label: 'Créditos', icon: ['fas', 'credit-card'] },
      { id: 'cashier-history', label: 'Historial', icon: ['fas', 'history'] },
      { id: 'cashier-inventory', label: 'Inventario', icon: ['fas', 'boxes'] },
      { id: 'cashier-reports', label: 'Reportes', icon: ['fas', 'file'] },
    ];

    const currentView = computed(() => {
      const name = route.name;
      return typeof name === 'string' ? name : 'cashier-dashboard';
    });

    const displayName = computed(() => {
      const u = authUser.value;
      if (!u) return 'Usuario';
      const parts = [u.firstName, u.lastName].filter(Boolean) as string[];
      if (parts.length > 0) return parts.join(' ');
      const local = u.email?.split('@')[0];
      return local?.trim() || u.email || 'Usuario';
    });

    const roleLabel = computed(() => formatRoleLabel(authUser.value?.role));

    const avatarSeed = computed(() => authUser.value?.id ?? authUser.value?.email ?? '');

    const goTo = (routeName: string) => {
      emit('request-close');
      router.push({ name: routeName }).catch(() => {
        /* duplicate navigation */
      });
    };

    const requestCloseNav = () => {
      emit('request-close');
    };

    const closeCashDrawer = () => {
      emit('request-close');
      modalStore.open(ModalName.CLOSE_CASH_DRAWER);
    };

    /** Turno: placeholder hasta que exista endpoint de caja; el modal sigue funcionando con este shape. */
    const currentShift = ref({
      id: 'SHIFT-001',
      status: 'open',
      openTime: new Date().toISOString(),
      closeTime: null as string | null,
      initialCash: 1000,
      totalSales: 0,
      cashAmount: 0,
      cardAmount: 0,
      transferAmount: 0,
      creditAmount: 0,
      cashTransactions: 0,
      cardTransactions: 0,
      transferTransactions: 0,
      creditTransactions: 0,
      transactions: [] as unknown[],
      expenses: [] as { description: string; amount: number }[],
      withdrawals: [] as { description: string; amount: number }[],
    });

    const cashClosingUser = computed(() => {
      const u = authUser.value;
      if (!u) {
        return {
          id: '',
          name: displayName.value,
          role: 'cashier',
          email: '',
        };
      }
      return {
        id: u.id,
        name: displayName.value,
        role: u.role ?? 'cashier',
        email: u.email,
      };
    });

    const sidebarMotion = {
      initial: { opacity: 0, x: -12 },
      enter: { opacity: 1, x: 0, transition: { duration: 280 } },
    };

    const logoMotion = {
      initial: { opacity: 0, scale: 0.96 },
      enter: { opacity: 1, scale: 1, transition: { duration: 280 } },
    };

    const navStaggerDelay = (index: number): number => index * 0.05;

    return {
      menuItems,
      currentView,
      closeCashDrawer,
      requestCloseNav,
      isDark,
      goTo,
      currentShift,
      cashClosingUser,
      isHovered,
      displayName,
      roleLabel,
      avatarSeed,
      sidebarMotion,
      logoMotion,
      navStaggerDelay,
      toggleTheme: themeStore.toggleTheme,
    };
  },
};
