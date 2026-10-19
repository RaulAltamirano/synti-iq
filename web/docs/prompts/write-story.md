# Prompt: Add Storybook Story for a Component

Use this prompt when asking an AI agent or developer to add a Storybook story for an existing Vue component.

---

## Instructions

Add a `.stories.ts` file for the component at `[path/to/ComponentName.vue]`.

### Steps (from [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md))

1. **Create** `ComponentName.stories.ts` next to the component.
2. **Use CSF3 format:**
   - `const meta: Meta<typeof Component> = { ... }`
   - `type Story = StoryObj<typeof Component>`
   - `export default meta`
3. **Include required stories:**
   - **Default:** Base case
   - **Variants:** One story per variant (Primary, Secondary, etc.)
   - **Sizes:** All size options
   - **States:** Loading, Disabled, Error (only when the component has corresponding props)
   - **AllVariants:** Visual regression / design review (optional)
4. **Args and argTypes:**
   - All interactive props as `args`
   - Use `args.children` for default slot content in story templates (Storybook-only convention)
   - Explicit `control` and `description` for each prop
   - Use `control: 'select'` with `options` for union types
5. **Event logging:** Add `onClick: { action: 'clicked' }`, `onClose: { action: 'closed' }` etc. to argTypes.

### Canonical reference

- [InfoBanner.stories.ts](../../src/modules/ui/components/InfoBanner/InfoBanner.stories.ts)

### Template shape

```typescript
import type { Meta, StoryObj } from '@storybook/vue3';
import { fn } from 'storybook/test';
import ComponentName from './ComponentName.vue';

const meta: Meta<typeof ComponentName> = {
  title: 'UI/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  args: {
    onRemove: fn(), // Add for each emitted event
  },
  argTypes: {
    // prop: { control: 'select', options: [...], description: '...' }
    onRemove: { action: 'remove', description: 'Emitted when dismiss is clicked' },
  },
  parameters: {
    docs: {
      description: {
        component: 'One-line description of the component.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: { /* ... */ },
  render: (args) => ({
    components: { ComponentName },
    setup() { return { args }; },
    template: '<ComponentName v-bind="args" @remove="args.onRemove" />',
  }),
};
```

**For components that emit events:**
- Bind handlers in the template: `@remove="args.onRemove"`, `@click="args.onClick"`, etc.
- Add `args.onEventName: fn()` to `meta.args` for each emit
- Add `onEventName: { action: 'eventName', description: '...' }` to `argTypes`
- Import `fn` from `'storybook/test'`

For components without emits, use `template: '<ComponentName v-bind="args" />'` only.

### Ensure

- Storybook glob includes the module: check `.storybook/main.ts` — currently `ui`, `auth`, `profile`, `home`, `shared`, `checkoutBox`
- If the component is in another module not listed above, add that module to the stories glob in `.storybook/main.ts`
