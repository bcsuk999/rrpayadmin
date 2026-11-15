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

### SelectDropdown — `src/components/SelectDropdown.tsx`

Custom select ported from the reference: 32px trigger, options panel with
hover/selected states, keyboard navigation (Enter/Space/Arrows/Home/End/
Escape/Tab), top or bottom placement, and outside-click/Escape closing.

| Prop          | Type                                  | Default |
| ------------- | ------------------------------------- | ------- |
| `value`       | `string \| number`                    | —       |
| `onChange`    | `(value) => void`                     | —       |
| `options`     | `(SelectOption \| string \| number)[]` | —       |
| `placement`   | `top \| bottom`                       | `bottom`|
| `placeholder` | `string`                              | `All`   |
| `disabled`    | `boolean`                             | `false` |
| `id`          | `string`                              | —       |
| `ariaLabel`   | `string`                              | —       |
| `className`   | `string`                              | —       |

```tsx
<SelectDropdown
  value={status}
  onChange={setStatus}
  options={[
    { value: 'active', label: 'Active' },
    { value: 'banned', label: 'Banned', disabled: true },
  ]}
  placement="bottom"
/>
```

### Sidebar — `src/components/Sidebar.tsx`

Admin navigation rail: 242px expanded / 64px collapsed rail, navy `#324157`
background, brand + Admin badge (mark when collapsed), nav items with
children flyouts, mobile drawer at ≤880px, amber active state.

| Prop               | Type                              | Default        |
| ------------------ | --------------------------------- | -------------- |
| `collapsed`        | `boolean`                         | `false`        |
| `mobileOpen`       | `boolean`                         | `false`        |
| `brand`            | `string`                          | `RRPAY`        |
| `badge`            | `string`                          | `Admin`        |
| `footerTitle`      | `string`                          | `{brand} Admin Panel` |
| `footerSubtitle`   | `string`                          | `Manage users & transactions` |
| `items`            | `SidebarNavItem[]`                | reference nav  |
| `currentPath`      | `string`                          | `/`            |
| `currentTab`       | `string`                          | —              |
| `onClose`          | `() => void`                      | —              |
| `onNavigate`       | `(item) => void`                  | —              |
| `onNavigateChild`  | `(parent, child) => void`         | —              |

```tsx
<Sidebar
  collapsed={collapsed}
  mobileOpen={mobileOpen}
  currentPath={path}
  onClose={() => setMobileOpen(false)}
  onNavigate={(item) => item.to && setPath(item.to)}
/>
```

### Header — `src/components/Header.tsx`

50px navy sticky bar: desktop collapse toggle, mobile menu toggle, breadcrumb
(Home / page), settings dropdown (View tags / Static cards), account dropdown
(Logout) and fullscreen toggle.

| Prop               | Type                      | Default     |
| ------------------ | ------------------------- | ----------- |
| `collapsed`        | `boolean`                 | `false`     |
| `pageTitle`        | `string`                  | `Dashboard` |
| `homeLabel`        | `string`                  | `Home`      |
| `showTags`         | `boolean`                 | `true`      |
| `showStats`        | `boolean`                 | `true`      |
| `onToggleSidebar`  | `() => void`              | —           |
| `onToggleMobile`   | `() => void`              | —           |
| `onShowTagsChange` | `(value: boolean) => void`| —           |
| `onShowStatsChange`| `(value: boolean) => void` | —           |
| `onLogout`         | `() => void`              | —           |

```tsx
<Header
  collapsed={collapsed}
  pageTitle="Dashboard"
  showTags={showTags}
  onToggleSidebar={() => setCollapsed((v) => !v)}
  onToggleMobile={() => setMobileOpen((v) => !v)}
  onShowTagsChange={setShowTags}
  onLogout={logout}
/>
```

### TagsView — `src/components/TagsView.tsx`

Visited-page tabs bar (the "view tags" feature toggled from the header):
navy background, amber active tag, close button per tag (except Home),
horizontal scroll. Controlled or self-managing based on `currentPath`.

| Prop          | Type                      | Default |
| ------------- | ------------------------- | ------- |
| `tags`        | `TagItem[]`               | internal |
| `currentPath` | `string`                  | `/`     |
| `onNavigate`  | `(path: string) => void`  | —       |
| `onClose`     | `(path: string) => void`  | —       |
| `titleMap`    | `Record<string,string>`   | built-in |

```tsx
<TagsView
  currentPath={path}
  onNavigate={(p) => setPath(p)}
/>
```

### Login — `src/components/Login.tsx`

Full-page sign-in card: brand + badge, mobile number + password fields,
validation message, and a loading submit button (uses the Button spinner).

| Prop            | Type                              | Default                  |
| --------------- | --------------------------------- | ------------------------ |
| `brand`         | `string`                          | `RRPAY`                  |
| `badge`         | `string`                          | `Admin`                  |
| `title`         | `string`                          | `Sign in to your account`|
| `loading`       | `boolean`                         | uncontrolled             |
| `errorMessage`  | `string`                          | —                        |
| `onSubmit`      | `(mobile, password) => void \| Promise<void>` | — |
| `className`     | `string`                          | —                        |

```tsx
<Login
  onSubmit={async (mobile, password) => {
    await adminLogin(mobile, password)
  }}
/>
```

### Toast — `src/components/Toast.tsx`

Viewport toasts with auto-dismiss: `success`, `error`, `warning`, `info`.
Module-level store so `useToast()` works anywhere; render `<ToastContainer />`
once (e.g. in your layout).

| Export          | Description                                              |
| --------------- | -------------------------------------------------------- |
| `useToast()`    | Returns `{ toasts, add, dismiss, clear, success, error, warning, info }` |
| `ToastContainer`| Renders the toasts into `document.body`                  |
| `addToast`      | Imperative helper                                        |

```tsx
const toast = useToast()

toast.success('Action completed successfully')
toast.error('Something went wrong')
toast.warning('Please review')
toast.info('Logged out')

// in layout:
<ToastContainer />
```

### Table — `src/components/Table*.tsx`

Table building blocks ported from the reference: `TableCard` (surface),
`TableCardHeading` (gradient title + subtitle + actions), `DataTable`
(horizontal scroll wrapper), `Pagination` and `TableFooter`.

| Component          | Key props                                              |
| ------------------ | ------------------------------------------------------ |
| `TableCard`        | `className`, `children`                                |
| `TableCardHeading` | `title`, `subtitle`, `actions`                          |
| `DataTable`        | `wide`, `compact`, `className`, `children` (thead/tbody)|
| `Pagination`       | `page`, `totalPages`, `disabled`, `directInput`, `showPageSizes`, `pageSize`, `pageSizes`, `onChange`, `onSizeChange` |
| `TableFooter`      | `page`, `totalPages`, `total`, `pageSize`, `pageSizes`, `onChange`, `onSizeChange` |

```tsx
<TableCard>
  <TableCardHeading title="Users (12)" subtitle="Page 1 / 2" />
  <DataTable>
    <thead><tr><th>UID</th><th>Mobile</th></tr></thead>
    <tbody>...</tbody>
  </DataTable>
  <TableFooter page={page} totalPages={totalPages} total={total} onChange={setPage} />
</TableCard>
```

