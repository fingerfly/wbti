# AGENTS.md

Coding agent instructions for the WBTI (Workplace 牛马格 Type Indicator) quiz
（npm 包名 `wbti`）。

## Project overview

- Package: `wbti` (ES Module, `"type": "module"`)
- Static `index.html` + `js/` modules; Vitest (jsdom) + Playwright e2e
- Product spec: [SPEC.md](SPEC.md)

## Build / test commands

```bash
cd 02product/01_coding/project/wbti   # from monorepo root
npm install
npm test              # unit (Vitest) + e2e (Playwright)
npm run test:unit     # Vitest only
npm run test:e2e      # Playwright only (starts http-server)
# Release to public GitHub (needs WBTI_DEPLOY_REMOTE); see DEPLOY.md
npm run release:patch # or :minor :major :build (HLM-style, includes --confirm)
```

## File layout

```text
wbti/
├── SPEC.md
├── AGENTS.md
├── README.md
├── index.html
├── profiles.png        # 4×2 source sheet
├── profiles/           # profile{typeKey}.png — run scripts/split_profiles.py
├── data/               # JSON: app-config, canonical, variants, quips, result-catalog,
│                       # ui-copy, theme (see data/README.md)
├── scripts/            # deploy.js, deployGitOps.js, deployLib.js; …
├── css/                # layout uses var(--*); values from data/theme.json
├── js/                 # app, appConfig, themeApply, uiCopy, quizView + helpers
│                       # (quizViewQuestion/Result/Screens/Options/Complete), …
├── tests/
│   ├── unit/           # includes quizView (variant scene flag)
│   └── e2e/
├── package.json
├── vitest.config.js
├── playwright.config.js
├── .github/workflows/  # test.yml; deploy-pages.yml (GitHub Pages)
└── .cursor/plans/    # project-local plans (workspace policy)
```

## Code style (Goja + HLM conventions)

- ESM only; explicit `.js` in imports; prefer named exports and plain
  functions.
- Module headers: `Purpose` + `Description` on non-trivial files.
- JSDoc on exported APIs (`@param`, `@returns`, `@throws` when useful).
- Wrap JS/HTML/CSS/comments to **≤ 78 columns** where practical.
- Prefer **&lt; 100 SLOC** per file (`cloc`); split when cohesion stays clear.
- Soft **40 lines** / function; investigate splits past **60 lines** or high
  complexity flags.

## Plans

- Store active plans under **this folder**: `.cursor/plans/`.
- Master plan: `.cursor/plans/wbti_master_plan_ea475cdf.plan.md`.
- Child scoring doc: `.cursor/plans/wbti_scoring_matrix_a1b2c3d4.plan.md`.
- Fun engagement doc: `.cursor/plans/wbti_fun_engagement_full.plan.md`.
- GitHub Pages mirror: `.cursor/plans/wbti_github_pages_mirror.plan.md`.
- Player-facing eight-type lexicon: [README.md](README.md)「牛马格的八种角色」.
- On milestone closeout: run full tests, align plan todo statuses, re-read
  plans for drift (see workspace plan-storage policy).

## Notes

- Open `index.html` via Live Server or `npx http-server .` (ES modules).
- `.github/workflows/test.yml` / `deploy-pages.yml` run when this directory is the
  **Git repository root** (use `npm run release:*` from `wbti/` to push that tree;
  see [DEPLOY.md](DEPLOY.md)).
- **Pages**: [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)
  publishes `index.html` + `css/` + `js/` + `data/` + `profiles/` to GitHub Pages
  when this folder is the repo root (see [README.md](README.md)「Deploy」).
- If you keep this folder inside a larger monorepo **without** mirroring, add a
  root workflow with `working-directory` pointing here (same `npm ci` / tests).
