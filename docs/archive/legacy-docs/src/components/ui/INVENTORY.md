# UI Component Inventory

## Existing Components

| Component | File | Variants | Status |
|-----------|------|----------|--------|
| Button | `button.tsx` | default (gradient), destructive, outline, secondary, ghost, link | ✅ Complete |
| Badge | `badge.tsx` | default, secondary, destructive, outline, success, warning, accent | ✅ Complete |
| Input | `input.tsx` | base only | ⚠️ Missing error, disabled variants |
| Card | `card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter | ✅ Complete |
| Skeleton | `skeleton.tsx` | base only | ✅ Complete |
| Select | `select.tsx` | Multiple parts | ✅ Complete |
| Dialog | `dialog.tsx` | Multiple parts | ✅ Complete |
| Sheet | `sheet.tsx` | Multiple parts | ✅ Complete |
| Form | `form.tsx` | Multiple parts | ✅ Complete |
| Label | `label.tsx` | base | ✅ Complete |
| Separator | `separator.tsx` | base | ✅ Complete |
| Avatar | `avatar.tsx` | Multiple parts | ✅ Complete |
| Checkbox | `checkbox.tsx` | base | ✅ Complete |
| Textarea | `textarea.tsx` | base | ✅ Complete |
| Sonner | `sonner.tsx` | toast | ✅ Complete |

## Missing Components (To Create)

| Component | Location | Purpose | Priority |
|-----------|----------|---------|----------|
| ProductCard | `components/catalog/` | Catalog product display with Card primitives | High |
| QuantitySelector | `components/ui/` | Reusable +/- stepper for cart/checkout | High |
| PriceDisplay | `components/ui/` | Format cents → dollars consistently | Medium |
| EmptyState | `components/ui/` | Empty cart, no results states | Medium |

## Pages Using Inline Styles

| Page | File | Issues |
|------|------|--------|
| Catalog | `app/shop/catalog/page.tsx` | Inline ProductCard, generic classes, `ui-${intent}` not mapped |
| Checkout | `app/checkout/page.tsx` | Generic border/rounded, no Card/Input components, `text-danger` |
| CartDrawer | `components/CartDrawer.tsx` | Emoji icon, `bg-danger`, `rounded`, no animation |

## Variant Additions Needed

### Input
- [ ] `error` variant (red ring, error border)
- [ ] `disabled` visual state

### Button
- [ ] `loading` variant with spinner

### Badge
- [ ] Map `ui_intent` prop to variants (stock_status, etc.)
