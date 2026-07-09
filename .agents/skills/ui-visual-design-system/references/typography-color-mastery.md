# Typography and Color Mastery

Authoritative reference for advanced typography and color systems in UI and visual design. Apply these principles to build typographic hierarchies and color palettes that are systematic, accessible, and scalable across platforms and locales.

---

## Typography Deep Dive

### Complete Font Pairing Guide

Select font pairings based on contrast and complementary structural characteristics rather than arbitrary aesthetic preference.

**Serif + Sans-Serif Pairings**

Pair a serif typeface for editorial body text with a geometric or humanist sans-serif for UI elements and headings. The structural contrast between stroke-modulated serifs and uniform sans-serifs creates clear visual hierarchy.

- Use a transitional serif (e.g., Charter, Utopia) with a humanist sans-serif (e.g., Source Sans, Fira Sans) for balanced warmth and legibility.
- Pair a high-contrast didone serif (e.g., Playfair Display) with a neutral grotesque (e.g., Inter, Helvetica Neue) for editorial sophistication.
- Combine a slab serif (e.g., Roboto Slab) with its sans-serif sibling (Roboto) for cohesion with minimal risk.

**Display + Body Pairings**

Reserve display typefaces for headings at 24px and above. Never use display faces at body sizes; their exaggerated features degrade legibility below 18px.

- Match a condensed display face with a wider body face to create spatial contrast.
- Pair a rounded display face with a structured geometric body face to balance personality with readability.
- Use superfamilies (e.g., IBM Plex Sans / Serif / Mono) when consistency is more important than contrast.

**Complementary Characteristics to Evaluate**

Assess these attributes when pairing fonts:

- **x-height ratio**: Ensure both faces share a similar x-height so they optically align at the same font-size.
- **Stroke contrast**: Pair high-contrast strokes with low-contrast strokes for hierarchy differentiation.
- **Letter spacing tendency**: Avoid pairing two tightly-spaced faces; combine a tight face with a naturally open one.
- **Historical period**: Fonts from the same era (e.g., both humanist) pair naturally; cross-era pairings require more careful balancing.
- **Intended use class**: Pair a face designed for long-form reading with one designed for short labels or headlines.

Limit any project to two typeface families maximum; use weight and size variations to create additional hierarchy levels within each family.

### Variable Fonts

Adopt variable fonts to reduce file size, enable fluid responsive design, and gain fine-grained typographic control.

**Advantages**

- A single variable font file replaces 6-12 static weight files, reducing total download size by 50-70%.
- Enable smooth animations along any axis for interactive states (hover weight transitions, responsive size adjustments).
- Provide precise optical tuning unavailable with static fonts (e.g., weight 450 instead of choosing between 400 and 500).

**Standard Axes**

| Axis | Tag | Range (typical) | Use Case |
|------|-----|-----------------|----------|
| Weight | `wght` | 100-900 | Replace multiple weight files; fine-tune emphasis |
| Width | `wdth` | 75-125 | Condense text in tight UI or expand for display |
| Slant | `slnt` | -12 to 0 | Subtle emphasis without a separate italic file |
| Italic | `ital` | 0 or 1 | True italic letterforms vs. slanted roman |
| Optical Size | `opsz` | 8-144 | Auto-adjust stroke contrast for size context |

**Implementation**

```css
@font-face {
  font-family: 'InterVariable';
  src: url('/fonts/InterVariable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}

body {
  font-family: 'InterVariable', system-ui, sans-serif;
  font-variation-settings: 'wght' 400, 'opsz' 16;
}

h1 {
  font-variation-settings: 'wght' 720, 'opsz' 48;
}
```

Register custom axes with `@font-face` descriptors and use `font-variation-settings` for non-standard axes. Prefer standard CSS properties (`font-weight`, `font-stretch`, `font-style`) for registered axes to enable proper cascading and animation.

### Responsive Typography

Implement fluid type scales that interpolate smoothly between viewport breakpoints without media query jumps.

**Fluid Type with CSS clamp()**

