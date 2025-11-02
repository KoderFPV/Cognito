# Cognito Template System

This directory contains the visual presentation layer of the Cognito e-commerce platform. It separates the **look & feel** (HTML + CSS) from the **business logic** (state, handlers, API calls).

## Design Vision

Below are the reference designs that showcase how the platform should look and feel:

### Desktop Experience

**Home Page**
![Home Page Design](./assets/Desktop/home.png)

**Product Listing**
![Product Listing Design](./assets/Desktop/listing_1.png)

**Product Page**
![Product Page Design](./assets/Desktop/product_page.png)

### Mobile Experience

The platform is mobile-first with full responsive support. Mobile designs are available in `template/assets/Mobile/`.

### Design System

![Design System](./assets/design_system.png)

The design system defines the visual language including colors, typography, spacing, and components used throughout the platform.

## Overview

The template system allows you to completely customize the appearance of the Cognito platform without touching any business logic. Simply replace the contents of this `template/` directory with your own design.

## Directory Structure

```
template/
├── components/          # Presentational components (HTML structure)
│   └── LoginForm/
│       ├── LoginFormTemplate.tsx         # React component (JSX + props)
│       └── LoginFormTemplate.module.scss # Component-specific styles
├── styles/              # Global styles and design tokens
│   ├── globals.scss     # Global CSS reset and base styles
│   ├── variables.scss   # Design tokens (colors, spacing, fonts, etc.)
│   └── mixins.scss      # Reusable SCSS mixins and utilities
└── README.md           # This file
```

## How It Works

### Separation of Concerns

**Business Logic** (`components/`, `app/`, `services/`):
- Component state (useState, useReducer)
- Side effects (useEffect, API calls)
- Event handlers
- Data fetching and mutations
- Routing and navigation

**Presentation** (`template/`):
- HTML structure (JSX)
- CSS styles (SCSS modules)
- Visual design
- Layout and spacing
- Colors and typography

### Example: LoginForm

**Logic Component** (`components/login/loginForm/LoginForm.tsx`):
```typescript
export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    // Business logic here
  };

  return (
    <LoginFormTemplate
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      // ... other props
    />
  );
};
```

**Template Component** (`template/components/LoginForm/LoginFormTemplate.tsx`):
```typescript
export const LoginFormTemplate = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
      />
      {/* Pure presentation - no business logic */}
    </form>
  );
};
```

## Customizing the Template

### Step 1: Backup the Original

```bash
cp -r template/ template-original/
```

### Step 2: Modify Design Tokens

Edit `template/styles/variables.scss` to change colors, fonts, spacing:

```scss
// Brand Colors
$primary-color: #YOUR_BRAND_COLOR;
$secondary-color: #YOUR_SECONDARY_COLOR;

// Typography
$font-family-base: 'Your Font', sans-serif;
```

### Step 3: Update Component Templates

Modify the HTML structure in `template/components/*/` files:

**Important:** Keep the same:
- File names and export names
- Component props interfaces (TypeScript types)
- Event handler signatures

**You can change:**
- HTML structure and elements
- CSS classes and styling
- Visual layout and design

### Step 4: Update Styles

Edit the corresponding `.module.scss` files to style your components.

## Design Tokens

All design tokens are centralized in `template/styles/variables.scss`:

### Colors
- `$primary-color` - Main brand color
- `$secondary-color` - Secondary brand color
- `$background-color` - Page background
- `$foreground-color` - Text color
- `$error-color` - Error messages
- `$success-color` - Success messages

### Typography
- `$font-family-base` - Base font family
- `$font-size-base` - Base font size (16px)
- `$font-size-h1`, `$font-size-h2`, etc.

### Spacing
- `$spacing-xs` to `$spacing-2xl` - Consistent spacing scale

### Border Radius
- `$border-radius-sm` to `$border-radius-xl`

### Responsive Breakpoints
- `$breakpoint-mobile` - 768px
- `$breakpoint-tablet` - 1024px
- `$breakpoint-desktop` - 1280px

## SCSS Mixins

Common patterns are available as mixins in `template/styles/mixins.scss`:

```scss
@import '../../styles/mixins';

.myComponent {
  @include flex-center;      // Flexbox centered
  @include card;             // Card styling with shadow
  @include button-primary;   // Primary button styles
  @include input-base;       // Input field styles

  @include mobile {          // Mobile-only styles
    // styles for mobile
  }

  @include tablet-up {       // Tablet and above
    // styles for tablet+
  }
}
```

## Component Interface Contracts

Each template component exports a TypeScript interface that defines its props. **You must maintain these interfaces** when customizing:

```typescript
export interface LoginFormTemplateProps {
  title: string;
  subtitle: string;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  // ... etc
}
```

If you change the interface, you'll need to update the corresponding logic component.

## Best Practices

### ✅ DO:
- Keep template components **pure** (no state, no side effects)
- Use design tokens from `variables.scss`
- Maintain TypeScript interfaces
- Add visual enhancements (animations, transitions)
- Reorganize HTML structure as needed
- Use SCSS modules for component styles

### ❌ DON'T:
- Add business logic to template components
- Make API calls from templates
- Use React hooks (useState, useEffect, etc.) in templates
- Change prop interfaces without updating logic components
- Import from `components/`, `services/`, or `app/` directories

## Testing Your Template

After making changes:

1. **Visual testing**: Check all pages in the browser
2. **Responsive testing**: Test on mobile, tablet, and desktop
3. **Functionality testing**: Ensure all interactions still work
4. **TypeScript**: Run `npm run build` to check for type errors

## Sharing Your Template

If you create a custom template you'd like to share:

1. Remove any business logic (should only be presentation)
2. Document any special requirements
3. Package the `template/` directory
4. Share with the community!

## Support

For questions or issues related to the template system, please refer to the main project documentation or open an issue on GitHub.
