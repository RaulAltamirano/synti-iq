import { setProjectAnnotations } from '@storybook/vue3';
import '@storybook/addon-vitest/internal/setup-file';

import preview from './preview';

setProjectAnnotations([preview]);
