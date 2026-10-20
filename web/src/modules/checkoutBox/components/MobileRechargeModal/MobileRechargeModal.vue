<script>
export default {
  data() {
    return {
      isOpen: false,
      isProcessing: false,
      selectedCompany: null,
      phoneNumber: '',
      recentNumbers: ['8095551234', '8295555678', '8495559012'],
      showAllPackages: false,
      activePackageType: 'data',
      selectedPackage: null,
      customAmount: 0,
      telecomCompanies: [
        {
          id: 'claro',
          name: 'Claro',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Claro_logo.svg/1200px-Claro_logo.svg.png',
          packages: [
            {
              id: 'claro1',
              amount: 100,
              bonus: 10,
              description: '1GB + 100 Min',
              validity: '7 días',
              type: 'data',
              popular: true,
              highlight: false,
            },
            {
              id: 'claro2',
              amount: 200,
              bonus: 15,
              description: '2.5GB + 200 Min',
              validity: '15 días',
              type: 'data',
              popular: true,
              highlight: true,
            },
            {
              id: 'claro3',
              amount: 300,
              bonus: 20,
              description: '5GB + 300 Min',
              validity: '30 días',
              type: 'data',
              popular: false,
              highlight: false,
            },
            {
              id: 'claro4',
              amount: 50,
              bonus: 0,
              description: '50 Min',
              validity: '3 días',
              type: 'voice',
              popular: false,
              highlight: false,
            },
            {
              id: 'claro5',
              amount: 100,
              bonus: 0,
              description: '100 Min',
              validity: '7 días',
              type: 'voice',
              popular: true,
              highlight: false,
            },
            {
              id: 'claro6',
              amount: 150,
              bonus: 0,
              description: 'SMS Ilimitado',
              validity: '7 días',
              type: 'sms',
              popular: false,
              highlight: false,
            },
          ],
        },
        {
          id: 'altice',
          name: 'Altice',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Altice_USA_logo.svg/1200px-Altice_USA_logo.svg.png',
          packages: [
            {
              id: 'altice1',
              amount: 100,
              bonus: 5,
              description: '1.5GB + 50 Min',
              validity: '7 días',
              type: 'data',
              popular: true,
              highlight: false,
            },
            {
              id: 'altice2',
              amount: 200,
              bonus: 10,
              description: '3GB + 100 Min',
              validity: '15 días',
              type: 'data',
              popular: true,
              highlight: true,
            },
            {
              id: 'altice3',
              amount: 300,
              bonus: 15,
              description: '6GB + 200 Min',
              validity: '30 días',
              type: 'data',
              popular: false,
              highlight: false,
            },
            {
              id: 'altice4',
              amount: 50,
              bonus: 0,
              description: '30 Min',
              validity: '3 días',
              type: 'voice',
              popular: false,
              highlight: false,
            },
            {
              id: 'altice5',
              amount: 100,
              bonus: 0,
              description: '80 Min',
              validity: '7 días',
              type: 'voice',
              popular: true,
              highlight: false,
            },
          ],
        },
        {
          id: 'viva',
          name: 'Viva',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Viva_logo.svg/1200px-Viva_logo.svg.png',
          packages: [
            {
              id: 'viva1',
              amount: 100,
              bonus: 20,
              description: '2GB + 100 Min',
              validity: '7 días',
              type: 'data',
              popular: true,
              highlight: false,
            },
            {
              id: 'viva2',
              amount: 200,
              bonus: 25,
              description: '4GB + 200 Min',
              validity: '15 días',
              type: 'data',
              popular: true,
              highlight: true,
            },
            {
              id: 'viva3',
              amount: 300,
              bonus: 30,
              description: '8GB + 300 Min',
              validity: '30 días',
              type: 'data',
              popular: false,
              highlight: false,
            },
            {
              id: 'viva4',
              amount: 50,
              bonus: 0,
              description: '60 Min',
              validity: '3 días',
              type: 'voice',
              popular: false,
              highlight: false,
            },
            {
              id: 'viva5',
              amount: 100,
              bonus: 0,
              description: '120 Min',
              validity: '7 días',
              type: 'voice',
              popular: true,
              highlight: false,
            },
          ],
        },
        {
          id: 'orange',
          name: 'Orange',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/1200px-Orange_logo.svg.png',
          packages: [
            {
              id: 'orange1',
              amount: 100,
              bonus: 15,
              description: '1.2GB + 80 Min',
              validity: '7 días',
              type: 'data',
              popular: true,
              highlight: false,
            },
            {
              id: 'orange2',
              amount: 200,
              bonus: 20,
              description: '3GB + 150 Min',
              validity: '15 días',
              type: 'data',
              popular: true,
              highlight: true,
            },
            {
              id: 'orange3',
              amount: 300,
              bonus: 25,
              description: '6GB + 250 Min',
              validity: '30 días',
              type: 'data',
              popular: false,
              highlight: false,
            },
            {
              id: 'orange4',
              amount: 50,
              bonus: 0,
              description: '40 Min',
              validity: '3 días',
              type: 'voice',
              popular: false,
              highlight: false,
            },
            {
              id: 'orange5',
              amount: 100,
              bonus: 0,
              description: '90 Min',
              validity: '7 días',
              type: 'voice',
              popular: true,
              highlight: false,
            },
          ],
        },
      ],
      quickActions: [
        { amount: 100, label: 'Recarga Rápida' },
        { amount: 200, label: 'Más Popular' },
        { amount: 300, label: 'Máximo Bono' },
        { amount: 500, label: 'Recarga Grande' },
      ],
    };
  },
  computed: {
    filteredPackages() {
      if (!this.selectedCompany) return [];

      let packages = this.selectedCompany.packages.filter(
        (pkg) => pkg.type === this.activePackageType
      );

      if (!this.showAllPackages) {
        packages = packages.filter((pkg) => pkg.popular);
      }

      // Highlight the best value package
      if (this.activePackageType === 'data') {
        const bestValue = packages.reduce((best, current) => {
          const currentValue = (current.amount * (1 + current.bonus / 100)) / current.amount;
          const bestValue = (best.amount * (1 + best.bonus / 100)) / best.amount;
          return currentValue > bestValue ? current : best;
        }, packages[0]);

        packages = packages.map((pkg) => ({
          ...pkg,
          highlight: pkg.id === bestValue.id,
        }));
      }

      return packages;
    },
    rechargeAmount() {
      if (this.selectedPackage) return this.selectedPackage.amount;
      if (this.customAmount > 0) return parseFloat(this.customAmount);
      return 0;
    },
    totalAmount() {
      if (!this.selectedPackage) return this.rechargeAmount;
      return this.rechargeAmount * (1 + this.selectedPackage.bonus / 100);
    },
    canAddToCart() {
      return this.selectedCompany && this.phoneNumber.length >= 10 && this.rechargeAmount > 0;
    },
    packageTypes() {
      if (!this.selectedCompany) return [];

      const types = new Set(this.selectedCompany.packages.map((pkg) => pkg.type));
      return Array.from(types).map((type) => ({
        value: type,
        label: this.getTypeLabel(type),
      }));
    },
  },
  methods: {
    selectCompany(company) {
      this.selectedCompany = company;
      this.selectedPackage = null;
      this.customAmount = 0;
      this.activePackageType = this.packageTypes[0]?.value || 'data';

      // Auto-select best package for demo purposes
      setTimeout(() => {
        const bestPackage = this.filteredPackages.find((pkg) => pkg.highlight);
        if (bestPackage) {
          this.selectedPackage = bestPackage;
        }
      }, 100);
    },
    selectPackage(pkg) {
      this.selectedPackage = pkg;
      this.customAmount = 0;
    },
    selectCustomAmount() {
      this.selectedPackage = null;
    },
    formatPhoneNumber() {
      // Simple formatting for demo - would need proper phone number formatting in production
      this.phoneNumber = this.phoneNumber.replace(/\D/g, '').slice(0, 10);
    },
    selectRecentNumber(number) {
      this.phoneNumber = number;
    },
    applyQuickAction(action) {
      this.customAmount = action.amount;
      this.selectedPackage = null;

      // Find closest package to suggest
      if (this.selectedCompany) {
        const closestPackage = this.selectedCompany.packages.reduce((prev, curr) =>
          Math.abs(curr.amount - action.amount) < Math.abs(prev.amount - action.amount)
            ? curr
            : prev
        );

        // Only suggest if within 20% of the amount
        if (Math.abs(closestPackage.amount - action.amount) / action.amount < 0.2) {
          this.$nextTick(() => {
            this.selectedPackage = closestPackage;
            this.customAmount = 0;
          });
        }
      }
    },
    getTypeLabel(type) {
      const labels = {
        data: 'Datos',
        voice: 'Minutos',
        sms: 'Mensajes',
        combo: 'Combo',
      };
      return labels[type] || type;
    },
    addToCart() {
      if (!this.canAddToCart) return;

      this.isProcessing = true;

      // Simulate API call
      setTimeout(() => {
        const item = {
          id: `recharge-${Date.now()}`,
          name: `Recarga ${this.selectedCompany.name}`,
          description: this.selectedPackage
            ? this.selectedPackage.description
            : `Recarga de $${this.rechargeAmount.toFixed(2)}`,
          quantity: 1,
          price: this.rechargeAmount,
          metadata: {
            company: this.selectedCompany.id,
            phoneNumber: this.phoneNumber,
            package: this.selectedPackage?.id || 'custom',
            bonus: this.selectedPackage?.bonus || 0,
            totalAmount: this.totalAmount,
          },
        };

        // Emit event or add to cart directly
        this.$emit('add-to-cart', item);

        // Add to recent numbers if not already there
        if (!this.recentNumbers.includes(this.phoneNumber)) {
          this.recentNumbers.unshift(this.phoneNumber);
          if (this.recentNumbers.length > 5) {
            this.recentNumbers.pop();
          }
        }

        this.isProcessing = false;
        this.isOpen = false;

        // Reset form (keep company and recent numbers)
        this.phoneNumber = '';
        this.selectedPackage = null;
        this.customAmount = 0;
      }, 1000);
    },
  },
};
</script>

