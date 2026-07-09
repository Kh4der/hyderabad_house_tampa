# Neurodiversity and Cognitive Accessibility Accommodations

## Cognitive Accessibility Overview

Cognitive accessibility addresses the needs of users with differences in attention, memory, learning, language processing, executive function, and emotional regulation. The population benefiting from cognitive accessibility is vast and frequently underserved: an estimated 15-20% of the global population is neurodivergent, encompassing ADHD, autism spectrum conditions, dyslexia, dyscalculia, intellectual disabilities, traumatic brain injury, age-related cognitive decline, and temporary cognitive impairments from stress, medication, illness, or fatigue.

Designing for cognitive accessibility improves usability for everyone. Clear navigation benefits a user with ADHD and a distracted parent simultaneously. Plain language serves both a user with a learning disability and a non-native speaker. Consistent layouts support autistic users and anyone encountering the interface for the first time. Cognitive accessibility is not a niche concern but a foundation of genuinely universal design.

WCAG 2.2 addresses cognitive accessibility through criteria like 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication, and 2.4.11 Focus Not Obscured. The W3C Cognitive and Learning Disabilities Accessibility Task Force (COGA) publishes supplemental guidance extending beyond WCAG, covering areas such as familiar design patterns, clear language, and error prevention. Treat COGA guidance as essential design input, not optional enhancement.

---

## ADHD Accommodations in UI Design

### Minimizing Distractions

Reduce visual noise across the interface. Limit the number of competing visual elements on any single screen. Suppress non-essential animations, auto-playing videos, and ambient motion that draws attention away from the primary task. Provide controls to dismiss or mute non-critical notifications. Batch notifications rather than delivering them individually in real time. Avoid blinking or pulsing elements that continuously pull focus.

Design layouts with clear visual hierarchy. Use whitespace deliberately to separate content regions. Collapse secondary information into progressive disclosure panels so the core task remains visually prominent. Avoid sidebar ads, floating chat widgets, and persistent banners that compete with primary content during task completion.

Offer a "focus mode" or "distraction-free mode" that hides navigation, sidebars, and ancillary UI elements. Text editors, reading apps, and productivity tools benefit significantly from this pattern.

### Supporting Focus

Provide visible progress indicators for multi-step processes. Show the current step, total steps, and estimated completion time. Progress bars, step counters, and checklists help users with ADHD maintain awareness of where they are in a workflow and how much remains.

Break large tasks into smaller, discrete steps. Present one step at a time rather than exposing an entire complex form simultaneously. Each step should have a clear, achievable objective. Celebrate completion of intermediate steps with subtle, non-distracting confirmation.

Integrate time awareness tools where appropriate: visible timers for time-boxed activities (with user control to pause/extend), time estimates for content reading or task completion, and "last saved" timestamps to orient users returning after a break.

### Managing Executive Function

Reduce decision complexity at every opportunity. Limit the number of options presented simultaneously. Apply progressive disclosure to surface advanced options only when needed. Provide smart defaults that handle common cases without requiring user configuration.

Present clear next steps after every action. When a user submits a form, display an explicit instruction: "Your order is confirmed. Track your order here." Avoid dead-end states where the user must determine what to do next without guidance.

Structure navigation predictably. Place primary actions consistently. Use descriptive labels rather than abstract icons. Eliminate ambiguous calls to action. "Save draft" is preferable to a bare floppy disk icon that could mean save, download, or export.

### Handling Working Memory Limitations

Persist context across sessions and interactions. Auto-save form data so that accidental navigation away does not lose progress. Maintain shopping cart state, search filters, and scroll position across page reloads and sessions.

Provide robust undo capabilities. Allow users to reverse actions without navigating to a separate settings or history page. Display "Undo" actions inline immediately after the triggering event. Extend undo windows generously: a 5-second undo toast is too brief for a user who was momentarily distracted.