```css
:root {
  /* fluid base: 16px at 320vw, 20px at 1280vw */
  --step-0: clamp(1rem, 0.875rem + 0.4167vw, 1.25rem);
  --step-1: clamp(1.2rem, 1.025rem + 0.5833vw, 1.5625rem);
  --step-2: clamp(1.44rem, 1.1938rem + 0.8208vw, 1.9531rem);
  --step-3: clamp(1.728rem, 1.3856rem + 1.1413vw, 2.4414rem);
  --step-4: clamp(2.0736rem, 1.6038rem + 1.5660vw, 3.0518rem);
}
```

Calculate each step using the formula: `clamp(minSize, preferred, maxSize)` where preferred = `minSize + (maxSize - minSize) * ((100vw - minViewport) / (maxViewport - minViewport))`. Simplify to a `rem + vw` expression for CSS.

**Type Scale Ratios**

Choose a modular scale ratio appropriate to the content type:

- **1.125 (Major Second)**: Tight scale for data-dense UIs, dashboards.
- **1.200 (Minor Third)**: General-purpose UI applications.
- **1.250 (Major Third)**: Marketing pages, moderate hierarchy.
- **1.333 (Perfect Fourth)**: Editorial, blog, documentation.
- **1.500 (Perfect Fifth)**: Display-heavy landing pages.

Generate 5-7 steps from the chosen ratio. Apply steps consistently to heading levels, body, captions, and labels.

**Viewport-Based Sizing Guards**

Always set minimum and maximum bounds. Never use raw `vw` units for font-size without `clamp()` — text becomes illegibly small on narrow viewports and absurdly large on ultrawide monitors.

### Typography for Different Content Types

**Editorial / Long-Form**

- Set body text between 16-20px (1rem-1.25rem) with line-height of 1.5-1.7.
- Maintain line length between 45-75 characters (measure); 66 characters is optimal.
- Use generous paragraph spacing (1em-1.5em margin-bottom).
- Apply hanging punctuation and optical margin alignment where supported.
- Employ drop caps or lead-in styles for article openings.

**UI / Application**

- Set base UI text at 14-16px with line-height of 1.3-1.5.
- Use semibold (600) for labels and controls; avoid bold (700) in small text.
- Differentiate primary, secondary, and tertiary text through opacity or color value, not size alone.
- Enforce strict truncation rules with ellipsis for overflow in constrained components.

**Data-Heavy / Dashboards**

- Use tabular (monospaced) figures for numerical columns: `font-variant-numeric: tabular-nums`.
- Set data at 12-14px; maintain consistent column alignment.
- Use condensed widths for dense data tables to fit more information without horizontal scrolling.
- Differentiate row headers from data cells through weight, not color alone.

**Marketing / Landing Pages**

- Set hero text at step-4 or step-5 in the type scale (36-64px equivalent).
- Use display optical sizes for large headings; switch to text optical sizes for body.
- Apply letter-spacing adjustments: tighten at display sizes (-0.02em), loosen at small sizes (+0.01em).
- Limit body text width to 600-700px maximum for comfortable reading even on wide viewports.

### International Typography

**CJK Considerations (Chinese, Japanese, Korean)**

- CJK characters occupy a square em-box; set line-height to 1.7-2.0 for comfortable vertical spacing.
- Never justify CJK text with Latin justification algorithms; use `text-justify: inter-ideograph` or equivalent.
- Specify CJK font families explicitly in the font stack: `font-family: 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans', sans-serif`.
- CJK fonts are large (5-20MB); use unicode-range subsetting or variable CJK fonts where available.
- Punctuation rules differ: full-width punctuation, prohibition rules (kinsoku) prevent certain characters from appearing at line starts or ends.

**RTL Script Handling (Arabic, Hebrew)**

- Set `dir="rtl"` on the HTML element or container; use `direction: rtl` in CSS only as a supplement.
- Use CSS logical properties (`margin-inline-start`, `padding-inline-end`) instead of physical directions to ensure layouts flip correctly.
- Arabic requires connected cursive rendering; test that font ligatures render correctly at all sizes.
- Bidirectional text (mixed LTR and RTL) requires explicit `<bdo>` or Unicode bidi control characters for correct ordering.
- Mirror UI icons and layouts, but do not mirror content that is universally directional (media playback controls, clocks, phone numbers).

**Multi-Script Systems**

- When mixing scripts in a single line, adjust `vertical-align` or `line-height` to harmonize different x-heights and ascender/descender proportions.
- Provide separate `@font-face` declarations with `unicode-range` to load only the glyphs needed for each script.
- Test text rendering on target platforms; font fallback behavior varies significantly across operating systems.

