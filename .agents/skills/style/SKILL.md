---
name: style
description: Style UI with Tailwind and tokens. Use when styling components or adjusting layout.
---

# Style Skill

This skill ensures that all UI implementations adhere to the project's aesthetic and technical standards.

## When to use this skill

- Use this when building new React components that require styling.
- Use this when adjusting layout, spacing, or typography.
- Use this when adding shared design values.

## How to use it

### Tokens

Always refer to the existing design system in `src/styles`:

- **Base (`tokens.css`)**: true-black background (`--color-bg`), white text (`--color-text`). Add shared vars here, never hardcode hex in components.
- **Entry (`main.css`)**: Tailwind import plus tokens. Component styles stay as Tailwind utilities in the markup.
- **Dark only**: true black background, white primary text. Information-dense, no decorative card/pill chrome, no light-gray subtitle lines above sections.
- **Copy**: minimal. No em dashes.
- **Motion**: avoid continuously repainting CSS animations (pulse, shimmer, blur, spinners); they peg the GPU on high-refresh displays.

## Example

```tsx
// Good: Tailwind utilities, no custom CSS file needed
<section className="mx-auto max-w-2xl px-4 py-10">
  <h1 className="text-xl font-semibold text-white">knots</h1>
</section>
```