Display relevant context inline rather than requiring users to remember information from previous screens. When a checkout process requires a shipping address, show the selected address on the payment screen rather than forcing the user to recall it. When referencing a previous choice, display that choice visibly.

Minimize reliance on short-term memory for task completion. Do not require users to remember codes, reference numbers, or instructions shown on a previous page. Keep multi-step instructions visible throughout the task.

---

## Autism Spectrum Accommodations

### Predictability and Consistency

Maintain stable, predictable layouts across all pages. Use consistent placement for navigation, primary actions, and content regions. Do not rearrange page elements between visits or as part of A/B testing without providing user controls to revert. Unexpected layout changes can cause significant disorientation and anxiety.

Communicate expectations clearly before every interaction. If clicking a button opens a new window, indicate that in the label or with a visible icon. If a process has a time limit, state it upfront. If an action is irreversible, confirm before executing. Eliminate surprises.

Provide advance notice of changes. When a system update will alter the interface, notify users well before the change, describe what will be different, and ideally offer a preview period. Sudden interface changes without warning can be deeply disruptive for autistic users who rely on familiar patterns.

Use clear, literal language in all interface text. Labels should describe exactly what will happen. "Remove item from cart" is preferable to "Clear." "Send message now" is preferable to "Fire away!"

### Sensory Sensitivity

Honor the `prefers-reduced-motion` media query to disable or reduce all animations, transitions, and motion effects. Provide an explicit in-app setting to control motion independently of the operating system setting. Avoid large-scale page transitions, parallax scrolling, and background video.

Avoid high-contrast flashing patterns, rapidly changing colors, and visual effects that can cause sensory overload. Test all animated content against WCAG 2.3.1 (three flashes threshold).

Provide controls for visual density. Allow users to increase spacing, reduce the number of visible elements, and choose calmer color palettes. Some autistic users experience visual overwhelm from dense information layouts that neurotypical users find efficient.

Minimize unexpected sounds. Never auto-play audio. Provide volume controls for all media. Allow notification sounds to be configured independently.

### Communication Clarity

Write interface text in plain, literal language. Avoid idioms ("break the ice"), metaphors ("hit the ground running"), sarcasm, and culturally specific references that may be interpreted literally. Use concrete, specific language.

Provide explicit instructions rather than implying expected behavior. Instead of "Complete your profile to get started," specify: "Add your name, email, and a profile photo. Then select Save."

Use consistent terminology throughout the application. If one page calls it "Account Settings," do not call it "Preferences" on another page and "Profile Options" on a third. Pick one term and use it everywhere.

Avoid ambiguous error messages. "Something went wrong" provides no actionable information. "Your payment could not be processed. The card number you entered is invalid. Please check the number and try again." provides clarity and direction.

### Routine Support

Design consistent workflows that do not vary between uses. If a purchase process follows five steps, maintain those same five steps in the same order every time. Do not dynamically skip steps or reorder them based on context without clear communication.

Provide visible change logs or "what's new" features when the interface updates. Allow users to review changes at their own pace rather than discovering them unexpectedly during use.

Support bookmarking and deep linking so users can return to specific screens directly without navigating through a sequence each time.

---

## Dyslexia Accommodations

### Typography

Select fonts with distinct letterforms. Sans-serif fonts with clear differentiation between similar characters (b/d, p/q, I/l/1, O/0) perform well. Arial, Verdana, Tahoma, Century Gothic, and Trebuchet MS are commonly recommended. OpenDyslexic is a specialized font with weighted bottoms that some users find helpful; offer it as an option rather than a default since preferences vary significantly.

Set body text to a minimum of 16px (1rem). Allow users to increase text size without layout breakage (support up to at least 200% per WCAG 1.4.4). Use a line height of 1.5 to 1.8 for body text. Set letter spacing to at least 0.12em and word spacing to at least 0.16em as configurable options. Avoid fully justified text, which creates uneven word spacing ("rivers of white") that disrupts reading flow.

