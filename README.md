# Rungs — Calisthenics Progression Tracker

A mobile-first PWA (Progressive Web App). All your data — stats, workouts,
weight log — stays on your phone in local storage. Nothing is sent
anywhere, there's no backend, no login.

## What it does

- Onboarding asks your height/weight/age, plus your current max reps on
  push-ups, pulls, squats, and plank — and places you on the right rung
  of each progression automatically (no fake "beginner" if you can already
  do 20 push-ups).
- Four progression "ladders": Push, Pull, Legs, Core — each with 8-9 rungs
  from absolute basics (wall push-up, dead hang) up to advanced skills
  (one-arm push-up, archer pull-up, pistol squat, L-sit).
- **Everything is doorway-pull-up-bar + floor + chair only** — no
  benches, parallel bars, rings, ab wheels, or boxes required.
- Every single exercise (83 total, main moves + accessories) has a
  small stick-figure diagram so you can tell at a glance what an
  unfamiliar move looks like. Tap any diagram for a bigger view.
- Each day it builds your session from your current rung on each ladder,
  rotated based on how many days/week you train (3 = full body, 4 = upper/
  lower split, 5+ = real push/pull/legs split). Each focus day gives you
  one main progression move plus 3-4 accessory exercises, so it actually
  feels like a full session, not one isolated move.
- All 5-6 of today's exercises show as a checklist right on the Train
  tab. Tap the circle to check one off — it auto-fills the target
  number. Tap the number box to type your actual reps/seconds instead.
  One "Complete Session" button saves everything at once.
- When you've hit the rung's target across recent sessions, the app
  flags "ready to advance." You confirm — you stay in control of when
  you level up, the app just tells you when you've earned it.
- **Roadmap tab**: a zoomed-out visual of your whole journey — total
  rungs climbed out of all 31 across every movement, a tier progress
  bar (Foundation → Beginner → Intermediate → Advanced → Elite), your
  actual pace (rungs cleared per week, calculated from your real
  logged history), and a projected date for your next tier based on
  that pace. This is separate from the **Path** tab, which is the
  detailed ladder view per movement.
- Tracks streak, full session history, and a bodyweight trend chart.

## How to get it on your phone (no app store needed)

**Easiest: host it free on GitHub Pages**

1. Create a free GitHub repo (or use an existing one).
2. Upload all 6 files from this folder (`index.html`, `app.js`,
   `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`) to the repo root.
3. In repo Settings → Pages, set source to your main branch, root folder.
4. GitHub gives you a URL like `https://yourname.github.io/reponame/`.
5. Open that URL on your phone in Chrome (Android) or Safari (iPhone).
6. Tap the browser menu → **"Add to Home Screen"** (iPhone: Share button →
   Add to Home Screen). It now opens full-screen with its own icon, like
   a real app — works offline after the first load.

**Alternative: Netlify Drop (even faster, no GitHub needed)**

1. Go to https://app.netlify.com/drop in a browser.
2. Drag the whole `calitrack` folder onto the page.
3. It gives you a live URL instantly. Open that on your phone, same
   "Add to Home Screen" step.

**Local testing on your own PC first (optional)**

If you want to preview it before publishing, open a terminal in this
folder and run:

```
python3 -m http.server 8080
```

Then visit `http://localhost:8080` in a browser on the same machine.
(Service workers need a real server, not a double-clicked file, which is
why GitHub Pages / Netlify is the real deployment path.)

## Notes on the progression logic

- The starting rung for each movement is estimated from your onboarding
  numbers using simple thresholds (e.g., 0 push-ups → start at Wall
  Push-up; 20+ → start at full Push-up working toward Diamond). This is a
  reasonable default, not gospel — you can't manually jump rungs in v1,
  but if a rung feels wrong, the rungs are plain data in `app.js` (the
  `TREES` object) and easy to edit by hand.
- Level-up detection looks at your best set across your last 3 logged
  sessions for that specific exercise. Hit the listed target, and it'll
  flag the level-up banner on the Train tab next time you open the app.
- The Roadmap's pace and projection numbers only appear after you've
  advanced at least 2 rungs — there's no honest pace to calculate before
  that, so it shows a "building your pace" message instead of guessing.
- A few pull exercises (archer/typewriter/one-arm pull-up work) put your
  full bodyweight through the bar at an angle, not just straight down.
  Make sure your doorway bar is rated for that and properly wedged before
  progressing into them.

## Extending it later

Since it's just static files with `localStorage`, you could later add:
- Export/import of your data as JSON (for backup or switching phones)
- More movement trees (e.g. handstand progression)
- Custom rung editing in the Profile tab

Happy to build any of these next — just say the word.
