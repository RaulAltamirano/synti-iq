import { useTheme } from '../../../shared/composables/useTheme';
import { computed, ref } from 'vue';
import { useMotion } from '@vueuse/motion';
import TitleCard from '../../../shared/components/TitleCard/TitleCard.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  name: 'FormUser',
  components: {
    useMotion,
    TitleCard,
    FontAwesomeIcon,
  },
  setup() {
    const { isDark } = useTheme();
    const loading = ref(false);
    const selectedProfile = ref<any | null>(null);
    const showPreview = ref(false);
    const isEditing = ref(false);

    const user = ref({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      store: '',
      address: '',
      locations: [],
      permissions: [] as string[],
      notifications: {
        email: false,
        push: false,
        sms: false,
      },
      delivery: {
        vehicleType: '',
        licensePlate: '',
        zone: '',
        isAvailable: false,
        preferredZones: [] as string[],
      },
      cashier: {
        branchOffice: '',
        cashierNumber: '',
        shiftStartTime: '',
        shiftEndTime: '',
      },
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: true,
      },
    });

    const profileTypes = [
      {
        id: 'customer',
        title: 'Customer',
        icon: 'user',
        color: 'bg-blue-500',
        description: 'Regular user who can make purchases',
      },
      {
        id: 'delivery',
        title: 'Delivery Agent',
        icon: 'truck',
        color: 'bg-green-500',
        description: 'Manages deliveries and routes',
      },
      {
        id: 'cashier',
        title: 'Cashier',
        icon: 'cash-register',
        color: 'bg-purple-500',
        description: 'Handles transactions at stores',
      },
    ];

    const departments = ['Sales', 'Operations', 'Customer Service', 'Logistics'];

    const stores = ['Main Store', 'Downtown Branch', 'Shopping Mall', 'Express Store'];

    const permissions = [
      { id: 'view_orders', label: 'View Orders' },
      { id: 'manage_users', label: 'Manage Users' },
      { id: 'process_returns', label: 'Process Returns' },
      { id: 'view_reports', label: 'View Reports' },
    ];

    const roleSpecificFields = computed(() => ({
      store: ['cashier', 'delivery'].includes(user.value.role),
      schedule: user.value.role === 'cashier',
      address: user.value.role === 'delivery',
    }));

    const handleSubmit = async () => {
      loading.value = true;
      try {
        // Simular guardado
        await new Promise((resolve) => setTimeout(resolve, 3000));
        // Emitir evento de guardado
        // emit('save', user.value)
      } catch {
        // Error silenced
      } finally {
        loading.value = false;
      }
    };

    const selectProfile = (profile: any) => {
      selectedProfile.value = profile;
      user.value.role = profile.id;
    };

    const togglePreview = () => {
      showPreview.value = !showPreview.value;
    };

    const openSettings = () => {};

    const addNewLocation = () => {
      user.value.locations.push({
        name: '',
        address: '',
        reference: '',
        coordinates: null,
        isDefault: user.value.locations.length === 0,
      });
    };

    const removeLocation = (index: number) => {
      user.value.locations.splice(index, 1);
      if (user.value.locations.length === 1) {
        user.value.locations[0].isDefault = true;
      }
    };

    const setDefaultLocation = (index: number) => {
      user.value.locations.forEach((loc, i) => {
        loc.isDefault = i === index;
      });
    };

    const openMapPicker = (_index: number) => {};

    const saveAsDraft = () => {};

    return {
      addNewLocation,
      removeLocation,
      setDefaultLocation,
      openMapPicker,
      saveAsDraft,
      isDark,
      isEditing,
      loading,
      showPreview,
      user,
      departments,
      stores,
      permissions,
      roleSpecificFields,
      togglePreview,
      selectedProfile,
      selectProfile,
      handleSubmit,
      openSettings,
      profileTypes,
    };
  },
};
