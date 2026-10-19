import type { Preview } from '@storybook/vue3-vite';
import '../src/assets/tailwind.css';
import '../src/modules/ui/styles/tokens.css';
import '../src/modules/ui/styles/base.css';
import { setup } from '@storybook/vue3';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import { MotionPlugin } from '@vueuse/motion';
import { useThemeStore } from '../src/modules/shared/store/ThemeStore';

library.add(fas, far, fab);

const mockRouter = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'Home', component: { template: '<div />' } },
    { path: '/gallery', name: 'Gallery', component: { template: '<div />' } },
  ],
});

const pinia = createPinia();

setup((app) => {
  app.use(pinia);
  useThemeStore(pinia).init();
  app.use(mockRouter);
  app.use(MotionPlugin);
  app.component('font-awesome-icon', FontAwesomeIcon);
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1f2937' },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '320px', height: '568px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1024px', height: '768px' },
          type: 'desktop',
        },
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      const toolbarTheme = context.globals.theme || 'light';
      const themeStore = useThemeStore(pinia);
      // Must update preference + DOM; init `syncFromPreference` alone would follow localStorage/OS
      // and ignore the Storybook toolbar. `$patch({ isDark })` does not reliably update setup-store refs.
      themeStore.setPreference(toolbarTheme === 'dark' ? 'dark' : 'light', { persist: false });

      return story();
    },
  ],
};

export default preview;
