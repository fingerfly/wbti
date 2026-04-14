# Changelog

## Unreleased

### Added

- **Single source of truth for version + build**（2026-04-14）：
  - [`package.json`](package.json)：`version`（semver）与 **`wbtiBuild`**
    （HLM 式 build 号）。
  - [`js/appVersion.js`](js/appVersion.js) 由脚本生成，勿手改；运行
    `npm run generate:app-version`。
  - [`scripts/appVersionGenerate.js`](scripts/appVersionGenerate.js) /
    [`scripts/generateAppVersion.js`](scripts/generateAppVersion.js)：从
    `package.json` 写出 `appVersion.js`。
  - [`scripts/assertAppVersionSync.js`](scripts/assertAppVersionSync.js)：
    校验磁盘上的 `appVersion.js` 与 `package.json` 一致；`pretest`、
    `test:unit`、`test:e2e` 会执行（CI `test:unit` 已覆盖）。
- **HLM-style build metadata**（与 HLM 同款语义）：
  - [`js/appVersion.js`](js/appVersion.js)：`APP_VERSION`、`APP_BUILD`、
    `getDisplayVersion()`（页脚文案 `v… (build N)`）。
  - [`scripts/appVersionDeploy.js`](scripts/appVersionDeploy.js)：读写
    `package.json` 发布态、解析生成后的 `appVersion.js`、计算下一发布状态
    （`build` 仅加 **`wbtiBuild`**；`patch|minor|major` 升 semver 且
    **`wbtiBuild`** 置 **1**）。
  - [`scripts/deployReleaseBump.js`](scripts/deployReleaseBump.js)：发布前
    写回 `package.json` 并 **重新生成** `js/appVersion.js`。
  - [`scripts/deploy.js`](scripts/deploy.js)：每次 `npm run release:*` 在
    通过测试后调用上述逻辑。
  - 页脚：[`index.html`](index.html) 增加 `#app-version`，[`js/app.js`](js/app.js)
    挂载 `getDisplayVersion()`，[`css/style.css`](css/style.css) 增加
    `.app-version` 样式。

### Changed

- **Dev tooling / CI**（2026-04-14）：[`package.json`](package.json) 升级
  **`@playwright/test`**、**`jsdom`**、**`vitest`**；增加 **`overrides`**
  **`follow-redirects`** 以清除 `npm audit` 报告；[`.github/workflows/test.yml`](.github/workflows/test.yml)
  在存在 `package-lock.json` 时用 **`npm ci`**，否则 **`npm install`**，并将
  npm 缓存键改为 **`package.json`**（适配 monorepo 未提交 lock 的开发树）。
- 文档与发布说明：[`DEPLOY.md`](DEPLOY.md)、[`README.md`](README.md)、
  [`AGENTS.md`](AGENTS.md) 补充 `appVersion.js`、`release:build` 与版本对齐
  约定；子计划
  [`.cursor/plans/wbti_github_pages_mirror.plan.md`](.cursor/plans/wbti_github_pages_mirror.plan.md)、
  [`.cursor/plans/wbti_master_plan_ea475cdf.plan.md`](.cursor/plans/wbti_master_plan_ea475cdf.plan.md)
  同步。

### Tests

- 单元测试：[`tests/unit/appVersion.test.js`](tests/unit/appVersion.test.js)、
  [`tests/unit/appVersionDeploy.test.js`](tests/unit/appVersionDeploy.test.js)、
  [`tests/unit/deployReleaseBump.test.js`](tests/unit/deployReleaseBump.test.js)。
- E2E：[`tests/e2e/wbti.spec.js`](tests/e2e/wbti.spec.js) 断言页脚版本格式
  `v\d+.\d+.\d+ (build \d+)`。

## 0.3.0 — 2026-04-13

### Changed

- Favicon set redesigned for stronger WBTI personality-test branding with a
  playful, humorous style: updated `favicon.svg`, `favicon.ico`, and
  `apple-touch-icon.png`.
