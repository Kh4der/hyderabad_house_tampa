# Haptic Feedback Design System — Touch You Can Feel

## Haptic Design Philosophy

Haptic feedback adds a sensory dimension to digital interfaces that neither visuals nor audio can replicate. A well-placed vibration confirms that a button press registered, that a toggle flipped, that a destructive action is about to execute. It creates a tactile contract between the user and the interface: the device acknowledges your intent through physical sensation.

The cardinal rule of haptic design is that every vibration must carry meaning. Gratuitous haptics — vibrating on every scroll frame, buzzing on every tap regardless of context, or layering haptics onto already-clear interactions — trains users to ignore the feedback channel entirely. When everything vibrates, nothing communicates.

### Core Principles

**Confirmation, not decoration.** Haptics should confirm that an action completed, not celebrate that a finger touched glass. A toggle switch earns a haptic because the user needs to know the state changed. A static text label does not.

**Proportional intensity.** The strength of a haptic must match the weight of the action. A light tap for selecting a list item. A medium thud for completing a drag-and-drop. A sharp double-pulse for a destructive deletion. The physical sensation should mirror the conceptual gravity.

**Temporal precision.** A haptic that fires 50ms after the visual change feels broken. A haptic that fires 50ms before the visual change feels prophetic and wrong. Haptics must synchronize exactly with the visual moment — the instant the animation snaps, the instant the color changes, the instant the element disappears.

**Restraint over abundance.** Most screens in an app should have zero haptic events. Reserve haptics for moments that genuinely benefit from tactile reinforcement: state changes, confirmations, errors, gesture boundaries, and progress milestones. If you find yourself adding haptics to more than 10-15 interaction points across your entire app, audit ruthlessly.

**System coherence.** Haptic patterns must be consistent across the entire application. If a light impact means "selection confirmed" on one screen, it must mean the same thing on every screen. Users internalize haptic vocabulary subconsciously — inconsistency erodes trust faster than absence.

---

## iOS Core Haptics

iOS provides three high-level feedback generators through the UIKit framework and a low-level engine for custom patterns through Core Haptics. All generators require calling `.prepare()` before the haptic event to wake the Taptic Engine and minimize latency.

### UIImpactFeedbackGenerator

Impact feedback simulates a physical collision. It communicates that something has happened — a snap, a landing, a contact event. Five styles are available, each with a distinct tactile character:

| Style    | Sensation                          | Typical Use                        |
|----------|------------------------------------|------------------------------------|
| `.light`   | Brief, delicate tap                | Selection, minor state change      |
| `.medium`  | Moderate thud                      | Button confirmation, snap point    |
| `.heavy`   | Firm, weighty impact               | Drop completion, significant action|
| `.soft`    | Gentle, cushioned pulse            | Subtle acknowledgment, background  |
| `.rigid`   | Sharp, crisp click                 | Precise input, detent position     |

```swift
// SwiftUI — Impact Feedback on Button Press
import SwiftUI

struct ConfirmButton: View {
    let impactLight = UIImpactFeedbackGenerator(style: .light)
    let impactMedium = UIImpactFeedbackGenerator(style: .medium)
    let impactHeavy = UIImpactFeedbackGenerator(style: .heavy)

    var body: some View {
        Button("Confirm") {
            impactMedium.impactOccurred()
        }
        .onAppear {
            impactMedium.prepare()
        }
    }
}
```

```swift
// SwiftUI — Impact with intensity parameter (0.0 to 1.0)
struct IntensityExample: View {
    let impact = UIImpactFeedbackGenerator(style: .rigid)

    var body: some View {
        Button("Precise Click") {
            impact.impactOccurred(intensity: 0.7)
        }
        .onAppear {
            impact.prepare()
        }
    }
}
```

### UISelectionFeedbackGenerator

