---
name: ppm-frontend-architecture
description: >
  Use this skill whenever an AI agent needs to create, modify, or review frontend
  code (components, hooks, views, layouts, or library modules) following the PPM
  Frontend Architecture Standard. Triggers: any React component creation, hook
  development, library module scaffolding, UI composition, or architecture review
  for projects using this standard. Also use when deciding versioning strategy,
  folder structure, or CI/CD integration for frontend libraries.
---

## Overview

This skill encodes the **PPM Frontend Architecture Standard** for reusable UI
libraries. All generated code must comply with these rules so that components,
hooks, and views work consistently across all consumer projects.

---

## 1. Tech Stack (non-negotiable versions)

| Tool / Library | Version |
|----------------|---------|
| React | 19 |
| TypeScript | ^5 |
| JavaScript | ECMAScript 2020 |
| Tailwind CSS | 3.4.17 |
| Formik | ^2.4.6 |
| HeroUI | 2.6.14 |
| Vite | latest |
| Vitest | latest |
| npm | 6 |
| Node.js | > 22 |

> Never downgrade or swap these dependencies without a MAJOR version bump and
> explicit approval.

---

## 2. Quality Attributes

Every piece of code must satisfy the following attributes:

| # | Attribute | Rule |
|---|-----------|------|
| 01 | **Reusability** | Components, hooks and views must work in multiple projects without internal modifications. |
| 02 | **Modularity** | Each module is autonomous and has a single responsibility. |
| 03 | **Performance** | Components must be lightweight. Use `React.memo`, `useMemo`, and `useCallback` only where measurably needed. Avoid unnecessary re-renders. |
| 04 | **Testability** | All logic units, views, and containers must be testable in isolation with Vitest. |
| 05 | **Scalability** | The folder structure must allow adding new modules without refactoring existing ones. |

---

## 3. Architecture Principles

### 3.1 Composable UI
Build interfaces by composing small, independent pieces (LEGO-style). Each piece
is unaware of the context in which it will be used.

### 3.2 Atomic Design (simplified names)

| Atomic Design Name | Simplified Name | Contents |
|--------------------|-----------------|----------|
| atoms | **base** | Buttons, inputs, icons — autonomous UI units with no business context. |
| molecules | **elements** | Simple combos: input + label. Group primitives into higher-level elements. |
| organisms | **blocks** | Complete sections: forms, navigation bars. |
| templates | **layouts** | Reusable screen structures. |

### 3.3 Reusable Logic (Hooks)
- Encapsulate internal component state in custom hooks.
- Keep business logic (use cases, services, validations) in hooks, not in JSX.
- Hooks must be fully decoupled from the view layer.

### 3.4 Slot API & Contextual Components
- **Slot API**: Pass JSX components/fragments as props to customize specific areas.
- **Render Props**: Pass render functions for dynamic content.
- **Context API**: Share state or functions between components to avoid prop drilling.
- Support both **controlled** (external state) and **uncontrolled** (internal state)
  modes for maximum flexibility.

---

## 4. Folder Structure

```
src/
├── base/                     # atoms — primitive components
│   └── Button/
│       ├── Button.tsx
│       ├── index.ts
│       └── style.ts
│
├── <FeatureModule>/           # e.g. Login, Dashboard, Programs
│   ├── presentation/
│   │   ├── elements/          # molecules
│   │   ├── blocks/            # organisms
│   │   └── layouts/           # templates
│   ├── hooks/
│   ├── api/
│   └── index.ts
│
└── core/
    ├── provider/
    └── config/
```

### Rules
- Each feature module exports everything through its own `index.ts`.
- `base/` components must **never** import from feature modules.
- `hooks/` must **never** import from `presentation/`.
- `api/` layer is the only place that communicates with external services.

---

## 5. Component Authoring Rules

```tsx
// ✅ Correct — typed props, memo, no inline logic
import React, { memo } from 'react';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

const Button = memo(({ label, variant = 'primary', onClick }: ButtonProps) => (
  <button className={`btn btn-${variant}`} onClick={onClick}>
    {label}
  </button>
));

export default Button;
```

```tsx
// ❌ Incorrect — business logic inside JSX, no typing, no memo
const Button = ({ label, onClick }) => {
  const result = expensiveCalc(); // ← logic belongs in a hook
  return <button onClick={onClick}>{label} {result}</button>;
};
```