Limit the use of italic text, ALL CAPS, and underlined text for non-links. These styles reduce letterform distinctiveness. Use bold for emphasis instead. Maintain sufficient contrast (4.5:1 minimum) but allow contrast customization since some dyslexic users find pure black on white overly harsh.

### Layout

Keep line lengths between 50 and 75 characters (approximately 45-65 characters is the optimal range for readability). Shorter lines reduce the likelihood of losing one's place when moving to the next line.

Left-align all body text. Centered text and right-aligned text disrupt the consistent left-edge anchor point that readers rely on to track line beginnings.

Use generous paragraph spacing (at least 1.5 times the line spacing). Separate distinct content sections with clear visual boundaries (whitespace, subtle dividers, background color changes). Avoid dense, unbroken walls of text.

Break content into scannable chunks. Use headings, subheadings, bullet points, and numbered lists liberally. Front-load important information in paragraphs and list items. Use bold for key terms within paragraphs to support scanning.

### Content

Write in plain language. Aim for a reading level accessible to a broad audience (6th-8th grade reading level for general consumer content). Use short sentences. Prefer common words over specialized vocabulary. Define technical terms when they must be used.

Provide summaries at the beginning of long documents or sections. Use the inverted pyramid structure: most important information first, supporting details after.

Avoid dense paragraphs exceeding 3-4 sentences. One idea per paragraph. Use transitional words and phrases to connect ideas and maintain reading flow.

### Tools

Integrate or support text-to-speech functionality. Offer a "read aloud" button that highlights text as it is spoken. Support system-level screen readers and text-to-speech engines without interference.

Provide a reading ruler or line guide option: a visual indicator (highlighted stripe or dimmed surrounding text) that follows the user's reading position, helping maintain line tracking.

Allow customizable display settings: font family, font size, line spacing, letter spacing, word spacing, background color, text color, and margin width. Persist these settings across sessions. A single "dyslexia-friendly mode" toggle that applies a curated set of these adjustments can serve as a convenient starting point.

---

## Learning Disabilities Accommodations

### Multi-Modal Content Presentation

Present information through multiple channels simultaneously. Pair text instructions with diagrams, illustrations, or icons. Provide video tutorials with captions and transcripts alongside written documentation. Offer audio explanations of complex concepts. Multiple modalities increase the likelihood that content will be understood, as different users process information most effectively through different channels.

Use concrete, visual examples rather than abstract descriptions. When explaining a concept, show it in action. Interactive demonstrations, before/after comparisons, and annotated screenshots convey meaning more effectively than prose alone for many users with learning disabilities.

### Progressive Complexity

Structure content and interfaces to move from simple to detailed. Present the essential version first, with options to drill deeper. An "Overview" tab followed by a "Details" tab serves this pattern well. Layer complexity so users engage only with the level of detail they need.

Provide onboarding flows that introduce features gradually rather than presenting the full interface at once. Use progressive disclosure to surface advanced controls only after fundamental ones are mastered. Coach marks, step-by-step tours, and contextual tips support gradual learning without overwhelming.

### Guided Experiences

Provide clear, step-by-step instructions for complex processes. Number each step. Use action-oriented language: "Select the file, then press Upload." Show the expected outcome of each step. Include visual indicators of the current step and remaining steps.

Offer templates, defaults, and examples for user-generated content. A blank text field is intimidating; a pre-populated template with placeholder text reduces cognitive load and provides a starting point.

### Error Prevention and Forgiveness

Prevent errors before they occur through constrained inputs (date pickers instead of free text, dropdown menus instead of manual entry), inline validation, and confirmation dialogs for destructive actions.

When errors do occur, provide specific, constructive error messages that explain what went wrong and how to fix it. Never blame the user. Offer one-click correction when possible. Preserve all user input through errors so that correcting one field does not require re-entering others.

Support unlimited undo and revision history. Allow users to experiment without fear of permanent consequences. "Try and undo" is a valid learning strategy that interfaces should support.

