# Animation Timing, Easing, and Physics-Based Motion

## CSS Animation and Transition Fundamentals

### Transition Properties

Use CSS transitions for simple state changes between two values. The four transition sub-properties control how interpolation occurs:

```css
.element {
  transition-property: transform, opacity;
  transition-duration: 300ms, 200ms;
  transition-timing-function: ease-out, linear;
  transition-delay: 0ms, 50ms;
}
```

The shorthand collapses all four into a single declaration. When specifying multiple transitions, separate each group with a comma:

```css
.element {
  transition: transform 300ms ease-out 0ms,
              opacity 200ms linear 50ms;
}
```

Use `transition: all` sparingly. It transitions every changed property, including unintended ones like `height` or `color`, which degrades performance and produces unexpected visual artifacts. Always enumerate specific properties.

### Keyframe Animations

Use `@keyframes` when animation requires more than two states, must loop, or must run without a state change trigger:

```css
@keyframes slide-in-up {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.element {
  animation: slide-in-up 400ms cubic-bezier(0.0, 0.0, 0.2, 1) both;
}
```

The `animation` shorthand accepts these sub-properties in order: `name`, `duration`, `timing-function`, `delay`, `iteration-count`, `direction`, `fill-mode`, `play-state`. Use `both` for `fill-mode` to retain the final keyframe state and apply the first keyframe state during the delay period.

### Key Differences Between Transitions and Animations

Transitions require a triggering state change (hover, class toggle, media query). Animations run on application of the `animation` property and can loop, alternate direction, and define intermediate keyframes. Prefer transitions for interactive state changes. Prefer keyframe animations for entrance effects, looping motion, and multi-step sequences.

---

## Cubic Bezier Deep Dive

### How Control Points Work

A cubic bezier curve in CSS defines the rate of change over time. The function `cubic-bezier(x1, y1, x2, y2)` takes four values representing two control points on a unit coordinate system where the X axis is time (0 to 1) and the Y axis is progress (0 to 1).

- **P0** is fixed at (0, 0) — the animation start.
- **P1** is the first control point at (x1, y1) — it pulls the curve away from the start.
- **P2** is the second control point at (x2, y2) — it pulls the curve toward the end.
- **P3** is fixed at (1, 1) — the animation end.

**Visual Intuition:**

- When P1 has a high Y value (e.g., `cubic-bezier(0.0, 0.8, ...)`), the animation starts fast — it covers a lot of progress early.
- When P2 has a low Y value (e.g., `cubic-bezier(..., 1.0, 0.2)`), the animation ends slowly — it decelerates into the final position.
- Y values outside 0–1 produce overshoot: `cubic-bezier(0.68, -0.55, 0.27, 1.55)` creates a back-and-forth elastic effect.
- X values must remain between 0 and 1 (time cannot go backward), but Y values have no such restriction.

### CSS Named Easings Mapped to Cubic Bezier

| Name          | Cubic Bezier                    | Character                  |
|---------------|---------------------------------|----------------------------|
| `ease`        | `cubic-bezier(0.25, 0.1, 0.25, 1.0)` | Soft start, quick finish |
| `ease-in`     | `cubic-bezier(0.42, 0, 1.0, 1.0)`    | Slow start, fast finish  |
| `ease-out`    | `cubic-bezier(0, 0, 0.58, 1.0)`      | Fast start, slow finish  |
| `ease-in-out` | `cubic-bezier(0.42, 0, 0.58, 1.0)`   | Slow start and finish    |
| `linear`      | `cubic-bezier(0, 0, 1, 1)`           | Constant speed           |

---

## Standard Easing Curve Library

### Material Design 3 Curves

Material Design defines four primary easing curves for its motion system:

```css
/* Standard curve — for elements moving between resting positions */
--md-sys-motion-easing-standard: cubic-bezier(0.2, 0.0, 0, 1.0);

/* Emphasized curve — for important, large, or expressive motion */
--md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0.0, 0, 1.0);

/* Emphasized accelerate — for elements leaving the screen */
--md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0.0, 0.8, 0.15);

/* Emphasized decelerate — for elements entering the screen */
--md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1.0);

/* Standard accelerate — for elements exiting, less expressive */
--md-sys-motion-easing-standard-accelerate: cubic-bezier(0.3, 0.0, 1.0, 1.0);

/* Standard decelerate — for elements entering, less expressive */
--md-sys-motion-easing-standard-decelerate: cubic-bezier(0.0, 0.0, 0.0, 1.0);
```

Material Design 3 duration tokens:

| Token            | Duration | Use Case                          |
|------------------|----------|-----------------------------------|
| `short1`         | 50ms     | Micro state changes               |
| `short2`         | 100ms    | Small element transitions         |
| `short3`         | 150ms    | Icon, checkbox, radio changes     |
| `short4`         | 200ms    | Selection, toggle state changes   |
| `medium1`        | 250ms    | Small expand/collapse              |
| `medium2`        | 300ms    | Standard element transitions      |
| `medium3`        | 350ms    | Medium area transitions           |
| `medium4`        | 400ms    | Large area transitions            |
| `long1`          | 450ms    | Page-level transitions            |
| `long2`          | 500ms    | Complex page transitions          |
| `long3`          | 550ms    | Full-screen transitions           |
| `long4`          | 600ms    | Complex orchestrated transitions  |
| `extra-long1`    | 700ms    | Dramatic transitions              |
| `extra-long2`    | 800ms    | Complex dramatic transitions      |
| `extra-long3`    | 900ms    | Extended sequences                |
| `extra-long4`    | 1000ms   | Maximum standard duration         |

### Apple System Animation Curves

Apple's Human Interface Guidelines define system-level animation curves accessible through platform APIs:

```swift
// iOS/macOS system curves
UIView.animate(withDuration: 0.35, delay: 0,
  options: .curveEaseInOut, animations: { ... })

// Spring animation (preferred in modern Apple design)
UIView.animate(withDuration: 0.5, delay: 0,
  usingSpringWithDamping: 0.7, initialSpringVelocity: 0.3,
  options: [], animations: { ... })
```

CSS approximations of Apple system curves:

```css
/* Apple ease-in-out (system default for most transitions) */
--apple-ease-in-out: cubic-bezier(0.42, 0, 0.58, 1.0);

/* Apple keyboard/sheet presentation */
--apple-sheet-present: cubic-bezier(0.2, 0.9, 0.3, 1.0);

/* Apple spring approximation (for non-spring environments) */
--apple-spring-approx: cubic-bezier(0.175, 0.885, 0.32, 1.275);

/* Apple fade duration */
--apple-fade-duration: 200ms;

/* Apple slide/sheet duration */
--apple-sheet-duration: 350ms;

/* Apple navigation push duration */
--apple-nav-push-duration: 450ms;
```

### Custom Brand-Appropriate Curves

Define curves that match a brand's personality. Store these as CSS custom properties for consistency:

```css
:root {
  /* Playful brand — slight overshoot, energetic feel */
  --brand-playful: cubic-bezier(0.34, 1.56, 0.64, 1.0);
  --brand-playful-duration: 500ms;

  /* Corporate/professional — smooth, no overshoot, measured */
  --brand-professional: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  --brand-professional-duration: 300ms;

  /* Premium/luxury — slow deceleration, graceful arrival */
  --brand-premium: cubic-bezier(0.16, 1, 0.3, 1);
  --brand-premium-duration: 600ms;

  /* Technical/precision — linear-ish with slight ease-out */
  --brand-technical: cubic-bezier(0.0, 0.0, 0.2, 1.0);
  --brand-technical-duration: 250ms;
}
```

---

## Spring Physics

### Parameter Fundamentals

Spring-based animations model the physics of a damped harmonic oscillator. Three parameters govern behavior:

**Stiffness (tension):** How forcefully the spring pulls toward the target. Higher stiffness means faster, snappier motion. Measured in Newtons per meter conceptually, though UI frameworks use unitless values.