### Font Loading Strategy

Control the flash of unstyled or invisible text during font loading with deliberate strategies.

| Strategy | `font-display` | Behavior | Best For |
|----------|----------------|----------|----------|
| **FOUT** (Flash of Unstyled Text) | `swap` | Show fallback immediately; swap when loaded | Body text, accessibility priority |
| **FOIT** (Flash of Invisible Text) | `block` | Hide text up to 3s; swap or show fallback | Display/heading text only |
| **Optional** | `optional` | Use font only if cached; never swap | Decorative/non-essential fonts |
| **Fallback** | `fallback` | Brief block (100ms), then fallback; late load ignored | Balanced approach |

**Preloading Critical Fonts**

```html
<link rel="preload" href="/fonts/Inter-var.woff2" as="font" type="font/woff2" crossorigin>
```

Preload only the primary body font (1-2 files maximum). Preloading too many fonts negates the benefit by congesting the critical request path.

**Font Fallback Matching**

Use `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` in `@font-face` to match fallback system fonts to the web font metrics, minimizing layout shift during swap:

```css
@font-face {
  font-family: 'Inter-fallback';
  src: local('Arial');
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
```

### Type Rendering

**Anti-Aliasing**

- macOS uses subpixel-free grayscale anti-aliasing by default (since Mojave). Apply `-webkit-font-smoothing: antialiased` only when intentionally thinning heavy fonts on light backgrounds.
- Windows uses ClearType subpixel rendering with DirectWrite. Text appears heavier than on macOS at the same weight.
- Never force anti-aliasing mode globally; test on both platforms and adjust weight selections per platform if needed.

**Platform Differences**

- The same font at the same size renders with different visual weight, spacing, and hinting across macOS, Windows, Linux, iOS, and Android.
- Design with platform-native system fonts as a fallback baseline; test custom fonts on each target platform.
- Hinting matters on Windows at small sizes (below 16px); prefer fonts with quality TrueType hinting (e.g., Inter, Roboto) for cross-platform consistency.

### OpenType Features

Activate OpenType features to refine typographic quality. Use `font-feature-settings` or the higher-level `font-variant-*` properties.

| Feature | CSS | Use |
|---------|-----|-----|
| Standard ligatures | `font-variant-ligatures: common-ligatures` | fi, fl, ffi connections (enabled by default) |
| Tabular numbers | `font-variant-numeric: tabular-nums` | Aligned numbers in tables and data |
| Lining numbers | `font-variant-numeric: lining-nums` | Uniform-height numbers for UI |
| Oldstyle numbers | `font-variant-numeric: oldstyle-nums` | Numbers that blend with body text |
| Small caps | `font-variant-caps: small-caps` | Abbreviations, acronyms in running text |
| Stylistic alternates | `font-feature-settings: 'salt' 1` | Alternate letterforms for brand character |
| Fractions | `font-variant-numeric: diagonal-fractions` | Properly stacked fractions (1/2 becomes a single glyph) |
| Case-sensitive forms | `font-feature-settings: 'case' 1` | Adjusts punctuation for all-caps text |

### Vertical Rhythm

Maintain a consistent baseline grid so all text and spacing aligns to a predictable vertical pattern.

**Establishing the Grid**

1. Set a base unit equal to the body line-height in pixels (e.g., 16px font-size * 1.5 line-height = 24px base unit).
2. Constrain all vertical spacing (margins, padding, gaps) to multiples of this base unit: 24px, 48px, 72px.
3. Set heading line-heights so that each heading occupies an integer multiple of the base unit.

**Practical Implementation**

```css
:root {
  --baseline: 1.5rem; /* 24px at 16px base */
}

h1 { font-size: var(--step-4); line-height: calc(var(--baseline) * 2); margin-bottom: var(--baseline); }
h2 { font-size: var(--step-3); line-height: calc(var(--baseline) * 2); margin-bottom: var(--baseline); }
p  { font-size: var(--step-0); line-height: var(--baseline); margin-bottom: var(--baseline); }
```

Accept slight deviations for fluid type sizes. The goal is optical consistency, not pixel-perfect mathematical alignment at every viewport width.

### Typography Testing

**Readability Testing**