<template>
  <div>
    <!-- Trigger Button -->
    <button
      class="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
      aria-haspopup="dialog"
      aria-expanded="false"
      aria-controls="recharge-modal"
      @click="isOpen = true"
    >
      <div class="flex items-center justify-center space-x-2">
        <FontAwesomeIcon :icon="faMobileScreen" class="h-4 w-4" />
        <span>Nueva Recarga</span>
      </div>
    </button>

    <!-- Modal Overlay -->
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Overlay Background -->
      <div
        v-motion="{
          initial: { opacity: 0 },
          enter: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
          leave: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
        }"
        class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        @click="isOpen = false"
      ></div>

      <!-- Modal Container -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div
          id="recharge-modal"
          v-motion="{
            initial: { opacity: 0, y: 20, scale: 0.98 },
            enter: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
            },
            leave: {
              opacity: 0,
              y: 20,
              scale: 0.98,
              transition: { duration: 0.2, ease: [0.36, 0.66, 0.04, 1] },
            },
          }"
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recharge-modal-title"
          @click.stop
        >
          <!-- Modal Header -->
          <div
            class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <FontAwesomeIcon :icon="faMobileScreen" class="h-5 w-5 text-purple-500" />
              <h2 id="recharge-modal-title" class="text-xl font-bold text-gray-800 dark:text-white">
                Nueva Recarga
              </h2>
            </div>
            <button
              class="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              aria-label="Cerrar modal"
              @click="isOpen = false"
            >
              <FontAwesomeIcon :icon="faXmark" class="h-5 w-5" />
            </button>
          </div>

          <!-- Modal Content -->
          <div class="overflow-y-auto max-h-[calc(100vh-12rem)]">
            <div class="p-6">
              <!-- Company Selection -->
              <div
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 50 } },
                }"
                class="mb-6"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon :icon="faSimCard" class="h-4 w-4 mr-2 text-purple-500" />
                  Compañía Telefónica
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    v-for="company in telecomCompanies"
                    :key="company.id"
                    :class="[
                      'p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center',
                      selectedCompany?.id === company.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-inner'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                    ]"
                    :aria-pressed="selectedCompany?.id === company.id"
                    @click="selectCompany(company)"
                  >
                    <div class="h-12 w-12 mb-2 flex items-center justify-center">
                      <img :src="company.logo" :alt="company.name" class="max-h-full max-w-full" />
                    </div>
                    <span class="font-medium text-xs sm:text-sm text-center">{{
                      company.name
                    }}</span>
                  </button>
                </div>
              </div>

              <!-- Phone Number Input -->
              <div
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 100 } },
                }"
                class="mb-6"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon :icon="faPhone" class="h-4 w-4 mr-2 text-purple-500" />
                  Número de Teléfono
                </h3>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 dark:text-gray-400">+</span>
                  </div>
                  <input
                    v-model="phoneNumber"
                    type="tel"
                    class="pl-8 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="1234567890"
                    maxlength="15"
                    @input="formatPhoneNumber"
                  />
                </div>

                <!-- Recent Numbers -->
                <div v-if="recentNumbers.length > 0" class="mt-3">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Números recientes:</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="(number, index) in recentNumbers"
                      :key="index"
                      class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full transition-colors flex items-center"
                      @click="selectRecentNumber(number)"
                    >
                      <FontAwesomeIcon
                        :icon="faClockRotateLeft"
                        class="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400"
                      />
                      {{ number }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Package Selection -->
              <div
                v-if="selectedCompany"
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 150 } },
                }"
                class="mb-6"
              >
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    <FontAwesomeIcon :icon="faBoxOpen" class="h-4 w-4 mr-2 text-purple-500" />
                    Paquetes Disponibles
                  </h3>
                  <div class="flex items-center space-x-2">
                    <button
                      :class="[
                        'px-3 py-1 text-xs rounded-full',
                        !showAllPackages
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                      ]"
                      @click="showAllPackages = false"
                    >
                      Populares
                    </button>
                    <button
                      :class="[
                        'px-3 py-1 text-xs rounded-full',
                        showAllPackages
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                      ]"
                      @click="showAllPackages = true"
                    >
                      Todos
                    </button>
                  </div>
                </div>

                <!-- Package Tabs -->
                <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
                  <nav class="-mb-px flex space-x-4">
                    <button
                      v-for="(type, index) in packageTypes"
                      :key="index"
                      :class="[
                        'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm',
                        activePackageType === type.value
                          ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                      ]"
                      @click="activePackageType = type.value"
                    >
                      {{ type.label }}
                    </button>
                  </nav>
                </div>

                <!-- Package Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div
                    v-for="(pkg, index) in filteredPackages"
                    :key="index"
                    :class="[
                      'p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                      selectedPackage?.id === pkg.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-inner'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                      pkg.highlight ? 'ring-2 ring-purple-300 dark:ring-purple-800' : '',
                    ]"
                    @click="selectPackage(pkg)"
                  >
                    <div class="flex flex-col h-full">
                      <div class="flex-grow">
                        <div class="flex justify-between items-start mb-2">
                          <span class="font-bold text-lg text-gray-800 dark:text-white"
                            >${{ pkg.amount.toFixed(2) }}</span
                          >
                          <span
                            v-if="pkg.bonus"
                            class="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded-full"
                          >
                            +{{ pkg.bonus }}%
                          </span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          {{ pkg.description }}
                        </p>
                        <p
                          v-if="pkg.validity"
                          class="text-xs text-gray-500 dark:text-gray-500 mt-1"
                        >
                          <FontAwesomeIcon :icon="faClock" class="h-3 w-3 mr-1" />
                          {{ pkg.validity }}
                        </p>
                      </div>
                      <div
                        v-if="pkg.popular"
                        class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
                      >
                        <span class="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          <FontAwesomeIcon :icon="faStar" class="h-3 w-3 mr-1" />
                          Popular
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Custom Amount -->
                <div class="mt-4">
                  <label
                    for="custom-amount"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    O ingresa un monto personalizado
                  </label>
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <span class="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      id="custom-amount"
                      v-model="customAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      class="pl-8 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0.00"
                      @focus="selectCustomAmount"
                    />
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div
                v-if="selectedCompany && phoneNumber.length >= 10"
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 200 } },
                }"
                class="mb-6"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon :icon="faBolt" class="h-4 w-4 mr-2 text-purple-500" />
                  Acciones Rápidas
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    v-for="action in quickActions"
                    :key="action.amount"
                    class="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors text-center"
                    @click="applyQuickAction(action)"
                  >
                    <div class="font-bold text-purple-600 dark:text-purple-400">
                      ${{ action.amount.toFixed(2) }}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {{ action.label }}
                    </div>
                  </button>
                </div>
              </div>

              <!-- Summary -->
              <div
                v-if="
                  selectedCompany &&
                  phoneNumber.length >= 10 &&
                  (selectedPackage || customAmount > 0)
                "
                v-motion="{
                  initial: { opacity: 0, y: 10 },
                  enter: { opacity: 1, y: 0, transition: { delay: 250 } },
                }"
                class="mb-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"
                >
                  <FontAwesomeIcon :icon="faReceipt" class="h-4 w-4 mr-2 text-purple-500" />
                  Resumen de Recarga
                </h3>

                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Compañía:</span>
                    <span class="font-medium">{{ selectedCompany.name }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Número:</span>
                    <span class="font-medium">+{{ phoneNumber }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Monto:</span>
                    <span class="font-medium">${{ rechargeAmount.toFixed(2) }}</span>
                  </div>

                  <div v-if="selectedPackage?.bonus" class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Bono:</span>
                    <span class="font-medium text-green-600 dark:text-green-400"
                      >+{{ selectedPackage.bonus }}% (${{
                        ((rechargeAmount * selectedPackage.bonus) / 100).toFixed(2)
                      }})</span
                    >
                  </div>

                  <div v-if="selectedPackage?.description" class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Paquete:</span>
                    <span class="font-medium text-right">{{ selectedPackage.description }}</span>
                  </div>

                  <div
                    class="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between"
                  >
                    <span class="text-gray-800 dark:text-white font-semibold">Total:</span>
                    <span class="text-purple-600 dark:text-purple-400 font-bold"
                      >${{ totalAmount.toFixed(2) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div
            class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-end"
          >
            <button
              class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              @click="isOpen = false"
            >
              Cancelar
            </button>
            <button
              :disabled="!canAddToCart"
              :class="[
                'px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center',
                canAddToCart
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed',
              ]"
              @click="addToCart"
            >
              <FontAwesomeIcon
                v-if="isProcessing"
                :icon="faSpinner"
                class="h-4 w-4 mr-2 animate-spin"
              />
              <span>{{ canAddToCart ? 'Agregar al Carrito' : 'Completa los datos' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