**Damping (friction):** How quickly oscillation energy dissipates. Low damping produces more bounce. High damping produces an overdamped motion that settles without oscillation. Critical damping is the threshold at which the system settles in minimum time without oscillation: `criticalDamping = 2 * sqrt(stiffness * mass)`.

**Mass:** How heavy the element feels. Higher mass makes motion slower and more lumbering. Most UI spring animations keep mass at 1 and vary stiffness and damping.

### Standard Spring Configurations

#### Natural Spring
```
stiffness: 170, damping: 26, mass: 1
```
Produces a natural, organic motion with a small amount of settle oscillation. Suitable for general-purpose UI transitions, modal presentations, and element repositioning. Approximates the iOS default spring behavior. Duration equivalent: roughly 500–600ms to visual rest.

#### Bouncy Spring
```
stiffness: 300, damping: 10, mass: 1
```
Produces pronounced oscillation with 3–5 visible bounces before settling. Suitable for playful interfaces, gamification elements, achievement celebrations, and attention-grabbing notifications. Use sparingly — excessive bounce frustrates users on repeated interactions. Duration equivalent: roughly 800–1000ms to visual rest.

#### Stiff Spring
```
stiffness: 400, damping: 30, mass: 1
```
Produces fast, decisive motion with minimal overshoot. Settles almost immediately with at most one small oscillation. Suitable for responsive controls, toggles, switches, dropdown menus, and any interaction requiring instant feedback. Duration equivalent: roughly 250–350ms to visual rest.

#### Gentle Spring
```
stiffness: 100, damping: 20, mass: 1
```
Produces slow, graceful motion with a soft settle. Suitable for background elements, parallax layers, ambient decorative motion, and slow reveals. Duration equivalent: roughly 700–900ms to visual rest.

### Spring Animation Implementation

#### JavaScript — Framer Motion

```jsx
import { motion } from "framer-motion";

// Natural spring
<motion.div
  animate={{ x: 100 }}
  transition={{ type: "spring", stiffness: 170, damping: 26, mass: 1 }}
/>

// Bouncy spring
<motion.div
  animate={{ scale: 1 }}
  initial={{ scale: 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 10, mass: 1 }}
/>

// Stiff spring (useful for quick snaps)
<motion.div
  animate={{ rotate: 180 }}
  transition={{ type: "spring", stiffness: 400, damping: 30, mass: 1 }}
/>

// Spring with velocity (for gesture-driven animations)
<motion.div
  drag="x"
  dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
/>
```

#### JavaScript — React Spring

```jsx
import { useSpring, animated } from "@react-spring/web";

const [styles, api] = useSpring(() => ({
  from: { opacity: 0, y: 40 },
  to: { opacity: 1, y: 0 },
  config: { tension: 170, friction: 26, mass: 1 },
}));

// Presets available:
// config.default  — { tension: 170, friction: 26 }
// config.gentle   — { tension: 120, friction: 14 }
// config.wobbly   — { tension: 180, friction: 12 }
// config.stiff    — { tension: 210, friction: 20 }
// config.slow     — { tension: 280, friction: 60 }
// config.molasses — { tension: 280, friction: 120 }
```

#### Swift — iOS

```swift
// UIKit spring animation
UIView.animate(
    withDuration: 0.6,
    delay: 0,
    usingSpringWithDamping: 0.7,
    initialSpringVelocity: 0.0,
    options: [],
    animations: {
        view.transform = .identity
    }
)

// SwiftUI spring
withAnimation(.spring(response: 0.5, dampingFraction: 0.7, blendDuration: 0)) {
    isExpanded.toggle()
}

// SwiftUI interpolating spring (iOS 17+)
withAnimation(.spring(duration: 0.5, bounce: 0.3)) {
    isExpanded.toggle()
}
```

#### Kotlin — Android (Jetpack Compose)

