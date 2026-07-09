# WCAG Compliance and ARIA Implementation Patterns

## WCAG 2.2 Checklist by POUR Principles

### Perceivable

Ensure all information and user interface components are presentable to users in ways they can perceive.

**1.1 Text Alternatives**

- **1.1.1 Non-text Content (Level A):** Provide text alternatives for all non-text content. Apply `alt` attributes to all `<img>` elements. Use empty `alt=""` for decorative images. Provide text alternatives for `<canvas>`, `<svg>`, and icon fonts. Ensure CAPTCHA alternatives exist (audio CAPTCHA, logic-based challenge).

**1.2 Time-Based Media**

- **1.2.1 Audio-only and Video-only (Level A):** Provide transcript for audio-only content. Provide audio description or text alternative for video-only content.
- **1.2.2 Captions (Level A):** Provide synchronized captions for all prerecorded audio content in multimedia.
- **1.2.3 Audio Description or Media Alternative (Level A):** Provide audio description for prerecorded video or a full text alternative.
- **1.2.4 Captions Live (Level AA):** Provide real-time captions for all live audio content.
- **1.2.5 Audio Description (Level AA):** Provide audio description for all prerecorded video content.

**1.3 Adaptable**

- **1.3.1 Info and Relationships (Level A):** Mark up headings, lists, tables, and form controls with proper semantic HTML. Use `<fieldset>`/`<legend>` for grouped controls. Convey visual relationships programmatically.
- **1.3.2 Meaningful Sequence (Level A):** Ensure DOM order matches visual presentation order. Do not rely on CSS alone to reorder content in ways that change meaning.
- **1.3.3 Sensory Characteristics (Level A):** Never rely solely on shape, color, size, visual location, orientation, or sound to convey instructions.
- **1.3.4 Orientation (Level AA):** Do not restrict content display to a single orientation (portrait or landscape) unless essential.
- **1.3.5 Identify Input Purpose (Level AA):** Use `autocomplete` attributes on form fields collecting user data (name, email, address, credit card).

**1.4 Distinguishable**

- **1.4.1 Use of Color (Level A):** Never use color as the sole means of conveying information. Supplement with icons, patterns, or text labels.
- **1.4.2 Audio Control (Level A):** Provide mechanism to pause, stop, or control volume for any audio that plays automatically for more than 3 seconds.
- **1.4.3 Contrast Minimum (Level AA):** Maintain at least 4.5:1 contrast ratio for normal text and 3:1 for large text (18pt or 14pt bold).
- **1.4.4 Resize Text (Level AA):** Ensure text can be resized up to 200% without loss of content or functionality.
- **1.4.5 Images of Text (Level AA):** Use real text instead of images of text except for logotypes.
- **1.4.10 Reflow (Level AA):** Content must reflow without horizontal scrolling at 320px width (equivalent to 400% zoom at 1280px).
- **1.4.11 Non-text Contrast (Level AA):** Maintain 3:1 contrast for UI components and graphical objects required to understand content.
- **1.4.12 Text Spacing (Level AA):** Ensure no loss of content when users override line height to 1.5x font size, paragraph spacing to 2x, letter spacing to 0.12x, and word spacing to 0.16x.
- **1.4.13 Content on Hover or Focus (Level AA):** Make hover/focus-triggered content dismissible (Escape), hoverable (user can move pointer over it), and persistent (remains visible until dismissed or trigger removed).

### Operable

Ensure all user interface components and navigation are operable.

**2.1 Keyboard Accessible**

- **2.1.1 Keyboard (Level A):** Make all functionality available from a keyboard. No keyboard traps except where the mechanism to exit is documented (e.g., modal dialogs with Escape).
- **2.1.2 No Keyboard Trap (Level A):** Ensure focus can always be moved away from any component using standard keyboard interactions.
- **2.1.4 Character Key Shortcuts (Level A):** If single-character key shortcuts exist, provide mechanism to turn them off, remap them, or activate them only when the relevant component has focus.

**2.2 Enough Time**

- **2.2.1 Timing Adjustable (Level A):** Allow users to turn off, adjust, or extend time limits. Warn users at least 20 seconds before timeout and allow extension.
- **2.2.2 Pause, Stop, Hide (Level A):** Provide controls for any moving, blinking, or scrolling content that starts automatically and lasts more than 5 seconds.

**2.3 Seizures and Physical Reactions**

- **2.3.1 Three Flashes or Below Threshold (Level A):** No content flashes more than three times per second unless below general flash and red flash thresholds.

**2.4 Navigable**