Selection feedback communicates a change in selection — scrolling through a picker, moving across discrete values in a slider, or highlighting items in a segmented control. It produces a light, ticking sensation that feels like detents on a physical dial.

```swift
// SwiftUI — Selection feedback on picker scroll
struct PickerHaptic: View {
    @State private var selected = 0
    let selectionFeedback = UISelectionFeedbackGenerator()

    var body: some View {
        Picker("Value", selection: $selected) {
            ForEach(0..<10) { i in
                Text("\(i)").tag(i)
            }
        }
        .pickerStyle(.wheel)
        .onChange(of: selected) { _ in
            selectionFeedback.selectionChanged()
        }
        .onAppear {
            selectionFeedback.prepare()
        }
    }
}
```

### UINotificationFeedbackGenerator

Notification feedback communicates the outcome of a task or action. Three types map to three semantic categories:

| Type       | Pattern                           | Use Case                             |
|------------|-----------------------------------|--------------------------------------|
| `.success` | Double tap, ascending             | Task complete, save confirmed        |
| `.warning` | Triple pulse, attention-seeking   | Approaching limit, caution required  |
| `.error`   | Sharp buzz, descending            | Validation failure, action rejected  |

```swift
// SwiftUI — Notification feedback for form validation
struct FormSubmit: View {
    @State private var email = ""
    let notification = UINotificationFeedbackGenerator()

    var body: some View {
        VStack {
            TextField("Email", text: $email)
            Button("Submit") {
                if isValidEmail(email) {
                    notification.notificationOccurred(.success)
                } else {
                    notification.notificationOccurred(.error)
                }
            }
        }
        .onAppear {
            notification.prepare()
        }
    }

    func isValidEmail(_ email: String) -> Bool {
        email.contains("@") && email.contains(".")
    }
}
```

### CHHapticEngine — Custom Patterns

For experiences beyond the built-in generators, Core Haptics provides `CHHapticEngine` to define custom haptic patterns with precise control over timing, intensity, and sharpness.

```swift
import CoreHaptics

class HapticManager {
    var engine: CHHapticEngine?

    init() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        do {
            engine = try CHHapticEngine()
            try engine?.start()
        } catch {
            print("Haptic engine failed: \(error.localizedDescription)")
        }
    }

    func playCustomPattern() {
        guard let engine = engine else { return }

        let sharpTap = CHHapticEvent(
            eventType: .hapticTransient,
            parameters: [
                CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.8),
                CHHapticEventParameter(parameterID: .hapticSharpness, value: 1.0)
            ],
            relativeTime: 0
        )

        let softPulse = CHHapticEvent(
            eventType: .hapticContinuous,
            parameters: [
                CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.4),
                CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.2)
            ],
            relativeTime: 0.1,
            duration: 0.3
        )

        do {
            let pattern = try CHHapticPattern(events: [sharpTap, softPulse], parameters: [])
            let player = try engine.makePlayer(with: pattern)
            try player.start(atTime: 0)
        } catch {
            print("Failed to play pattern: \(error.localizedDescription)")
        }
    }
}
```

The two event types are `.hapticTransient` (a brief, instantaneous tap) and `.hapticContinuous` (a sustained vibration over a duration). Combine them to create rhythmic patterns, escalating alerts, or textured feedback sequences.

### The .prepare() Contract

Always call `.prepare()` before you expect the haptic to fire. This wakes the Taptic Engine from its idle state, which takes approximately 30-50ms. Without preparation, the first haptic event may feel delayed or may not fire at all. Call `.prepare()` in `onAppear`, in `viewDidLoad`, or at the beginning of a gesture recognizer — any point that precedes the actual haptic event by at least one frame.

---

## Android Haptics

Android's haptic system spans `HapticFeedbackConstants` for semantic feedback, `VibrationEffect` for programmatic control, and Jetpack Compose extensions for declarative haptic triggers.

### HapticFeedbackConstants