---

## Anxiety and Stress Accommodations

### Reducing Uncertainty

Provide immediate, visible feedback for every user action. Button presses should produce visual confirmation (state change, loading indicator). Form submissions should display explicit success or failure messages. Never leave users in ambiguous states where they cannot determine whether an action succeeded.

Show clear system status at all times. Loading states should include progress indicators (determinate when possible, indeterminate when not) and estimated wait times. Background processes should be visible in a status area. Connection loss should be communicated immediately with recovery instructions.

Display comprehensive information before requiring commitment. Show the full cost (including taxes and fees) before the payment button. Display subscription terms, cancellation policies, and renewal dates clearly. Preview the result of an action before executing it (email preview, print preview, "Review your order").

### Providing Control

Allow users to pause, cancel, and reverse actions. Provide a clear cancellation path for any multi-step process. Allow mid-process saving so users can leave and return. Never auto-submit or auto-advance without explicit user action.

Offer customization options for notifications, display density, communication preferences, and data sharing. The sense of control itself reduces anxiety, even if users do not change the defaults.

Support multiple pathways to accomplish the same goal. Some users prefer search; others prefer navigation. Some prefer forms; others prefer chat. Offering choice respects different comfort levels and reduces the anxiety of being forced into an unfamiliar interaction pattern.

### Avoiding Urgency Manipulation

Never use countdown timers to pressure purchasing decisions. Avoid displaying false scarcity indicators ("Only 2 left in stock!" when restocking is continuous). Do not display "X people are looking at this right now" pressure indicators. These dark patterns exploit anxiety and are particularly harmful to users with anxiety disorders.

Allow users to set their own pace. If a session must time out for security reasons, provide generous duration (at least 20 minutes), warn before expiration, and offer easy extension. Never auto-log out without saving the user's work.

Replace urgency-based language ("Act now!" "Limited time!" "Don't miss out!") with informative language ("Sale ends March 15" "Available while supplies last" "New items added weekly").

### Clear Cost and Commitment Communication

Display total costs upfront, including all fees, taxes, and recurring charges. Do not reveal additional costs late in a checkout funnel. Itemize charges clearly.

Communicate commitments plainly: "You are signing up for a monthly subscription at $9.99/month. You can cancel anytime from your Account Settings page. Your next billing date will be April 15."

Distinguish clearly between free trials and paid subscriptions. Do not require payment information for genuinely free services. If payment information is required for a free trial, display the exact date and amount of the first charge prominently.

---

## Memory Impairment Accommodations

### Persistent Navigation and Context

Keep navigation visible and consistent at all times. Avoid hiding primary navigation behind hamburger menus on desktop. Breadcrumbs provide essential orientation for users who may not remember how they arrived at the current page.

Display the user's current location within the application clearly. Highlight the active navigation item. Show breadcrumb trails. Use page titles that match navigation labels exactly.

Maintain visible context for the current task. If a process spans multiple pages, display a persistent summary of previous selections. Show the document title, project name, or account context prominently.

### Recognition Over Recall

Design interfaces that present options rather than requiring users to remember them. Dropdown menus, suggestion lists, and recently used items reduce recall demands. Show previously entered values, recent searches, and frequently used features.

Use icons paired with text labels rather than icons alone. Icons without labels require the user to recall the icon's meaning. Labels make the function immediately recognizable.

Display descriptions and context alongside choices. Instead of a bare list of project names, show the project name, last modified date, and a brief description. The additional context supports recognition.

### Auto-Save and Session Persistence

Auto-save user work continuously and unobtrusively. Display the last save time visibly. Do not rely on the user to remember to save. Session loss after a browser crash or accidental tab closure is deeply frustrating for all users and devastating for users with memory impairments.

Persist form data, shopping carts, search filters, and application state across sessions. When a user returns after days or weeks, restore their context as completely as possible. Provide a "Continue where you left off" prompt.