- **2.4.1 Bypass Blocks (Level A):** Provide skip navigation links and use landmark roles.
- **2.4.2 Page Titled (Level A):** Every page must have a descriptive, unique `<title>`.
- **2.4.3 Focus Order (Level A):** Ensure focus order preserves meaning and operability. Use `tabindex="0"` to add elements to natural tab order; use `tabindex="-1"` for programmatic focus only. Never use `tabindex` values greater than 0.
- **2.4.4 Link Purpose in Context (Level A):** Make link text meaningful in context. Avoid "click here" or "read more" without surrounding context.
- **2.4.5 Multiple Ways (Level AA):** Provide at least two ways to locate a page (navigation, search, site map, table of contents).
- **2.4.6 Headings and Labels (Level AA):** Use descriptive headings and labels that clearly describe topic or purpose.
- **2.4.7 Focus Visible (Level AA):** Ensure keyboard focus indicator is visible. Use high-contrast focus outlines (minimum 2px solid, 3:1 contrast against adjacent colors).
- **2.4.11 Focus Not Obscured Minimum (Level AA) [WCAG 2.2]:** Ensure the focused element is not entirely hidden behind other content such as sticky headers, footers, or overlays.
- **2.4.12 Focus Not Obscured Enhanced (Level AAA) [WCAG 2.2]:** Ensure no part of the focused element is hidden by author-created content.
- **2.4.13 Focus Appearance (Level AAA) [WCAG 2.2]:** The focus indicator area must be at least as large as a 2px-thick perimeter of the unfocused component and have a 3:1 contrast ratio between focused and unfocused states.

**2.5 Input Modalities**

- **2.5.1 Pointer Gestures (Level A):** Provide single-pointer alternatives for any multipoint or path-based gestures.
- **2.5.2 Pointer Cancellation (Level A):** Use `click`/`mouseup` events, not `mousedown`. Allow cancellation by moving pointer off the target before release.
- **2.5.3 Label in Name (Level A):** Ensure the accessible name of a component contains or matches its visible text label.
- **2.5.4 Motion Actuation (Level A):** Provide UI-based alternatives for any functionality triggered by device motion (shake, tilt).
- **2.5.7 Dragging Movements (Level AA) [WCAG 2.2]:** Provide single-pointer alternative for any drag-and-drop functionality.
- **2.5.8 Target Size Minimum (Level AA) [WCAG 2.2]:** Interactive targets must be at least 24x24 CSS pixels, or provide sufficient spacing from adjacent targets.

### Understandable

Ensure information and UI operation are understandable.

**3.1 Readable**

- **3.1.1 Language of Page (Level A):** Declare the language of the page using `<html lang="en">`.
- **3.1.2 Language of Parts (Level AA):** Mark up content in a different language with the `lang` attribute on the containing element.

**3.2 Predictable**

- **3.2.1 On Focus (Level A):** No context change on focus alone.
- **3.2.2 On Input (Level A):** No context change on input alone unless the user is advised beforehand.
- **3.2.6 Consistent Help (Level A) [WCAG 2.2]:** Place help mechanisms (contact info, chat, FAQ links) in a consistent location across pages.

**3.3 Input Assistance**

- **3.3.1 Error Identification (Level A):** Identify and describe input errors in text. Do not rely on color alone.
- **3.3.2 Labels or Instructions (Level A):** Provide labels or instructions for user input.
- **3.3.3 Error Suggestion (Level AA):** Suggest corrections when input errors are detected.
- **3.3.4 Error Prevention Legal/Financial/Data (Level AA):** Allow submissions to be reversible, verified, or confirmed for legal, financial, or data-modification transactions.
- **3.3.7 Redundant Entry (Level A) [WCAG 2.2]:** Do not require users to re-enter information already provided in the same process. Auto-populate or allow selection from prior entries.
- **3.3.8 Accessible Authentication Minimum (Level AA) [WCAG 2.2]:** Do not require cognitive function tests (puzzles, memorization) for authentication. Support password managers, copy-paste, and biometric or device-based authentication.

### Robust

Ensure content is robust enough to be interpreted by a wide variety of user agents, including assistive technologies.

**4.1 Compatible**

- **4.1.2 Name, Role, Value (Level A):** All user interface components must expose name, role, and value to assistive technology. Use native HTML elements whenever possible; supplement with ARIA only when necessary.
- **4.1.3 Status Messages (Level AA):** Ensure status messages (success, error, progress) are announced to assistive technology without receiving focus, using `role="status"`, `role="alert"`, or `aria-live` regions.

---

## ARIA Roles Reference

### Document Structure Roles

| Role | Purpose | Usage |
|------|---------|-------|
| `document` | Contains content meant to be read as a document | Apply to content areas where browse mode is appropriate |
| `article` | Self-contained composition | Blog posts, comments, forum entries |
| `heading` | Section heading | Prefer native `<h1>`-`<h6>`; use with `aria-level` |
| `list` / `listitem` | List structure | Prefer native `<ul>`/`<ol>`/`<li>` |
| `table` / `row` / `cell` / `columnheader` / `rowheader` | Table structure | Prefer native `<table>` elements |
| `img` | Image container | Use on `<svg>` or `<div>` acting as image with `aria-label` |
| `math` | Mathematical expression | Pair with MathML or image fallback |
| `presentation` / `none` | Remove semantic meaning | Apply to decorative wrappers only |
| `separator` | Thematic break (non-focusable) or value separator (focusable) | Prefer `<hr>` for non-interactive |
| `toolbar` | Collection of function buttons | Apply to button groups with `aria-label` |