- Test with real content, not lorem ipsum. Use representative paragraphs at minimum 300 words.
- Verify line length (measure) stays within 45-75 characters across all breakpoints.
- Conduct the "newspaper test": can a user scan headlines and grasp page structure in under 3 seconds?

**Automated Checks**

- Integrate contrast checking into CI (axe-core, Pa11y) to validate text-to-background contrast at every heading and body level.
- Use line-length linting (stylelint custom rules) to flag containers wider than `75ch` without `max-width` constraints.
- Run font loading performance audits with Lighthouse; flag render-blocking font requests.

---

## Color Deep Dive

### Color Theory Foundations

Apply color harmony rules from the color wheel systematically rather than relying on subjective taste.

**Harmony Rules**

- **Complementary**: Two colors opposite on the wheel (e.g., blue and orange). High contrast, high energy. Use for CTAs against neutral backgrounds.
- **Analogous**: Three adjacent colors (e.g., blue, blue-green, green). Low contrast, cohesive. Use for backgrounds and subtle UI surfaces.
- **Triadic**: Three evenly-spaced colors (e.g., red, yellow, blue). Balanced vibrancy. Use one dominant, one secondary, one accent.
- **Split-Complementary**: A base color plus two colors adjacent to its complement. Nearly as much contrast as complementary but more nuanced.
- **Tetradic (Rectangle)**: Four colors in two complementary pairs. Use sparingly; requires careful balance to avoid visual noise.

In practice, select one primary and one accent color, then generate neutrals from a desaturated variant of the primary. Limit chromatic colors to 2-3 in any interface; use neutrals for 80-90% of surface area.

### Perceptual Color Spaces

**Why OKLCH Over HSL/RGB**

HSL and RGB are device-oriented, not perception-oriented. Two colors with the same HSL lightness value can appear drastically different in perceived brightness (e.g., yellow at L:50% appears far lighter than blue at L:50%).

OKLCH (Lightness, Chroma, Hue) and CIELAB are perceptually uniform: equal numeric differences produce equal visual differences.

**OKLCH Axis Definitions**

- **L (Lightness)**: 0 (black) to 1 (white). Perceptually linear.
- **C (Chroma)**: 0 (gray) to approximately 0.4 (maximum saturation, varies by hue). Controls color intensity.
- **H (Hue)**: 0-360 degrees. Perceptually uniform hue distribution — no discontinuities like HSL's green bias.

**Practical Application**

Generate consistent tonal palettes by fixing chroma and hue while stepping lightness:

```css
:root {
  --blue-100: oklch(0.95 0.03 250);
  --blue-200: oklch(0.88 0.06 250);
  --blue-300: oklch(0.78 0.10 250);
  --blue-400: oklch(0.68 0.15 250);
  --blue-500: oklch(0.58 0.19 250);
  --blue-600: oklch(0.48 0.17 250);
  --blue-700: oklch(0.38 0.14 250);
  --blue-800: oklch(0.28 0.10 250);
  --blue-900: oklch(0.18 0.06 250);
}
```

Each step has equal perceived lightness difference. This is impossible to achieve reliably in HSL.

### Systematic Color Palette Generation

**Algorithmic Approaches**

1. **Lightness ramp method**: Fix hue and chroma, vary lightness in equal OKLCH steps. Produces consistent tonal scales.
2. **Chroma curve method**: Increase chroma toward mid-tones, decrease at extremes (lights and darks). Mimics natural color behavior and prevents neon artifacts at mid-range.
3. **Hue rotation method**: Apply slight hue shifts across the lightness ramp (e.g., blue shifts toward purple in dark tones, toward cyan in light tones). Creates richer, more natural-feeling palettes.

**Hand-Tuning**

After algorithmic generation, adjust by eye:

- Ensure the darkest step (900) works as text on white and the lightest step (100) works as a background.
- Verify mid-range steps (400-600) meet WCAG AA contrast against both white and dark surfaces.
- Check that adjacent steps are distinguishable from each other; merge any steps that appear identical.

Generate 9-11 steps per color for maximum flexibility. At minimum, produce 5 steps: lightest background, light, mid, dark, darkest text.

### Brand Color Integration

Translate brand guidelines into functional UI palettes by treating the brand color as a single input point, not the entire palette.

