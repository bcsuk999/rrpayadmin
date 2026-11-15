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

The loading state uses [ldrs](https://uiball.com/ldrs) `LineSpinner`, tinted with the
button's `currentColor`.

### Card — `src/components/Card.tsx`

Reference admin surface: white background, `#e4e7ed` border, 8px radius, 16px
padding and the two-layer card shadow.

| Prop            | Type        | Default |
| --------------- | ----------- | ------- |
| `title`         | `ReactNode` | —       |
| `subtitle`      | `ReactNode` | —       |
| `actions`       | `ReactNode` | —       |
| `bodyClassName` | `string`    | —       |

Native `<section>` attributes and `ref` are forwarded. The header only renders
when at least one of `title`, `subtitle` or `actions` is provided.

```tsx
import Card from './components/Card'

<Card
  title="Settlement summary"
  subtitle="Last 24 hours"
  actions={<Button variant="ghost" size="sm">View all</Button>}
>
  <p>Card body content.</p>
</Card>
```

### Input — `src/components/Input.tsx`

Reference filter input: 32px tall, 4px radius, `#dcdfe6` border, `#c0c4cc`
placeholder and the amber focus ring (`#ebaf5b` + `#f0c078`).

| Prop                 | Type              | Default |
| -------------------- | ----------------- | ------- |
| `label`              | `ReactNode`       | —       |
| `hint`               | `string`          | —       |
| `error`              | `string`          | —       |
| `containerClassName` | `string`          | —       |

Native `<input>` attributes and `ref` are forwarded. `error` also sets
`aria-invalid` and styles the field red.

```tsx
import Input from './components/Input'

<Input label="Group ID" placeholder="Please enter group ID" />
<Input label="UID" inputMode="numeric" />
<Input label="Reason" error="Reason is required" />
```

### DatePicker — `src/components/DatePicker.tsx`

Single-date picker ported from the reference: calendar icon trigger, fixed
popover, year/month navigation, today and selected states, Clear/Today footer,
outside-click and Escape handling, and viewport-aware positioning.

| Prop          | Type                      | Default                  |
| ------------- | ------------------------- | ------------------------ |
| `value`       | `string` (`YYYY-MM-DD`)   | —                        |
| `onChange`    | `(value: string) => void` | —                        |
| `placeholder` | `string`                  | `Please select a date`   |
| `disabled`    | `boolean`                 | `false`                  |
| `className`   | `string`                  | —                        |

```tsx
const [date, setDate] = useState('')

<DatePicker value={date} onChange={setDate} />
```

### FilterCard — `src/components/FilterCard.tsx`

The reference filter panel: 12px radius, `#e4e7ed` border, 15px padding,
title/description header, optional header actions and an animated collapse.

| Prop            | Type                      | Default    |
| --------------- | ------------------------- | ---------- |
| `title`         | `ReactNode`               | `Filters`  |
| `description`   | `ReactNode`               | —          |
| `actions`       | `ReactNode`               | —          |
| `open`          | `boolean`                 | uncontrolled |
| `defaultOpen`   | `boolean`                 | `true`     |
| `onOpenChange`  | `(open: boolean) => void` | —          |
| `collapsible`   | `boolean`                 | `true`     |
| `bodyClassName` | `string`                  | —          |

```tsx
<FilterCard
  title="Group filters"
  actions={<Button variant="ghost" size="sm">Export</Button>}
>
  <div className="flex flex-wrap items-center gap-2.5">
    <Input placeholder="Group ID" />
    <DatePicker value={date} onChange={setDate} />
  </div>
  <div className="mt-4 flex justify-end gap-2.5 border-t border-card-border pt-[15px]">
    <Button variant="ghost" size="sm">Reset</Button>
    <Button size="sm">Search</Button>
  </div>
</FilterCard>
```

The home page (`src/App.tsx`) renders every component, variant and state as a
visual checklist.