### Widget Roles

| Role | Purpose | Key Requirements |
|------|---------|-----------------|
| `button` | Clickable element | Prefer `<button>`. Support Enter and Space. |
| `link` | Navigation element | Prefer `<a href>`. Support Enter. |
| `checkbox` | Toggle selection | Manage `aria-checked` (true/false/mixed). Support Space. |
| `radio` | Single selection from group | Wrap in `radiogroup`. Manage `aria-checked`. Arrow key navigation. |
| `switch` | On/off toggle | Manage `aria-checked`. Support Space. |
| `textbox` | Text input | Prefer `<input>` / `<textarea>`. |
| `searchbox` | Search input | Prefer `<input type="search">`. |
| `slider` | Range selection | Manage `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. Arrow keys. |
| `spinbutton` | Numeric stepper | Arrow keys for increment/decrement. |
| `combobox` | Text input with popup | Manage `aria-expanded`, `aria-activedescendant` or focus. |
| `listbox` / `option` | Selection list | Arrow key navigation. `aria-selected`. |
| `grid` / `gridcell` | Interactive grid | Arrow key cell navigation. |
| `tab` / `tablist` / `tabpanel` | Tabbed interface | Manage `aria-selected`, keyboard navigation. |
| `tree` / `treeitem` | Hierarchical list | Arrow key navigation. `aria-expanded`. |
| `menu` / `menuitem` / `menubar` | Application menu | Arrow key navigation. Type-ahead. |
| `dialog` | Modal or non-modal dialog | Focus management. `aria-modal`. Escape to close. |
| `alertdialog` | Urgent dialog | Same as dialog plus immediate announcement. |
| `progressbar` | Progress indicator | `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, or indeterminate. |
| `scrollbar` | Scroll control | `aria-controls`, `aria-valuenow`. |
| `tooltip` | Descriptive popup | `aria-describedby` on trigger. |

### Landmark Roles

| Role | HTML Equivalent | Purpose |
|------|----------------|---------|
| `banner` | `<header>` (page-level) | Site-wide header |
| `navigation` | `<nav>` | Navigation links |
| `main` | `<main>` | Primary content (one per page) |
| `complementary` | `<aside>` | Supporting content |
| `contentinfo` | `<footer>` (page-level) | Footer information |
| `search` | `<search>` (HTML 5.x) | Search facility |
| `region` | `<section>` with label | Generic labeled region |
| `form` | `<form>` with label | Form landmark |

Use native HTML elements to convey landmarks implicitly. Add explicit landmark roles only when native elements are insufficient or overridden.

### Live Region Roles

| Role | Behavior | Use Case |
|------|----------|----------|
| `alert` | Assertive announcement | Error messages, warnings |
| `status` | Polite announcement | Success messages, status updates |
| `log` | Polite, append-only | Chat logs, activity feeds |
| `marquee` | Non-essential updates | Stock tickers, news crawlers |
| `timer` | Time-related updates | Countdown displays |

### Window Roles

| Role | Purpose |
|------|---------|
| `dialog` | Modal or non-modal dialog window |
| `alertdialog` | Dialog conveying urgent information requiring acknowledgment |

---

## ARIA States and Properties Reference

### Widget Attributes

| Attribute | Values | Purpose |
|-----------|--------|---------|
| `aria-checked` | `true` / `false` / `mixed` | Selection state of checkboxes, radios, switches |
| `aria-selected` | `true` / `false` | Selection state in tabs, options, grid cells |
| `aria-pressed` | `true` / `false` / `mixed` | Toggle button pressed state |
| `aria-expanded` | `true` / `false` | Expansion state of collapsible elements |
| `aria-disabled` | `true` / `false` | Disabled state (element remains focusable unlike native `disabled`) |
| `aria-hidden` | `true` / `false` | Remove element from accessibility tree (but not visual display) |
| `aria-invalid` | `true` / `false` / `grammar` / `spelling` | Validation state of input |
| `aria-required` | `true` | Field is required |
| `aria-readonly` | `true` / `false` | Field is read-only |
| `aria-current` | `page` / `step` / `location` / `date` / `time` / `true` | Current item in a set (active nav link, wizard step) |
| `aria-haspopup` | `true` / `menu` / `listbox` / `tree` / `grid` / `dialog` | Element triggers a popup |
| `aria-autocomplete` | `none` / `inline` / `list` / `both` | Autocomplete behavior of combobox |
| `aria-multiselectable` | `true` / `false` | Multiple selection allowed in listbox, grid, tree |
| `aria-orientation` | `horizontal` / `vertical` | Orientation of toolbar, slider, separator, listbox, menu |
| `aria-sort` | `ascending` / `descending` / `none` / `other` | Sort direction of table column |
| `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-valuetext` | Number / String | Range widget values |