Implement session timeout warnings with at least 20 seconds of advance notice and a one-click extension mechanism. After timeout, save state and provide a clear path to resume after re-authentication.

### Clear History and Activity Logs

Provide accessible activity history: recent orders, past searches, viewed items, completed actions. Display history in reverse chronological order with clear timestamps and descriptions.

Offer "recently viewed" and "continue where you left off" features prominently. These serve as external memory aids that reduce the cognitive burden of remembering past interactions.

---

## Motor and Dexterity Considerations for Cognitive Load

### Large Touch Targets

Size interactive touch targets to at least 44x44 CSS pixels (Apple HIG recommendation) or 48x48dp (Material Design recommendation). WCAG 2.2 Success Criterion 2.5.8 requires a minimum of 24x24 CSS pixels with adequate spacing. Go beyond the minimum. Larger targets reduce the cognitive load of precise motor planning.

Provide generous spacing between adjacent interactive elements. Minimum 8px spacing; prefer 12-16px. Insufficient spacing forces users to concentrate on precise targeting rather than the task itself.

### Timeout Extensions

Extend or eliminate timeouts for users who process information more slowly. WCAG 2.2.1 requires that time limits be adjustable: allow the user to turn off the timer, extend it to at least 10 times the default, or be warned 20 seconds before expiration with an option to extend.

For CAPTCHAs and time-limited tasks, provide alternatives that do not penalize slower processing: extended time versions, non-timed alternatives, or biometric/device-based authentication.

### Voice and Switch Control Support

Ensure all interactive elements have visible text labels that match their accessible names (WCAG 2.5.3 Label in Name). Voice control users (Dragon NaturallySpeaking, Apple Voice Control, Android Voice Access) issue commands by speaking the visible label. A button displaying "Submit" but carrying an accessible name of "Send Form" cannot be activated by voice.

Test switch control navigation (single-switch scanning, two-switch step-and-select). Verify that focus order is logical and that no elements are skipped. Minimize the number of switch presses needed to reach common actions by placing primary controls early in focus order.

Support dwell-based activation for users who cannot reliably press buttons. Allow configuration of dwell time and provide visual feedback (filling ring, countdown) during the dwell period.

---

## Preference Media Queries Implementation

### `prefers-reduced-motion`

Detect and honor the user's motion preference at the OS level. Eliminate or replace all motion with instant state changes.

```css
/* Base styles: include full animations */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.slide-panel {
  transition: transform 0.3s ease;
}

/* Reduce motion: eliminate or simplify */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

For more nuanced control, replace motion with opacity crossfades or instant transitions on a per-component basis:

```css
@media (prefers-reduced-motion: reduce) {
  .slide-panel {
    transition: opacity 0.15s ease;
    transform: none;
  }

  .carousel-slide {
    animation: none;
    transition: opacity 0.2s ease;
  }

  .page-transition {
    transition: none;
  }
}
```

In JavaScript, check the preference and adapt behavior:

```javascript
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function getAnimationDuration() {
  return motionQuery.matches ? 0 : 300;
}

// Listen for changes (user may toggle mid-session)
motionQuery.addEventListener('change', (event) => {
  if (event.matches) {
    stopAllAnimations();
    disableAutoPlayCarousels();
  }
});

function initCarousel(element) {
  const autoPlay = !motionQuery.matches;
  // Configure carousel with or without auto-rotation
}
```

Disable auto-playing carousels, background videos, parallax effects, and skeleton loading animations when reduced motion is preferred. Replace loading skeletons with static loading indicators (spinner or text).

### `prefers-contrast`

Detect high contrast and forced-colors preferences and adjust styling accordingly.

```css
/* High contrast adjustments */
@media (prefers-contrast: more) {
  :root {
    --border-color: #000;
    --text-color: #000;
    --bg-color: #fff;
    --focus-outline: 3px solid #000;
  }

  button, a, input, select, textarea {
    border: 2px solid var(--border-color);
  }

  .subtle-text {
    color: var(--text-color); /* Upgrade from gray to full black */
  }

  .card {
    border: 2px solid var(--border-color);
    box-shadow: none; /* Replace shadows with borders */
  }
}

