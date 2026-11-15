# RRPAY Admin

React admin UI built with Vite, TypeScript and Tailwind CSS.

The visual language (palette, sizing, hover/active states) follows the existing
SimplyPay admin Vue project, ported component by component.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run lint     # oxlint
npm run preview  # preview the production build
```

## Components

### Button — `src/components/Button.tsx`

| Prop          | Type                                                             | Default     |
| ------------- | ---------------------------------------------------------------- | ----------- |
| `variant`     | `primary \| ghost \| outline \| success \| danger \| warning`     | `primary`   |
| `size`        | `sm \| md`                                                       | `md`        |
| `loading`     | `boolean`                                                        | `false`     |
| `loadingText` | `string`                                                         | `children`  |
| `fullWidth`   | `boolean`                                                        | `false`     |
| `leftIcon`    | `ReactNode`                                                      | —           |
| `rightIcon`   | `ReactNode`                                                      | —           |

All native `<button>` attributes are forwarded, and `ref` is supported.

```tsx
import Button from './components/Button'

<Button variant="primary">Save</Button>
<Button variant="ghost" leftIcon={<PlusIcon />}>Add user</Button>
<Button variant="danger" loading loadingText="Deleting…">Delete</Button>
```

The home page (`src/App.tsx`) renders every variant, size and state as a visual
checklist.