### Relationship Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `aria-labelledby` | Reference visible label element(s) | `aria-labelledby="heading-1 heading-2"` |
| `aria-describedby` | Reference descriptive element(s) | Error messages, help text |
| `aria-controls` | Element controls another element | Tab controls panel, combobox controls listbox |
| `aria-owns` | Establish parent-child when DOM structure differs | Portaled popups |
| `aria-activedescendant` | Virtual focus within composite widget | Combobox managing focus on options |
| `aria-errormessage` | Reference error message element | Pair with `aria-invalid="true"` |
| `aria-details` | Reference extended description | Complex images, data visualizations |
| `aria-flowto` | Override reading order | Alternative reading sequence |

### Live Region Attributes

| Attribute | Values | Purpose |
|-----------|--------|---------|
| `aria-live` | `polite` / `assertive` / `off` | Announcement urgency |
| `aria-atomic` | `true` / `false` | Announce entire region or just changed nodes |
| `aria-relevant` | `additions` / `removals` / `text` / `all` | Types of changes to announce |
| `aria-busy` | `true` / `false` | Region is updating; defer announcements |

---

## Common ARIA Widget Patterns

### Accordion

```html
<div class="accordion">
  <h3>
    <button aria-expanded="false" aria-controls="panel-1" id="header-1">
      Section Title
    </button>
  </h3>
  <div id="panel-1" role="region" aria-labelledby="header-1" hidden>
    <p>Panel content here.</p>
  </div>
</div>
```

**Keyboard:** Enter or Space toggles the panel. Optionally support arrow keys to move between accordion headers when headers are siblings. Home/End move to first/last header.

**ARIA:** Toggle `aria-expanded` between `true` and `false` on the button. Toggle the `hidden` attribute on the panel. The `role="region"` with `aria-labelledby` ensures the panel is announced with its heading context.

### Tabs

```html
<div class="tabs">
  <div role="tablist" aria-label="Feature tabs">
    <button role="tab" aria-selected="true" aria-controls="panel-a" id="tab-a" tabindex="0">
      Tab A
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel-b" id="tab-b" tabindex="-1">
      Tab B
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel-c" id="tab-c" tabindex="-1">
      Tab C
    </button>
  </div>
  <div role="tabpanel" id="panel-a" aria-labelledby="tab-a" tabindex="0">
    Panel A content.
  </div>
  <div role="tabpanel" id="panel-b" aria-labelledby="tab-b" tabindex="0" hidden>
    Panel B content.
  </div>
  <div role="tabpanel" id="panel-c" aria-labelledby="tab-c" tabindex="0" hidden>
    Panel C content.
  </div>
</div>
```

**Keyboard (Roving Tabindex):** Left/Right arrows move between tabs (wrap around). Home/End move to first/last tab. Tab key moves focus into the active panel. Set `tabindex="0"` on the active tab and `tabindex="-1"` on all others. When activation follows focus (automatic activation), change the panel on arrow key press. When activation is manual, require Enter or Space to activate the tab after focus.

**ARIA:** Set `aria-selected="true"` on the active tab and `"false"` on others. Hide inactive panels with `hidden`. Each panel references its controlling tab via `aria-labelledby`.

### Modal Dialog

```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Deletion</h2>
  <p id="dialog-desc">This action cannot be undone. Delete this item?</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

**Focus Trap:** On open, move focus to the first focusable element inside the dialog (or the dialog itself). Trap Tab and Shift+Tab within the dialog. On close, return focus to the element that triggered the dialog.

**Dismiss:** Close on Escape key. Optionally close on click outside (backdrop click). Always provide a visible close mechanism.

**Scroll Lock:** Apply `overflow: hidden` to `<body>` while the dialog is open. Use `inert` attribute on all sibling content outside the dialog to prevent assistive technology from accessing background content.

```javascript
function openDialog(dialog, triggerElement) {
  const mainContent = document.getElementById('main-content');
  mainContent.setAttribute('inert', '');
  dialog.removeAttribute('hidden');
  dialog.querySelector('[autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').focus();
  document.body.style.overflow = 'hidden';
  dialog._triggerElement = triggerElement;
}

function closeDialog(dialog) {
  const mainContent = document.getElementById('main-content');
  mainContent.removeAttribute('inert');
  dialog.setAttribute('hidden', '');
  document.body.style.overflow = '';
  if (dialog._triggerElement) {
    dialog._triggerElement.focus();
  }
}
```

### Combobox / Autocomplete

```html
<label for="city-input">City</label>
<div class="combobox-wrapper">
  <input id="city-input" role="combobox"
         aria-expanded="false" aria-autocomplete="list"
         aria-controls="city-listbox" aria-activedescendant="">
  <ul id="city-listbox" role="listbox" hidden>
    <li id="city-1" role="option">New York</li>
    <li id="city-2" role="option">Los Angeles</li>
    <li id="city-3" role="option">Chicago</li>
  </ul>
