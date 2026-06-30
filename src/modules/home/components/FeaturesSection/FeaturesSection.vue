<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useTheme } from '@/modules/shared/composables/useTheme';
import {
  faChartLine,
  faUsers,
  faCog,
  faBoxes,
  faStore,
  faIndustry,
  faBoxOpen,
  faCashRegister,
  faClock,
  faCalendarAlt,
  faShoppingCart,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';

const { isDark } = useTheme();

const cards = [
  {
    title: 'Cashier',
    description: 'Process sales and manage transactions in real time.',
    icon: faCashRegister,
    iconBg: 'bg-green-500',
    route: 'cashier-sales',
    borderHoverLight: 'group-hover:border-green-500/20',
    borderHoverDark: 'group-hover:border-green-400/20',
  },
  {
    title: 'Users',
    description: 'Manage accounts, roles, and system permissions.',
    icon: faUsers,
    iconBg: 'bg-blue-500',
    route: 'Users',
    borderHoverLight: 'group-hover:border-blue-500/20',
    borderHoverDark: 'group-hover:border-blue-400/20',
  },
  {
    title: 'Products',
    description: 'Manage the product catalog and its details.',
    icon: faBoxOpen,
    iconBg: 'bg-purple-500',
    borderHoverLight: 'group-hover:border-purple-500/20',
    borderHoverDark: 'group-hover:border-purple-400/20',
  },
  {
    title: 'Suppliers',
    description: 'Manage information and relationships with suppliers.',
    icon: faIndustry,
    iconBg: 'bg-yellow-500',
    borderHoverLight: 'group-hover:border-yellow-500/20',
    borderHoverDark: 'group-hover:border-yellow-400/20',
  },
  {
    title: 'Stores',
    description: 'Supervise and configure multiple store locations.',
    icon: faStore,
    iconBg: 'bg-pink-500',
    route: 'StoreDashboard',
    borderHoverLight: 'group-hover:border-pink-500/20',
    borderHoverDark: 'group-hover:border-pink-400/20',
  },
  {
    title: 'Inventory',
    description: 'Control stock levels and inventory movements.',
    icon: faBoxes,
    iconBg: 'bg-indigo-500',
    borderHoverLight: 'group-hover:border-indigo-500/20',
    borderHoverDark: 'group-hover:border-indigo-400/20',
  },
  {
    title: 'Shifts',
    description: 'Organize and manage staff schedules.',
    icon: faClock,
    iconBg: 'bg-teal-500',
    borderHoverLight: 'group-hover:border-teal-500/20',
    borderHoverDark: 'group-hover:border-teal-400/20',
  },
  {
    title: 'Calendar',
    description: 'View important events and schedules.',
    icon: faCalendarAlt,
    iconBg: 'bg-orange-500',
    borderHoverLight: 'group-hover:border-orange-500/20',
    borderHoverDark: 'group-hover:border-orange-400/20',
  },
  {
    title: 'Analytics',
    description: 'Get insights and key business metrics.',
    icon: faChartLine,
    iconBg: 'bg-red-500',
    borderHoverLight: 'group-hover:border-red-500/20',
    borderHoverDark: 'group-hover:border-red-400/20',
  },
  {
    title: 'Orders',
    description: 'Manage purchase orders and tracking.',
    icon: faShoppingCart,
    iconBg: 'bg-lime-500',
    borderHoverLight: 'group-hover:border-lime-500/20',
    borderHoverDark: 'group-hover:border-lime-400/20',
  },
  {
    title: 'Reports',
    description: 'Generate detailed and exportable reports.',
    icon: faFileAlt,
    iconBg: 'bg-cyan-500',
    borderHoverLight: 'group-hover:border-cyan-500/20',
    borderHoverDark: 'group-hover:border-cyan-400/20',
  },
  {
    title: 'Settings',
    description: 'Adjust system preferences and parameters.',
    icon: faCog,
    iconBg: 'bg-gray-500',
    borderHoverLight: 'group-hover:border-gray-500/20',
    borderHoverDark: 'group-hover:border-gray-400/20',
  },
];

const ANIMATION_CONFIG = {
  staggerDelay: 0.025,
  duration: 0.25,
  maxDelay: 0.2,
};

const getCardDelay = (index) =>
  Math.min(index * ANIMATION_CONFIG.staggerDelay, ANIMATION_CONFIG.maxDelay);
</script>

<template>
  <section
    aria-labelledby="dashboard-title"
    class="py-6 px-0 sm:py-8 sm:px-2 md:py-10 md:px-4 lg:py-12 lg:px-6"
  >
    <div class="max-w-7xl mx-auto">
      <h2 id="dashboard-title" class="sr-only">Dashboard Features</h2>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6"
        role="list"
        aria-label="Feature cards"
      >
        <router-link
          v-for="(card, index) in cards"
          :key="card.route"
          v-motion="{
            initial: { opacity: 0, y: 10 },
            enter: {
              opacity: 1,
              y: 0,
              transition: {
                delay: getCardDelay(index),
                duration: ANIMATION_CONFIG.duration,
                ease: 'easeOut',
              },
            },
          }"
          :to="{ name: card.route }"
          role="listitem"
          :aria-label="`Go to ${card.title}`"
          :class="[
            'group relative block rounded-xl sm:rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 overflow-hidden min-h-[120px]',
            isDark
              ? 'bg-gray-900/80 border-gray-800 focus-visible:ring-offset-gray-900'
              : 'bg-white border-gray-200 focus-visible:ring-offset-white',
          ]"
        >
          <div
            :class="[
              'absolute inset-0 z-0 opacity-0 transition-opacity duration-150 rounded-xl sm:rounded-2xl',
              isDark ? 'group-hover:opacity-20' : 'group-hover:opacity-10',
              card.iconBg,
            ]"
            aria-hidden="true"
          />

          <div
            class="relative z-10 p-4 sm:p-5 lg:p-6 flex flex-col h-full backdrop-blur-sm rounded-xl sm:rounded-2xl"
          >
            <div class="mb-3 sm:mb-4">
              <div
                :class="card.iconBg"
                class="h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 flex items-center justify-center rounded-lg sm:rounded-xl shadow-md group-hover:rotate-3 group-hover:shadow-lg transition-all duration-200"
                aria-hidden="true"
              >
                <FontAwesomeIcon
                  :icon="card.icon"
                  class="text-white w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transition-transform duration-150 group-hover:scale-110"
                />
              </div>
            </div>

            <h3
              :class="[
                'text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 leading-tight transition-colors duration-150',
                isDark ? 'text-gray-100' : 'text-gray-900',
              ]"
            >
              {{ card.title }}
            </h3>

            <p
              :class="[
                'text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 grow',
                isDark ? 'text-gray-300' : 'text-gray-600',
              ]"
            >
              {{ card.description }}
            </p>

            <div class="mt-auto">
              <div
                :class="[
                  'inline-flex items-center text-xs sm:text-sm font-medium transition-colors duration-150',
                  isDark ? 'text-gray-300' : 'text-gray-700',
                ]"
              >
                <span>View details</span>
                <svg
                  class="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform duration-150"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div
            class="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-transparent pointer-events-none transition-all duration-150"
            :class="isDark ? card.borderHoverDark : card.borderHoverLight"
            aria-hidden="true"
          />
        </router-link>
      </div>
    </div>
  </section>
</template>