/* Low contrast preference (rare but supported) */
@media (prefers-contrast: less) {
  :root {
    --text-color: #555;
    --bg-color: #f5f5f5;
  }
}

/* Windows High Contrast / Forced Colors */
@media (forced-colors: active) {
  .custom-checkbox-visual {
    border: 2px solid ButtonText;
  }

  .custom-checkbox-visual.checked::after {
    background: Highlight;
  }

  /* Use system color keywords */
  .icon {
    fill: ButtonText;
  }

  a {
    color: LinkText;
  }

  button {
    border: 1px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }

  button:focus {
    outline: 2px solid Highlight;
  }

  /* Ensure custom focus indicators remain visible */
  :focus-visible {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
}
```

Forced-colors mode overrides custom colors with system colors. Test all components in Windows High Contrast mode (both light and dark themes). Custom icons rendered as background images may disappear; use inline SVGs with `currentColor` or `forced-color-adjust: auto`.

### `prefers-color-scheme`

Detect the user's light/dark mode preference and apply the appropriate theme automatically.

```css
/* Light theme (default) */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #555555;
  --accent: #0066cc;
  --border: #dddddd;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #e5e5e5;
    --text-secondary: #a0a0a0;
    --accent: #6db3f2;
    --border: #444444;
  }
}

/* Apply variables throughout */
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

a {
  color: var(--accent);
}
```

In JavaScript, detect and respond to changes:

```javascript
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

// Apply on load
applyTheme(darkQuery.matches);

// Listen for system changes
darkQuery.addEventListener('change', (event) => {
  // Only auto-apply if user has not explicitly overridden
  if (!localStorage.getItem('theme-override')) {
    applyTheme(event.matches);
  }
});
```

Maintain sufficient contrast ratios in both light and dark themes. Test all color combinations against WCAG 1.4.3 contrast requirements in both modes. Dark mode is not just inverting colors; it requires careful selection of surface colors, text colors, and shadow/elevation patterns to maintain readability and visual hierarchy.

---

## User Preference Persistence and Settings Design

### Settings Architecture

Provide a centralized accessibility settings panel accessible from every page. Include the following configurable preferences:

- **Motion:** Reduce motion / Full motion
- **Contrast:** Default / Increased contrast / Decreased contrast
- **Color scheme:** Light / Dark / System default
- **Text size:** Slider from 100% to 200%
- **Font:** System default / Sans-serif / Serif / OpenDyslexic
- **Line spacing:** Normal / Relaxed / Generous
- **Content density:** Comfortable / Compact
- **Notifications:** All / Important only / None
- **Auto-play media:** On / Off

### Persistence Strategy

Store preferences in multiple layers for resilience:

1. **Server-side (authenticated users):** Sync preferences to the user account. Apply them on any device after login.
2. **Local storage (anonymous users):** Store preferences in `localStorage` so they persist across sessions on the same device.
3. **CSS media queries (system-level):** Use as the baseline default, overridden by explicit user preferences.

Apply preferences before first paint to avoid flash of unstyled/wrong-themed content:

```html
<head>
  <script>
    // Apply stored preferences before CSS renders
    (function() {
      const prefs = JSON.parse(localStorage.getItem('a11y-prefs') || '{}');
      const html = document.documentElement;
      if (prefs.theme) html.setAttribute('data-theme', prefs.theme);
      if (prefs.fontSize) html.style.fontSize = prefs.fontSize;
      if (prefs.reducedMotion) html.classList.add('reduced-motion');
      if (prefs.font) html.setAttribute('data-font', prefs.font);
    })();
  </script>
