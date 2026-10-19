import { createApp } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import './assets/tailwind.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

import App from './modules/core/pages/App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { MotionPlugin } from '@vueuse/motion';
import StatusModalPlugin from './modules/shared/services/statusModalService';
import { useThemeStore } from './modules/shared/store/ThemeStore';
import { setupVeeValidate } from './modules/forms/vee-validate.config';

setupVeeValidate();

const pinia = createPinia();
library.add(fas, far, fab);

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(pinia);
useThemeStore(pinia).init();
app.use(StatusModalPlugin);
app.use(router);
app.use(MotionPlugin);
app.mount('#app');
