---
name: Crave & Discover
colors:
  surface: '#fff8f6'
  surface-dim: '#f2d3ca'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ed'
  surface-container: '#ffe9e3'
  surface-container-high: '#ffe2da'
  surface-container-highest: '#fbdcd3'
  on-surface: '#281712'
  on-surface-variant: '#5c4037'
  inverse-surface: '#3f2c26'
  inverse-on-surface: '#ffede8'
  outline: '#916f65'
  outline-variant: '#e6beb2'
  surface-tint: '#ad3300'
  primary: '#a93100'
  on-primary: '#ffffff'
  primary-container: '#d34000'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59e'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#005da8'
  on-tertiary: '#ffffff'
  tertiary-container: '#0076d3'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59e'
  on-primary-fixed: '#3a0b00'
  on-primary-fixed-variant: '#842500'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a4c9ff'
  on-tertiary-fixed: '#001c39'
  on-tertiary-fixed-variant: '#004884'
  background: '#fff8f6'
  on-background: '#281712'
  surface-variant: '#fbdcd3'
typography:
  display-lg:
    fontFamily: Epilogue
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  2xl: 3rem
  gutter: 1rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
---

## Brand & Style

The brand personality for this design system is energetic, appetizing, and effortless. It aims to evoke a sense of culinary excitement while maintaining the high-utility feel of a modern digital tool. 

The design style follows a **Modern Minimalist** approach with a focus on high-quality food photography. It utilizes generous whitespace to allow colorful dish imagery to stand out. While the core is clean and functional, the system incorporates subtle tactile elements—specifically through soft shadows and layered cards—to make the interface feel tangible and responsive. The aesthetic avoids unnecessary decoration, ensuring the path from discovery to decision is frictionless.

## Colors

The palette is centered around a vibrant, high-chroma primary color designed to stimulate appetite and signal action. 

- **Primary (#FF4F00):** Used for key brand moments, primary CTAs, and active states. It should be used purposefully to guide the eye without overwhelming the content.
- **Secondary Grays:** A sophisticated range of cool-toned grays provides a neutral backdrop. These shades handle metadata, borders, and secondary text.
- **Dark Mode:** The system supports a deep navy-slate dark mode. In this mode, the primary orange retains its vibrancy, while surfaces use layered depth (lighter grays for elevated cards) rather than pure black to maintain readability and softness.

## Typography

This design system uses a dual-font strategy to balance character with clarity.

- **Headlines:** **Epilogue** provides a distinctive, geometric weight to the UI. Its bold presence creates a clear hierarchy for restaurant names and category titles.
- **Body & UI:** **Be Vietnam Pro** is used for all functional text. It offers a warm, contemporary feel with excellent legibility at small sizes, making it ideal for ingredient lists, reviews, and menu descriptions.
- **Hierarchy:** High contrast in weight is encouraged. Use "Epilogue Bold" for main titles and "Be Vietnam Pro Regular" for supporting copy to ensure an editorial feel.

## Layout & Spacing

The system utilizes a **Fluid Grid** model heavily inspired by Tailwind CSS's 8-pixel rhythm. 

- **Grid:** A 12-column grid is used for desktop, scaling down to a single-column stack for mobile discovery feeds. 
- **Rhythm:** All internal padding and external margins must be multiples of 4px. The standard "gap" between content cards is 16px (1rem).
- **Safe Areas:** On mobile devices, a minimum 16px horizontal margin is maintained to prevent content from touching the screen edges.

## Elevation & Depth

Visual hierarchy is established through a combination of **Tonal Layers** and **Ambient Shadows**.

- **Level 0 (Base):** The main background color.
- **Level 1 (Cards/Surfaces):** Raised elements use a 1px subtle border (#E2E8F0 in light mode) and a very soft, diffused shadow: `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`.
- **Level 2 (Floating/Interacting):** Hover states or active modals increase shadow spread and blur to simulate physical lift.
- **Dark Mode Depth:** Shadows are replaced by slight variations in surface lightness (e.g., a Level 1 card is slightly lighter than the Level 0 background) to maintain a clean aesthetic without "muddy" dark shadows.

## Shapes

The design system employs a consistent **Rounded** language to feel approachable and friendly. 

- **Primary Cards:** Always use a 16px (1rem) corner radius. This applies to restaurant cards, dish previews, and promotional banners.
- **Buttons & Inputs:** Use a 12px (0.75rem) radius to feel substantial yet aligned with the card language.
- **Small Elements:** Chips, tags, and small badges should use a fully rounded "pill" shape (9999px) to distinguish them from interactive containers.

## Components

- **Cards:** The core of the food-discovery experience. Cards feature full-bleed imagery at the top, followed by a content area with 16px padding. Titles are Epilogue Bold, while metadata (rating, distance) uses Be Vietnam Pro with small icons.
- **Buttons:** Primary buttons are #FF4F00 with white text. Secondary buttons use a light gray fill (#F1F5F9) with dark text. All buttons feature a subtle 2px vertical press interaction.
- **Chips:** Used for cuisine categories (e.g., "Italian," "Vegan"). These have a light gray background and transition to the primary orange background when selected.
- **Search Bar:** A prominent component with a 12px radius, a subtle inner shadow, and a persistent "Search for dishes or restaurants" placeholder.
- **Food Badges:** Specialized tags for "Trending," "Fast Delivery," or "Top Rated" that overlay on the top-left of cards using high-contrast backgrounds and white Epilogue typography.
- **Navigation:** A clean bottom tab bar for mobile, using icon+label combinations, where the active state is highlighted in the primary brand color.