```kotlin
import androidx.compose.animation.core.*

val animatedOffset by animateFloatAsState(
    targetValue = if (expanded) 200f else 0f,
    animationSpec = spring(
        dampingRatio = Spring.DampingRatioMediumBouncy,  // 0.5
        stiffness = Spring.StiffnessMedium               // 400
    )
)

// Available damping ratio constants:
// DampingRatioHighBouncy    = 0.2
// DampingRatioMediumBouncy  = 0.5
// DampingRatioLowBouncy     = 0.75
// DampingRatioNoBouncy      = 1.0

// Available stiffness constants:
// StiffnessHigh             = 10000
// StiffnessMedium           = 1500 (note: differs from web conventions)
// StiffnessMediumLow        = 400
// StiffnessLow              = 200
// StiffnessVeryLow          = 50
```

#### CSS — Upcoming `linear()` and Spring Approximation

While CSS does not natively support spring physics as of early 2026, approximate spring curves using the `linear()` easing function by sampling the spring curve at regular intervals:

```css
/* Approximation of natural spring (stiffness 170, damping 26) */
/* Generated by sampling the spring curve at 20 points */
.spring-natural {
  transition: transform 600ms linear(
    0, 0.063, 0.234, 0.474, 0.722, 0.916,
    1.024, 1.060, 1.044, 1.010, 0.981,
    0.971, 0.978, 0.990, 0.998, 1.002,
    1.002, 1.001, 1.000, 1.000
  );
}
```

Use a spring curve generator tool to produce accurate `linear()` samples for specific spring configurations.

---

## Duration Calculation

### General Principles

Match duration to the perceptual weight of the change. Small, frequent interactions demand shorter durations. Large, infrequent transitions tolerate longer durations.

**Distance-based scaling:** Longer travel distances require longer durations. A tooltip appearing 8px away from its trigger needs 100–150ms. A full-screen page transition covering 1000px+ needs 300–500ms. Scale roughly proportional to the square root of distance, not linearly — doubling distance does not double duration.

**Element size-based scaling:** Small elements (icons, toggles, checkboxes) should animate in 100–200ms. Medium elements (cards, dropdowns, modals) should animate in 200–400ms. Full-screen or page-level changes should animate in 300–600ms.

**Importance-based adjustment:** Critical feedback (error indication, success confirmation) should be fast: 100–200ms. Transitional motion (page changes, layout shifts) can be moderate: 200–400ms. Decorative or ambient motion can be slower: 400–1000ms.

### Quick Reference Duration Table

| Element Type               | Duration Range | Easing Type          |
|----------------------------|----------------|----------------------|
| Micro-feedback (ripple)    | 50–100ms       | ease-out             |
| Toggle/checkbox            | 100–200ms      | ease-in-out / spring |
| Tooltip appear             | 100–150ms      | ease-out             |
| Tooltip disappear          | 75–100ms       | ease-in              |
| Dropdown open              | 150–250ms      | ease-out / decelerate|
| Dropdown close             | 100–200ms      | ease-in / accelerate |
| Modal entrance             | 200–350ms      | decelerate / spring  |
| Modal exit                 | 150–250ms      | accelerate           |
| Page transition            | 300–500ms      | emphasized           |
| Loading skeleton shimmer   | 1500–2500ms    | ease-in-out (loop)   |
| Notification slide-in      | 250–400ms      | decelerate / spring  |
| Notification slide-out     | 150–250ms      | accelerate           |

**Asymmetric durations:** Exits should generally be 20–40% faster than entrances. Users have already processed the element; removing it quickly respects their attention. Entrances need slightly more time to register visually.

---

## Stagger Patterns

### Sequential Reveal

When revealing a group of elements (a list of cards, a grid of thumbnails, a menu of options), stagger their entrance so each appears slightly after the previous one:

```css
.stagger-item {
  opacity: 0;
  transform: translateY(12px);
  animation: fade-in-up 300ms cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
}

.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 50ms; }
.stagger-item:nth-child(3) { animation-delay: 100ms; }
.stagger-item:nth-child(4) { animation-delay: 150ms; }
.stagger-item:nth-child(5) { animation-delay: 200ms; }

@keyframes fade-in-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Stagger interval guidelines:**
- 30–50ms between items for tight, fast reveals (menus, small lists)
- 50–80ms between items for standard card/grid reveals
- 80–120ms between items for dramatic, editorial reveals

**Maximum total stagger duration:** Cap the total stagger sequence at 400–600ms. Beyond that, users perceive the animation as sluggish. For a list of 10 items at 50ms stagger, the last item starts at 450ms — acceptable. For 20 items, reduce the stagger to 25ms or animate only the first 8–10 and instantly show the rest.

### Framer Motion Stagger

```jsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map((i) => (
    <motion.li key={i} variants={item} />
  ))}
</motion.ul>
```

---

## Performance Optimization

### Compositor-Only Properties

The browser rendering pipeline consists of Layout, Paint, and Composite stages. Animating properties that trigger only the Composite stage avoids expensive recalculations:

**Compositor-only (cheap):** `transform`, `opacity`, `filter`, `clip-path` (in some browsers).

**Paint-triggering (moderate):** `background-color`, `box-shadow`, `border-radius`, `color`.

**Layout-triggering (expensive):** `width`, `height`, `padding`, `margin`, `top`, `left`, `right`, `bottom`, `font-size`.

Always prefer `transform: translateX()` over `left` for horizontal movement. Prefer `transform: scale()` over changing `width`/`height`. Prefer `opacity` over `visibility` or `display` changes for fade effects.

### GPU Acceleration

Promote animated elements to their own compositor layer to offload rendering to the GPU:

```css
.animated-element {
  will-change: transform, opacity;
}
```

**`will-change` pitfalls:**
- Apply only to elements that will actually animate, and remove it when animation completes if possible.
- Each `will-change` element creates a new compositor layer, consuming GPU memory.
- Applying `will-change` to many elements (e.g., every list item in a long list) causes excessive memory use and can degrade performance.
- Do not apply `will-change` in static stylesheets for elements that animate only on hover — apply it via JavaScript just before animating, or apply it on a parent hover state.

```css
/* Correct: apply will-change on intent */
.card:hover .card-image {
  will-change: transform;
}
.card-image {
  transition: transform 300ms ease-out;
}
```

### requestAnimationFrame vs CSS Animations vs Web Animations API

**CSS Transitions/Animations:** Best for declarative, state-driven animations. Run on the compositor thread when animating compositor-only properties. Use for most UI transitions.

**Web Animations API (WAAPI):** Programmatic control with the performance benefits of CSS animations. Supports dynamic keyframes, playback control (pause, reverse, seek), and promises for completion:

```javascript
element.animate(
  [
    { transform: "translateY(20px)", opacity: 0 },
    { transform: "translateY(0)", opacity: 1 },
  ],
  {
    duration: 300,
    easing: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    fill: "forwards",
  }
);
```

**requestAnimationFrame (rAF):** Use for animations that depend on dynamic values, physics simulations, game-like animation loops, or canvas/WebGL rendering. Runs on the main thread — avoid heavy computation inside rAF callbacks:

```javascript
function animate(timestamp) {
  // Update position based on physics/logic
  element.style.transform = `translateX(${position}px)`;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### Layout Thrashing Prevention

Layout thrashing occurs when JavaScript alternates between reading layout values and writing style changes, forcing the browser to recalculate layout multiple times per frame:

```javascript
// BAD — causes layout thrashing
items.forEach(item => {
  const height = item.offsetHeight; // read (forces layout)
  item.style.height = height + 10 + "px"; // write (invalidates layout)
});

// GOOD — batch reads then batch writes
const heights = items.map(item => item.offsetHeight); // all reads
items.forEach((item, i) => {
  item.style.height = heights[i] + 10 + "px"; // all writes
});
```

Use libraries like `fastdom` to automatically batch reads and writes when dealing with complex layout-dependent animations.

### Measuring Animation Performance

Use Chrome DevTools Performance panel:
1. Open DevTools, navigate to the Performance tab.
2. Enable "Screenshots" to see visual frames.
3. Click record, perform the animation, stop recording.
4. Examine the Frames section — each bar represents one frame. Green bars under 16.7ms indicate 60fps. Tall bars indicate dropped frames.
5. Look for long "Recalculate Style" or "Layout" events during animation — these indicate non-compositor-only properties are being animated.
6. Enable "Rendering > Paint flashing" to visualize which areas repaint during animation.
7. Enable "Rendering > Layer borders" to verify compositor layer promotion.

---

## CSS @keyframes Pattern Library

### Bounce

```css
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateY(0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translateY(-30px);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translateY(-15px);
  }
  90% {
    transform: translateY(-4px);
  }
}
```

### Shake

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.error-shake {
  animation: shake 400ms ease-in-out;
}
```

### Pulse

```css
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
```

### Spin

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 800ms linear infinite;
}
```

### Fade In

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fade-in 200ms ease-out forwards;
}
```

### Slide In (from bottom)

```css
@keyframes slide-in-bottom {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in-bottom {
  animation: slide-in-bottom 300ms cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
}
```

### Scale In

```css
@keyframes scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.scale-in {
  animation: scale-in 250ms cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
}
```

---

## View Transitions API

### Basic Setup

The View Transitions API enables smooth animated transitions between DOM states or between pages. For same-document transitions:

```javascript
document.startViewTransition(() => {
  // Update the DOM here
  updateContent();
});
```

The browser captures a screenshot of the old state, applies the DOM changes, then cross-fades from old to new. Customize the transition with CSS:

```css
::view-transition-old(root) {
  animation: fade-out 200ms ease-in forwards;
}

::view-transition-new(root) {
  animation: fade-in 300ms ease-out forwards;
}
```

### Named View Transitions

Assign `view-transition-name` to elements that should animate independently rather than cross-fading with the page:

```css
.hero-image {
  view-transition-name: hero;
}

.page-title {
  view-transition-name: title;
}
```

Named elements morph between their old and new positions/sizes automatically. Customize individual element transitions:

```css
::view-transition-old(hero) {
  animation: scale-out 300ms ease-in forwards;
}
::view-transition-new(hero) {
  animation: scale-in 300ms ease-out forwards;
}
```

### Cross-Document View Transitions

Enable cross-document (multi-page) view transitions with a meta tag on both the source and destination pages:

```html
<meta name="view-transition" content="same-origin" />
```

Apply `view-transition-name` properties via CSS on both pages. The browser matches elements by name and morphs between them automatically. Use `@view-transition` at-rule for navigation-type filtering:

```css
@view-transition {
  navigation: auto;
}
```

---

## Scroll-Driven Animations

### CSS `scroll()` Timeline

Bind animations to scroll position instead of time:

```css
@keyframes parallax-shift {
  from { transform: translateY(0); }
  to { transform: translateY(-100px); }
}

.parallax-element {
  animation: parallax-shift linear both;
  animation-timeline: scroll(nearest block);
}
```

The `scroll()` function accepts a scroller element reference and axis. `nearest` finds the nearest scrollable ancestor. `block` specifies the block axis (vertical in horizontal writing modes).

### CSS `view()` Timeline

Trigger animations when an element enters and exits the viewport during scroll:

```css
@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-reveal {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

The `animation-range` property controls which portion of the element's visibility triggers the animation. `entry 0%` is when the element first touches the viewport edge. `entry 100%` is when the element is fully inside the viewport.

---

## Reduced Motion

### Implementation Pattern

Always provide a reduced-motion alternative for every animation:

```css
@keyframes slide-in {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.element {
  animation: slide-in 300ms ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .element {
    animation: none;
    /* Still show the element, just skip motion */
    opacity: 1;
    transform: none;
  }
}
```

**Best practices for reduced motion:**
- Replace motion with instant state changes, not with removal of visual feedback.
- Fade transitions (opacity changes) are generally acceptable at reduced durations (100–150ms) even in reduced-motion mode, as they do not involve spatial movement.
- Remove parallax, auto-playing animations, scroll-triggered motion, and bouncing/shaking effects entirely.
- Maintain functional animations (progress indicators, loading spinners with reduced speed) that communicate state.

### JavaScript Detection

```javascript
const prefersReducedMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Listen for changes
window.matchMedia("(prefers-reduced-motion: reduce)")
  .addEventListener("change", (e) => {
    if (e.matches) disableAnimations();
    else enableAnimations();
  });
```

### Testing Reduced Motion

In Chrome DevTools: open the Rendering panel, find "Emulate CSS media feature prefers-reduced-motion" and set to "reduce." On macOS: System Settings > Accessibility > Display > Reduce motion. On iOS: Settings > Accessibility > Motion > Reduce Motion.

---

## Animation Orchestration

### Sequencing with CSS

Use `animation-delay` to sequence animations. Calculate each delay as the sum of previous animation durations plus any intentional pauses:

```css
.step-1 { animation: fade-in 200ms ease-out 0ms forwards; }
.step-2 { animation: slide-in 300ms ease-out 200ms forwards; }
.step-3 { animation: scale-in 250ms ease-out 500ms forwards; }
```

### Sequencing with WAAPI

Use `Animation.finished` promises for sequential orchestration:

```javascript
async function orchestrate(element) {
  // Step 1: fade in
  await element.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 200, easing: "ease-out", fill: "forwards" }
  ).finished;

  // Step 2: slide up
  await element.animate(
    [{ transform: "translateY(20px)" }, { transform: "translateY(0)" }],
    { duration: 300, easing: "ease-out", fill: "forwards" }
  ).finished;

  // Step 3: scale emphasis
  await element.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.02)" }, { transform: "scale(1)" }],
    { duration: 250, easing: "ease-in-out", fill: "forwards" }
  ).finished;
}
```

### Parallel Groups

Run multiple animations simultaneously using `Promise.all`:

```javascript
await Promise.all([
  elementA.animate(fadeIn, { duration: 200 }).finished,
  elementB.animate(slideIn, { duration: 300 }).finished,
]);
// Both complete before continuing
```

### Framer Motion Orchestration

```jsx
const sequence = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      when: "beforeChildren", // parent animates first
    },
  },
};
```

---

## Frame Rate Considerations

### 60fps Target

The standard target for UI animation is 60 frames per second, yielding a frame budget of **16.7ms** per frame. Within that budget, all JavaScript execution, style calculation, layout, paint, and compositing must complete.

### When 30fps Is Acceptable

30fps (33.3ms per frame) is acceptable for:
- Background ambient animations (floating particles, gradient shifts)
- Non-interactive loading illustrations
- Video-like content where cinematic frame rates feel natural
- Low-power mode or battery-saving contexts

30fps is **not** acceptable for:
- Direct manipulation (dragging, swiping, scrolling)
- Interactive state transitions (hover, press, toggle)
- Any animation tracking user input (cursor followers, gesture responses)

### Variable Refresh Rate Displays

Modern displays (ProMotion at 120Hz, high-refresh Android screens at 90Hz/120Hz/144Hz) raise the bar. On a 120Hz display, the frame budget is **8.3ms**. Animations that run fine at 60fps may stutter on 120Hz if they are borderline on performance.

Use `requestAnimationFrame` timestamps for frame-rate-independent animation logic rather than assuming a fixed frame rate:

```javascript
let lastTime = 0;
function animate(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // Move based on elapsed time, not frame count
  position += velocity * (deltaTime / 1000);

  element.style.transform = `translateX(${position}px)`;
  requestAnimationFrame(animate);
}
```

This approach produces consistent animation speed regardless of whether the display runs at 60Hz, 90Hz, or 120Hz.

---

## M3 Expressive Spring Motion & iOS 26 Liquid Glass Animation

### M3 Expressive Spring Specifications

Material 3 Expressive (2025-2026) introduces a formal spring motion system that replaces duration-based curves as the default animation model. The specification defines four named spring configurations, each tuned for a distinct interaction character:

| Spring Name | Stiffness | Damping Ratio | Character | Use Case |
|---|---|---|---|---|
| **Responsive** | 1500 | 1.0 | Critically damped, no overshoot, immediate | Toggles, switches, pressed states, micro-interactions |
| **Expressive** | 380 | 0.7 | Slight overshoot, organic settle | Navigation transitions, FAB morphing, layout changes (system default) |
| **Gentle** | 200 | 0.85 | Slow, soft arrival, minimal overshoot | Parallax layers, background shifts, ambient motion |
| **Bouncy** | 500 | 0.5 | Pronounced oscillation, playful | Celebrations, achievements, attention-seeking elements |

The **Expressive** spring (380/0.7) is the system default, used for navigation bar indicator animation, bottom sheet presentation, and component transitions. It produces approximately one visible overshoot cycle before settling, giving motion a lively but controlled feel.

### Spring Advantages Over Duration-Based Animation

Spring physics offer structural advantages that duration-based curves cannot match:

- **Inherent interruptibility.** A spring animation can be interrupted at any point, and a new spring animation inherits the current velocity. This produces smooth, natural response when users change their mind mid-gesture. Duration-based curves must be manually cancelled and restarted, often producing visual discontinuities.
- **Velocity preservation.** When a dragged element is released, its release velocity feeds directly into the spring animation. This creates a seamless transition from direct manipulation to animated settle. Duration-based animations ignore release velocity entirely, producing a jarring disconnect between the gesture and the resulting animation.
- **Natural feel.** Springs model real physical behavior. Humans have deep intuitive understanding of how physical springs move. Duration-based curves, by contrast, are mathematical abstractions that require careful tuning to avoid feeling mechanical.

### iOS 26 Liquid Glass Animation

iOS 26's Liquid Glass introduces a new category of animation: material response. The glass material is not static — it responds dynamically to content and interaction:

- **Refraction shifts.** As content scrolls or moves beneath a glass surface, the refraction pattern updates in real time, creating a subtle optical distortion that reinforces the glass metaphor. This is GPU-composited and does not require developer intervention for standard navigation chrome.
- **Parallax depth.** Glass surfaces at different depth layers exhibit parallax motion relative to each other. When the device tilts (using accelerometer data) or when content scrolls, foreground glass elements shift slightly relative to background glass, creating a convincing spatial hierarchy.
- **Translucency transitions.** Glass surfaces can transition between levels of translucency — from nearly transparent to frosted — based on scroll position, content density, or explicit state changes. This replaces the abrupt show/hide pattern for navigation bars with a gradual materialization effect.

### Compose Spring Implementation

In Jetpack Compose, apply the M3 Expressive spring system using the `spring()` animation specification:

```kotlin
// M3 Expressive default
val offset by animateFloatAsState(
    targetValue = targetOffset,
    animationSpec = spring(
        dampingRatio = 0.7f,
        stiffness = 380f
    )
)

// Responsive (for toggles and micro-interactions)
animationSpec = spring(dampingRatio = 1.0f, stiffness = 1500f)

// Gentle (for background and ambient motion)
animationSpec = spring(dampingRatio = 0.85f, stiffness = 200f)

// Bouncy (for celebrations)
animationSpec = spring(dampingRatio = 0.5f, stiffness = 500f)
```

The `dampingRatio` controls overshoot behavior (1.0 = critically damped, below 1.0 = underdamped with oscillation), while `stiffness` controls the speed of the animation (higher values = faster motion).

> For the complete platform-level treatment including SwiftUI `.glassEffect()` animation parameters, cross-platform spring bridging strategies, and reduced-motion fallbacks for spring and glass animations, see `ios26-liquid-glass-material3-expressive.md`.
