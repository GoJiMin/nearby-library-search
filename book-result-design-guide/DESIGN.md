# Design System Document: The Library Book Finder

## 1. Overview & Creative North Star
### Creative North Star: "The Silent Librarian"
This design system moves away from the chaotic "bookstore" aesthetic toward a **"Restrained Game-Like"** experience. Imagine a high-end, minimalist RPG interface where every interaction feels tactile, responsive, and rewarding, yet the overall atmosphere remains as quiet as a reading room. 

We avoid the "template" look by rejecting traditional borders and rigid grids. Instead, we use **Intentional Asymmetry** and **Tonal Depth**. The system feels like "Toss" or "Daangn" in its efficiency, but carries a signature editorial weight through sophisticated layering and high-contrast typography scales. 

---

## 2. Colors & Surface Architecture
Our palette is anchored in a balanced Blue, avoiding the "tech-purple" trend in favor of a more grounded, academic, yet modern "Library Blue."

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections.
Boundaries must be created through:
- **Background Color Shifts:** A `surface-container-low` section sitting on a `surface` background.
- **Tonal Transitions:** Using the hierarchy of surfaces to imply containment.

### Surface Hierarchy & Nesting
Treat the UI as physical layers—like stacked sheets of fine, heavy-stock paper or frosted glass.
- **Level 0 (Base):** `surface` (#f7f9fb)
- **Level 1 (Subtle Inset):** `surface-container-low` (#f2f4f6) for secondary content areas.
- **Level 2 (Active Cards):** `surface-container-lowest` (#ffffff) to create a "lifted" feel for primary interactive cards.
- **Level 3 (High Focus):** `surface-container-highest` (#e0e3e5) for persistent navigation or search bars.

### The "Glass & Soul" Rule
To achieve a premium feel, use **Glassmorphism** for floating elements (e.g., bottom navigation or sticky headers). Use semi-transparent `surface` colors with a 20px backdrop-blur. 
- **Signature Texture:** Apply a subtle linear gradient to main CTAs (Primary #2b4bb9 to Primary-Container #4865d3) to give the blue "soul" and depth that a flat hex code cannot provide.

---

## 3. Typography: Editorial Authority
We pair **Space Grotesk** (Display/Headlines) for a technical, game-like precision with **Manrope** (Body/Labels) for warm, humanistic readability.

| Level | Token | Font | Size | Weight | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Space Grotesk | 3.5rem | 700 | Large hero numbers/stats |
| **Headline**| `headline-md` | Space Grotesk | 1.75rem | 600 | Page titles & Section headers |
| **Title** | `title-md` | Manrope | 1.125rem | 600 | Book titles, Card headings |
| **Body** | `body-md` | Manrope | 0.875rem | 400 | Descriptions & General text |
| **Label** | `label-md` | Manrope | 0.75rem | 500 | Metadata, Micro-copy |

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too "web 2.0." We use **Ambient Depth**.

- **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card on a `surface-container-low` background. The slight shift in brightness creates a "soft lift" without visual clutter.
- **Ambient Shadows:** For floating elements (Modals, FABs), use a multi-layered shadow: 
  `box-shadow: 0 12px 32px -8px rgba(25, 28, 30, 0.06);` (Using a tinted `on-surface` color).
- **The "Ghost Border":** If a container is placed on a background of the same color, use a 1px border with `outline-variant` at **15% opacity**. Never use 100% opacity for borders.

---

## 5. Components & Interaction Patterns
All components must utilize the **Roundedness Scale**, defaulting to `md` (0.75rem) for cards and `full` (9999px) for buttons.

### Cards & Lists (The Editorial Card)
- **Rule:** Forbid divider lines.
- **Execution:** Use vertical white space from the spacing scale (e.g., 24px) or a background shift to separate items.
- **Interaction:** On hover/tap, the card should scale slightly (1.02x) and shift from `surface-container-lowest` to `surface-bright`.

### Buttons (Tactile CTAs)
- **Primary:** Linear gradient (`primary` to `primary-container`). White text. No border.
- **Secondary:** `secondary-container` background with `on-secondary-container` text.
- **Tertiary:** Ghost style. No background. `on-surface` text with a subtle `fade + slight slide` animation on hover.

### Game-Like Micro-Components
- **The Progress Rail:** Use a thick (8px) `surface-variant` track with a `primary` rounded bar to indicate reading progress or search status.
- **Search Input:** A large, `xl` roundedness bar using `surface-container-high`. When focused, it expands slightly with a "Ghost Border" of the `primary` color at 20% opacity.

---

## 6. Do’s and Don'ts

### Do
- **Do** use asymmetric margins for editorial feel (e.g., more padding at the top of a header than the bottom).
- **Do** ensure all text/background combinations meet **WCAG AA** standards using the provided color tokens.
- **Do** use "Fade + Slight Slide Up" (200ms Cubic-Bezier) for all screen transitions to maintain the "fast yet calm" personality.

### Don't
- **Don't** use pure black (#000) for text. Always use `on-surface` (#191c1e).
- **Don't** use standard "drop shadows" with high opacity. They break the calm, flat-layered aesthetic.
- **Don't** use icons with varying stroke weights. Stick to a consistent 1.5pt or 2pt rounded line-art style.

---

## 7. Motion & Interaction
To achieve the "Restrained Game-Like" feel, motion should be snappier than a standard app but smoother than a game.
- **Entrance:** Items should cascade in with a 20ms delay between elements.
- **Feedback:** When a book is "saved," use a haptic-like visual: the icon should scale up to 1.2x and settle back down quickly (Spring: 400, 25).