1. Place the primary brand color at the 500 step in a generated scale.
2. Adjust its OKLCH chroma if it exceeds gamut at extreme lightness values.
3. Generate the full tonal ramp around it, preserving hue and approximate chroma curve.
4. Derive a complementary or split-complementary accent from the brand color's hue.
5. Generate neutrals by desaturating the brand hue to chroma 0.01-0.03, providing a warm or cool tint to grays.

Never modify the exact brand color value for primary usage (logos, brand marks). Adjust derived UI colors (hover states, backgrounds, borders) freely within the generated scale.

### Color for Data Visualization

**Sequential Palettes**

Use a single-hue lightness ramp for ordered data (low-to-high). Ensure at least 3:1 contrast ratio between adjacent stops when the palette encodes fewer than 7 values.

**Diverging Palettes**

Use two hues (one warm, one cool) diverging from a neutral midpoint. Ensure the two endpoints are distinguishable under all forms of color vision deficiency — pair blue-orange or purple-green rather than red-green.

**Categorical Palettes**

Assign colors that are maximally distinguishable in hue and lightness. Limit categorical palettes to 8-10 colors maximum; beyond that, use patterns, shapes, or labels.

- Test categorical palettes with a color blindness simulator (Sim Daltonism, Coblis).
- Ensure every category is identifiable by a non-color cue (shape, pattern, label, position).

### Cultural Color Associations

Color meaning varies by culture. Account for this in products serving international audiences.

| Color | Western | East Asian | Middle Eastern | South Asian |
|-------|---------|------------|----------------|-------------|
| Red | Danger, passion, urgency | Luck, prosperity, celebration | Danger, caution | Purity (in marriage), fertility |
| White | Purity, cleanliness | Mourning, death | Purity, peace | Mourning (in some contexts) |
| Green | Nature, growth, money | Youth, fertility | Islam, paradise, prosperity | Fertility, happiness |
| Yellow | Caution, warmth | Royalty, sacred | Happiness, prosperity | Sacred, auspicious |
| Black | Elegance, mourning | Power, mystery | Mourning, evil | Evil, negativity |

Do not rely on color alone to convey meaning. Always pair color with text labels, icons, or patterns so the message persists regardless of cultural interpretation.

### Dark Mode Color Adaptation

**Saturation Adjustment**

Reduce chroma by 10-20% for dark mode. Fully saturated colors on dark backgrounds cause visual vibration and eye strain, especially for blue and red hues.

```css
/* Light mode */
--accent: oklch(0.58 0.19 250);
/* Dark mode: reduce chroma */
--accent: oklch(0.68 0.15 250);
```

**Surface Elevation**

Use lightness to communicate elevation in dark mode instead of shadows (which are invisible on dark surfaces).

| Elevation | OKLCH Lightness | Use |
|-----------|----------------|-----|
| Base (dp 0) | 0.15 | App background |
| Surface (dp 1) | 0.18 | Cards, sheets |
| Raised (dp 4) | 0.21 | App bars, menus |
| Overlay (dp 8) | 0.24 | Dialogs, modals |
| Top (dp 16) | 0.27 | Popovers, tooltips |

**Brand Color in Dark Contexts**

If the brand color is dark (low lightness), use a lighter tint (300-400 step) as the primary interactive color in dark mode. Never place a dark brand color on a dark surface where contrast falls below 3:1.

### Color Accessibility

**Beyond Contrast Ratios**

WCAG 2.x contrast ratios (4.5:1 AA for normal text, 3:1 for large text) are a minimum floor, not a quality target. Strive for higher contrast, especially for body text (7:1 or above).

APCA (Accessible Perceptual Contrast Algorithm), developed for WCAG 3.0, provides more perceptually accurate contrast measurement. Evaluate critical text with APCA in addition to WCAG 2.x ratios.

**Colorblind-Safe Design**

- 8% of males and 0.5% of females have some form of color vision deficiency.
- Never use red vs. green as the sole differentiator. Pair with icons, text, or pattern.
- Protanopia (red-blind) and deuteranopia (green-blind) are most common; test designs against these first.
- Use blue as a safe base color — it is distinguishable across nearly all color vision types.

**Redundant Encoding**

Every instance where color conveys meaning must have a secondary indicator:

