import { ref, computed, defineComponent, onMounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useTheme } from '../../shared/composables/useTheme';
import { useRouter } from 'vue-router';
import TitleCard from '../../shared/components/TitleCard/TitleCard.vue';

export default defineComponent({
  name: 'Users',
  components: {
    FontAwesomeIcon,
    TitleCard,
  },
  setup() {
    const { isDark } = useTheme();
    const router = useRouter();
    const mounted = ref(false);
    const search = ref('');
    const filterRole = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 5;
    const showAddModal = ref(false);

    const filters = ref({
      search: '',
      role: '',
      status: '',
    });

    onMounted(() => {
      mounted.value = true;
    });
    const stats = [
      { label: 'Total Users', value: '2,847', icon: 'users', color: 'text-blue-500' },
      { label: 'Active Now', value: '147', icon: 'user-clock', color: 'text-green-500' },
      { label: 'New Today', value: '24', icon: 'user-plus', color: 'text-purple-500' },
      { label: 'Pending Approvals', value: '12', icon: 'user-shield', color: 'text-yellow-500' },
    ];

    const roles = [
      { value: 'admin', label: 'Administrator' },
      { value: 'moderator', label: 'Moderator' },
      { value: 'editor', label: 'Editor' },
      { value: 'user', label: 'User' },
    ];

    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      moderator: 'bg-purple-100 text-purple-800',
      editor: 'bg-yellow-100 text-yellow-800',
      user: 'bg-blue-100 text-blue-800',
    };

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-500',
      idle: 'bg-yellow-500',
    };

    const filteredUsers = computed(() => {
      return users.value.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          user.email.toLowerCase().includes(filters.value.search.toLowerCase());
        const matchesRole = !filters.value.role || user.role === filters.value.role;
        const matchesStatus = !filters.value.status || user.status === filters.value.status;
        return matchesSearch && matchesRole && matchesStatus;
      });
    });

    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredUsers.value.slice(start, end);
    });

    const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage));
    const paginationStart = computed(() => (currentPage.value - 1) * itemsPerPage);
    const paginationEnd = computed(() =>
      Math.min(currentPage.value * itemsPerPage, filteredUsers.value.length)
    );

    const toggleDarkMode = () => {
      isDark.value = !isDark.value;
    };

    const formatLastSeen = (date) => {
      // return formatDistance(date, new Date(), { addSuffix: true })
    };

    const formatDate = (date) => {
      // return format(date, 'MMM d, yyyy')
    };
    const viewDashboard = (user) => router.push({ name: 'UserDashboard' });
    const impersonateUser = () => {};
    const editUser = (user) => router.push({ name: 'EditUser', params: { id: 'dasd' } });
    const showUserLogs = () => {};
    const confirmDelete = () => {};

    const users = ref([
      {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'admin',
        status: 'online',
        lastSeen: new Date(),
        joinDate: new Date('2023-01-15'),
        teamCount: 3,
        projectCount: 8,
      },
      {
        id: 2,
        name: 'Miguel Pavon',
        email: 'miguel@example.com', // Corrected duplicate email
        role: 'admin',
        status: 'online',
        lastSeen: new Date(),
        joinDate: new Date('2023-01-15'),
        teamCount: 3,
        projectCount: 8,
      },
      // Add 10 more users with random data
      ...Array(10)
        .fill()
        .map((_, index) => ({
          id: index + 3, // Start IDs from 3 to avoid conflicts
          name: generateRandomName(),
          email: generateRandomEmail(),
          role: generateRandomRole(),
          status: Math.random() < 0.5 ? 'online' : 'offline', // Randomize status
          lastSeen: generateRandomLastSeenDate(),
          joinDate: generateRandomJoinDate(),
          teamCount: Math.floor(Math.random() * 10) + 1, // Random team count (1-10)
          projectCount: Math.floor(Math.random() * 20) + 1, // Random project count (1-20)
        })),
    ]);

    function generateRandomName() {
      const firstNames = [
        'Maria',
        'Sofia',
        'Camila',
        'Isabella',
        'Valentina',
        'Santiago',
        'Mateo',
        'Emiliano',
        'Sebastian',
        'David',
      ];
      const lastNames = ['Lopez', 'Gonzalez', 'Hernandez', 'Garcia', 'Rodriguez'];
      return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }

    function generateRandomEmail() {
      const names = generateRandomName().split(' ').join('.');
      return `${names}@example.com`; // Ensure unique emails
    }

    function generateRandomRole() {
      const roles = ['admin', 'editor', 'member'];
      return roles[Math.floor(Math.random() * roles.length)];
    }

    function generateRandomLastSeenDate() {
      const daysAgo = Math.floor(Math.random() * 30); // Up to 30 days ago
      return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    }

    function generateRandomJoinDate() {
      const year = Math.floor(Math.random() * 2) + 2023; // 2023 or 2024
      const month = Math.floor(Math.random() * 12); // 0-11 (January-December)
      const day = Math.floor(Math.random() * 31) + 1; // 1-31
      return new Date(year, month, day);
    }
    const addNewUser = () => {
      router.push({ name: 'AddUser' });
    };

    return {
      currentPage,
      mounted,
      search,
      isDark,
      router,
      filterRole,
      showAddModal,
      roles,
      addNewUser,
      filteredUsers,
      viewDashboard,
      impersonateUser,
      showUserLogs,
      paginatedUsers,
      totalPages,
      paginationStart,
      paginationEnd,
      toggleDarkMode,
      filters,

      formatLastSeen,
      stats,
      formatDate,
      editUser,
      confirmDelete,
      roleColors,
      statusColors,
    };
  },
});