</div>
```

**Keyboard:** Down Arrow opens the listbox and moves to the first option. Up/Down arrows navigate options. Enter selects the focused option and closes the listbox. Escape closes the listbox without selection. Typing filters the list.

**Announcement:** Update `aria-activedescendant` to the ID of the currently highlighted option. Toggle `aria-expanded`. Set `aria-selected="true"` on the highlighted option. Use a live region or `aria-activedescendant` to ensure screen readers announce the current option.

### Menu / Menubar

```html
<nav aria-label="Main menu">
  <ul role="menubar">
    <li role="none">
      <button role="menuitem" aria-haspopup="true" aria-expanded="false">
        File
      </button>
      <ul role="menu">
        <li role="none"><button role="menuitem">New</button></li>
        <li role="none"><button role="menuitem">Open</button></li>
        <li role="separator"></li>
        <li role="none"><button role="menuitem">Save</button></li>
      </ul>
    </li>
    <li role="none">
      <button role="menuitem" aria-haspopup="true" aria-expanded="false">
        Edit
      </button>
      <ul role="menu">
        <li role="none"><button role="menuitem">Undo</button></li>
        <li role="none"><button role="menuitem">Redo</button></li>
      </ul>
    </li>
  </ul>
</nav>
```

**Keyboard:** Left/Right arrows move between menubar items. Down Arrow opens submenu, Up/Down navigate within. Enter activates item. Escape closes current menu and returns focus to parent. Home/End move to first/last item. Type-ahead: typing a character moves focus to next item starting with that character.

**Roles:** Apply `role="none"` to `<li>` wrapper elements to remove list semantics. Use `role="separator"` for visual dividers. Use `role="menuitemcheckbox"` and `role="menuitemradio"` for togglable items.

### Tree View

```html
<ul role="tree" aria-label="File browser">
  <li role="treeitem" aria-expanded="true">
    Documents
    <ul role="group">
      <li role="treeitem" class="leaf">Resume.pdf</li>
      <li role="treeitem" aria-expanded="false">
        Projects
        <ul role="group">
          <li role="treeitem" class="leaf">Project-A.md</li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
```

**Keyboard:** Up/Down arrows move between visible tree items. Right Arrow expands a collapsed node or moves to first child. Left Arrow collapses an expanded node or moves to parent. Home/End move to first/last visible item. Enter activates/selects the item. Asterisk (*) expands all siblings.

**Multi-select:** Add `aria-multiselectable="true"` to the tree. Use `aria-selected` on each treeitem. Support Shift+Arrow for range selection and Ctrl+Space for toggle selection.

### Carousel / Slider

```html
<section aria-roledescription="carousel" aria-label="Featured articles">
  <button aria-label="Previous slide">&#8592;</button>
  <button aria-label="Next slide">&#8594;</button>
  <button aria-label="Stop automatic slide rotation">Pause</button>
  <div aria-live="polite" aria-atomic="true">
    <div role="group" aria-roledescription="slide" aria-label="1 of 4">
      <!-- Slide content -->
    </div>
  </div>
  <div role="tablist" aria-label="Slide controls">
    <button role="tab" aria-selected="true" aria-label="Slide 1">1</button>
    <button role="tab" aria-selected="false" aria-label="Slide 2">2</button>
    <button role="tab" aria-selected="false" aria-label="Slide 3">3</button>
    <button role="tab" aria-selected="false" aria-label="Slide 4">4</button>
  </div>
</section>
```

**Auto-play:** Always provide a visible pause button. Stop rotation on hover, focus, or when a screen reader is detected interacting with the slides. Honor `prefers-reduced-motion` by disabling auto-play.

**Keyboard:** Tab to carousel controls. Arrow keys to navigate slides (or use tab pattern for dots). Announce current slide via live region.

### Data Table

```html
<table>
  <caption>Quarterly Revenue by Region</caption>
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">
        <button>Region</button>
      </th>
      <th scope="col" aria-sort="none">
        <button>Q1</button>
      </th>
      <th scope="col" aria-sort="none">
        <button>Q2</button>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">North America</th>
      <td>$1.2M</td>
      <td>$1.4M</td>
    </tr>
    <tr>
      <th scope="row">Europe</th>
      <td>$800K</td>
      <td>$950K</td>
    </tr>
  </tbody>
</table>
```

**Headers:** Use `scope="col"` for column headers and `scope="row"` for row headers. For complex tables with multi-level headers, use `headers` attribute referencing specific `<th>` element IDs. Always provide a `<caption>` or `aria-label`/`aria-labelledby` for the table.

**Sortable Columns:** Update `aria-sort` to `ascending`, `descending`, or `none`. Announce sort changes via live region. Mark the sort button with `aria-label` that includes the current sort direction.

### Disclosure Widget

```html
<button aria-expanded="false" aria-controls="details-content">
  Show Details
</button>
<div id="details-content" hidden>
  <p>Additional details here.</p>
</div>
```

**Behavior:** Toggle `aria-expanded` and the `hidden` attribute. Screen readers announce "expanded" or "collapsed" state. Use the native `<details>`/`<summary>` elements when the use case permits, as they provide built-in accessible behavior.

### Tooltip

```html
<button aria-describedby="tooltip-1">
  Settings
  <span id="tooltip-1" role="tooltip" hidden>Configure application preferences</span>