These constants map to system-defined haptic patterns that adapt to device hardware. Using constants rather than raw vibration ensures consistency with the user's system haptic settings and provides appropriate fallbacks on devices with limited haptic motors.

| Constant               | Sensation                        | Typical Use                          |
|------------------------|----------------------------------|--------------------------------------|
| `CONFIRM`              | Affirmative double pulse         | Action completed, state saved        |
| `REJECT`               | Sharp negative buzz              | Validation failure, denied action    |
| `GESTURE_START`        | Subtle onset tap                 | Drag initiated, long press began     |
| `GESTURE_END`          | Completion thud                  | Drag released, gesture finished      |
| `LONG_PRESS`           | Firm sustained press             | Context menu trigger, selection mode |
| `CONTEXT_CLICK`        | Medium click                     | Right-click equivalent, secondary action|
| `CLOCK_TICK`           | Light tick                       | Picker scroll, timer increment       |
| `KEYBOARD_TAP`         | Minimal tap                      | Keystroke feedback                   |
| `TEXT_HANDLE_MOVE`     | Subtle drag tick                 | Text cursor repositioning            |
| `VIRTUAL_KEY`          | Brief key press                  | Soft keyboard input                  |

```kotlin
// Jetpack Compose — Haptic feedback on button click
@Composable
fun ConfirmButton() {
    val haptic = LocalHapticFeedback.current

    Button(onClick = {
        haptic.performHapticFeedback(HapticFeedbackType.Confirm)
    }) {
        Text("Confirm")
    }
}
```

```kotlin
// Jetpack Compose — Haptic feedback on long press
@Composable
fun LongPressCard() {
    val haptic = LocalHapticFeedback.current

    Card(
        modifier = Modifier.combinedClickable(
            onClick = { /* normal tap */ },
            onLongClick = {
                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                // Enter selection mode
            }
        )
    ) {
        Text("Long press me")
    }
}
```

### VibrationEffect API

For custom haptic patterns beyond the semantic constants, Android provides `VibrationEffect` with three factory methods:

**createPredefined()** wraps system-defined effects with hardware optimization:

```kotlin
// Predefined effects
val click = VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK)
val doubleClick = VibrationEffect.createPredefined(VibrationEffect.EFFECT_DOUBLE_CLICK)
val heavyClick = VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK)
val tick = VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK)

val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
vibrator.vibrate(click)
```

**createOneShot()** produces a single vibration of specified duration and amplitude:

```kotlin
// Single vibration: 50ms at 75% amplitude
val effect = VibrationEffect.createOneShot(50, 190) // amplitude 0-255
vibrator.vibrate(effect)
```

**createWaveform()** defines a sequence of timed vibration and pause segments:

```kotlin
// Waveform: vibrate-pause-vibrate pattern
// timings array: [wait, vibrate, wait, vibrate, ...]
val timings = longArrayOf(0, 50, 100, 30, 80, 50)
val amplitudes = intArrayOf(0, 200, 0, 150, 0, 255)
val effect = VibrationEffect.createWaveform(timings, amplitudes, -1) // -1 = no repeat

vibrator.vibrate(effect)
```

```kotlin
// Compose wrapper for custom vibration
@Composable
fun CustomHapticButton() {
    val context = LocalContext.current

    Button(onClick = {
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        if (vibrator.hasVibrator()) {
            val effect = VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK)
            vibrator.vibrate(effect)
        }
    }) {
        Text("Heavy Click")
    }
}
```

Always check `vibrator.hasVibrator()` and, for amplitude control, `vibrator.hasAmplitudeControl()` before attempting custom effects. Not all Android devices support variable amplitude — those that do not will fall back to a binary on/off vibration.

---

## Apple Watch Taptic Engine

The Apple Watch Taptic Engine is the primary feedback mechanism on a device where screen size limits visual feedback and speakers are tiny. watchOS haptics are accessed through `WKInterfaceDevice` and use named patterns optimized for the wrist.