</head>
```

### Settings UI Design

Present settings with immediate preview: when the user adjusts text size, reflect the change in real time. Provide a "Reset to defaults" button. Group related settings logically. Use plain language to describe each option and its effect. Do not require page reload to apply changes.

Avoid requiring users to navigate to a buried settings page to discover these options. Offer a quick-access accessibility menu (commonly triggered by a floating accessibility icon or a persistent footer link labeled "Accessibility Settings"). Announce changes to assistive technology via a live region: "Text size increased to 150%."

---

## Testing with Neurodivergent Users

### Recruitment

Recruit neurodivergent participants intentionally and through appropriate channels. Partner with neurodiversity advocacy organizations, disability employment networks, university disability services, and online neurodivergent communities. Avoid exclusively recruiting through clinical databases, as this skews toward diagnosed individuals and misses the large population who are undiagnosed or self-identified.

Use inclusive screening questionnaires that allow self-identification without requiring medical documentation. Respect that many neurodivergent people may not have formal diagnoses, particularly adults who were not assessed in childhood, women, and people from underserved communities. Self-identification is a valid basis for inclusion in usability studies.

Compensate participants fairly and promptly. Offer flexible compensation options (digital gift cards, direct payment, charitable donations). Recognize that participation may require more energy and planning for neurodivergent individuals.

### Protocol Adaptations

**Environment:** Offer remote participation as an option; many neurodivergent participants are more comfortable in their own environment with their own equipment and accommodations. For in-person sessions, provide a quiet, low-stimulation room. Minimize fluorescent lighting. Allow participants to wear sunglasses, headphones, or other comfort items.

**Scheduling:** Offer flexible scheduling with generous time windows. Allow participants to choose their preferred time of day (executive function varies throughout the day for many neurodivergent people). Send reminders 24 hours and 1 hour before the session. Provide clear instructions about location, parking, check-in procedures, and what to expect.

**Session structure:** Provide a written agenda at the start. Explain what will happen, how long it will take, and what is expected. Allow breaks at any time without requiring justification. Extend session time by 25-50% compared to standard usability sessions to reduce time pressure.

**Communication:** Provide task instructions in writing as well as verbally. Use literal, concrete language. Avoid hypothetical scenarios ("Imagine you want to...") when you can use concrete ones ("Find the return policy for this order"). Allow participants to read tasks at their own pace rather than listening to them spoken aloud.

**Think-aloud adaptation:** Traditional think-aloud protocol can be cognitively taxing and may interfere with task performance for neurodivergent users. Consider retrospective think-aloud (complete the task first, then discuss), or use a hybrid approach where participants narrate only when comfortable. Accept that some participants may communicate differently: brief responses, written notes, or demonstrating rather than verbalizing.

**Stimming and movement:** Do not ask participants to stop fidgeting, rocking, or using fidget tools. These self-regulatory behaviors support focus and are not indicators of inattention or disengagement. Do not interpret lack of eye contact as disinterest.

### Ethical Considerations

**Informed consent:** Provide consent forms in plain language at an accessible reading level. Offer the consent form in advance so participants can review it without time pressure. Explain data collection, recording, and how insights will be used. Allow verbal consent as an alternative to signed forms.

**Identity-first vs person-first language:** Follow the preference of the community. Many autistic people prefer identity-first language ("autistic person" rather than "person with autism"). Many people with ADHD use identity-first language casually. When in doubt, ask the participant their preference. Never use deficit-framing language ("suffering from," "afflicted with").

**Avoid pathologizing:** Frame findings in terms of usability barriers and design opportunities, not user deficits. "The checkout flow requires users to remember a code across screens, creating a barrier" is appropriate. "Users with memory problems could not complete checkout" frames the issue as a user problem rather than a design problem.

**Data protection:** Handle disability-related data with heightened sensitivity. Anonymize findings. Do not include diagnostic information in reports unless directly relevant and consented. Store screening data separately from session data. Delete identifying information according to a defined retention schedule.

**Representation:** Include neurodivergent people in the design process beyond usability testing. Hire neurodivergent designers, developers, and researchers. Engage neurodivergent consultants for accessibility reviews. Involve disability advocacy organizations in roadmap discussions. Nothing about us without us.

**Avoiding tokenism:** Do not test with one or two neurodivergent users and declare the design "neuro-inclusive." Neurodiversity encompasses a wide spectrum of experiences. An accommodation that helps one autistic user may not help another. Recruit diverse participants across multiple conditions, demographics, and severity levels. Conduct ongoing research, not one-time studies.

---

## AI-Adaptive Neurodiversity Patterns

### AI-Powered Adaptive Interfaces

AI enables interfaces that adapt to individual neurodivergent users' needs in real time, moving beyond static preference settings to dynamic accommodation.

**Sensory Profile Customization**
Go beyond simple reduced-motion toggles. AI-adaptive systems can learn individual sensory profiles encompassing motion sensitivity, color sensitivity, audio sensitivity, information density preference, and interaction pace. Present these as a comprehensive sensory profile editor rather than scattered individual settings. Allow users to create named profiles for different contexts (work, evening, high-focus).

**Cognitive Load Adaptation**
AI can detect signals that suggest cognitive overload — increased error rates, slower interaction speed, repeated undo actions, abandoned task flows — and adapt the interface in real time:

- Simplify the current view by collapsing secondary information.
- Reduce notification frequency and urgency.
- Offer to break the current task into smaller steps.
- Switch to a calmer color palette or increase whitespace.
- Proactively suggest a break after sustained high-intensity interaction.

Implement adaptation as gentle suggestions ("Want me to simplify this view?") rather than automatic changes, which can disorient users who rely on predictable interfaces. Always provide manual override and the ability to disable adaptive behavior entirely.

**AI-Personalized Communication**
Allow AI-powered interfaces to adapt their communication style based on user preference: literal and precise for users who prefer concrete language, or more contextual and explanatory for users who benefit from additional framing. Let users configure their preferred communication style through explicit settings rather than inferring it opaquely.

### Research Methodology Adaptations for Neurodivergent Participants

When conducting research specifically to evaluate neurodiversity accommodations:

- **Co-design sessions:** Involve neurodivergent users as co-designers, not just test participants. Their lived experience is the primary source of design knowledge.
- **Longitudinal studies:** Single-session testing misses the adaptation patterns that neurodivergent users develop over time. Diary studies and multi-week evaluations reveal how accommodations work in practice.
- **Sensory environment control:** In remote testing, allow participants to use their own sensory accommodations (lighting, headphones, fidget tools). In lab testing, provide adjustable lighting, noise-canceling headphones, and a calm environment.
- **Flexible success criteria:** Define task success broadly. A neurodivergent user who completes a task through an alternative path has succeeded — the path matters less than the outcome.
- **Pair analysis with lived experience:** Partner neurodivergent researchers or consultants with neurotypical researchers during analysis to catch interpretive biases.

## Summary of Implementation Priorities

1. Honor all preference media queries (`prefers-reduced-motion`, `prefers-contrast`, `prefers-color-scheme`) as baseline behavior.
2. Provide persistent, cross-session user preference settings that override system defaults.
3. Write all interface text in plain, literal, unambiguous language.
4. Minimize cognitive load through progressive disclosure, smart defaults, and task decomposition.
5. Eliminate urgency manipulation, false scarcity, and anxiety-inducing dark patterns.
6. Auto-save state continuously and provide robust undo capabilities.
7. Present information through multiple modalities (text, visual, audio).
8. Maintain consistent, predictable layouts and navigation across all pages.
9. Provide customizable typography, spacing, and density settings.
10. Test with neurodivergent users using adapted protocols that respect diverse communication and processing styles.
11. Explore AI-adaptive interfaces that learn and respond to individual sensory and cognitive profiles.
12. Involve neurodivergent users as co-designers, not just test participants.