</button>
```

**Keyboard:** Show tooltip on focus, hide on blur and Escape. Show on hover, hide on mouse leave. Tooltip content must be hoverable (user can move pointer into the tooltip). Maintain tooltip for a reasonable duration (do not auto-dismiss too quickly).

**Timing:** Display tooltip after a short delay (300-500ms) to avoid accidental triggers. Dismiss immediately on Escape. Never place essential information exclusively in tooltips.

---

## Focus Management in Single-Page Applications

### Route Changes

Manage focus on every client-side route change. Move focus to the new page heading or the main content container. Set `tabindex="-1"` on the target element to make non-interactive elements focusable programmatically.

```javascript
function onRouteChange() {
  const heading = document.querySelector('main h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
    heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
  }
}
```

Announce the new page title to screen readers using a live region or by updating `document.title`.

### Dynamic Content Updates

When new content appears (search results, loaded data, expanded sections), move focus to the new content container or the first interactive element within it. If content is removed, move focus to a logical predecessor.

### Focus Restoration

When closing overlays, popovers, dialogs, or inline editors, return focus to the trigger element. Store a reference to the trigger before opening the overlay.

### Programmatic Focus Rules

1. Never move focus without a user-initiated action (except on page load to the main heading).
2. Prefer moving focus to the most relevant content after an action.
3. Use `tabindex="-1"` for programmatic focus on non-interactive elements; remove after blur.
4. Test focus management with screen readers, not just visually.

---

## Skip Navigation and Landmark Navigation

### Skip Link Implementation

```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header><!-- Site header --></header>
  <nav><!-- Navigation --></nav>
  <main id="main-content" tabindex="-1">
    <!-- Main content -->
  </main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 10000;
  padding: 0.75rem 1.5rem;
  background: #000;
  color: #fff;
  font-weight: bold;
  text-decoration: none;
}

.skip-link:focus {
  top: 0;
}
```

### Landmark Strategy

Use one `<main>`, one `<header>` (banner), one `<footer>` (contentinfo), and labeled `<nav>` elements. Apply `aria-label` to distinguish multiple landmarks of the same type (e.g., "Primary navigation" vs "Footer navigation"). Screen reader users navigate by landmark using shortcut keys (D in NVDA, rotor in VoiceOver).

---

## Live Region Best Practices

### Polite vs Assertive

Use `aria-live="polite"` for non-urgent updates: status messages, search result counts, saved confirmations. The announcement queues behind the user's current activity.

Use `aria-live="assertive"` (or `role="alert"`) only for urgent, time-sensitive information: form validation errors, session timeouts, system failures. Assertive announcements interrupt the user immediately.

### Atomic and Relevant

Set `aria-atomic="true"` when the entire region must be re-read on any change (e.g., a timer displaying "3 minutes remaining" should read the complete phrase, not just the changed number). Set `aria-atomic="false"` (default) when only the changed nodes should be announced.

Set `aria-relevant="additions text"` (default) for most live regions. Include `removals` only when removed content is meaningful (e.g., items removed from a cart).

### Implementation Pattern

Render the live region container in the DOM on page load (empty is fine). Inject content dynamically into the existing container. Do not dynamically add the `aria-live` attribute after page load, as some screen readers ignore it.

```html
<!-- Rendered on page load, empty -->
<div id="status-announcer" role="status" aria-live="polite" aria-atomic="true"></div>
```

```javascript
function announce(message) {
  const announcer = document.getElementById('status-announcer');
  announcer.textContent = '';
  requestAnimationFrame(() => {
    announcer.textContent = message;
  });
}
```

The double-write pattern (clear then set) ensures screen readers detect the change even if the new message is identical to the previous one.

---

## Form Accessibility

### Label Association

Always associate labels with controls using explicit `for`/`id` pairing or implicit wrapping. Never rely on placeholder text as the sole label.

```html
<!-- Explicit association (preferred) -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" autocomplete="email">

<!-- Implicit association -->
<label>
  Email address
  <input type="email" name="email" autocomplete="email">
</label>
```

### Error Messaging

Associate error messages with their controls using `aria-describedby` and `aria-invalid`. Display errors inline near the field and in a summary at the top of the form.

```html
<label for="password">Password</label>
<input type="password" id="password" aria-invalid="true" aria-describedby="password-error" aria-errormessage="password-error">
<span id="password-error" class="error">Password must be at least 8 characters.</span>
```

Move focus to the first invalid field or the error summary on form submission. Announce errors using a live region or `role="alert"`.

### Required Fields

Mark required fields with `aria-required="true"` or the native `required` attribute. Indicate required status visually with text "(required)" in addition to any asterisk. Never use color or an asterisk alone to indicate required status.

### Fieldset and Legend

Group related controls (radio buttons, checkboxes, related inputs like date parts) with `<fieldset>` and `<legend>`.

```html
<fieldset>
  <legend>Shipping Address</legend>
  <label for="street">Street</label>
  <input type="text" id="street" autocomplete="street-address">
  <label for="city">City</label>
  <input type="text" id="city" autocomplete="address-level2">