- Error states: red color + error icon + error text.
- Status indicators: color + label text + distinct icon shape.
- Chart data: color + pattern fill + data labels.
- Form validation: color border + icon + message text.

### CSS Color Functions

**`color-mix()`**

Blend two colors in any color space:

```css
/* 30% white mixed into the brand color in OKLCH space */
--brand-light: color-mix(in oklch, var(--brand) 70%, white);

/* 50/50 blend for a hover midpoint */
--hover: color-mix(in oklch, var(--primary), var(--secondary));
```

Always specify `in oklch` for perceptually uniform mixing.

**`oklch()` Function**

```css
--color: oklch(0.65 0.2 250);
--color-alpha: oklch(0.65 0.2 250 / 0.5);
```

**Relative Color Syntax**

Derive new colors from existing ones by modifying individual channels:

```css
--primary: oklch(0.55 0.2 250);
/* Lighten by adding 0.2 to lightness */
--primary-light: oklch(from var(--primary) calc(l + 0.2) c h);
/* Desaturate by halving chroma */
--primary-muted: oklch(from var(--primary) l calc(c / 2) h);
/* Shift hue by 30 degrees */
--secondary: oklch(from var(--primary) l c calc(h + 30));
```

Relative color syntax eliminates the need for pre-generated palette steps in many cases, enabling dynamic theme generation with minimal tokens.

### Color Token Architecture

Structure color tokens in three tiers to separate intent from implementation.

**Tier 1: Global Palette Tokens**

Raw color values with no semantic meaning. Name by hue and lightness step.

```json
{
  "color": {
    "blue": {
      "100": { "$value": "oklch(0.95 0.03 250)" },
      "500": { "$value": "oklch(0.58 0.19 250)" },
      "900": { "$value": "oklch(0.18 0.06 250)" }
    },
    "neutral": {
      "0": { "$value": "oklch(1.0 0 0)" },
      "100": { "$value": "oklch(0.96 0.005 250)" },
      "900": { "$value": "oklch(0.15 0.01 250)" },
      "1000": { "$value": "oklch(0.0 0 0)" }
    }
  }
}
```

**Tier 2: Semantic Tokens**

Map purpose to global values. These are what themes swap.

```json
{
  "color": {
    "bg": {
      "primary": { "$value": "{color.neutral.0}" },
      "secondary": { "$value": "{color.neutral.100}" },
      "brand": { "$value": "{color.blue.500}" }
    },
    "text": {
      "primary": { "$value": "{color.neutral.900}" },
      "secondary": { "$value": "{color.neutral.600}" },
      "on-brand": { "$value": "{color.neutral.0}" }
    },
    "border": {
      "default": { "$value": "{color.neutral.200}" },
      "focus": { "$value": "{color.blue.500}" }
    }
  }
}
```

**Tier 3: Component Tokens**

Map component-specific needs to semantic tokens. These enable component-level overrides without breaking the system.

```json
{
  "button": {
    "primary": {
      "bg": { "$value": "{color.bg.brand}" },
      "text": { "$value": "{color.text.on-brand}" },
      "border": { "$value": "{color.bg.brand}" },
      "bg-hover": { "$value": "{color.blue.600}" }
    }
  }
}
```

Consume only Tier 2 and Tier 3 tokens in application code. Never reference Tier 1 global tokens directly in components — doing so bypasses theming and creates hard-coded color dependencies.

---

## Integration: Typography + Color Working Together

### Hierarchy Through Combined Systems

Build visual hierarchy using both type scale and color simultaneously:

- **Primary content**: Largest appropriate type step + highest contrast text color (`text.primary`).
- **Secondary content**: One step smaller + reduced contrast (`text.secondary` or reduced opacity).
- **Tertiary/metadata**: Smallest type step + lowest contrast (`text.tertiary`), minimum 4.5:1 against background.

### Testing Typography and Color as a System

- Generate a type specimen page showing every heading level, body variant, and caption with the full color palette applied.
- Test the specimen page under simulated color vision deficiency.
- Validate every text-on-background combination against WCAG AA at minimum.
- Review the specimen on macOS, Windows, iOS, and Android for rendering consistency.
- Print the specimen (or view in grayscale) to verify hierarchy is maintained without color.

Treat typography and color as interdependent systems. Changes to one always affect the other. Audit both simultaneously during design reviews and accessibility testing.