### Available Patterns

| Pattern          | Sensation                         | When to Use                              |
|------------------|-----------------------------------|------------------------------------------|
| `.notification`  | Prominent double tap              | New message, incoming alert              |
| `.directionUp`   | Upward-sweeping pulse             | Value increasing, positive movement      |
| `.directionDown` | Downward-sweeping pulse           | Value decreasing, negative movement      |
| `.success`       | Celebratory triple pulse          | Workout goal reached, task completed     |
| `.failure`       | Harsh descending buzz             | Action failed, error occurred            |
| `.retry`         | Rhythmic repeating pulse          | Try again prompt, connection retrying    |
| `.start`         | Assertive onset tap               | Timer started, recording began           |
| `.stop`          | Definitive end tap                | Timer stopped, recording ended           |
| `.click`         | Minimal detent click              | Digital Crown scroll, picker selection   |

```swift
// watchOS — Playing haptic patterns
import WatchKit

struct WorkoutView: View {
    func startWorkout() {
        WKInterfaceDevice.current().play(.start)
    }

    func completeGoal() {
        WKInterfaceDevice.current().play(.success)
    }

    func showError() {
        WKInterfaceDevice.current().play(.failure)
    }

    func scrollTick() {
        WKInterfaceDevice.current().play(.click)
    }
}
```

### watchOS Haptic Guidelines

The wrist is far more sensitive to vibration than a hand holding a phone. Patterns that feel subtle on iPhone can feel aggressive on Apple Watch. Favor `.click` and `.directionUp`/`.directionDown` for routine interactions. Reserve `.notification`, `.success`, and `.failure` for significant moments.

Use `.directionUp` and `.directionDown` to communicate directional data without requiring the user to look at the screen. A navigation app can pulse `.directionUp` for "go straight" and alternate patterns for turns. A fitness app can use `.directionUp` when heart rate enters the target zone and `.directionDown` when it drops below.

The `.retry` pattern is unique to watchOS and communicates that the system is working on something that has not yet resolved. Use it sparingly — repeated retry haptics can feel alarming on the wrist. Pair it with a visual progress indicator.

---

## Haptic Pattern Library

This table defines the canonical haptic mapping for common interaction events. Use this as the foundation of your app's haptic vocabulary.

### Confirmation Patterns

| Event                  | iOS Implementation                              | Android Implementation                  |
|------------------------|------------------------------------------------|-----------------------------------------|
| Button press           | `UIImpactFeedbackGenerator(style: .light)`     | `HapticFeedbackType.Confirm`            |
| Toggle on/off          | `UIImpactFeedbackGenerator(style: .light)`     | `HapticFeedbackType.Confirm`            |
| Selection made         | `UIImpactFeedbackGenerator(style: .light)`     | `HapticFeedbackType.Confirm`            |
| Checkbox toggled       | `UIImpactFeedbackGenerator(style: .soft)`      | `EFFECT_CLICK`                          |
| Save completed         | `UINotificationFeedbackGenerator(.success)`    | `HapticFeedbackType.Confirm`            |

### Error Patterns

| Event                  | iOS Implementation                              | Android Implementation                  |
|------------------------|------------------------------------------------|-----------------------------------------|
| Form validation fail   | `UINotificationFeedbackGenerator(.error)`      | `HapticFeedbackType.Reject`             |
| Destructive action     | `UINotificationFeedbackGenerator(.error)`      | `HapticFeedbackType.Reject`             |
| Network error          | `UINotificationFeedbackGenerator(.error)`      | `HapticFeedbackType.Reject`             |
| Permission denied      | `UINotificationFeedbackGenerator(.error)`      | `HapticFeedbackType.Reject`             |

### Warning Patterns