</fieldset>
```

---

## Image Accessibility Decision Tree

1. **Is the image purely decorative?** Use `alt=""` (empty alt). Do not omit the `alt` attribute entirely.
2. **Is the image a simple informative image?** Provide concise `alt` text describing the image's content or function (not appearance).
3. **Is the image a functional image (link, button)?** Describe the action, not the image. Example: `alt="Search"` for a magnifying glass icon.
4. **Is the image complex (chart, diagram, infographic)?** Provide a brief `alt` summarizing the key message, plus a longer description via `aria-describedby`, `<figcaption>`, or a linked text alternative.
5. **Is the image of text?** Reproduce the text in the `alt` attribute. Prefer real text over images of text.
6. **Is the image a group or figure?** Wrap in `<figure>` with `<figcaption>`. The `<img>` may have a brief `alt` while the `<figcaption>` provides extended context.
7. **Is the image an SVG?** Apply `role="img"` and `aria-label` or `<title>` with `aria-labelledby`.

```html
<!-- Decorative -->
<img src="flourish.svg" alt="">

<!-- Informative -->
<img src="chart.png" alt="Sales increased 40% from Q1 to Q4 2024">

<!-- Complex with extended description -->
<figure>
  <img src="architecture-diagram.png" alt="System architecture overview">
  <figcaption>The system uses a microservices architecture with API gateway,
  three backend services, and a PostgreSQL database cluster.</figcaption>
</figure>

<!-- SVG -->
<svg role="img" aria-labelledby="svg-title">
  <title id="svg-title">Company Logo</title>
  <!-- SVG paths -->
</svg>
```

---

## Testing Tools Configuration

### axe-core

Integrate axe-core into automated testing pipelines. Configure rule sets to match target conformance level.

```javascript
// Cypress with cypress-axe
describe('Accessibility', () => {
  it('passes axe audit on homepage', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice']
      }
    });
  });

  it('passes axe audit on modal dialog', () => {
    cy.visit('/');
    cy.get('[data-testid="open-modal"]').click();
    cy.checkA11y('[role="dialog"]');
  });
});
```

```javascript
// Jest with jest-axe
const { axe, toHaveNoViolations } = require('jest-axe');
expect.extend(toHaveNoViolations);

