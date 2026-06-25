Clario — project instructions for Codex
Product

Clario is a Russian-language MVP web app for creating structured briefs for visual projects.

User flow:

User describes a visual task in free text.
App asks short clarifying questions.
User answers with single choice, multi choice, text input, custom answer, "Не знаю", or "Пропустить".
App generates a structured brief.
User can copy the brief, download .txt, or start again.
Tech stack
Vite
React 18+
TypeScript
Functional components only
Hooks only
CSS Modules
No backend for MVP
No Redux
No heavy UI libraries
No Tailwind unless explicitly requested by Anna
Important project structure

src/
components/
StartScreen.tsx
QuestionScreen.tsx
OptionButton.tsx
ProgressBar.tsx
ResultScreen.tsx
data/
questions.ts
utils/
buildBrief.ts
App.tsx
main.tsx

Hard rules

Do not break existing product logic:

single questions
multiple questions
text questions
multi-select
selected states
custom answer
"Не знаю"
"Пропустить"
buildBrief
copy to clipboard
download .txt
restart flow

When the task is UI-only, do not rewrite business logic.

When editing components:

keep props typed
do not use any unless there is no reasonable alternative
avoid inline styles
prefer CSS Modules
keep components readable and small
UI direction

Visual benchmark:

Linear
Raycast
Vercel
Loom
Superlist

Clario should feel:

modern
calm
precise
slightly bold
not corporate
not Bootstrap-like
not like Google Forms

Current visual system:

black ink
warm off-white background
acid lime as accent only
Onest as main UI font

Do not use huge poster typography that breaks 1366×768.
Start screen must fit into the first viewport on a 15-inch laptop at browser zoom 100%.

Language

All user-facing UI copy is in Russian.

Tone:

clear
human
smart
not bureaucratic
not too playful

Avoid:

"инновационный продукт"
corporate clichés
robotic form wording
Commands

Use these checks before finishing a task:

npm run build

If available, also run:

npm run lint

Do not claim the task is done if the build fails.

Reporting format

At the end of each task, report:

files changed
what was changed
whether product logic was touched
whether npm run build passed
any risks or follow-up notes