| Event                  | iOS Implementation                              | Android Implementation                  |
|------------------------|------------------------------------------------|-----------------------------------------|
| Approaching limit      | `UINotificationFeedbackGenerator(.warning)`    | `HapticFeedbackType.LongPress`          |
| Destructive confirm    | `UINotificationFeedbackGenerator(.warning)`    | `HapticFeedbackType.LongPress`          |
| Unsaved changes        | `UINotificationFeedbackGenerator(.warning)`    | `HapticFeedbackType.LongPress`          |

### Progress Patterns

| Event                  | iOS Implementation                              | Android Implementation                  |
|------------------------|------------------------------------------------|-----------------------------------------|
| Picker scroll          | `UISelectionFeedbackGenerator`                 | `CLOCK_TICK`                            |
| Slider position        | `UISelectionFeedbackGenerator`                 | `CLOCK_TICK`                            |
| Page snap              | `UIImpactFeedbackGenerator(style: .medium)`    | `EFFECT_TICK`                           |
| Pull-to-refresh threshold | `UIImpactFeedbackGenerator(style: .medium)` | `HapticFeedbackType.Confirm`            |

### Notification Patterns

| Event                  | iOS Implementation                              | Android Implementation                  |
|------------------------|------------------------------------------------|-----------------------------------------|
| Message received       | `UINotificationFeedbackGenerator(.success)`    | `HapticFeedbackType.Confirm`            |
| Task complete          | `UINotificationFeedbackGenerator(.success)`    | `HapticFeedbackType.Confirm`            |
| Download finished      | `UINotificationFeedbackGenerator(.success)`    | `EFFECT_DOUBLE_CLICK`                   |

### Gesture Feedback Patterns

| Event                  | iOS Implementation                              | Android Implementation                  |
|------------------------|------------------------------------------------|-----------------------------------------|
| Drag start             | `UIImpactFeedbackGenerator(style: .medium)`    | `HapticFeedbackType.GestureStart`       |
| Drag end / drop        | `UIImpactFeedbackGenerator(style: .medium)`    | `HapticFeedbackType.GestureEnd`         |
| Snap to grid           | `UIImpactFeedbackGenerator(style: .rigid)`     | `EFFECT_CLICK`                          |
| Long press activate    | `UIImpactFeedbackGenerator(style: .heavy)`     | `HapticFeedbackType.LongPress`          |
| Swipe threshold        | `UIImpactFeedbackGenerator(style: .light)`     | `HapticFeedbackType.GestureStart`       |

---

## Haptic + Animation Synchronization

The perception of quality in haptic feedback depends almost entirely on timing. A haptic that arrives even 30ms out of sync with its visual counterpart registers as a bug rather than a feature. The visual and tactile events must coincide within a single display frame (approximately 16.6ms at 60Hz, 8.3ms at 120Hz).

### Technique 1: Animation Completion Callbacks

Fire the haptic inside the animation's completion block so it coincides with the final settled state:

```swift
// SwiftUI — Haptic at animation completion
struct SnapCard: View {
    @State private var offset: CGFloat = 0
    @State private var snapped = false
    let impact = UIImpactFeedbackGenerator(style: .medium)

    var body: some View {
        RoundedRectangle(cornerRadius: 12)
            .frame(width: 100, height: 100)
            .offset(x: offset)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        offset = value.translation.width
                    }
                    .onEnded { value in
                        let snapPoint: CGFloat = value.translation.width > 100 ? 200 : 0
                        withAnimation(.interpolatingSpring(stiffness: 300, damping: 20)) {
                            offset = snapPoint
                        }
                        // Fire haptic at snap moment
                        impact.impactOccurred()
                    }
            )
            .onAppear {
                impact.prepare()
            }
    }
}
```

### Technique 2: Gesture Recognizer State Changes

For drag gestures with intermediate snap points, fire haptics when the gesture crosses threshold boundaries:

```swift
// SwiftUI — Haptic at threshold crossing during drag
struct ThresholdDrag: View {
    @State private var dragOffset: CGFloat = 0
    @State private var lastThreshold: Int = 0
    let selection = UISelectionFeedbackGenerator()

    let thresholdSpacing: CGFloat = 50

    var body: some View {
        Circle()
            .frame(width: 60, height: 60)
            .offset(x: dragOffset)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        dragOffset = value.translation.width
                        let currentThreshold = Int(value.translation.width / thresholdSpacing)
                        if currentThreshold != lastThreshold {
                            selection.selectionChanged()
                            selection.prepare()
                            lastThreshold = currentThreshold
                        }
                    }
            )
            .onAppear {
                selection.prepare()
            }
    }
}
```

### Technique 3: CADisplayLink Sync (UIKit)

For frame-accurate synchronization in UIKit, use `CADisplayLink` to fire haptics at exact display refresh boundaries:

```swift
// UIKit — CADisplayLink haptic synchronization
class SyncedHapticController: UIViewController {
    var displayLink: CADisplayLink?
    var pendingHaptic = false
    let impact = UIImpactFeedbackGenerator(style: .rigid)

    func scheduleHapticOnNextFrame() {
        impact.prepare()
        pendingHaptic = true
        displayLink = CADisplayLink(target: self, selector: #selector(displayLinkFired))
        displayLink?.add(to: .main, forMode: .common)
    }

    @objc func displayLinkFired() {
        if pendingHaptic {
            impact.impactOccurred()
            pendingHaptic = false
            displayLink?.invalidate()
            displayLink = nil
        }
    }
}
```

### Android Animation Sync

In Compose, tie haptics to `Animatable` value changes or `LaunchedEffect` triggers:

```kotlin
@Composable
fun AnimatedHapticSnap() {
    val haptic = LocalHapticFeedback.current
    val offsetX = remember { Animatable(0f) }
    var isDragging by remember { mutableStateOf(false) }

    LaunchedEffect(isDragging) {
        if (!isDragging) {
            val snapTarget = if (offsetX.value > 100f) 200f else 0f
            offsetX.animateTo(
                targetValue = snapTarget,
                animationSpec = spring(dampingRatio = 0.6f, stiffness = 300f)
            )
            haptic.performHapticFeedback(HapticFeedbackType.Confirm)
        }
    }

    Box(
        modifier = Modifier
            .offset { IntOffset(offsetX.value.roundToInt(), 0) }
            .pointerInput(Unit) {
                detectDragGestures(
                    onDragStart = { isDragging = true },
                    onDragEnd = { isDragging = false },
                    onDrag = { _, dragAmount ->
                        coroutineScope.launch {
                            offsetX.snapTo(offsetX.value + dragAmount.x)
                        }
                    }
                )
            }
    ) {
        // Card content
    }
}
```

---

## Brand Haptic Vocabulary

A haptic vocabulary is the tactile equivalent of a color palette or type scale. It defines the finite set of haptic patterns your app uses and maps each pattern to a semantic meaning. Without this, haptic usage sprawls — different developers pick different generators for similar actions, and the user receives an incoherent tactile experience.

### Defining the Vocabulary

Limit your app to 5-8 core haptic events. More than that, and the patterns blur together perceptually. A practical vocabulary:

1. **Primary confirmation** — Light impact. Used for the most common positive action (button tap, selection).
2. **Heavy confirmation** — Medium impact. Used for significant completions (save, send, purchase).
3. **Error** — Notification error. Used for all failure states without exception.
4. **Warning** — Notification warning. Used for cautionary moments (unsaved changes, destructive path).
5. **Selection tick** — Selection feedback. Used for all picker/slider/scroll detent interactions.
6. **Gesture boundary** — Medium impact. Used for drag start, snap points, and drop targets.
7. **Success celebration** — Notification success. Used for milestone moments (goal reached, streak achieved).
8. **Subtle acknowledgment** — Soft impact. Used for background state changes that do not require attention.