- Icon concept now emphasizes quiz identity and memorability via a colorful
  speech bubble, bold `WBTI` lettering, a wink-smile face, and a `?` badge.
- `index.html` head metadata now references the full icon trio
  (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`) for modern and
  legacy browser/device coverage.

## 0.2.6 — 2026-04-13

### Changed

- 题库文案轻量化（`data/canonical-questions.json`）：16 道母题题干与全部选项
  改为更短、更口语、低阅读负担表达；保留 `id` / `optionId` / `scores` 不变，
  运行时 320 组合题自动继承新文案。
- 结果页文案轻量化（`data/result-catalog.json`）：8 种结果的 `title`、
  `gameSubtitle` 与四段 `reportSections` 全量改写为更通俗、轻松的语气，减少
  过密梗词与过时表达。
- 首页文案收敛（`index.html`）：`meta description` 与欢迎区导语简化，降低信息
  压力，和题库/结果页语气统一。

### Fixed

- 发布镜像远端切换修复（`scripts/deployGitOps.js`）：复用已有 deploy checkout
  时，若当前 `origin` URL 与 `WBTI_DEPLOY_REMOTE` 不一致，自动执行
  `git remote set-url origin <remote>` 后再拉取/推送，避免旧 HTTPS 远端导致的
  token 认证失败。

### Tests

- 新增回归测试（`tests/unit/deployGitOps.test.js`）：覆盖“复用目录时自动更新
  origin URL”的场景，防止发布流程再次卡在错误远端。

## 0.2.3 — 2026-04-13

### Added

- Security policy doc: [SECURITY.md](SECURITY.md) (reporting channel, response
  SLAs, key rotation and history cleanup playbook).
- CI secret scan workflow: `.github/workflows/security-scan.yml` (`gitleaks`
  on push / pull_request / workflow_dispatch).
- Local pre-commit secret guard: `.githooks/pre-commit` +
  `scripts/precommitSecretScan.js`; manual check via
  `npm run secrets:scan-staged`.
- Secret-scan allowlist config: `.secret-scan-allowlist.json` with strict
  `filePath` + regex `rule` + required `reason` entries.
- Local push guard: `.githooks/pre-push` + `scripts/prepushPublicGuard.js`
  now enforce no tracked `.cursor/`, no tracked non-template `.env*`, and
  full `npm test` before push.
- Hook runtime hardening: `.githooks/pre-commit` and `.githooks/pre-push`
  now run as Node scripts (no shell wrapper dependency).
- Regression guard: `tests/unit/gitHooksRuntime.test.js` verifies both
  `.githooks` launchers keep the Node shebang.

### Changed

- Public docs hygiene: `README.md`, `DEPLOY.md`, and `deploy.env.example` now
  use generic placeholders for deploy repo and Pages URL.
- Deploy hardening: `scripts/deployGitOps.js` no longer passes `--no-verify`
  to `git commit`; local hooks remain active.
- Internal planning metadata is kept private and excluded from public mirror
  artifacts.
- `AGENTS.md` is treated as internal-only guidance and excluded from the public
  repository surface.
- Private monorepo tracking for `.cursor/plans/*` and `AGENTS.md` is preserved;
  public leak prevention is enforced by deploy mirror exclusions.
- Public README no longer links internal `.cursor/plans/*` artifacts.

## 0.2.2 — 2026-04-13

### Added

- **公开仓库**：首次通过 `npm run release:patch` 推送至 `main`。
- **线上演示（GitHub Pages）**：启用 Actions Pages 后一般为  
  **https://<owner>.github.io/<repo>/**
- **`.env.deploy`**：可选本地加载 `WBTI_DEPLOY_REMOTE`（见
  [deploy.env.example](deploy.env.example)）；[`scripts/deployEnv.js`](scripts/deployEnv.js)。
- **跨平台发布（Goja/HLM 式）**：[`scripts/deploy.js`](scripts/deploy.js)、
  [`scripts/deployGitOps.js`](scripts/deployGitOps.js)、
  [`scripts/deployLib.js`](scripts/deployLib.js)；`npm run release:build` /
  `release:patch` / `release:minor` / `release:major`（内置 `--confirm`）。
- **GitHub Actions**：`deploy-pages.yml` + `test.yml`；**`package-lock.json`**。
- **部署清单** [DEPLOY.md](DEPLOY.md)（Node 发布流程）。

### Changed

- **许可声明**：项目许可证设为 `UNLICENSED`（No License）。
- **Pages 验证**：`https://<owner>.github.io/<repo>/` 可访问时，表示 `Deploy to GitHub Pages`
  已成功。
- **quizView 拆分**：`quizViewQuestion` / `quizViewResult` / `quizViewScreens` /
  `quizViewOptions` / `quizViewComplete`；配套单元测。
- **部署策略**：公开库由 **`npm run release:*`** 推送（无 bash/PowerShell 镜像脚本）。
- 欢迎页 **welcome-panel** 版式与文案调整（去 WBTI 品牌字样等，见 `ui-copy.json`）。

## 0.2.1 — 2026-04-12

### Changed

- 选项接梗行（`#quiz-quip`）对最终用户默认关闭：`app-config.json` 新增
  `showOptionQuipDefault`（默认 `false`）；`quizView` 仅在开启时展示接梗。

## 0.2.0 — 2026-04-12

### Added

- **`data/` JSON**：`app-config.json`（含成就 storage/手速阈值/夜猫时段）、
  `canonical-questions.json`、`variant-tables.json`、`option-quips.json`、
  **`result-catalog.json`**（八种结果文案）、**`ui-copy.json`**（进度/分享文案）、
  **`theme.json`**（CSS 变量与字体）；`js/appConfig.js`、`js/uiCopy.js`、
  `js/themeApply.js`、`js/deepFreeze.js`；`tests/vitest-setup.js` 注入主题变量；
  `scripts/dump-result-catalog.mjs`；`tests/unit/resultCatalog.test.js`、
  `uiCopy.test.js`。
- Session shuffle: `js/quizSession.js` + per-option `optionId` in `quizData.js`;
  `quizView` 用洗牌后的题集调用 `computeResult`.
- **320 题题库** `js/quizBank.js`：**16** 母题 × **20** 场景变体；每题 `balanceAxis`；
  **`js/sessionBalance.js`** 每局无放回抽 **16** 题，不满足三轴覆盖则替换/重试/
  贪心兜底；再洗牌。母题在 `js/quizPatterns.js`。移除 B 卷与按 completion 切换 A/B。
- 题中 `quip` 接梗、`quiz-quip`；人格化进度 `quizProgressCopy.js`；结果卡随机
  主题 `resultCardTheme.js`；彩蛋 `resultExtras.js`（不影响分型）。
- 本地成就 `achievements.js`；默认关音效/震动 `fxSettings.js`；分享对比句
  `buildCompareBlurb` / `buildShareText(r, url)`。
- Unit tests: `quizSession`, `quizBank`, `sessionBalance`, `resultExtras`,
  `achievements`, `shareText`, `progressState`, `quizView`（情境标签显示开关）。
- Eight cropped portraits under `profiles/profile{typeKey}.png`, split from the
  4×2 `profiles.png` sheet (same grid order as `PROFILE_GRID_ORDER` in
  `js/profileArt.js`); regenerate via `python3 scripts/split_profiles.py`.
- Result `<img>` loads the matching file by `typeKey`; mapping and alt text in
  `js/profileArt.js`; layout in `css/style.css`.

### Changed

- **结果报告**：`result-catalog.json` 改为四段结构化 **`reportSections`**（八种格共用
  同一套小标题）；正文与 `gameSubtitle` 重写；结果页按段渲染（`result-section`），
  分享文案段间空行；`computeResult` 仍导出扁平 `paragraphs` 以兼容旧逻辑。
- **结果页**：移除「娱乐向成就（本地）」提示行；`index.html` / `quizView` 不再挂载
  该段落；`ui-copy.json` 去掉 `achievements` 块；`achievements.js` 仍于完成测验时
  解锁并写入 localStorage。
- **内容与配置外置**：题目/选项、变体表、接梗、**结果目录**、**UI 文案模板**、
  **主题 token** 在 `data/*.json`；`resultTypes` / `shareText` / `quizProgressCopy` /
  `achievements`（阈值与 storage，仍落盘、结果页不展示）数据驱动；`app.js` 启动时
  `applyThemeToRoot()`；`quizPatterns` / `quizBank` / `quizOptionQuips` 仅加载与校验。
- 抽题：同一 `patternId` 每局至多 `⌈n/母题数⌉` 次（16 题、16 母题 → ≤1），一局题干
  互不重复；`variantContext.scene` 默认不在测验区展示（`showVariantScene` 可开）。
- **母题扩至 16**：`js/quizPatterns.js` 新增 q11–q16（跨时区、复盘甩锅、团建、
  工位、事故救火、拖堂站会）；`PATTERN_COUNT` 取自 `CANONICAL_TEN.length`；
  `scripts/gen-quips-p10-p15.mjs` 生成接梗扩展行。
- **选项接梗**：`js/quizOptionQuips.js` 冻结 **16×4×20** 矩阵；每个 (母题, 选项槽)
  下 **20 条 quip 两两不同**；`quizBank` 用 `getOptionQuip(p, oi, v)`，启动时
  `assertOptionQuipsMatrix()`。移除 `BASE_QUIPS` / `QUIP_SUFFIX` / `makeQuip`。
- 场景槽 **10 → 20** / 题库 **100 → 200**（`VARIANTS_PER_PATTERN`、`SCENES` 等
  同步扩表）。
- 题库：`prompt` 与选项 `text` 仅为母题原文；情境标签/语气/选项引导在
  `variantContext`（不拼进题干或选项正文）；测验页**默认不**展示 `scene` 标签。
- 测验随机源默认 `createUniform01()`（优先 `crypto`）；欢迎页说明题面/顺序随机。
- README / SPEC / AGENTS：大题库平衡抽题；结果页与分享文案强化「仅供娱乐、不用于
  招聘/诊断」；README / SPEC / AGENTS 同步。
- `resultExtras`：扩展彩蛋（全选末项、0/3 横跳、极端总分等）。
- Quiz UI: 「题目 / 选项」分区、题干强调块（左色条+浅底）与选项卡片（浅灰底+
  轻阴影）提高层级对比。
- `quizData.js`: prompts/options rephrased with current 网感用语；各选项 a/b/c
  得分与顺序未改。
- UI theme: light-on-white (`css/style.css` tokens); `color-scheme: light`.
- Workspace master plan added under `.cursor/plans/`; scoring child plan links
  README 牛马人格释义.
- README: document eight「牛马人格」roles (axis keys + plain-language blurbs).
- README + `resultTypes.js`: eight role titles refreshed toward current
  网络人设梗（开麦、脆皮、阴阳师、偷感、淡人、吗喽、NPC 等），报告首段略对齐。
- Light gamification: result `gameSubtitle` (稀有度/定位/被动), RPG-flavored
  copy, README design note; share/persist include subtitle; result kicker
  「牛马人格掉落」.

### Fixed

- Playwright e2e welcome heading matcher aligned with「测测你的牛马人格」copy.

## 0.1.0 — 2026-04-12

### Added

- MVP quiz flow: welcome (disclaimer), 10 questions with progress, result card.
- Pure scoring module with eight result profiles and documented tie-break.
- Vitest unit tests for scoring; Playwright e2e for happy path and retake.
- Share (Web Share API) and clipboard copy fallbacks; optional localStorage
  persistence of last result payload.
- Project docs: `README.md`, `AGENTS.md`, scoring child plan under
  `.cursor/plans/`, and optional GitHub Actions workflow.


