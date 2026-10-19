import { computed, onUnmounted, ref, watch } from 'vue';
import Logo from '../Logo/Logo.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'vue-router';
import { useTheme } from '../../composables/useTheme';
import { useNotificationStore } from '../../store/NotificationStore';
import { useAuth } from '../../../auth/composables/useAuth';
import { useAuthStore } from '../../../auth/stores/authStore';
import { Avatar, Badge, RoleIcon } from '../../../ui/components';

export default {
  name: 'Navbar',
  components: {
    FontAwesomeIcon,
    Avatar,
    Badge,
    RoleIcon,
    Logo,
  },
  setup() {
    const { isDark, themeStore } = useTheme();
    const authStore = useAuthStore();
    const { logout } = useAuth();
    const router = useRouter();

    const wishlistCount = ref(0);
    const cartCount = ref(0);
    const showDropdown = ref(false);
    const dropdownRef = ref<HTMLElement | null>(null);
    const cartAnimation = ref(false);
    const wishlistAnimation = ref(false);
    const notificationStore = useNotificationStore();
    const notificationPanelRef = ref<HTMLElement | null>(null);

    const currentUser = computed(() => authStore.currentUser);
    const userId = computed(() => currentUser.value?.id || '');
    const userName = computed(
      () =>
        [currentUser.value?.firstName, currentUser.value?.lastName].filter(Boolean).join(' ') || ''
    );
    const userEmail = computed(() => currentUser.value?.email || '');
    const userRole = computed(() => currentUser.value?.role || '');
    const userInitials = computed(() => {
      const { firstName, lastName } = currentUser.value || {};
      if (firstName && lastName) {
        return (firstName[0] + lastName[0]).toUpperCase();
      }
      if (firstName) return firstName[0].toUpperCase();
      if (lastName) return lastName[0].toUpperCase();
      return '';
    });

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const closeDropdown = () => {
      showDropdown.value = false;
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.value && !dropdownRef.value.contains(target)) {
        closeDropdown();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDropdown.value) {
        closeDropdown();
      }
    };

    watch(showDropdown, (isOpen) => {
      if (isOpen) {
        document.addEventListener('click', handleClickOutside, true);
        document.addEventListener('keydown', handleEscapeKey);
      } else {
        document.removeEventListener('click', handleClickOutside, true);
        document.removeEventListener('keydown', handleEscapeKey);
      }
    });

    const navigateTo = (route: string) => {
      router.push({ name: route });
      closeDropdown();
    };

    const onLogout = async () => {
      logout();
      closeDropdown();
    };

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('click', handleNotificationClickOutside, true);
    });

    const menuItems = computed(() => [
      {
        label: 'My Profile',
        icon: 'user',
        action: () => navigateTo('Profile'),
      },
      {
        label: 'Log out',
        icon: 'sign-out-alt',
        action: onLogout,
        danger: true,
      },
    ]);
    const changeTheme = () => {
      themeStore.toggleTheme();
    };

    const toggleNotifications = () => {
      notificationStore.toggleNotificationPanel();
    };

    const handleNotificationClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationPanelRef.value && !notificationPanelRef.value.contains(target)) {
        notificationStore.closeNotificationPanel();
      }
    };

    watch(
      () => notificationStore.showNotificationPanel,
      (isOpen) => {
        if (isOpen) {
          document.addEventListener('click', handleNotificationClickOutside, true);
        } else {
          document.removeEventListener('click', handleNotificationClickOutside, true);
        }
      }
    );

    return {
      /** Pass `IconDefinition` objects — avoids string lookup and survives minification. */
      faMoon,
      faSun,
      wishlistCount,
      cartCount,
      changeTheme,
      toggleDropdown,
      toggleNotifications,
      notificationStore,
      notificationPanelRef,
      userId,
      userName,
      userEmail,
      userRole,
      userInitials,
      currentUser,
      closeDropdown,
      dropdownRef,
      onLogout,
      showDropdown,
      cartAnimation,
      wishlistAnimation,
      menuItems,
      navigateTo,
      isDark,
    };
  },
};