### Documentation Format

Document haptic tokens alongside visual and motion tokens in your design system. Each entry should include:

```
Token:          haptic.confirmation.primary
Platform:       iOS — UIImpactFeedbackGenerator(style: .light)
                Android — HapticFeedbackType.Confirm
Intensity:      Low
Trigger:        User-initiated action with immediate result
Usage:          Button press, toggle, checkbox, radio selection
Do not use for: Background events, passive state changes, scrolling
```

### Enforcement

Create wrapper functions or utility classes that abstract platform-specific haptic calls behind semantic names. Developers should never call `UIImpactFeedbackGenerator` directly — they should call `HapticService.primaryConfirmation()`. This ensures vocabulary adherence and makes it possible to update patterns globally.

```swift
// iOS — Haptic vocabulary wrapper
enum AppHaptic {
    case primaryConfirmation
    case heavyConfirmation
    case error
    case warning
    case selectionTick
    case gestureBoundary
    case successCelebration
    case subtleAcknowledgment

    func play() {
        switch self {
        case .primaryConfirmation:
            let generator = UIImpactFeedbackGenerator(style: .light)
            generator.impactOccurred()
        case .heavyConfirmation:
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()
        case .error:
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.error)
        case .warning:
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.warning)
        case .selectionTick:
            let generator = UISelectionFeedbackGenerator()
            generator.selectionChanged()
        case .gestureBoundary:
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()
        case .successCelebration:
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.success)
        case .subtleAcknowledgment:
            let generator = UIImpactFeedbackGenerator(style: .soft)
            generator.impactOccurred()
        }
    }
}

// Usage: AppHaptic.primaryConfirmation.play()
```

---

## Accessibility Considerations

Haptic feedback is inherently exclusionary for users who cannot perceive vibration — including users with reduced tactile sensitivity, users who place their devices on surfaces, and users of assistive mounting devices. Designing responsibly means treating haptics as an enhancement layer, never a primary communication channel.

### Never Rely on Haptics Alone

Every piece of information communicated through haptics must also be communicated through at least one other channel — visual change, audio cue, or screen reader announcement. The haptic that accompanies a form validation error must coincide with a visible error message and, ideally, a VoiceOver/TalkBack announcement. If removing all haptics from your app would make any feature harder to understand, the design is broken.

### Respect System Settings

Both iOS and Android allow users to disable haptic feedback at the system level.

On iOS, check `CHHapticEngine.capabilitiesForHardware().supportsHaptics` before attempting any haptic playback. The built-in UIKit generators already respect the system setting, but custom `CHHapticEngine` patterns require an explicit check.

On Android, the system `HapticFeedbackConstants` respect the user's vibration settings automatically. Custom `VibrationEffect` calls through the `Vibrator` service do not — you must check the user's preference manually or provide an in-app toggle.

### Motor Impairment Considerations

Unexpected vibrations can cause distress or discomfort for users with motor impairments, tremor conditions, or sensory processing differences. Some users grip their device tightly to maintain control, and sudden vibrations can cause involuntary movements that disrupt their interaction.

Provide a haptic preference toggle in your app's settings screen. Three levels work well:

- **Full haptics** — All defined haptic events fire.
- **Reduced haptics** — Only critical haptics fire (errors, warnings, significant confirmations).
- **No haptics** — All haptic events are suppressed.

```swift
// iOS — Respecting app-level haptic preference
enum HapticPreference: String {
    case full, reduced, none
}

extension AppHaptic {
    func playIfAllowed() {
        let preference = UserDefaults.standard.string(forKey: "hapticPreference")
        let level = HapticPreference(rawValue: preference ?? "full") ?? .full

        switch level {
        case .none:
            return
        case .reduced:
            switch self {
            case .error, .warning, .heavyConfirmation:
                self.play()
            default:
                return
            }
        case .full:
            self.play()
        }
    }
}
```