test('renders accessible form', async () => {
  const { container } = render(<LoginForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Lighthouse Accessibility Audit

Run Lighthouse in CI with minimum score thresholds:

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.95 }]
      }
    }
  }
};
```

### WAVE

Use the WAVE browser extension for manual audits. Review all reported errors, alerts, structural elements, and contrast issues. Focus on errors first (missing alt text, empty links, missing form labels), then address alerts (redundant alt text, suspicious link text).

---

## Common Accessibility Testing Scenarios

### Keyboard Navigation Audit

1. Tab through the entire page from top to bottom. Verify focus order is logical and visible.
2. Activate every interactive element with Enter and/or Space.
3. Navigate composite widgets (tabs, menus, trees) with arrow keys.
4. Dismiss all overlays with Escape.
5. Verify no keyboard traps exist.
6. Confirm skip link works and moves focus correctly.

### Screen Reader Testing Matrix

| Task | NVDA + Firefox | JAWS + Chrome | VoiceOver + Safari |
|------|---------------|---------------|-------------------|
| Navigate by headings | H key | H key | Rotor > Headings |
| Navigate by landmarks | D key | R key | Rotor > Landmarks |
| Read form labels | Tab to field | Tab to field | Tab or VO+Right |
| Read table headers | Ctrl+Alt+Arrows | Ctrl+Alt+Arrows | VO+Arrows |
| Interact with combobox | Down Arrow | Down Arrow | VO+Down |
| Read live region updates | Automatic | Automatic | Automatic |

### Zoom and Reflow Testing

1. Zoom to 200% and verify no content is lost or overlapping.
2. Set viewport to 320px width and verify content reflows without horizontal scrollbar.
3. Override text spacing (line height 1.5, paragraph spacing 2em, letter spacing 0.12em, word spacing 0.16em) and verify no content loss.

---

## Legal Landscape

### Americans with Disabilities Act (ADA)

The ADA Title III applies to places of public accommodation, which courts have extended to cover websites and mobile applications. There is no explicit web standard in the statute, but WCAG 2.1 Level AA is the accepted benchmark in Department of Justice guidance and court settlements. Businesses of all sizes face litigation risk. Recent DOJ rulings (2022 and onward) explicitly reference WCAG 2.1 AA.

### Section 508 (United States)

Section 508 of the Rehabilitation Act requires federal agencies and their contractors to make electronic and information technology accessible. The 2017 refresh aligns Section 508 with WCAG 2.0 Level AA. Federal procurement processes require Voluntary Product Accessibility Templates (VPATs) documenting conformance.

### EN 301 549 (European Union)

EN 301 549 is the European harmonized standard for ICT accessibility. It incorporates WCAG 2.1 Level AA for web content and adds requirements for non-web software, hardware, and documentation. It applies to public sector websites and apps under the EU Web Accessibility Directive (2016/2102).

### European Accessibility Act (EAA) - Effective June 2025

The EAA extends accessibility requirements to the private sector across the EU. It covers e-commerce, banking, transport, e-books, and telecommunications. Businesses must ensure products and services are accessible. The act references EN 301 549 and WCAG 2.1 AA. Non-compliance may result in market withdrawal, penalties, and consumer complaints. Businesses selling into the EU must prepare for compliance regardless of where they are headquartered.

### Accessibility for Ontarians with Disabilities Act (AODA)

Ontario, Canada requires WCAG 2.0 Level AA compliance for public and private sector organizations with 50+ employees.

### Compliance Strategy

1. Adopt WCAG 2.2 Level AA as the baseline standard to exceed all current legal requirements.
2. Publish a public accessibility statement documenting conformance level, known issues, and remediation timeline.
3. Establish an accessibility feedback mechanism on every page.
4. Conduct annual third-party accessibility audits.
5. Train development and design teams on accessibility fundamentals.
6. Integrate automated accessibility testing into CI/CD pipelines.
7. Maintain a VPAT/ACR (Accessibility Conformance Report) for enterprise procurement.
8. Monitor legislative developments, as accessibility law is expanding globally.

---

## WCAG 3.0 Outcomes Framework

### Bronze/Silver/Gold Conformance Model

WCAG 3.0 replaces binary pass/fail compliance with a graduated scoring system. Each outcome is scored on a 0-4 scale, and scores are aggregated with weighting to determine conformance level.

| Level | Requirement | Equivalent to |
|-------|------------|---------------|
| Bronze | Minimum score threshold across all critical outcomes | Roughly WCAG 2.x Level AA |
| Silver | Higher scores across critical and important outcomes | Between AA and AAA |
| Gold | High scores across all outcome categories | Exceeds current AAA |

### How Scoring Works

Each of the 174 outcomes receives a score from 0 to 4:

| Score | Label | Description |
|-------|-------|-------------|
| 0 | Very Poor | No support for this outcome |
| 1 | Poor | Minimal, inconsistent support |
| 2 | Fair | Partial support with notable gaps |
| 3 | Good | Solid support with minor gaps |
| 4 | Excellent | Full, robust support |

Scores are weighted by outcome category and user impact. Critical outcomes (those affecting basic access) carry higher weight than enhancement outcomes. The weighted aggregate determines conformance level.

### Key New Outcomes Beyond WCAG 2.2

WCAG 3.0 introduces outcomes that address gaps in WCAG 2.x:

- **Cognitive accessibility outcomes:** Explicit requirements for clear language, predictable navigation, and error prevention that go beyond WCAG 2.2's limited cognitive coverage.
- **Application-specific outcomes:** Requirements for native mobile apps, desktop applications, and embedded systems that WCAG 2.x addressed only tangentially.
- **XR and immersive outcomes:** Accessibility requirements for augmented reality, virtual reality, and spatial computing experiences.
- **AI interface outcomes:** Requirements for accessible AI-generated content, screen reader compatibility with streaming outputs, and accessible confidence indicators.
- **Document accessibility outcomes:** Structured requirements for PDF, EPUB, and document accessibility beyond web content.

### Testing Methodology Differences

WCAG 3.0 testing differs from WCAG 2.x in three significant ways:

1. **Outcome-based testing:** Tests evaluate whether the user can achieve the intended outcome, not just whether a specific technical criterion is met. This is more holistic but requires more judgment.
2. **Functional categories:** Outcomes are organized by functional need (vision, hearing, mobility, cognition) rather than by technical principle (perceivable, operable, understandable, robust).
3. **Scoring requires calibration:** Because outcomes are scored on a scale rather than binary pass/fail, evaluator calibration and inter-rater reliability become more important. Use scoring rubrics and calibration sessions.

### AI-Enhanced Accessibility

AI is augmenting assistive technology capabilities, creating both opportunities and new design considerations:

- **AI-powered screen readers:** Google's integration of Gemini with TalkBack enables natural language descriptions of complex visual content. Design interfaces that provide structured data for AI screen readers to interpret, not just raw ARIA attributes.
- **AI image descriptions:** Automatic alt text generation is improving but remains unreliable for critical content. Use AI-generated descriptions as a fallback, not a replacement for human-authored alt text. Always allow users to request a more detailed AI description.
- **AI-augmented assistive tech:** Design for a future where assistive technology can ask your interface questions about its content and structure. Provide rich semantic markup, structured data, and API endpoints that AI assistive tech can query.
- **Voice AI and screen readers:** Ensure that voice AI features (copilots, voice assistants) work alongside screen readers without conflict. Test AI voice output with VoiceOver, NVDA, and TalkBack running simultaneously.
