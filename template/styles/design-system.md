# Design System Documentation

This document provides a complete reference for the Cognito e-commerce platform design system. All colors, typography, spacing, and component styles are defined here and implemented in SCSS variables and mixins.

## Color Palette

### Primary Colors
Main brand colors used for primary actions and branding.

- `$primary-50: #e3f2fd` - Lightest blue
- `$primary-100: #bbdefb` - Very light blue
- `$primary-300: #64b5f6` - Light blue
- `$primary-500: #2196f3` - **Default primary** (main brand color)
- `$primary-700: #1976d2` - Dark blue

### Secondary Colors
Supporting brand colors for secondary elements and accents.

- `$secondary-50: #e8eaf6` - Lightest indigo
- `$secondary-100: #c5cae9` - Very light indigo
- `$secondary-300: #7986cb` - Light indigo
- `$secondary-500: #3f51b5` - **Default secondary** (main secondary color)
- `$secondary-700: #303f9f` - Dark indigo

### Accent Colors
Vibrant colors for special highlights and call-to-action elements.

- `$accent-50: #e0f7fa` - Lightest cyan
- `$accent-100: #b2ebf2` - Very light cyan
- `$accent-300: #4dd0e1` - Light cyan
- `$accent-500: #00bcd4` - **Default accent** (main accent color)
- `$accent-700: #0097a7` - Dark cyan

### Gray Scale
Neutral colors for text, backgrounds, and borders.

- `$gray-50: #fafafa` - Lightest gray (backgrounds)
- `$gray-100: #f5f5f5` - Very light gray (disabled backgrounds)
- `$gray-300: #e0e0e0` - Light gray (borders)
- `$gray-500: #9e9e9e` - Medium gray (secondary text)
- `$gray-700: #616161` - Dark gray (primary text)
- `$gray-900: #212121` - Darkest gray (headings)

### Semantic Colors
Status and feedback colors for UI states.

- `$success: #4caf50` - Success states (green)
- `$warning: #ff9800` - Warning states (orange)
- `$error: #f44336` - Error states (red)
- `$info: #2196f3` - Information states (blue)

### Legacy Color Variables
For backwards compatibility with existing code.

- `$primary-color` → `$primary-500`
- `$secondary-color` → `$secondary-500`
- `$accent-color` → `$accent-500`
- `$background-color` → `#ffffff`
- `$foreground-color` → `$gray-900`

## Typography

### Font Families

```scss
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
$font-family-heading: $font-family-base;
```

### Font Sizes

**Body Text:**
- `$font-size-small: 14px` - Small body text
- `$font-size-base: 16px` - Regular body text
- `$font-size-medium: 16px` - Medium body text
- `$font-size-large: 18px` - Large body text

**Headings:**
- `$font-size-h1: 48px` - Main page heading
- `$font-size-h2: 40px` - Section heading
- `$font-size-h3: 32px` - Sub-section heading
- `$font-size-h4: 24px` - Card/component heading
- `$font-size-h5: 20px` - Small heading

### Font Weights

- `$font-weight-regular: 400` - Regular body text
- `$font-weight-medium: 500` - Emphasized text
- `$font-weight-semibold: 600` - Buttons and labels
- `$font-weight-bold: 700` - Headings

### Line Heights

- `$line-height-base: 1.5` - Body text line height
- `$line-height-heading: 1.2` - Heading line height
- `$line-height-tight: 1.25` - Tight spacing for UI elements

### Typography Mixins

Use these mixins to apply consistent typography styles:

```scss
@include heading-1;  // h1 styling (48px, bold)
@include heading-2;  // h2 styling (40px, bold)
@include heading-3;  // h3 styling (32px, semibold)
@include heading-4;  // h4 styling (24px, semibold)
@include heading-5;  // h5 styling (20px, medium)
@include body-regular;  // Regular body text (16px, regular)
@include body-medium;   // Medium body text (16px, medium)
@include body-small;    // Small body text (14px, regular)
@include link-text;     // Link styling (16px, medium, blue, hover effects)
```

## Spacing System

Consistent spacing scale based on 4px grid:

- `$spacing-2xs: 2px` - Extra extra small spacing
- `$spacing-xs: 4px` - Extra small spacing
- `$spacing-sm: 8px` - Small spacing
- `$spacing-md: 16px` - Medium spacing (default)
- `$spacing-lg: 24px` - Large spacing
- `$spacing-xl: 32px` - Extra large spacing
- `$spacing-2xl: 48px` - 2x extra large spacing
- `$spacing-3xl: 64px` - 3x extra large spacing

## Border Radius

- `$border-radius-sm: 4px` - Small elements (inputs, tags)
- `$border-radius-md: 8px` - Medium elements (buttons, cards)
- `$border-radius-lg: 12px` - Large elements (modals, containers)
- `$border-radius-xl: 16px` - Extra large elements
- `$border-radius-full: 9999px` - Fully rounded (pills, avatars)

## Borders

- `$border-width: 1px` - Standard border width
- `$border-width-thick: 2px` - Thick border width
- `$border-color: #e0e0e0` - Default border color
- `$border-color-light: #f5f5f5` - Light border color
- `$border-color-dark: #9e9e9e` - Dark border color

## Shadows

Layered shadow system for depth and elevation:

- `$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)` - Subtle shadow
- `$shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1)` - Default card shadow
- `$shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15)` - Elevated elements
- `$shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.2)` - Modal/popup shadow

## Components

### Buttons

#### Primary Buttons
Main action buttons with solid background.

**Mixins:**
```scss
@include button-primary;        // Medium primary button
@include button-primary-small;  // Small primary button
@include button-primary-large;  // Large primary button
```

**Variables:**
- Height: 36px (small), 44px (medium), 52px (large)
- Padding: 8px/16px (small), 12px/24px (medium), 16px/32px (large)
- Background: `$primary-500`
- Hover: `$primary-700` with shadow
- Disabled: 50% opacity

#### Secondary Buttons
Outline buttons with transparent background.

**Mixins:**
```scss
@include button-secondary;        // Medium secondary button
@include button-secondary-small;  // Small secondary button
@include button-secondary-large;  // Large secondary button
```

**Variables:**
- Border: 1px solid `$primary-500`
- Background: transparent
- Hover: `$primary-50` background
- Text color: `$primary-500`

#### Text Buttons
Minimal buttons with no border or background.

**Mixin:**
```scss
@include button-text;  // Text button with hover effect
```

#### Accent Buttons
Special accent color buttons for emphasis.

**Mixin:**
```scss
@include button-accent;  // Accent color button
```

### Input Fields

#### Base Input
Default input field styling.

**Mixin:**
```scss
@include input-base;  // Standard input field
```

**Variables:**
- Height: `$input-height` (44px)
- Padding: `$input-padding` (12px 16px)
- Border: 1px solid `$gray-300`
- Focus: Blue border with shadow
- Disabled: Gray background

#### Input States

**Error Input:**
```scss
@include input-error;  // Red border and focus ring
```

**Valid Input:**
```scss
@include input-valid;  // Green border and focus ring
```

**Input with Icon:**
```scss
@include input-with-icon;  // Left padding for icon
@include input-icon;       // Icon positioning
```

### Cards

#### Standard Card
Basic card container with shadow.

**Mixin:**
```scss
@include card;  // Standard card with shadow
```

**Variables:**
- Padding: `$card-padding` (24px)
- Border radius: `$card-border-radius` (12px)
- Shadow: `$shadow-md`
- Background: white

#### Card Variants

**Hover Card:**
```scss
@include card-hover;  // Card with hover lift effect
```

**Simple Card:**
```scss
@include card-simple;  // Card with border, no shadow
```

**Product Card:**
```scss
@include card-product;  // Hover lift and shadow enhancement
```

#### Card Sections

**Card Header:**
```scss
@include card-header;  // Top section with bottom border
```

**Card Footer:**
```scss
@include card-footer;  // Bottom section with top border
```

### Alert Components

Status messages and notifications.

**Mixins:**
```scss
@include alert-error;    // Error alert (red)
@include alert-warning;  // Warning alert (orange)
@include alert-info;     // Info alert (blue)
@include alert-success;  // Success alert (green)
```