### Hearing and Vision Impairment Interactions

Users who are deaf or hard of hearing may rely more heavily on haptic feedback as a substitute for audio cues. For these users, haptics are an accessibility feature rather than an enhancement. Consider offering a "haptic audio replacement" mode that fires stronger or additional haptic patterns where your app would normally play a sound.

Users who are blind or have low vision receive spatial and state information through VoiceOver and TalkBack. Haptics can supplement these announcements — a subtle tick when VoiceOver focus moves between items, a confirmation when an action completes. Coordinate haptic timing with accessibility announcement delivery.

---

## Testing Haptics

Haptic feedback cannot be tested in the iOS Simulator or Android Emulator. Neither environment drives a physical vibration motor. There is no visual proxy that accurately represents the tactile experience. Testing haptics requires real hardware, held in the hand, under realistic conditions.

### Real-Device Testing Checklist

**Multi-device coverage.** Haptic motor quality varies significantly across devices. The iPhone 15 Pro's Taptic Engine produces crisper, more nuanced patterns than the iPhone SE's. The Pixel 8 Pro's haptic motor outperforms many budget Android devices that only support binary vibration. Test on at least three devices spanning your target demographic:

- Flagship phone (latest generation)
- Mid-range phone (1-2 generations old)
- Budget/entry-level phone (if targeting that segment)

**Case interference.** Thick protective cases dampen haptic intensity. A haptic that feels distinct on a naked device may become imperceptible through a rugged case. Test with the most common case types your users are likely to have:

- No case (bare device)
- Thin silicone/TPU case
- Thick rugged/protective case

**Grip and posture.** Haptic perception changes with how the user holds the device. A phone resting flat on a desk transmits vibration through the surface and feels different than a phone gripped in one hand. Test these scenarios:

- One-handed portrait grip
- Two-handed landscape grip
- Device resting on a hard surface
- Device resting on a soft surface (bed, couch)

**Volume and silent mode.** On iOS, the system plays haptics even in silent mode (this is expected behavior — haptics are distinct from ringtone/notification sounds). On Android, haptic behavior in different sound modes varies by manufacturer. Test with:

- Volume at maximum
- Volume at minimum
- Silent/vibrate mode
- Do Not Disturb mode

**Accessibility settings.** Test the full matrix of accessibility configurations:

- System haptics enabled vs disabled
- Bold Text and Larger Dynamic Type (these do not affect haptics but indicate users who customize their experience)
- VoiceOver/TalkBack enabled (verify haptics do not interfere with screen reader announcements)
- Switch Control enabled (verify haptics do not fire during scanning)

### Perceptual Testing

Beyond functional verification, perform qualitative perceptual tests:

**Distinctness.** Can users differentiate your confirmation haptic from your error haptic without looking at the screen? If the patterns feel too similar, the vocabulary is not working. Test by having someone close their eyes while you trigger different haptic events, and ask them to identify which event occurred.

**Intensity calibration.** Are any haptics so strong they feel aggressive or startling? Are any so weak they go unnoticed? The goal is a comfortable middle range where every pattern is perceptible but none is intrusive.

**Fatigue.** Use the app for an extended session (15-30 minutes of active interaction) and evaluate whether the haptic feedback becomes annoying or tiresome. This is the strongest signal for whether you have too many haptic events. If you find yourself wishing they would stop, reduce the count.

**Timing perception.** Do the haptics feel synchronized with visual changes? A timing mismatch as small as two frames (33ms at 60Hz) is perceptible. If any haptic feels "late" or "early," investigate the synchronization mechanism for that interaction.

### Automated Testing Limitations

Unit tests can verify that haptic code paths are invoked (by mocking the feedback generators), but they cannot verify the perceptual quality of the output. Treat haptic testing as analogous to visual design review — it requires human judgment on real hardware. Include haptic review as an explicit step in your QA checklist alongside visual and functional testing.