### Styling
- Use **Tailwind CSS utility classes** exclusively.
- Store design tokens (colors, spacing) as Tailwind config values, not inline styles.
- Component-specific overrides go in `style.ts` as a class-name object.

---

## 6. Hook Authoring Rules

```ts
// ✅ Correct — isolated logic, no UI imports
import { useState, useCallback } from 'react';
import { validateEmail } from '../api/validators';

export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    const result = await validateEmail(email);
    if (!result.valid) setError(result.message);
  }, [email]);

  return { email, setEmail, error, submit };
}
```

- Never import React components inside a hook.
- Always return a typed object, never a tuple (unless following the `useState` pattern).
- Clean up side-effects in the `useEffect` return function.

---

## 7. Forms

Use **Formik** for all form state management.

```tsx
import { useFormik } from 'formik';

const form = useFormik({
  initialValues: { email: '', password: '' },
  validate: values => { /* validation logic */ },
  onSubmit: values => { /* submit logic */ },
});
```

- Never manage form state with plain `useState` unless the form has a single field.
- Validation logic must live in a separate pure function (testable without the component).

---

## 8. Semantic Versioning (SemVer)

The library follows `MAJOR.MINOR.PATCH`. Use **changesets** to automate versioning.

| Change Type | Example | Version Bump |
|-------------|---------|-------------|
| Add new component | Add `<DatePicker>` | **MINOR** |
| Add new slot/context | Add `Card.Header` | **MINOR** |
| Visual tweak, no API change | Change `Card` padding | **PATCH** |
| Bug fix in a hook | Fix `useFormValidation` error clearing | **PATCH** |
| Breaking prop change | `Button` now requires `variant` | **MAJOR** |
| Remove slot/context | Remove `Card.Footer` | **MAJOR** |

> Update `package.json` version on every publish. Never publish without a version bump.

---

## 9. CI/CD Pipeline (Azure DevOps)

The following flow is **mandatory** for every change:

```
Developer → feature branch (Bitbucket)
        → Pull Request → webhook → Azure Pipelines (CI)
                                    ├── Build
                                    ├── Unit tests (Vitest)
                                    └── SonarCloud static analysis
        → Chapter Lead approval → merge to develop
        → Azure Artifacts publish (versioned npm package)
```

- **SonarCloud** must pass with no new critical issues before merge.
- **Chapter Lead** review is required for every PR.
- Published packages are hosted in **Azure Artifacts** and installed via `npm`.

---

## 10. Security Rules

1. **Dependency management**: Always use the latest stable versions of all
   dependencies. Run `npm audit` before publishing.
2. **Static analysis**: SonarCloud integration is non-negotiable; it runs on every
   CI build.
3. **No secrets in source**: API keys, tokens, and credentials must never appear
   in source code or `package.json`.
4. **Versioning compliance**: Follow SemVer strictly so consumers can safely
   upgrade using lock files.

---

## 11. Testing Standards

- Framework: **Vitest**
- Every component in `base/` needs at least one render test.
- Every custom hook needs unit tests covering success and error paths.
- Tests live alongside their subject: `Button.test.tsx` next to `Button.tsx`.
- Coverage must not drop on any PR; enforce via Azure Pipelines CI gate.

```ts
// Example Vitest test for a hook
import { renderHook, act } from '@testing-library/react';
import { useLoginForm } from './useLoginForm';

test('sets error when email is invalid', async () => {
  const { result } = renderHook(() => useLoginForm());
  act(() => result.current.setEmail('bad-email'));
  await act(() => result.current.submit());
  expect(result.current.error).not.toBeNull();
});
```

---

## 12. Checklist Before Every PR

- [ ] Component/hook has TypeScript types for all props and return values.
- [ ] No business logic inside JSX — moved to a hook.
- [ ] Tailwind classes only — no inline styles.
- [ ] Unit tests written and passing.
- [ ] SonarCloud analysis passes (no new critical/blocker issues).
- [ ] `package.json` version bumped according to SemVer rules.
- [ ] Changeset file created with `changeset` CLI.
- [ ] `index.ts` barrel updated to export the new module.
- [ ] Chapter Lead assigned as reviewer in Bitbucket.