**Features:**
- Left border accent (4px)
- Icon support
- Colored background
- Flex layout for content

## Breakpoints

Responsive design breakpoints:

- `$breakpoint-mobile: 768px` - Mobile devices
- `$breakpoint-tablet: 1024px` - Tablet devices
- `$breakpoint-desktop: 1280px` - Desktop screens

### Responsive Mixins

```scss
@include mobile { /* styles */ }      // < 768px
@include tablet { /* styles */ }      // 768px - 1023px
@include desktop { /* styles */ }     // >= 1280px
@include mobile-up { /* styles */ }   // >= 768px
@include tablet-up { /* styles */ }   // >= 1024px
```

## Layout Utilities

### Flexbox Helpers

```scss
@include flex-center;    // Center both axes
@include flex-between;   // Space between with center align
@include flex-column;    // Vertical flex layout
@include flex-start;     // Align start
@include flex-end;       // Align end
```

### Container

```scss
@include container;  // Responsive centered container
```

**Features:**
- Max width: 1280px
- Centered with auto margins
- Responsive horizontal padding

### Text Utilities

**Single Line Truncate:**
```scss
@include truncate;  // Ellipsis overflow
```

**Multi-line Truncate:**
```scss
@include truncate-lines(3);  // Clamp to 3 lines
```

## Transitions

Smooth animation timing:

- `$transition-fast: 150ms ease-in-out` - Quick interactions
- `$transition-base: 250ms ease-in-out` - Default transitions
- `$transition-slow: 350ms ease-in-out` - Slower animations

## Z-Index Scale

Layering system for stacking contexts:

- `$z-index-dropdown: 1000`
- `$z-index-sticky: 1020`
- `$z-index-fixed: 1030`
- `$z-index-modal-backdrop: 1040`
- `$z-index-modal: 1050`
- `$z-index-popover: 1060`
- `$z-index-tooltip: 1070`

## Modal and Overlay

### Overlay

```scss
@include overlay;  // Full-screen backdrop
```

**Features:**
- Fixed positioning
- Semi-transparent background
- Flex centering
- Backdrop z-index

### Modal

```scss
@include modal;  // Modal window container
```

**Features:**
- White background
- Large shadow
- Responsive sizing (90vw/90vh max)
- Scrollable content
- High z-index

## Focus States

### Focus Ring

```scss
@include focus-ring;     // Blue focus ring
@include focus-visible;  // Focus ring on keyboard focus only
```

## Usage Examples

### Creating a Primary Button

```scss
.button {
  @include button-primary;

  &.small {
    @include button-primary-small;
  }

  &.large {
    @include button-primary-large;
  }
}
```

### Creating a Responsive Card

```scss
.product-card {
  @include card-product;

  @include mobile {
    padding: $spacing-md;
  }

  @include desktop {
    padding: $spacing-xl;
  }
}
```

### Creating Form Inputs

```scss
.input-field {
  @include input-base;

  &.error {
    @include input-error;
  }

  &.valid {
    @include input-valid;
  }
}
```

## Best Practices

1. **Use variables** instead of hard-coded values for colors and spacing
2. **Use mixins** for consistent component styling
3. **Follow the spacing system** (4px grid) for all margins and padding
4. **Use semantic color names** (`$success`, `$error`) instead of generic names
5. **Apply responsive mixins** for mobile-first design
6. **Use the z-index scale** to avoid stacking conflicts
7. **Leverage transition variables** for consistent animations
8. **Use typography mixins** for consistent text styling across the app

## File Structure

```
template/styles/
├── variables.scss        # All design tokens and variables
├── mixins.scss          # Reusable SCSS mixins
├── globals.scss         # Global styles and resets
└── design-system.md     # This documentation
```

## Customization

To customize the design system:

1. Modify variables in `variables.scss`
2. Adjust mixins in `mixins.scss` if needed
3. Keep the same variable and mixin names for compatibility
4. Test changes across all components

The design system is intentionally separated from business logic to allow complete visual customization without breaking functionality.
